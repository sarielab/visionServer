require('dotenv').config()

const appSchema = require('./schema/schema')
const app = require('express')()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const graphQLHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors())

app.use('/graphql', graphQLHTTP (req => ({
  schema: appSchema,
  graphiql:true
})))

let env = app.settings.env || 'dev'

let db_config = {
  dev: 'mongodb://localhost/vision'
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
