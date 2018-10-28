import { BufferedReader } from './buffered-reader'
import { HttpRequest, read } from './http-request'
import { HttpResponse, response } from './http-response'
import { listen as tcp } from 'deno'


export type RequestHandler = (req: HttpRequest, res: HttpResponse) => void

export async function listen(addr: string, handler: RequestHandler) {
  const listener = tcp('tcp', addr)

  while (true) {
    const connection = await listener.accept()
    read(BufferedReader.from(connection, 4096)).then(request => {
      handler(request, response(connection))
    })
  }
}
