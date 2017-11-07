require('dotenv').config()
const request = require("request")

let init = () => {
  getWifi('10','-6.220146','106.7535745')
}

const getToken = () => {
  let token = {
    method: 'POST',
    url: 'https://api.mainapi.net/token',
    headers: {
      'postman-token': '3d4d0e56-906f-7015-49db-84defd5e5899',
      'cache-control': 'no-cache',
      'content-type': 'application/x-www-form-urlencoded',
      authorization: process.env.MAIN_AUTHORIZATION
    },
    form: { grant_type: 'client_credentials' }
  }

  return new Promise((resolve,reject) => {
    try {
      request(token, function (error, response, body) {
        if (error) reject(error)
        resolve(`Bearer ${JSON.parse(body).access_token}`)
      })
    } catch(ex) {reject(ex)}
  })
}

const sendMessage = async (phone, content) => {
    let res = await getToken()

    let message = {
      method: 'POST',
      url: 'https://api.mainapi.net/smsnotification/1.0.0/messages',
      headers: {
        accept: 'application/json',
        authorization: res,
        'postman-token': '7b900d0c-7a31-2603-1cda-5f8187e653a3',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: {
        grant_type: 'client_credentials',
        msisdn: phone,
        content: content
      }
    }

    console.log(message)

    await request(message, function (error, response, body) {
      body = JSON.parse(body)
      if (body.status !== 'success') console.log('fail to send message')
    })

}

const getWifi = async (radius,lat,lon) => {
  try {
    let res = await getToken()
    console.log('autho 1',res)
    let wifi = {
      method: 'GET',
      url: 'https://api.mainapi.net/wifi.id-locator/0.0.1/%2A',
      qs: { radius: radius, lat: lat, lon: lon },
      headers: {
        'postman-token': '2a0147ff-4fe3-9130-06ad-eb4159659376',
        'cache-control': 'no-cache',
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        authorization: res
      }
    }

    request(wifi, function (error, response, body) {
      body = JSON.parse(body)
      if (typeof body.net.mainapi.fault !== 'undefined') console.log(body.net.mainapi.fault)
      //tambah buat show
    })
  } catch(ex) {console.log('tes');console.log(ex)}
}

module.exports = {
  getWifi,
  sendMessage
}