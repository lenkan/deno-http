import { listen } from '../src/http'

listen('127.0.0.1:3000', async (req, res) => {
  console.log(JSON.stringify(req, null, 2))
  const body = await req.body()
  console.log('BODY', body)
  const decoder = new TextDecoder('utf8')
  console.log('Parsed', decoder.decode(body))
})

