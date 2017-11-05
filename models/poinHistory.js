const mongoose = require('mongoose')
const Schema = mongoose.Schema

let poinHistorySchema = new Schema({
  _user: {type: Schema.Types.ObjectId, ref: 'User' },
  _poin: {type: Schema.Types.ObjectId, ref: 'Poin' },
  poin: Number,
  descr: String,
  tag: {
    type: String,
    enum: {
      values: ['add', 'subtract'],
      message: `{PATH} should be [add | subtract]`
    }
  },
  createdDate: {type: Date, default: Date.now}
})

let PoinHistory = mongoose.model('PoinHistory', poinHistorySchema)
module.exports = PoinHistory