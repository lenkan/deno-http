import { Writer, WriteCloser } from 'deno'
import { HttpResponseHeaders } from './http-header';
const CRLF = '\r\n'
const encoder = new TextEncoder('utf-8')

export interface HttpResponse {
  /**
   * Adds the specified headers to the response. It will
   * be merged into any already added headers.
   */
  headers(headers: HttpResponseHeaders): HttpResponse

  /**
   * Sets the specified HTTP response status
   */
  status(status: number, reason?: string): HttpResponse

  /**
   * Sets the specified reason phrase
   */
  reason(reason: string): HttpResponse

  /**
   * Sets the specified response body
   */
  body(body: Uint8Array): HttpResponse

  /**
   * Sends the response, resolves when response has been written.
   */
  reply(): Promise<void>
}

interface HttpResponseMessage {
  status: number
  protocol: string
  reason: string
  headers: HttpResponseHeaders
  body: Uint8Array
}


async function write(writer: Writer, message: HttpResponseMessage): Promise<void> {
  const lines = [
    `${message.protocol} ${message.status} ${message.reason}`,
    ...Object.keys(message.headers).map(name => {
      return `${name}: ${message.headers[name]}`
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
    headers: {},
    protocol: 'HTTP/1.1'
  }

  return {
    headers(headers: HttpResponseHeaders): HttpResponse {
      message.headers = { ...message.headers, ...headers }
      return this
    },

    status(status: number, reason?: string): HttpResponse {
      message.status = status
      if(reason) {
        message.reason = reason
      }
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
