const mongoose = require('mongoose')
const Schema = mongoose.Schema

let rewardSchema = new Schema({
  poin: {type: Number, default: 0},
  descr: {type: String, required: [true, '{PATH} must be filled']},
  title: {type: String, required: [true, '{PATH} must be filled']},
  image: {type: String, required: [true, '{PATH} must be filled']},
  isActive: {type : Boolean, default: true}
})

let Reward = mongoose.model('Reward', rewardSchema)
module.exports = Reward