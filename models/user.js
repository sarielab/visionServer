const mongoose = require('mongoose')
const Schema = mongoose.Schema

/*
  achievement dia liat tuh pas di date udah ada 10 ato belum kalo belum maka ditambahin ke poin
  kalo ga ya udah ga ketambahan....
*/

let userSchema = new Schema({
  name: {type: String, required:[true, '{PATH} must be filled']},
  repository: [{ type:String }],
  poin: {type: Number, default: 0},
  achievement: [{
    descr: String,
    createdDate: { type:Date, default: Date.now }
  }]
})

let User = mongoose.model('User', userSchema)
module.exports = User