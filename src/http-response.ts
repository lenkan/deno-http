import { Writer, WriteCloser } from 'deno'
import { HttpHeader } from './http-header';
const CRLF = '\r\n'
const encoder = new TextEncoder('utf8')

export interface HttpResponse {
  header(header: HttpHeader): HttpResponse
  headers(headers: HttpHeader[]): HttpResponse
  status(status: number): HttpResponse
  reason(reason: string): HttpResponse
  body(body: Uint8Array): HttpResponse
  reply(): Promise<void>
}

interface HttpResponseMessage {
  status: number
  protocol: string
  reason: string
  headers: HttpHeader[]
  body: Uint8Array
}


async function write(writer: Writer, message: HttpResponseMessage): Promise<void> {
  const lines = [
    `${message.protocol} ${message.status} ${message.reason}`,
    ...message.headers.map(header => {
      return `${header.name}: ${header.value}`
    }),
    `${CRLF}`
  ].join(CRLF)

  const envelope = encoder.encode(lines)

  const data = new Uint8Array(envelope.length + message.body.length)
  data.set(envelope, 0)
  data.set(message.body, envelope.length)
  await writer.write(data)
}

export function response(writer: Writer & WriteCloser): HttpResponse {
  const message: HttpResponseMessage = {
    status: undefined,
    reason: undefined,
    body: undefined,
    headers: [],
    protocol: 'HTTP/1.1'
  }

  return {
    header(header: HttpHeader): HttpResponse {
      message.headers.push(header)
      return this
    },

    headers(headers: HttpHeader[]): HttpResponse {
      headers.forEach(h => message.headers.push(h))
      return this
    },

    status(status: number): HttpResponse {
      message.status = status
      return this
    },

    body(body: Uint8Array): HttpResponse {
      message.body = body
      return this
    },

    reason(reason: string): HttpResponse {
      message.reason = reason
      return this
    },

    async reply() {
      await write(writer, message)
      writer.close()
    }
  }
}
