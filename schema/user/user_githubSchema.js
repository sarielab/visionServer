const {User} = require('../../models/user')
const {GithubRepositoryType} = require('../userSchema')
const Axios = require('axios')

const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
} = require('graphql')

// const RepositoryType = new GraphQLObjectType({
//   name: "RepositoryType",
//   fields: {
//       repository: {type: new GraphQLList(GithubRepositoryType)}
//   }
// })

const RepositoryType= new GraphQLList(GithubRepositoryType)

//taredit
//kalo dah ada api bisa diapus

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
             .then(response => {
                 if (typeof response.data !== 'undefined') {
                     let sorted_repo = response.data.sort((a,b)=> {
                         return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
                     })
                     
                     let len = sorted_repo.length < 10 ? sorted_repo.length : 10
                     let github_repo = []
                     
                     for (let i = 0; i < len; i++)
                         github_repo.push({
                             name: sorted_repo[i].name,
                             url: sorted_repo[i].url,
                             createdDate: sorted_repo[i].created_at,
                             pushDate: sorted_repo[i].pushed_at
                         })
                     
                     user.github.repository =  github_repo
                     user.save((err, e_user) => err? reject(err.errors) : resolve(e_user.github.repository))
                 }
             })
             .catch(err => {
                 console.log(err)
                 reject(err)
             })
         } 
         
         
        // let github_1 = {}
        // 
        // //taredit
        // //disini dia panggil githubAPI by pushDate
        // //trus masukin ke github_repo
        // let github_repo = github.repository || []
        // 
        // if (github_repo.length > 0) {
        //   //ngurutin lagi
        //   github_repo.sort((a,b)=> {
        //     return new Date(a.pushDate).getTime() - new Date(b.pushDate).getTime()
        //   })
        // }
        // 
        // //sebenernya kalo dah ada API udah ga perlu lagi :D
        // //bisa diapus
        // if (typeof input.github_repo_name !== 'undefined') github_1.name = input.github_repo_name
        // if (typeof input.github_repo_url !== 'undefined') github_1.url = input.github_repo_url
        // if (typeof input.github_repo_createdDate !== 'undefined') github_1.cr = input.github_repo_createdDate
        // if (typeof input.github_repo_pushDate !== 'undefined') github_1.pushDate = input.github_repo_pushDate
        // 
        // if (github.repository.length == 10) {
        //   github.repository.slice(9,1,github_1)
        // } else github.repository.push(github_1)
        // 
        // if (Object.keys(github_repo).length > 0) github.repository = github_repo
        // if (Object.keys(github).length > 0) user.github = github

        //baru deh save
        // user.save((err, e_user) => err? reject(err.errors) : resolve(e_user))
        
        
        
      }
    })
  })
}

module.exports = {
  insertGithub
}