const Axios = require('axios')

const {User} = require('../../models/user')
const Poin = require('../../models/poin')
const {GithubRepositoryType} = require('../userSchema')

const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
} = require('graphql')

const RepositoryType= new GraphQLList(GithubRepositoryType)

const insertGithub = {
  type: RepositoryType,
  args: {
    github_user: {name: 'github_user', type: GraphQLString},
    id: {name: 'id', type: GraphQLID}
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {github_user, id} = args
    User.findById(id)
    .exec((err, user)=> {
      if(err) reject(err)
      else {
         let username = typeof github_user !== 'undefined' ? github_user: user.github.user
         if (typeof username !== 'undefined' && username !== 'null') {
             let url = `https://api.github.com/users/${username}/repos`

             Axios.get(url)
             .then(async response => {
                if (typeof response.data !== 'undefined') {
                  let joined_repo = response.data.filter(dt => {
                    return new Date(dt.created_at).getTime() > new Date(user.createdDate).getTime()
                  })
                  let curr_repo = joined_repo.length || 0
                  let old_repo = user.github.count || 0
                  let github_repo = []

                  if (joined_repo.length > 0) {
                    let sorted_repo = joined_repo.sort((a,b)=> {
                      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
                    })
                    let len = sorted_repo.length < 10 ? sorted_repo.length : 10

                    for (let i = 0; i < len; i++)
                      github_repo.push({
                        name: sorted_repo[i].name,
                        url: sorted_repo[i].url,
                        createdDate: sorted_repo[i].created_at,
                        pushDate: sorted_repo[i].pushed_at
                      })

                    if (old_repo < curr_repo || user.repository.name !== github_user) {
                      try {
                        await Poin.findOne({tipe: 'github'},
                        (err,poin) => {
                          if (poin) {
                            user.poin = user.poin + poin.poin
                          }
                        })
                      } catch(ex) {
                        console.log(ex)
                      }
                    }
                  }
                  user.github.count = curr_repo
                  user.github.repository =  github_repo
                  user.save((err, e_user) => err? reject(err.errors) : resolve(e_user.github.repository))
                }
             })
             .catch(err => {
                 console.log(err)
                 reject(err)
             })
         }
      }
    })
  })
}

module.exports = {
  insertGithub
}