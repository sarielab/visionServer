const {User} = require('../../models/user')

const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
} = require('graphql')

const RepositoryType = new GraphQLObjectType({
  name: "RepositoryType",
  fields: {
    name: {type: GraphQLString},
    url: {type: GraphQLString}
  }
})

//taredit
//kalo dah ada api bisa diapus
const RepositoryInputType = new GraphQLInputObjectType({
  name: 'RepositoryInputType',
  fields: {
    _id: {type: GraphQLID},
    github_user: {type: GraphQLString},
    github_repo_name: {type: GraphQLString},
    github_repo_url: {type: GraphQLString},
    github_repo_pushDate: {type: GraphQLString}
  },
})

const insertGithub = {
  type: RepositoryType,
  args: {
    input: {
      name: 'input',
      type: RepositoryInputType
    },
    id: {name: 'id', type: GraphQLID}
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input, id} = args

    User.findById(id)
    // .sort({'github.repository.pushDate':'desc'})
    .exec((err, user)=> {
      if(err) reject(err)
      else {
        let github_1 = {}

        //taredit
        //disini dia panggil githubAPI by pushDate
        //trus masukin ke github_repo
        let github_repo = github.repository || []

        if (github_repo.length > 0) {
          //ngurutin lagi
          github_repo.sort((a,b)=> {
            return new Date(a.pushDate).getTime() - new Date(b.pushDate).getTime()
          })
        }

        //sebenernya kalo dah ada API udah ga perlu lagi :D
        //bisa diapus
        if (typeof input.github_repo_name !== 'undefined') github_1.name = input.github_repo_name
        if (typeof input.github_repo_url !== 'undefined') github_1.url = input.github_repo_url
        if (typeof input.github_repo_createdDate !== 'undefined') github_1.cr = input.github_repo_createdDate
        if (typeof input.github_repo_pushDate !== 'undefined') github_1.pushDate = input.github_repo_pushDate

        if (github.repository.length == 10) {
          github.repository.slice(9,1,github_1)
        } else github.repository.push(github_1)

        if (Object.keys(github_repo).length > 0) github.repository = github_repo
        if (Object.keys(github).length > 0) user.github = github

        //baru deh save
        user.save((err, e_user) => err? reject(err.errors) : resolve(e_user))
      }
    })
  })
}

module.exports = {
  insertGithub
}