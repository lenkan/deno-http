import { readDir, readFile } from 'deno'
import { listen, HttpHandler } from '../src/http'

function type(name: string) {
  if (name.endsWith('.css')) {
    return 'text/css'
  }

  if (name.endsWith('.js')) {
    return 'text/javascript'
  }

  if (name.endsWith('.html')) {
    return 'text/html'
  }

  return undefined
}

function serveStatic(path: string): HttpHandler {
  async function getContent(name) {
    const files = await readDir(path)
    const file = files.find(f => f.name === name)
    if (!file) {
      return undefined
    }

    return {
      content: await readFile(file.path),
      type: type(file.name)
    }
  }

  return async (req, res) => {
    const file = await getContent(req.path.replace(/^\//, '').replace(/^$/, 'index.html'))
    if (!file) {
      return res.status(404, 'Not Found').send()
    }

    const { content, type } = file

    return res.status(200, 'OK')
      .headers({
        'Connection': 'keep-alive',
        'Content-Length': content.byteLength.toString(),
        'Content-Type': type
      }).send(content)
  }
}

listen('127.0.0.1:3000', serveStatic('./examples/static'))
