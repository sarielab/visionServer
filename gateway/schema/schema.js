const {
  GraphQLObjectType,
  GraphQLSchema
} = require('graphql')

const {
  reward, rewards, createReward, deleteReward, updateReward,
  achievement, achievements, createAchievement, deleteAchievement, updateAchievement, AchievementHistoryType,
  poin, poins, createPoin, deletePoin, updatePoin,
  users, user, createUser, updateUser, deleteUser, poinHistories, addAchievementHistory, insertGithub, useReward,
  events, event, joinEvent, approveEvent, createEvent, updateEvent, deleteEvent,
  createAchievementHistory,
} = require('./index')


const appQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    rewards, reward,
    achievements, achievement,
    poins, poin,
    users, user,
    poinHistories,
    events, event
  }
})
const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createReward, deleteReward, updateReward,
    createAchievement, deleteAchievement, updateAchievement,
    createPoin, deletePoin, updatePoin,
    createUser,updateUser,deleteUser, insertGithub, addAchievementHistory, useReward,
    createAchievementHistory,
    createEvent,approveEvent, joinEvent, updateEvent, deleteEvent,
  }
})
const appSchema = new GraphQLSchema({
  query: appQuery,
  mutation: mutationType
})

module.exports = appSchema