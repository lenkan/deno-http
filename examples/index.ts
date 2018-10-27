import { listen } from '../src/http'

listen('127.0.0.1:3000', async (req, res) => {
  const encoder = new TextEncoder('utf8')

  const response = encoder.encode(JSON.stringify({
    foo: 'bar'
  }))


  await res
    .status(201)
    .reason('Accepted')
    .header({
      name: 'Content-Type',
      value: 'application/json',
    })
    .body(response)
    .reply()
})

