import { Reader } from './buffered-reader'
import { createReader } from './http-body-reader'
import { HttpRequestHeaders, parse as parseHeaders } from './http-header'

const CRLF = '\r\n'
const decoder = new TextDecoder('utf-8')
const CR = 13
const LF = 10

export interface HttpRequest {
  method: string
  protocol: string
  path: string
  headers: HttpRequestHeaders
  buffer(): Promise<Uint8Array>
  json(): Promise<any>
  text(): Promise<string>
}

interface HttpRequestEnvelope {
  method: string
  protocol: string
  path: string
  headers: HttpRequestHeaders
}

function isEndOfEnvelope(slice: number[]) {
  return slice[0] === CR &&
    slice[1] === LF &&
    slice[2] === CR &&
    slice[3] === LF
}

function parseEnvelope(data: Uint8Array): HttpRequestEnvelope {
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

export async function read(reader: Reader) : Promise<HttpRequest> {

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
      const bodyReader = createReader(reader, envelope.headers)

      return {
        path: envelope.path,
        protocol: envelope.protocol,
        method: envelope.method,
        headers: envelope.headers,
        buffer: bodyReader.buffer,
        json: bodyReader.json,
        text: bodyReader.text
      }
    }
  }
}
