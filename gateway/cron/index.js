'use strict'
require('dotenv').config()
const https = require('https')
const nodemailer = require('nodemailer')
const cronJob = require('cron').CronJob
const kue = require('kue')
const {graphql} = require('graphql')
const appSchema = require('../schema/schema')
const {sendMessage} = require('../mainAPI/main')

const queue = kue.createQueue()

const query = str => {return graphql(appSchema, str) }
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const createJOB = (jobname,priority='low') => {
  let job =
    queue.create(jobname)
    .priority(priority)
    .attempts(5)
    .save(err => console.log(err? err : job.id))

  job.on('complete', res => console.log(`complete\n${res}`))
  job.on('failed', err => console.log(err) );
}
//taredit
//hardcode tanggal
//jam cron belum seragam
const insertGithub = () => {
  let blastEvent = new cronJob('* * 19 0 0 *' ,
    function() {
      query(`
        {
          users {
            _id
            github {
              user
            }
          }
        }
      `).then(response => {
        if (typeof response.data !== 'undefined') {
          response.data.users.forEach(user => {
            query(`mutation{
              insertGithub(github_user:"${user.github.user}", id:"${user._id}"){count}
            }`).then(response2 => {
              if (response2.errors !== 'undefined') console.log(response2.errors)
            })
          })

        }
        else if (typeof response.errors !== 'undefined') console.log(response.errors)
        else console.log('ga usah ngide, ga ada data')
      }).catch(err => {console.log('mamam tuh error'); console.log(err)})
      //taredit
      //komen karena kita ga mau dia stop
      this.stop()
    },
    () => {},
    true, /*start the job right now*/
    'Asia/Jakarta' /*timeZone*/
  )
}
// pas join date start
const blastEvent = () => {
  let blastEvent = new cronJob('* * 19 0 0 *' ,
    function() {
      //cari event
      let currDate = new Date()
      let date_format = `${currDate.getFullYear()}-${currDate.getMonth()}-`+ `0${currDate.getDay()}`.substr(-2)
      // let date_format = '2017-10-01'
      query(`
        {
          users {
            email
            phone
          }
          events(date_start:"${date_format}"){
            tipe
            name
            date {
              event
              join_start
              join_end
            }
          }
        }
      `).then(response => {
        if (typeof response.data !== 'undefined') {
          let events = response.data.events
          let users = response.data.users.map(user => user.email).join(',')
          let userphone = response.data.users.filter((v,i,a)=> v.phone !== null && a.indexOf(v) === i).map(user => user.phone)
          events.forEach(event => {
            // cari user
            let mailOptions = {
              from: '"VISION" <noreply@vision.com>', // sender address
              to: users,
              subject: `[${event.tipe.toUpperCase()}]${event.name}`, // Subject line
              text: `Hi Coders! Join us at ${event.name} ${event.tipe} on ${event.date.event}. Registration will be start on ${event.date.join_start} till ${event.date.join}`, // plain text body
              html: `Hi Coders!<br/><br/>Join us at ${event.name} ${event.tipe} on ${event.date.event}. Registration will be start on ${event.date.join_start} till ${event.date.join}.<br/>` // html body
            }
            sendEmail(mailOptions)
            let smsContent = `Hi Coders! Join us at ${event.name} ${event.tipe}`

            userphone.forEach(phone => {
              sendSMS(phone, smsContent)
            })
          })
        }
        else if (typeof response.errors !== 'undefined') console.log(err)
        else console.log('ga usah ngide, ga ada data')
      }).catch(err => {console.log('mamam tuh error'); console.log(err)})
      console.log('WTF')
      //taredit
      //komen karena kita ga mau dia stop
      this.stop()
    },
    () => {},
    true, /*start the job right now*/
    'Asia/Jakarta' /*timeZone*/
  )
}
// pas hari event
const remindEvent = () => {
  let remindEvent = new cronJob('* * 19 0 0 *' ,
    function() {
      //cari event
      let currDate = new Date()
      let date_format = `${currDate.getFullYear()}-${currDate.getMonth()}-`+ `0${currDate.getDay()}`.substr(-2)
      // let date_format = '2017-11-10'
      query(`
        {
          events(date_event:"${date_format}"){
            tipe
            name
            date {
              event
              join_start
              join_end
            }
            participant {
              email
            }
          }
        }
      `).then(response => {

        if (typeof response.data !== 'undefined') {
          let events = response.data.events
          events.forEach(event => {
            // cari user
            let users = event.participant.map(participant => participant.email).join(',')
            let mailOptions = {
              from: '"VISION" <noreply@vision.com>', // sender address
              to: users,
              subject: `[REMINDER ${event.tipe.toUpperCase()}]${event.name}`, // Subject line
              text: `Hi Coders! Dont forget to come for ${event.name} ${event.tipe} on ${event.date.event}.`, // plain text body
              html: `Hi Coders!<br/><br/>Join us for ${event.name} ${event.tipe} on ${event.date.event}.` // html body
            }
            sendEmail(mailOptions)
            // sendSMS(smsOptions)
          })
        }
        else if (typeof response.errors !== 'undefined') console.log(response.errors)
        else console.log('ga usah ngide, ga ada data')
      }).catch(ex => {console.log('mamam tuh error'); console.log(ex)})
      //taredit
      //komen karena kita ga mau dia stop
      this.stop()
    },
    () => {},
    true, /*start the job right now*/
    'Asia/Jakarta' /*timeZone*/
  )
}
const approvalEvent = () => {
  let approvalEvent = new cronJob('* * 19 0 0 *' ,
    function() {
      query(`
        {
          users(role:"admin"){email}
          events(approved:-1){name}
        }
      `).then(response => {
        if (typeof response.data !== 'undefined') {
          let admins = response.data.users.map(user => user.email).join(",")
          let events = response.data.events.map(evt => evt.name)
          let mailOptions = {
            from: '"VISION" <noreply@vision.com>', // sender address
            to: admins,
            subject: `APPROVAL REQUEST`, // Subject line
            text: `Hi Admin! There are events waiting for approval!\nEvent List: \n${events.join('\n')}`, // plain text body
            html: `Hi Admin!<br/><br/>There are events waiting for approval!<br/>Event List: <br/>${events.join('<br/>')}` // html body
          }
          sendEmail(mailOptions)
          // sendSMS(smsOptions)
        }
        else if (typeof response.errors !== 'undefined') console.log(response.errors)
        else console.log('ga usah ngide, ga ada data')
      }).catch(ex => {console.log('mamam tuh error'); console.log(ex)})
      //taredit
      //komen karena kita ga mau dia stop
      this.stop()
    },
    () => {},
    true, /*start the job right now*/
    'Asia/Jakarta' /*timeZone*/
  )
}

const createAchievementHistory = () => {
  let createAchievementHistory = new cronJob('* * 19 0 0 *' ,
    function() {
      query(`
        {
          users(role:"member"){_id, achievementHistories{ _achievement}, github{count}, join_meetup, join_hackathon}
          achievements{ _id}
        }
      `).then(response => {
        if (typeof response.data !== 'undefined') {
          response.data.achievements.forEach(achievement => {
            response.data.users.forEach(user => {
              let flag = false
              if (typeof user.achievementHistories !== 'undefined') {
                let idx = user.achievementHistories.findIndex(acv => `${acv._achievement}` === `${achievement._id}` )
                flag = idx === -1
              }
              //flag=true (ga ada) maka....
              //cekAchievementCocokAtoKaga
              //jika cocok maka tambah
              if (flag) {
                let unlock_num = achievement.unlock_num
                let unlock_desc = achievement.unlock_desc

                switch(unlock_desc) {
                  case 'github':
                    flag = user.github.count >= unlock_num
                    break
                  case 'hackathon':
                    flag = user.join_hackathon >= unlock_num
                    break
                  case 'meetup':
                    flag = join_meetup >= unlock_num
                    break
                }

                //cocok nih, tambah deh!
                if (flag) {
                  query(`mutation{
                    addAchievementHistory (
                      input :{
                        _user: "${user._id}"
                        _achievement: "${achievement._id}"
                      }
                    ) {_id,_user,_achievement}
                  }`).then(response2 => {
                    if (response2.errors !== 'undefined') console.log(response2.errors)
                    else console.log(response2.data)
                  })
                }
              }
            })
          })
        }
        else if (typeof response.errors !== 'undefined') console.log(response.errors)
        else console.log('ga usah ngide, ga ada data')
      }).catch(ex => {console.log('mamam tuh error'); console.log(ex)})
      //taredit
      //komen karena kita ga mau dia stop
      this.stop()
    },
    () => {},
    true, /*start the job right now*/
    'Asia/Jakarta' /*timeZone*/
  )
}

const sendEmail = (mailOptions) => {
  createJOB('sendEmail','critical')
  queue.process('sendEmail',(job,done)=>{
    transporter.sendMail(mailOptions, (err, info) => {
      err ? done(err) : done()
    })
  })
}

const sendSMS = (phone, content) => {
  createJOB('SMS','critical')
  queue.process('SMS',(job,done)=>{
    sendMessage(phone,content, done)
  })
}

const init = () => {
  blastEvent()
  remindEvent()
  insertGithub()
  approvalEvent()
  createAchievementHistory()
}

module.exports = {
  init
}