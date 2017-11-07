const mongoose = require('mongoose')
const Schema = mongoose.Schema


let poinSchema = new Schema({
  poin: Number,
  descr: String,
  tipe: {
    type: String,
    lowercase: true,
    enum: {
      values: ['hackathon', 'meetup', 'github'],
      message: `{PATH} should be [Hackathon | Meetup | Github]`
    }
  }
})

let Poin = mongoose.model('Poin', poinSchema)
module.exports = Poin