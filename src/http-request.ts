import { Conn } from 'deno'
import { Reader, BufferedReader } from './buffered-reader'
import { HttpRequestHeaders } from './http-header'

const CRLF = '\r\n'
const decoder = new TextDecoder('utf-8')
const CR = 13
const LF = 10

export interface HttpRequest {
  /**
   * Gets the underlying connection instance, i.e. the connection object.
   */
  connection: Conn

  /**
   * The HTTP method used for the request.
   */
  method: string

  /**
   * The protocol version used for the request.
   */
  protocol: string

  /**
   * The request path.
   */
  path: string

  /**
   * The request headers
   */
  headers: HttpRequestHeaders

  /**
   * Reads the entire body into a byte array and resolves with the result.
   */
  buffer(): Promise<Uint8Array>

  /**
   * Reads and parses the entire body as a javascript object.
   */
  json(): Promise<any>

  /**
   * Reads and decodes the entire body as plain text.
   */
  text(): Promise<string>
}

function isEndOfEnvelope(slice: number[]) {
  return slice[0] === CR &&
    slice[1] === LF &&
    slice[2] === CR &&
    slice[3] === LF
}

function parseHeader(header: string) {
  const separator = header.indexOf(':')
  const name = header.slice(0, separator).trim()
  const value = header.slice(separator + 1, header.length).trim()
  return { name, value }
}

function parseHeaders(lines: string[]): HttpRequestHeaders {
  return lines.reduce((all, line) => {
    const { name, value } = parseHeader(line)
    return {
      ...all,
      [name]: value
    }
  }, {})
}

function parseEnvelope(data: Uint8Array) {
  const lines = decoder.decode(data).trim().split(CRLF)
  if (lines.length === 0) {
    throw new Error('Invalid request line')
  }

  const [method, path, protocol] = lines[0].split(' ').map(s => s.trim())
  const headers = parseHeaders(lines.slice(1))

  return {
    method, 
    path, 
    protocol, 
    headers
  }
}

function readBody(reader: Reader, headers: HttpRequestHeaders) {
  const decoder = new TextDecoder('utf-8')
  const hasBody = headers['Content-Length'] || headers['Transfer-Encoding']
  const length = parseInt(headers['Content-Length'] || '0', 10)

  function buffer(): Promise<Uint8Array> {
    return hasBody ? reader.read(length) : Promise.resolve(new Uint8Array(0))
  }

  async function text() : Promise<string> {
    return decoder.decode(await buffer())
  }

  async function json() : Promise<any> {
    return hasBody ? JSON.parse(await text()) : undefined
  }

  return {
    buffer,
    json,
    text
  }
}

export async function read(conn: Conn) : Promise<HttpRequest> {
  const reader = BufferedReader.from(conn, 4096)
  const bytes: number[] = []

  while (true) {
    const byte = await reader.readUint8()

    if (bytes.length === 0 && (byte === CR || byte === LF)) {
      continue
    }

    bytes.push(byte)
    const end = bytes.slice(bytes.length - 4)

    if (isEndOfEnvelope(end)) {
      const envelope = parseEnvelope(Uint8Array.from(bytes))
      const body = readBody(reader, envelope.headers)

      return {
        connection: conn,
        path: envelope.path,
        protocol: envelope.protocol,
        method: envelope.method,
        headers: envelope.headers,
        buffer: body.buffer,
        json: body.json,
        text: body.text
      }
    }
  }
}
