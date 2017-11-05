const { reward, rewards, createReward, updateReward, deleteReward} = require('./rewardSchema')
const {poin, poins, createPoin, updatePoin, deletePoin } = require('./poinSchema')
const {achievement, achievements, createAchievement, updateAchievement, deleteAchievement } = require('./achievementSchema')
const {achievementHistory, AchievementHistoryType, achievementHistories, createAchievementHistory, updateAchievementHistory, deleteAchievementHistory } = require('./achievementHistorySchema')
const {user, users, createUser, updateUser, deleteUser, updatePoinHistory, poinHistories } = require('./userSchema')
const {insertGithub } = require('./user/user_githubSchema')

module.exports = {
  reward, rewards, createReward, updateReward, deleteReward,
  poin, poins, createPoin, updatePoin, deletePoin,
  achievement, achievements, createAchievement, updateAchievement, deleteAchievement,
  AchievementHistoryType, achievementHistory, achievementHistories, createAchievementHistory, updateAchievementHistory, deleteAchievementHistory,
  user, users, createUser, updateUser, deleteUser, updatePoinHistory, poinHistories,
  insertGithub,
}