const mongoose = require('mongoose')
const Schema = mongoose.Schema

let eventSchema = new Schema({
  image: {
    standard: String,
    vr: [String]
  },
  tipe: {
    type: String,
    lowercase:true,
    enum: {
      values: ['hackathon', 'meetup'],
      message: `{PATH} should be [Hackathon | Meetup]`
    }
  },
  location: {
    lat: String,
    lng: String,
    name: String
  },
  url: String,
  date: {
    join_start: Date,
    join_end: Date,
    event: Date
  },
  // poin: {type: Number, default: 0},
  participant: [{type: Schema.Types.ObjectId, ref: 'User'}],
  _organizer: {type: Schema.Types.ObjectId, ref: 'User'},
  approved: {type: Number, default: -1},
  name:{type:String},
  descr:{type:String}
})

let Event = mongoose.model('Event', eventSchema)
module.exports = Event