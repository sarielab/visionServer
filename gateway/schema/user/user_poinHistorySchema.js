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

const PoinHistory = require('../../models/poinHistory')
const {User} = require('../../models/user')

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

const poinHistories= {
  type: new GraphQLList(PoinHistoryType),
  args: {
    _user: {name:'_user', type: GraphQLID}
  },
  resolve: (root, args) => new Promise((resolve, reject)=> {
    PoinHistory.find({_user:args._user}, (err, phs) => err? reject(err): resolve(phs))
  })
}
//gabisa panggil mutation dalam mutation, FAK!
// const updatePoinHistory = {
//   name: 'updatePoinHistory',
//   type: PoinHistoryType,
//   args: {
//     input: {
//       name: 'input',
//       type: PoinInputHistoryType
//     },
//   },
//   resolve: (obj, args) => new Promise((resolve, reject) => {
//     const {input} = args
//     User.findById(input._user, (err, user)=> {
//       if (err) reject(err)
//       else if (user === null) reject({errors:{message: "User not found"}})
//       else {
//         Poin.findById(input._poin, (err, poin) => {
//           let i_poin = parseInt(poin.poin)
//           user.poin = user.poin || 0
//           user.descr = input.tag === "add"? 'Attend '+poin.descr : `Used on ${new Date()}`
//           user.poin = user.poin + (input.tag === 'add'? i_poin: -i_poin)
//           user.save((err, e_user) => {
//             if (err) reject(err)
//             else {
//               let ph_dt = {}
//               if (typeof input._user !== 'undefined') ph_dt._user = input._user
//               if (typeof poin.poin !== 'undefined') ph_dt.poin = poin.poin
//               if (typeof input.descr !== 'undefined') ph_dt.descr = input.descr
//               if (typeof input.tag !== 'undefined') ph_dt.tag = input.tag
//               let ph = new PoinHistory(ph_dt)
//               ph.save((err, s_ph) => err? reject(err.errors) : resolve(s_ph))
//             }
//           })
//         })
//       }
//     })
//   })
// }

module.exports = {
  poinHistories,
  // updatePoinHistory
}