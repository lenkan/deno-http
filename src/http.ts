import { HttpRequest, read } from './http-request'
import { HttpResponse } from './http-response'
import { listen as tcp, connect, Conn, Reader } from 'deno'


export type RequestHandler = (req: HttpRequest, res: HttpResponse) => void

export async function listen(addr: string, handler: RequestHandler) {
  const listener = tcp('tcp', addr)

  while (true) {
    const connection = await listener.accept()
    read(connection).then(request => handler(request, {}))
  }
}
