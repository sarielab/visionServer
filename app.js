require('dotenv').config()

const app = require('express')()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const graphQLHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

const appSchema = require('./schema/schema')
const cron = require('./cron/index')
const port = process.env.PORT || 4000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors())

app.use('/graphql', graphQLHTTP (req => ({
  schema: appSchema,
  graphiql: true
})))

app.use('/cron', cron.init)

let env = app.settings.env || 'dev'

let db_config = {
  dev: 'mongodb://localhost/vision',
  prod: `mongodb://rumah360:${process.env.ATLAS_PASS}@room360-shard-00-00-g8m3k.mongodb.net:27017,room360-shard-00-01-g8m3k.mongodb.net:27017,room360-shard-00-02-g8m3k.mongodb.net:27017/vision?ssl=true&replicaSet=room360-shard-0&authSource=admin`
}

console.log(db_config[env])

mongoose.connect(db_config[env],(err,res)=>{
  console.log(db_config[env])
  console.log(err?err:'Berhasil connect ke db '+db_config[env]);
})

app.set('port', port)

app.listen(app.get('port'), () => {
  console.log('magic happen at port:',app.get('port'))
})

module.exports = app
