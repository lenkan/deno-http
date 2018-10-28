import { listen as tcp } from 'deno'
import { HttpRequest, read } from './http-request'
import { HttpResponse, response } from './http-response'

export type RequestHandler = (req: HttpRequest, res: HttpResponse) => void

export async function listen(addr: string, handler: RequestHandler) {
  const listener = tcp('tcp', addr)

  while (true) {
    const connection = await listener.accept()
    read(connection).then(request => {
      handler(request, response(connection, request.headers))
    })
  }
}
