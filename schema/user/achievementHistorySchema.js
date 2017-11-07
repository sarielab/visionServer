const {AchievementHistory} = require('../../models/user')

const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLID
} = require('graphql')

const AchievementHistoryType = new GraphQLObjectType({
  name: 'AchievementHistory',
  fields: {
    _id: {type: GraphQLID},
    _user: {type: GraphQLID},
    _achievement: {type: GraphQLID}
  }
})

const AchievementHistoryInputType = new GraphQLInputObjectType({
  name: 'AchievementHistoryInputType',
  fields: {
    _user: {type: new GraphQLNonNull(GraphQLID)},
    _achievement: {type:  new GraphQLNonNull(GraphQLID)}
  }
})

const achievementHistories= {
  type: new GraphQLList(AchievementHistoryType),
  args: {
    id: {name:'id', type: GraphQLID}
  },
  resolve: (root, args) => new Promise((resolve, reject)=> {
    if (typeof args.id !== 'undefined')
      AchievementHistory.findById(args.id,(err, achievementHistories) => {
        err? reject(err) : resolve(achievementHistories)
      })
    else resolve({})

  })
}

const achievementHistory= {
  type: AchievementHistoryType,
  args: {
    id: {name:'id', type: GraphQLID}
  },
  resolve: (root, args) => new Promise((resolve, reject)=> {
    AchievementHistory.findById(args.id,(err, achievementHistory) => {
      err? reject(err) : resolve(achievementHistory)
    })
  })
}

const createAchievementHistory = {
  type: AchievementHistoryType,
  args: {
    input: {
      name: 'input',
      type: AchievementHistoryInputType
    }
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input} = args
    let n_achievementHistory = new AchievementHistory({
      _user: input._user,
      _achievement: input._achievement
    })
    n_achievementHistory.save((err, s_achievementHistory) => err? reject(err) : resolve(s_achievementHistory))
  })
}

const updateAchievementHistory = {
  type: AchievementHistoryType,
  args: {
    id: {name: 'id', type: new GraphQLNonNull(GraphQLID)},
    input: {
      name: 'input',
      type: AchievementHistoryInputType
    },
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input, id} = args
    AchievementHistory.findById(id, (err, f_achievementHistory) => {
      if (err) reject(err)
      else {
        if (typeof input._user !== 'un_userdefined') f_achievementHistory._user  = input._user
        if (typeof input._achievement !== 'undefined') f_achievementHistory._achievement  = input._achievement

        f_achievementHistory.save((err, e_achievementHistory)=> err ? reject(err.errors) : resolve(e_achievementHistory) )
      }
    })
  })
}

const deleteAchievementHistory = {
  type: AchievementHistoryType,
  args: {
    id: {name:'id',type: new GraphQLNonNull(GraphQLID)}
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {id} = args
    AchievementHistory.findById(id, (err, achievementHistory) => {
      if (err) reject(err)
      else
        achievementHistory.remove((err, d_achievementHistory)=> err? reject(err) : resolve(d_achievementHistory) )
    })
  })
}

module.exports = {
  AchievementHistoryType,
  AchievementHistoryInputType,
  achievementHistory,
  achievementHistories,
  //ini sebenernya cuma dipake buat seeding
  createAchievementHistory,
  updateAchievementHistory,
  deleteAchievementHistory
}