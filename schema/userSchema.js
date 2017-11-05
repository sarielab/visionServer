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

const {User} = require('../models/user')
const PoinHistory = require('../models/poinHistory')
const Poin = require('../models/poin')
const {achievementHistories} = require('./achievementHistorySchema')

const GithubRepositoryType = new GraphQLObjectType({
  name: "GithubRepositoryType",
  fields: {
    name: {type: GraphQLString},
    url: {type: GraphQLString}
  }
})

const PoinHistoryType = new GraphQLObjectType({
  name: "PoinHistoryType",
  fields: {
    _id: {type: new GraphQLNonNull(GraphQLID)},
    _user: {type: new GraphQLNonNull(GraphQLID)},
    _poin: {type: new GraphQLNonNull(GraphQLID)},
    poin: {type: GraphQLInt},
    descr: {type: GraphQLString},
    tag: {type: GraphQLString}
  }
})

const PoinInputHistoryType = new GraphQLInputObjectType({
  name: "PoinInputHistoryType",
  fields: {
    _user: {type: new GraphQLNonNull(GraphQLID)},
    _poin: {type: new GraphQLNonNull(GraphQLID)},
    descr: {type: GraphQLString},
    tag: {type: GraphQLString}
  }
})

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: {
    _id: {type: GraphQLID},
    fb_name: {type: GraphQLString},
    fb_photo: {type: GraphQLString},
    poin: {type: GraphQLInt},
    descr: {type: GraphQLString},
    achievementHistories: achievementHistories,
    github: {
      type: new GraphQLObjectType({
        name: "GithubType",
        fields: {
          user: {type: GraphQLString},
          repository: {type: new GraphQLList(GithubRepositoryType)}
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
    }
  },
})

const UserInputType = new GraphQLInputObjectType({
  name: 'UserInputType',
  fields: {
    _id: {type: GraphQLID},
    fb_name: {type: GraphQLString},
    fb_photo: {type: GraphQLString},
    poin: {type: GraphQLInt},
    descr: {type: GraphQLString},
    github_user: {type: GraphQLString},
    // github_repo_name: {type: GraphQLString},
    // github_repo_url: {type: GraphQLString},
    // github_repo_createdDate: {type: GraphQLString},
    // github_repo_pushDate: {type: GraphQLString}
  },
})

const users= {
  type: new GraphQLList(UserType),
  resolve: (root) => new Promise((resolve, reject)=> {
    User.find((err, users) => err? reject(err) : resolve(users))
  })
}

const poinHistories= {
  type: new GraphQLList(PoinHistoryType),
  args: {
    _user: {name:'_user', type: GraphQLID}
  },
  resolve: (root, args) => new Promise((resolve, reject)=> {
    PoinHistory.find({_user:args._user}, (err, phs) => err? reject(err): resolve(phs))
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
        console.log('err find by id')
        reject(err)
      } else {
        let achievements = User.findAchievementHistories(args._id)
        user.achievementHistories = achievements
        resolve(user)
        // err? reject(err) : resolve(user)
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
    // let github_repo = []

    if (typeof input.fb_name !== 'undefined') facebook.name = input.fb_name
    if (typeof input.fb_photo !== 'undefined') facebook.photo = input.fb_photo
    if (typeof input.github_user !== 'undefined') github.user = input.github_user
    // if (typeof input.github_repo_name !== 'undefined') github_repo.name = input.github_repo_name
    // if (typeof input.github_repo_url !== 'undefined') github_repo.url = input.github_repo_url
    // if (typeof input.github_repo_createdDate !== 'undefined') github_repo.cr = input.github_repo_createdDate
    // if (typeof input.github_repo_pushDate !== 'undefined') github_repo.push = input.github_repo_pushDate
    if (typeof input.descr !== 'undefined') user_dt.descr = input.descr
    if (typeof input.poin !== 'undefined') user_dt.poin = input.poin
    if (Object.keys(facebook).length > 0) user_dt.facebook = facebook
    // if (Object.keys(github_repo).length > 0) github.repository = github_repo
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
        // if (typeof input.github_repo_name !== 'undefined') github_repo.name = input.github_repo_name
        // if (typeof input.github_repo_url !== 'undefined') github_repo.url = input.github_repo_url
        // if (typeof input.github_repo_createdDate !== 'undefined') github_repo.cr = input.github_repo_createdDate
        // if (typeof input.github_repo_pushDate !== 'undefined') github_repo.push = input.github_repo_pushDate
        if (typeof input.descr !== 'undefined') user.descr = input.descr
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

const updatePoinHistory = {
  name: 'updatePoinHistory',
  type: PoinHistoryType,
  args: {
    input: {
      name: 'input',
      type: PoinInputHistoryType
    },
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input} = args
    User.findById(input._user, (err, user)=> {
      if (err) reject(err)
      else if (user === null) reject({errors:{message: "User not found"}})
      else {
        Poin.findById(input._poin, (err, poin) => {
          let i_poin = parseInt(poin.poin)
          user.poin = user.poin || 0
          user.descr = input.tag === "add"? 'Attend '+poin.descr : `Used on ${new Date()}`
          user.poin = user.poin + (input.tag === 'add'? i_poin: -i_poin)
          user.save((err, e_user) => {
            if (err) reject(err)
            else {
              let ph_dt = {}
              if (typeof input._user !== 'undefined') ph_dt._user = input._user
              if (typeof poin.poin !== 'undefined') ph_dt.poin = poin.poin
              if (typeof input.descr !== 'undefined') ph_dt.descr = input.descr
              if (typeof input.tag !== 'undefined') ph_dt.tag = input.tag
              let ph = new PoinHistory(ph_dt)
              ph.save((err, s_ph) => err? reject(err.errors) : resolve(s_ph))
            }
          })
        })
      }
    })
  })
}

module.exports = {
  user,
  users,
  poinHistories,
  createUser,
  updateUser,
  deleteUser,
  updatePoinHistory
}