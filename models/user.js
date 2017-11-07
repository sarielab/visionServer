const mongoose = require('mongoose')
const Schema = mongoose.Schema

/*
  achievement dia liat tuh pas di date udah ada 10 ato belum kalo belum maka ditambahin ke poin
  kalo ga ya udah ga ketambahan....

  repo dari push date
*/

let achievementHistorySchema = new Schema({
  _user: {type: Schema.Types.ObjectId, ref: 'User' },
  _achievement: {type: Schema.Types.ObjectId, ref: 'Achievement' },
  createdDate: { type:Date, default: Date.now }
});

let AchievementHistory = mongoose.model('AchievementHistory', achievementHistorySchema, 'AchievementHistories')

let userSchema = new Schema({
  facebook: {
    name: {type: String, required:[true, '{PATH} must be filled']},
    photo: String,
  },
  github: {
    user: {type: String},
    repository: [
      {
        name:String,
        url: String,
        createdDate: {type: Date, default: Date.now},
        pushDate: {type: Date, default: Date.now}
      }
    ],
    count: {type: Number, default: 0},
  },
  descr: String,
  email: String,
  poin: {type: Number, default: 0},
  event: [{type:Schema.Types.ObjectId, ref:'Event'}],
  achievementHistories: [ {type: Schema.Types.ObjectId, ref: 'AchievementHistory'}],
  join_meetup: {type: Number, default: 0},
  join_hackathon: {type: Number, default: 0},
  createdDate: {type: Date, default: Date.now},
  role: {type:String, default:"member"},
  phone: {type:String}
})
//
// userSchema.statics.findAchievementHistories = function(id) {
//   return this.findById(id)
//     .populate('achievementHistories')
//     .then(user => {
//       return user.achievementHistories
//     })
// }

let User = mongoose.model('User', userSchema)
module.exports = {User, AchievementHistory}