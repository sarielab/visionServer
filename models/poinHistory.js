const mongoose = require('mongoose')
const Schema = mongoose.Schema


let poinHistorySchema = new Schema({
  poin: Number,
  descr: String,
  tag: {
    type: String,
    enum: {
      values: ['add', 'subtract'],
      message: `{PATH} should be [add | subtract]`
    }
  }
})

let PoinHistory = mongoose.model('PoinHistory', poinHistorySchema)
module.exports = PoinHistory