const admin = require('firebase-admin')
const { google } = require('googleapis')
const axios = require('axios')

const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'
const SCOPES = [MESSAGING_SCOPE]

const serviceAccount = require('./devpop-notification-firebase-adminsdk-x1e0y-ae80e96168.json')
const databaseURL = 'https://devpop-notification.firebaseapp.com/'
const URL = 'https://fcm.googleapis.com/v1/projects/devpop-notification/messages:send'
const deviceToken = 'dMNkoymRWmc:APA91bHNpa2kH8jGDHcf_R0yj21_LvA5_Ec9eYsf6MWbVFoNKGgUhVF9bibLy4bzNlha4xYjJ74HVu80xqLWXHCHqchPVlbyyNgBQ4TmWZy7bhMqEAz_Yhv1vPchh9AG5bbzeihjtdjE'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL
})

function getAccessToken() {
  return new Promise(function(resolve, reject) {
    var key = serviceAccount
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    )
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err)
        return
      }
      resolve(tokens.access_token)
    })
  })
}

async function init() {
  const body = {
    message: {
      data: { key: 'value' },
      notification: {
        title: 'คนทำสวยมาก',
        body: 'คนทำสวยมาก'
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          requireInteraction: 'true'
        }
      },
      token: deviceToken
    }
  }

  try {
    const accessToken = await getAccessToken()
    console.log('accessToken: ', accessToken)
    const { data } = await axios.post(URL, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    console.log('name: ', data.name)
  } catch (err) {
    console.log('err: ', err.message)
  }
}

init()