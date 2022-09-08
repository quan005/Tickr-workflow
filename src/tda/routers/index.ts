import fs from "fs"
import path from "path"
import https from "https"
import express from "express"
import { constants } from "crypto"

const app = express.Router()

app.post('/auth', async (req, res) => {
  const code = Object.keys(req.body)[0]
  const codeSlice = code.slice(1, code.length - 1)

  const params = new URLSearchParams({
    'grant_type': 'authorization_code',
    'access_type': 'offline',
    'code': codeSlice,
    'client_id': 'GYNQGLGLPINXJNWLKFZM48NQ1C86KS8D', //save in a env (process.env.CLIENT_ID)
    'redirect_uri': 'https://localhost'  //save in a env (process.env.REDIRECT_URI)
  });

  const postData = params.toString();

  const authOptions = {
    hostname: 'api.tdameritrade.com',
    port: 443,
    path: '/v1/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length':  Buffer.byteLength(postData)
    },
    key: fs.readFileSync(path.resolve(__dirname, "../certs/localhost/localhost.decrypted.key"), 'utf8'),
    cert: fs.readFileSync(path.resolve(__dirname, "../certs/localhost/localhost.crt"), 'utf8'),
    secureOptions: constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
    passphrase: 'white wolf red eyes'
  }

  const response = https.request(authOptions, (resp) => {
    let data = ''
    resp.on('data', (chunk) => {
      data += chunk
    })

    resp.on('end', () => {
      res.status(200).json(data)
    })
  }).on('error', (e) => {
    console.error(e);
    res.status(500).json({
      error: e
    })
  });
  
  response.write(postData);
  response.end();
})

app.post('/streamer-auth',async (req, res) => {
  const access_token = Object.keys(req.body)[0]

  const params = new URLSearchParams({
    'fields': 'streamerSubscriptionKeys,streamerConnectionInfo',
  });

  const paramsString = params.toString()

  const authOptions = {
    hostname: 'api.tdameritrade.com',
    port: 443,
    path: '/v1/userprincipals?' + paramsString,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`
    },
    key: fs.readFileSync(path.resolve(__dirname, "../certs/localhost/localhost.decrypted.key"), 'utf8'),
    cert: fs.readFileSync(path.resolve(__dirname, "../certs/localhost/localhost.crt"), 'utf8'),
    secureOptions: constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
    passphrase: 'white wolf red eyes' // process.env.PASSPHRASE
  }

  const response = https.request(authOptions, (resp) => {
    let data = ''
    resp.on('data', (chunk) => {
      data += chunk
    })

    resp.on('end', () => {
      res.status(200).json(data)
    })
  }).on('error', (e) => {
    console.error(e);
    res.status(500).json({
      error: e
    })
  });

  response.end();
})

app.post('/td-account', async (req, res) => {
  const {token, accountId} = req.body
  const access_token = decodeURIComponent(token)

  const authOptions = {
    hostname: 'api.tdameritrade.com',
    port: 443,
    path: '/v1/accounts/' + accountId,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`
    },
    key: fs.readFileSync(path.resolve(__dirname, "../certs/localhost/localhost.decrypted.key"), 'utf8'),
    cert: fs.readFileSync(path.resolve(__dirname, "../certs/localhost/localhost.crt"), 'utf8'),
    secureOptions: constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
    passphrase: 'white wolf red eyes' // process.env.PASSPHRASE
  }

  const response = https.request(authOptions, (resp) => {
    let data = ''
    resp.on('data', (chunk) => {
      data += chunk
    })

    resp.on('end', () => {
      res.status(200).json(data)
    })
  }).on('error', (e) => {
    console.error(e);
    res.status(500).json({
      error: e
    })
  });

  response.end();
})

app.post('/td-place-order', async (req, res) => {
  const {token, accountId, orderData} = req.body
  const access_token = decodeURIComponent(token)
  const orderDataString = JSON.stringify(orderData)

  const authOptions = {
    hostname: 'api.tdameritrade.com',
    port: 443,
    path: '/v1/accounts/' + `${accountId}/orders`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`
    },
    key: fs.readFileSync(path.resolve(__dirname, "../certs/localhost/localhost.decrypted.key"), 'utf8'),
    cert: fs.readFileSync(path.resolve(__dirname, "../certs/localhost/localhost.crt"), 'utf8'),
    secureOptions: constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
    passphrase: 'white wolf red eyes' // process.env.PASSPHRASE
  }

  const response = https.request(authOptions, (resp) => {
    let data = ''
    resp.on('data', (chunk) => {
      data += chunk
    })

    resp.on('end', () => {
      res.status(200).json(data)
    })
  }).on('error', (e) => {
    console.error(e);
    res.status(500).json({
      error: e
    })
  });

  response.write(orderDataString)
  response.end();
})

app.post('/td-get-order', async (req, res) => {
  const {token, accountId, orderId} = req.body
  const access_token = decodeURIComponent(token)

  const authOptions = {
    hostname: 'api.tdameritrade.com',
    port: 443,
    path: '/v1/accounts/' + `${accountId}/orders/${orderId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`
    },
    key: fs.readFileSync(path.resolve(__dirname, "../certs/localhost/localhost.decrypted.key"), 'utf8'),
    cert: fs.readFileSync(path.resolve(__dirname, "../certs/localhost/localhost.crt"), 'utf8'),
    secureOptions: constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
    passphrase: 'white wolf red eyes' // process.env.PASSPHRASE
  }

  const response = https.request(authOptions, (resp) => {
    let data = ''
    resp.on('data', (chunk) => {
      data += chunk
    })

    resp.on('end', () => {
      res.status(200).json(data)
    })
  }).on('error', (e) => {
    console.error(e);
    res.status(500).json({
      error: e
    })
  });

  response.end();
})

app.post('/td-option-chain', async (req, res) => {
  const {token, optionChainConfig} = req.body
  const access_token = decodeURIComponent(token)

  const params = new URLSearchParams(optionChainConfig);

  const postData = params.toString();

  const authOptions = {
    hostname: 'api.tdameritrade.com',
    port: 443,
    path: '/v1/marketdata/chains?' + postData,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`
    },
    key: fs.readFileSync(path.resolve(__dirname, "../certs/localhost/localhost.decrypted.key"), 'utf8'),
    cert: fs.readFileSync(path.resolve(__dirname, "../certs/localhost/localhost.crt"), 'utf8'),
    secureOptions: constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
    passphrase: 'white wolf red eyes'
  }

  const response = https.request(authOptions, (resp) => {
    let data = ''
    resp.on('data', (chunk) => {
      data += chunk
    })

    resp.on('end', () => {
      res.status(200).json(data)
    })
  }).on('error', (e) => {
    console.error(e);
    res.status(500).json({
      error: e
    })
  });

  response.end();
})

export { app }