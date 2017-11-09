const mongoose = require('mongoose')
const Schema = mongoose.Schema

let achievementSchema = new Schema({
  poin: {type: Number, default: 0},
  descr: {type: String, required: [true, '{PATH} must be filled']},
  title: {type: String, required: [true, '{PATH} must be filled']},
  unlock_num: {type: Number, required: [true, '{PATH} must be filled']},
  unlock_desc: {
    type: String,
    required: [true, '{PATH} must be filled'],
    enum: {
      values: ['github', 'meetup', 'hackathon'],
      message: `{PATH} should be [github | meetup | hackathon]`
    }
  },
  image: {type: String, required: [true, '{PATH} must be filled']}
})
let Achievement = mongoose.model('Achievement', achievementSchema)
module.exports = Achievement