const mongoose = require('mongoose')
const Schema = mongoose.Schema


let poinSchema = new Schema({
  poin: Number,
  descr: String,
  tipe: {
    type: String,
    lowercase: true,
    enum: {
      values: ['hackathon', 'meetup'],
      message: `{PATH} should be [Hackathon | Meetup]`
    }
  }
})

let Poin = mongoose.model('Poin', poinSchema)
module.exports = Poin