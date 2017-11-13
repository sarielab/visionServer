const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  graphql,
} = require('graphql')

const {User} = require('../models/user')
const PoinHistory = require('../models/poinHistory')
const Poin = require('../models/poin')
const Event = require('../models/event')
const {users} = require('./userSchema')
const {sendEmail} = require('../cron/index')
const {sendMessage} = require('../mainAPI/main')

const EventType = new GraphQLObjectType({
  name: 'EventType',
  fields: {
    _id: {type: GraphQLID},
    name: {type:GraphQLString},
    descr: {type:GraphQLString},
    // poin: {type: GraphQLInt},
    tipe: {type: GraphQLString},
    image: {
      type: new GraphQLObjectType({
        name: "ImageType",
        fields: {
          standard: {type: GraphQLString},
          vr: {type: new GraphQLList(GraphQLString)},
        }
      })
    },
    location: {
      type: new GraphQLObjectType({
        name: "LocationType",
        fields: {
          lat: {type: GraphQLString},
          lng: {type: GraphQLString},
          name: {type: GraphQLString},
        }
      })
    },
    url: {type: GraphQLString},
    date: {
      type: new GraphQLObjectType({
        name: "DateType",
        fields: {
          join_start: {type: GraphQLString},
          join_end: {type: GraphQLString},
          event: {type: GraphQLString},
        }
      })
    },
    participant: users,
    _organizer: {type: GraphQLString},
    approved: {type: GraphQLInt}
  }
})
const EventInputType = new GraphQLInputObjectType({
  name: 'EventInputType',
  fields: {
    // poin: {type: GraphQLInt},
    tipe: {type: GraphQLString},
    name: {type: GraphQLString},
    descr: {type: GraphQLString},
    image_standard: {type: GraphQLString},
    image_vr: {type: new GraphQLList(GraphQLString)},
    location_lat: {type: GraphQLString},
    location_lng: {type: GraphQLString},
    location_name: {type: GraphQLString},
    url: {type: GraphQLString},
    date_join_start: {type: GraphQLString},
    date_join_end: {type: GraphQLString},
    date_event: {type: GraphQLString},
    participant: {type: GraphQLID},
    _organizer: {type: GraphQLString},
    approved: {type: GraphQLInt}
  }
})

const events =  {
  type: new GraphQLList(EventType),
  args: {
    approved: {name:'approved', type:GraphQLInt},
    date_start: {name:'date_start', type:GraphQLString},
    date_event: {name:'date_event', type:GraphQLString},
    tipe: {name:'tipe', type: GraphQLString},
  },
  resolve: (root,args) => new Promise((resolve, reject)=> {
    let {date_start, date_event, approved, tipe} = args
    let search = {}

    // search.approved = (typeof approved != 'undefined') ?  approved : 1
    if(typeof approved !== 'undefined') search.approved =  approved
    if(typeof tipe !== 'undefined') search.tipe =  tipe
    if(typeof date_start !== 'undefined') search['date.join_start'] =  {$eq: date_start }
    if(typeof date_event !== 'undefined') search['date.event'] =  {$eq: date_event }

    Event.find(search,(err, events) => err? reject(err) : resolve(events) )
  })
}
const event= {
  type: EventType,
  args: {
    id: {name:'id', type: GraphQLID}
  },
  resolve: (root, args) => new Promise((resolve, reject)=> {
    Event.findById(args.id,(err, event) => {
      err? reject(err) : resolve(event)
    })
  })
}

const createEvent = {
  type: EventType,
  args: {
    input: {
      name: 'input',
      type: EventInputType
    }
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input} = args
    let event_dt = {}
    let image = {}
    let location = {}
    let date = {}

    // if (typeof input.poin !== 'undefined') event_dt.poin = input.poin
    if (typeof input.descr !== 'undefined') event_dt.descr = input.descr
    if (typeof input.tipe !== 'undefined') event_dt.tipe = input.tipe
    if (typeof input.name !== 'undefined') event_dt.name = input.name
    if (typeof input.image_standard !== 'undefined') image.standard = input.image_standard
    if (typeof input.image_vr !== 'undefined') image.vr = input.image_vr
    if (typeof input.location_lat !== 'undefined') location.lat = input.location_lat
    if (typeof input.location_lng !== 'undefined') location.lng = input.location_lng
    if (typeof input.location_name !== 'undefined') location.name = input.location_name
    if (typeof input.date_join_start !== 'undefined') date.join_start = input.date_join_start
    if (typeof input.date_join_end !== 'undefined') date.join_end = input.date_join_end
    if (typeof input.date_event !== 'undefined') date.event = input.date_event
    if (typeof input.url !== 'undefined') event_dt.url = input.url
    if (typeof input._organizer !== 'undefined') event_dt._organizer = input._organizer
    if (Object.keys(date).length > 0) event_dt.date = date
    if (Object.keys(location).length > 0) event_dt.location = location
    if (Object.keys(image).length > 0) event_dt.image = image

    let n_event = new Event(event_dt)
    n_event.save((err, s_event) => {console.log(err);err? reject(err.errors) : resolve(s_event)} )
  })
}

const approveEvent = {
  type: EventType,
  args: {
    id: {name:'id',type: new GraphQLNonNull(GraphQLID)},
    approved: {name:'approved', type: new GraphQLNonNull(GraphQLInt)},
    approved_by: {name:'approved_by',type: new GraphQLNonNull(GraphQLID)},
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {id, approved, approved_by} = args
    User.findById(approved_by, (err,admin)=>{
      if (err) reject(err)
      else if (admin.role !== 'admin') reject()
      else {
        Event.findById(id, (err, event) => {
          if (err) reject(err)
          else {
            event.approved = approved
            event.save((err, a_event)=> err? reject(err) : resolve(a_event) )
          }
        })
      }
    })
  })
}

const joinEvent = {
  type: EventType,
  args: {
    id: {name:'id',type: new GraphQLNonNull(GraphQLID)},
    participant: {name:'participant', type: new GraphQLNonNull(GraphQLID)}
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    console.log(args)

    const {id, participant} = args
    //, approved:1
    Event.findOne({_id:id}, (err, event) => {
      console.log('============================================1')
      console.log(err)
      if (err) reject(err)
      else if (event === null)reject({errors:{"message": "Event hasnt been approved"}})
      else {
        event.participant = event.participant || []
        event.participant.push(participant)
        event.save((err, j_event)=> {
          if(err) reject(err)
          else {
            //taredit
            //trus nanti malam si cron ngecek deh
            User.findById(participant, async (err,user) => {
              if (err) reject(err)
              else {
                try {
                  await Poin.findOne({tipe:event.tipe},(err,poin)=>{
                    if (poin) {
                      user.poin += poin.poin
                      let i_poin = parseInt(poin.poin)
                      let ph_dt = {}

                      user.descr = `Attend ${event.name} (${event.tipe} )`
                      user[`join_${event.tipe}`] += 1
                      user.poin = user.poin + i_poin
                      ph_dt._user = user._id
                      ph_dt.tag = "add"
                      ph_dt.descr = user.descr
                      ph_dt.poin = i_poin

                      let ph = new PoinHistory(ph_dt)

                      ph.save((err, s_ph) => err? console.log(err.errors) : console.log(s_ph))

                    }
                  })

                  user.event = user.event || []
                  user.event.push(id)

                  let mailOptions = {
                    from: '"VISION" <noreply@vision.com>', // sender address
                    to: user.email,
                    subject: `[${event.tipe.toUpperCase()}]${event.name}`, // Subject line
                    text: `Hi Coders!\n\nYou are joining ${event.name} ${event.tipe} on ${event.date.event} at ${event.location.name}\n\nGood luck!`, // plain text body
                    html: `Hi Coders!<br/><br/>You are joining ${event.name} ${event.tipe} on ${event.date.event} at ${event.location.name}<br/><br/>Good luck!`, // plain text body
                  }

                  // let smsContent = `Hi Coders! Join us at ${event.name} ${event.tipe}`
                  // sendMessage(user.phone, smsContent)
                  sendEmail(mailOptions)

                  user.save((err,j_user) => err? reject(err) : resolve(j_event) )
                } catch(ex) {console.log(ex)}
              }
            })
          }
        })
      }
    })
  })
}
//
const updateEvent = {
  type: EventType,
  args: {
    id: {name: 'id', type: GraphQLID},
    input: {
      name: 'input',
      type: EventInputType
    },
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {input, id} = args
    Event.findById(id, (err, f_event) => {
      if (err) reject(err)
      else {
        let image = {}
        let location = {}
        let date = {}

        // if (typeof input.poin !== 'undefined') f_event.poin = input.poin
        if (typeof input.descr !== 'undefined') f_event.descr = input.descr
        if (typeof input.tipe !== 'undefined') f_event.tipe = input.tipe
        if (typeof input.name !== 'undefined') f_event.name = input.name
        if (typeof input.image_standard !== 'undefined') image.standard = input.image_standard
        if (typeof input.image_vr !== 'undefined') image.vr = input.image_vr
        if (typeof input.location_lat !== 'undefined') location.lat = input.location_lat
        if (typeof input.location_lng !== 'undefined') location.lng = input.location_lng
        if (typeof input.location_name !== 'undefined') location.name = input.location_name
        if (typeof input.date_join_start !== 'undefined') date.join_start = input.date_join_start
        if (typeof input.date_join_end !== 'undefined') date.join_end = input.date_join_end
        if (typeof input.date_event !== 'undefined') date.event = input.date_event
        if (typeof input.url !== 'undefined') f_event.url = input.url
        if (typeof input._organizer !== 'undefined') f_event._organizer = input._organizer
        if (Object.keys(date).length > 0) f_event.date = date
        if (Object.keys(location).length > 0) f_event.location = location
        if (Object.keys(image).length > 0) f_event.image = image

        f_event.save((err, e_event)=> err? reject(err.errors) : resolve(e_event) )
      }
    })
  })
}

const deleteEvent = {
  type: EventType,
  args: {
    id: {name:'id',type: GraphQLID}
  },
  resolve: (obj, args) => new Promise((resolve, reject) => {
    const {id} = args
    Event.findById(id, (err, event) => {
      if (err) reject(err)
      else if(event !== null) event.remove((err, d_event)=> err? reject(err) : resolve(d_event) )
      else reject({err: "no data"})
    })
  })
}

module.exports = {
  event,
  events,
  createEvent,
  joinEvent,
  approveEvent,
  updateEvent,
  deleteEvent
}