const Poin = require('../models/poin')

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

const PoinType = new GraphQLObjectType({
  name: 'Poin',
  fields: {
    _id: {type: GraphQLID},
    poin: {type: GraphQLInt},
    tipe: {type: GraphQLString},
    descr: {type: GraphQLString}
  }
})

const PoinInputType = new GraphQLInputObjectType({
  name: 'PoinInputType',
  fields: {
    poin: {type: GraphQLInt},
    descr: {type: GraphQLString},
    tipe: {type: GraphQLString}
  }
})

const poins= {
  type: new GraphQLList(PoinType),
  resolve: (root) => new Promise((resolve, reject)=> {
    Poin.find((err, poins) => {
      err? reject(err) : resolve(poins)
    })
  })
}

const poin= {
  type: PoinType,
  args: {
    id: {name:'id', type: GraphQLID}
  },
  resolve: (root, args) => new Promise((resolve, reject)=> {
    Poin.findById(args.id,(err, poin) => {
      err? reject(err) : resolve(poin)
    })
  })
}

const createPoin = {
  type: PoinType,
  args: {
    input: {
      name: 'input',
      type: PoinInputType
    }
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input} = args
    let n_poin = new Poin({
      poin: input.poin,
      descr: input.descr,
      tipe: input.tipe
    })
    n_poin.save((err, s_poin) => err? reject(err.errors) : resolve(s_poin) )
  })
}

const updatePoin = {
  type: PoinType,
  args: {
    id: {name: 'id', type: GraphQLID},
    input: {
      name: 'input',
      type: PoinInputType
    },
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input, id} = args
    Poin.findById(id, (err, f_poin) => {
      if (err) reject(err)
      else {
        if (typeof input.descr !== 'undefined') f_poin.descr  = input.descr
        if (typeof input.tipe !== 'undefined') f_poin.tipe  = input.tipe
        if (typeof input.poin !== 'undefined') f_poin.poin  = input.poin

        f_poin.save((err, e_poin)=> err? reject(err.errors) : resolve(e_poin) )
      }
    })
  })
}

const deletePoin = {
  type: PoinType,
  args: {
    id: {name:'id',type: GraphQLID}
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {id} = args
    Poin.findById(id, (err, poin) => {
      if (err) reject(err)
      else poin.remove((err, d_poin)=> err? reject(err) : resolve(d_poin) )
    })
  })
}

module.exports = {
  poin,
  poins,
  createPoin,
  updatePoin,
  deletePoin
}