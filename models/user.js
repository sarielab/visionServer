const mongoose = require('mongoose')
const Schema = mongoose.Schema

/*
  achievement dia liat tuh pas di date udah ada 10 ato belum kalo belum maka ditambahin ke poin
  kalo ga ya udah ga ketambahan....

  repo dari push date
*/

let achievementHistorySchema = new Schema({
  _id: { type: String },
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
    ]
  },
  descr: String,
  poin: {type: Number, default: 0},
  achievementHistories: [ {type: Schema.Types.ObjectId, ref: 'AchievementHistory'}]
})

userSchema.statics.findAchievementHistories = function(id) {
  return this.findById(id)
    .populate('achievementHistories')
    .then(user => {
      return user.achievementHistories
    })
}

let User = mongoose.model('User', userSchema)
module.exports = {User, AchievementHistory}