require('dotenv').config()

const app = require('express')()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const graphQLHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const transformSchema = require('graphql-transform-schema').transformSchema
const makeRemoteExecutableSchema = require('graphql-tools').makeRemoteExecutableSchema
const mergeSchemas = require('graphql-tools').mergeSchemas
const introspectSchema = require('graphql-tools').introspectSchema
const HttpLink = require('apollo-link-http').HttpLink
const fetch = require('node-fetch')
const playground  = require('graphql-playground/middleware').express

const appSchema = require('./schema/schema')
const cron = require('./cron/index')
const port = process.env.PORT || 4000

const endpoint = '__SIMPLE_API_ENDOINT__'  // looks like: https://api.graph.cool/simple/v1/__SERVICE_ID__
const link = new HttpLink({ uri: endpoint, fetch })

let env = app.settings.env || 'dev'

let db_config = {
  dev: 'mongodb://localhost/vision',
  prod: `mongodb://rumah360:${process.env.ATLAS_PASS}@room360-shard-00-00-g8m3k.mongodb.net:27017,room360-shard-00-01-g8m3k.mongodb.net:27017,room360-shard-00-02-g8m3k.mongodb.net:27017/vision?ssl=true&replicaSet=room360-shard-0&authSource=admin`
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors())

mongoose.connect(db_config[env],(err,res)=>{
  console.log(db_config[env])
  console.log(err?err:'Berhasil connect ke db '+db_config[env]);
})

introspectSchema(link).then(introspectionSchema => {
  const mergedSchemas = mergeSchemas({
    schemas: appSchema,
    resolvers: mergeInfo => ({
      Query: {
        viewer: () => ({}),
      },
      Viewer: {
        me: {
          resolve(parent, args, context, info) {
            const alias = 'john' // should be determined from context
            return mergeInfo.delegate('query', 'user', { alias }, context, info)
          },
        },
        // topPosts: {
        //   resolve(parent, { limit }, context, info) {
        //     return mergeInfo.delegate('query', 'allPosts', { first: limit }, context, info)
        //   },
        // },
      },
    }),
  })

  // Step 4: Limit exposed operations from merged schemas
  // Hide every root field except `viewer`
  const schema = transformSchema(mergedSchemas, {
    '*': true,
    viewer: true,
  })

  app.use('/graphql', graphQLHTTP (req => ({
    schema: appSchema,
    graphiql: true
  })))
  app.use('/playground', playground({ endpoint: '/graphql' }))
  app.use('/cron', cron.init)

  app.set('port', port)

  app.listen(app.get('port'), () => {
    console.log('magic happen at port:',app.get('port'))
  })

})









module.exports = app
