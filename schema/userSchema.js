const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  graphql
} = require('graphql')

const {User,AchievementHistory} = require('../models/user')
const Poin = require('../models/poin')
const Achievement = require('../models/achievement')
const PoinHistory = require('../models/poinHistory')
const Reward = require('../models/reward')
const {achievementHistories, AchievementHistoryType, AchievementHistoryInputType} = require('./user/achievementHistorySchema')
const appSchema = require('./schema')

const GithubRepositoryType = new GraphQLObjectType({
  name: "GithubRepositoryType",
  fields: {
    name: {type: GraphQLString},
    url: {type: GraphQLString},
    count: {type: GraphQLInt}
  }
})

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: {
    _id: {type: GraphQLID},
    event: {type: new GraphQLList(GraphQLID) },
    poin: {type: GraphQLInt},
    descr: {type: GraphQLString},
    email: {type: GraphQLString},
    phone: {type: GraphQLString},
    role: {type: GraphQLString},
    achievementHistories: achievementHistories,
    github: {
      type: new GraphQLObjectType({
        name: "GithubType",
        fields: {
          user: {type: GraphQLString},
          repository: {type: new GraphQLList(GithubRepositoryType)},
          count: {type: GraphQLInt}
        }
      })
    },
    facebook: {
      type: new GraphQLObjectType({
        name: 'FacebookType',
        fields: {
          name: {type: GraphQLString},
          photo: {type: GraphQLString}
        }
      })
    },
    join_meetup: {type: GraphQLInt},
    join_hackathon: {type: GraphQLInt},
  },
})

const UserInputType = new GraphQLInputObjectType({
  name: 'UserInputType',
  fields: {
    _id: {type: GraphQLID},
    fb_name: {type: GraphQLString},
    fb_photo: {type: GraphQLString},
    phone: {type: GraphQLString},
    poin: {type: GraphQLInt},
    descr: {type: GraphQLString},
    email: {type: GraphQLString},
    role: {type: GraphQLString},
    github_user: {type: GraphQLString},
  },
})

const users= {
  type: new GraphQLList(UserType),
  args: {
    role: {name:'role', type: GraphQLString}
  },
  resolve: (root,args) => new Promise((resolve, reject)=> {
    let search = {}
    if (typeof args.role !== 'undefined') search.role = args.role

    User.find(search,(err, users) => {
      console.log('done get')
      err? reject(err) : resolve(users)
    })
  })
}

const user= {
  type: UserType,
  args: {
    id: {name:'id', type: GraphQLID}
  },
  resolve: (root, args) => new Promise((resolve, reject)=> {
    User.findById(args.id,(err, user) => {
      if (err) {
        reject(err)
      } else {
        // let achievements = User.findAchievementHistories(args._id)
        // console.log(achievements)
        // user.achievementHistories = achievements
        resolve(user)
      }
    })
  })
}

const createUser = {
  type: UserType,
  args: {
    input: {
      name: 'input',
      type: UserInputType
    }
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input} = args
    let user_dt = {}
    let facebook = {}
    let github = {}

    if (typeof input.fb_name !== 'undefined') facebook.name = input.fb_name
    if (typeof input.fb_photo !== 'undefined') facebook.photo = input.fb_photo
    if (typeof input.github_user !== 'undefined') github.user = input.github_user
    if (typeof input.descr !== 'undefined') user_dt.descr = input.descr
    if (typeof input.phone !== 'undefined') user_dt.phone = input.phone
    if (typeof input.email !== 'undefined') user_dt.email = input.email
    if (typeof input.role !== 'undefined') user_dt.role = input.role
    if (typeof input.poin !== 'undefined') user_dt.poin = input.poin
    if (Object.keys(facebook).length > 0) user_dt.facebook = facebook
    if (Object.keys(github).length > 0) user_dt.github = github

    let n_user = new User(user_dt)

    n_user.save((err, s_user) => err? reject(err.errors) : resolve(s_user))
  })
}

const updateUser = {
  type: UserType,
  args: {
    input: {
      name: 'input',
      type: UserInputType
    },
    id: {name: 'id', type: GraphQLID}
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input, id} = args

    User.findById(id, (err, user)=> {
      if(err) reject(err)
      else {
        let facebook = user.facebook || {}
        let github = user.github || {}
        let github_repo = github.repository || []

        if (typeof input.fb_name !== 'undefined') facebook.name = input.fb_name
        if (typeof input.fb_photo !== 'undefined') facebook.photo = input.fb_photo
        if (typeof input.github_user !== 'undefined') github.user = input.github_user
        if (typeof input.descr !== 'undefined') user.descr = input.descr
        if (typeof input.phone !== 'undefined') user.phone = input.phone
        if (typeof input.email !== 'undefined') user.email = input.email
        if (typeof input.role !== 'undefined') user.role = input.role
        if (typeof input.poin !== 'undefined') user.poin = input.poin
        if (Object.keys(facebook).length > 0) user.facebook = facebook
        if (Object.keys(github_repo).length > 0) github.repository = github_repo
        if (Object.keys(github).length > 0) user.github = github

        user.save((err, e_user) => err? reject(err.errors) : resolve(e_user))
      }
    })

  })
}

const deleteUser = {
  type: UserType,
  args: {
    id: {name: 'id', type: GraphQLID}
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {id} = args

    User.findById(id, (err, user)=> {
      if(err) reject(err)
      else {
        user.remove((err, d_user) => err? reject(err.errors) : resolve(d_user))
      }
    })

  })
}

//ini achievement history yg kepake HAHAHAHHA
const addAchievementHistory = {
  type: AchievementHistoryType,
  args: {
    input: {
      name: 'input',
      type: AchievementHistoryInputType
    },
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input} = args
    User.findById(input._user, async (err, user)=> {
      if (err) reject(err)
      else if (user === null) reject({errors:{message: "User not found"}})
      else {
        try {
          Achievement.findById(input._achievement, (err,acv) => {
            if (err) reject(err)
            else if (acv === null)  reject({errors:{message: "Achievement not found"}})
            else {
              let n_achievementHistory = new AchievementHistory({
                _user: user._id,
                _achievement: input._achievement
              })

              n_achievementHistory.save((err, s_achievementHistory) => {
                if (err) reject(err)

                user.poin += acv.poin
                user.achievementHistory = user.achievementHistory || []
                user.achievementHistory.push(s_achievementHistory._id)
                user.save((err,a_user)=> err? reject(err): resolve(s_achievementHistory))
              })
            }
          })

        } catch(ex) {console.log('kita masuk ex');console.log(ex)}
      }
    })
  })
}

const useReward = {
  type: UserType,
  args: {
    _user: {type:new GraphQLNonNull(GraphQLID)},
    _reward: {type:new GraphQLNonNull(GraphQLID)}
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    User.findById(args._user, (err, user)=> {
      if (err) reject(err)
      else if (user === null) reject({errors:{message: "User not found"}})
      else {
        Reward.findById(args._reward, async (err,reward)=> {
          if (err) reject(err)
          else if (reward === null)reject({errors:[{"message": "Reward not found"}]})
          else if (user.poin < reward.poin) reject({errors:[{"message": "Insufficient Poin"}]})
          else {
            try {
              let ph_dt = {}
              ph_dt._user = user._id
              ph_dt.tag = "subtract"
              ph_dt.descr = user.descr
              ph_dt.poin = reward.poin
              let ph = new PoinHistory(ph_dt)
              await ph.save((err, s_ph) => err? console.log(err.errors) : console.log(s_ph))
              user.poin -= reward.poin
              user.save((err,a_user)=> err? reject(err): resolve(a_user))

            } catch(ex) {console.log(ex)}
          }
        })
      }
    })
  })
}


module.exports = {
  user,
  users,
  createUser,
  updateUser,
  deleteUser,
  addAchievementHistory,
  useReward,
  GithubRepositoryType,
}