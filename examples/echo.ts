import { listen } from '../src/http'
// import { listen } from 'https://raw.githubusercontent.com/lenkan/deno-http/v0.0.3/src/http'

const encoder = new TextEncoder()

listen('127.0.0.1:3000', async (req, res) => {
  const response = encoder.encode(JSON.stringify({
    request: req
  }))

  await res
    .status(200, 'OK')
    .headers({
      'Content-Type': 'application/json',
      'Content-Length': response.byteLength.toString()
    }).send(response)
})

