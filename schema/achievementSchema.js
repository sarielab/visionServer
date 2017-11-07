const Achievement = require('../models/achievement')

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

const AchievementType = new GraphQLObjectType({
  name: 'Achievement',
  fields: {
    _id: {type: GraphQLID},
    poin: {type: GraphQLInt},
    unlock_num: {type: GraphQLInt},
    unlock_desc: {type: GraphQLString},
    title: {type: GraphQLString},
    descr: {type: GraphQLString},
    image: {type: GraphQLString}
  }
})

const AchievementInputType = new GraphQLInputObjectType({
  name: 'AchievementInputType',
  fields: {
    poin: {type: GraphQLInt},
    descr: {type: GraphQLString},
    unlock_num: {type: GraphQLInt},
    unlock_desc: {type: GraphQLString},
    title: {type: GraphQLString},
    image: {type: GraphQLString}
  }
})

const achievements= {
  type: new GraphQLList(AchievementType),
  resolve: (root) => new Promise((resolve, reject)=> {
    Achievement.find((err, achievements) => {
      err? reject(err) : resolve(achievements)
    })
  })
}

const achievement= {
  type: AchievementType,
  args: {
    id: {name:'id', type: GraphQLID}
  },
  resolve: (root, args) => new Promise((resolve, reject)=> {
    Achievement.findById(args.id,(err, achievement) => {
      err? reject(err) : resolve(achievement)
    })
  })
}

const createAchievement = {
  type: AchievementType,
  args: {
    input: {
      name: 'input',
      type: AchievementInputType
    }
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input} = args
    let n_achievement = new Achievement({
      poin: input.poin,
      descr: input.descr,
      title: input.title,
      unlock_num: input.unlock_num,
      unlock_desc: input.unlock_desc,
      image: input.image
    })
    n_achievement.save((err, s_achievement) =>{
      console.log(err)
      console.log(s_achievement)
       err? reject(err.errors) : resolve(s_achievement)
     })
  })
}

const updateAchievement = {
  type: AchievementType,
  args: {
    id: {name: 'id', type: new GraphQLNonNull(GraphQLID)},
    input: {
      name: 'input',
      type: AchievementInputType
    },
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input, id} = args
    Achievement.findById(id, (err, f_achievement) => {
      if (err) reject(err)
      else {
        if (typeof input.descr !== 'undefined') f_achievement.descr  = input.descr
        if (typeof input.image !== 'undefined') f_achievement.image  = input.image
        if (typeof input.poin !== 'undefined') f_achievement.poin  = input.poin
        if (typeof input.title !== 'undefined') f_achievement.title  = input.title
        if (typeof input.unlock_num !== 'undefined') f_achievement.unlock_num  = input.unlock_num
        if (typeof input.unlock_desc !== 'undefined') f_achievement.unlock_desc  = input.unlock_desc

        f_achievement.save((err, e_achievement)=> err ? reject(err.errors) : resolve(e_achievement) )
      }
    })
  })
}

const deleteAchievement = {
  type: AchievementType,
  args: {
    id: {name:'id',type: new GraphQLNonNull(GraphQLID)}
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {id} = args
    Achievement.findById(id, (err, achievement) => {
      if (err) reject(err)
      else achievement.remove((err, d_achievement)=> err? reject(err) : resolve(d_achievement) )
    })
  })
}

module.exports = {
  achievement,
  achievements,
  createAchievement,
  updateAchievement,
  deleteAchievement
}