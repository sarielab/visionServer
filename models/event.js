const mongoose = require('mongoose')
const Schema = mongoose.Schema

let eventSchema = new Schema({
  image: {
    standard: String,
    vr: [String]
  },
  tipe: {
    type: String,
    enum: {
      values: ['Hackathon', 'Meetup'],
      message: `{PATH} should be [Hackathon | Meetup]`
    }
  },
  location: {
    lat: string,
    lng: string,
    name: string
  },
  url: String,
  date: {
    join_start: Date,
    join_end: Date,
    event: Date
  },
  poin: {type: Number, default: 0},
  participant: [{type: Schema.Types.ObjectId, ref: 'User'}],
  _organizer: {type: Schema.Types.ObjectId, ref: 'User'},
  approved: {type: Boolean, default: false}
})

let Event = mongoose.model('Event', eventSchema)
module.exports = Event