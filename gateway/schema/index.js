const { reward, rewards, createReward, updateReward, deleteReward} = require('./rewardSchema')
const {poin, poins, createPoin, updatePoin, deletePoin } = require('./poinSchema')
const {achievement, achievements, createAchievement, updateAchievement, deleteAchievement } = require('./achievementSchema')
const {achievementHistory, AchievementHistoryType, achievementHistories, createAchievementHistory, updateAchievementHistory, deleteAchievementHistory } = require('./user/achievementHistorySchema')
const {user, users, createUser, updateUser, deleteUser, addAchievementHistory, useReward } = require('./userSchema')
const {poinHistories } = require('./user/user_poinHistorySchema')
const {insertGithub } = require('./user/user_githubSchema')
const {events, event, joinEvent, approveEvent, createEvent, updateEvent, deleteEvent } = require('./eventSchema')

module.exports = {
  reward, rewards, createReward, updateReward, deleteReward,
  poin, poins, createPoin, updatePoin, deletePoin,
  achievement, achievements, createAchievement, updateAchievement, deleteAchievement,
  AchievementHistoryType, achievementHistory, achievementHistories, createAchievementHistory, updateAchievementHistory, deleteAchievementHistory,
  user, users, createUser, updateUser, deleteUser, poinHistories, addAchievementHistory, useReward,
  insertGithub,
  events, event, joinEvent, approveEvent, createEvent, updateEvent, deleteEvent,
}