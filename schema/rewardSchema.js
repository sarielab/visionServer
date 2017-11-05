const Reward = require('../models/reward')

const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLID
} = require('graphql')

const RewardType = new GraphQLObjectType({
  name: 'Reward',
  fields: {
    _id: {type: GraphQLID},
    poin: {type: GraphQLInt},
    title: {type: GraphQLString},
    descr: {type: GraphQLString},
    image: {type: GraphQLString},
    isActive: {type: GraphQLBoolean}
  }
})

const RewardInputType = new GraphQLInputObjectType({
  name: 'RewardInputType',
  fields: {
    poin: {type: GraphQLInt},
    descr: {type: GraphQLString},
    title: {type: GraphQLString},
    image: {type: GraphQLString},
    isActive: {type: GraphQLBoolean}
  }
})

const rewards= {
  type: new GraphQLList(RewardType),
  resolve: (root) => new Promise((resolve, reject)=> {
    Reward.find((err, rewards) => {
      err? reject(err) : resolve(rewards)
    })
  })
}

const reward= {
  type: RewardType,
  args: {
    id: {name:'id', type: GraphQLID}
  },
  resolve: (root, args) => new Promise((resolve, reject)=> {
    Reward.findById(args.id,(err, reward) => {
      err? reject(err) : resolve(reward)
    })
  })
}

const createReward = {
  type: RewardType,
  args: {
    input: {
      name: 'input',
      type: RewardInputType
    }
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input} = args
    let n_reward = new Reward({
      poin: input.poin,
      descr: input.descr,
      title: input.title,
      image: input.image,
      isActive: input.isActive
    })
    n_reward.save((err, s_reward) => err? reject(err.errors) : s_reward)
  })
}

const updateReward = {
  type: RewardType,
  args: {
    id: {name: 'id', type: new GraphQLNonNull(GraphQLID)},
    input: {
      name: 'input',
      type: RewardInputType
    },
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input, id} = args
    Reward.findById(id, (err, f_reward) => {
      if (err) reject(err)
      else {
        if (typeof input.descr !== 'undefined') f_reward.descr  = input.descr
        if (typeof input.image !== 'undefined') f_reward.image  = input.image
        if (typeof input.poin !== 'undefined') f_reward.poin  = input.poin
        if (typeof input.title !== 'undefined') f_reward.title  = input.title
        if (typeof input.isActive !== 'undefined') f_reward.isActive  = input.isActive

        f_reward.save((err, e_reward)=> {
          if (err) {
            // let err_msg = []
            // for (let error in err.errors) err_msg.push(err.errors[error].message)
            reject(err.errors)
          } else resolve(e_reward)
        })
      }
    })
  })
}

const deleteReward = {
  type: RewardType,
  args: {
    id: {name:'id',type: new GraphQLNonNull(GraphQLID)}
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {id} = args
    Reward.findById(id, (err, reward) => {
      if (err) reject(err)
      else {
        reward.remove((err, d_reward)=> {
          err? reject(err) : resolve(d_reward)
        })
      }
    })
  })
}

module.exports = {
  reward,
  rewards,
  createReward,
  updateReward,
  deleteReward
}