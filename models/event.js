const mongoose = require('mongoose')
const Schema = mongoose.Schema

let eventSchema = new Schema({
  image: {
    icon: String,
    big: String,
    vr: [String]
  },
  tipe: {
    type: String,
    enum: {
      values: ['Hackathon', 'Meetup'],
      message: `{PATH} should be [Hackathon | Meetup]`
    }
  },
  participant: [{type: Schema.Types.ObjectId, ref: 'User'}],
  _organizer: {type: Schema.Types.ObjectId, ref: 'User'},
  url: String,
  approved: {type: Boolean, default: false}
  date: {
    join_start: Date,
    join_end: Date,
    event: Date
  }
})

let Event = mongoose.model('Event', eventSchema)
module.exports = Event