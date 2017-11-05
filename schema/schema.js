const {
  GraphQLObjectType,
  GraphQLSchema
} = require('graphql')

const {
  reward, rewards, createReward, deleteReward, updateReward,
  achievement, achievements, createAchievement, deleteAchievement, updateAchievement, AchievementHistoryType,
  poin, poins, createPoin, deletePoin, updatePoin,
  users, user, createUser, updateUser, deleteUser, updatePoinHistory, poinHistories,
  insertGithub,
} = require('./index')


const appQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    rewards,
    reward,
    achievements,
    achievement,
    poins,
    poin,
    users,
    user,
    poinHistories
  }
})
const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createReward,
    deleteReward,
    updateReward,
    createAchievement,
    deleteAchievement,
    updateAchievement,
    createPoin,
    deletePoin,
    updatePoin,
    createUser,
    updateUser,
    deleteUser,
    updatePoinHistory,
    insertGithub,
  }
})
const appSchema = new GraphQLSchema({
  query: appQuery,
  mutation: mutationType
})

module.exports = appSchema