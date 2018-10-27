import { Reader } from 'deno'
import { HttpHeader } from './http-header';

const CRLF = '\r\n'
const decoder = new TextDecoder('utf8')
const CR = 13
const LF = 10

export interface HttpRequest {
  method: string
  protocol: string
  path: string
  headers: HttpHeader[]

  /**
   * Reads and returns the entire body
   */
  body(): Promise<Uint8Array>
}


async function readChunk(reader: Reader, size: number) {
  const chunk = new Uint8Array(size)
  const result = await reader.read(chunk)

  return result.nread === size ? chunk : chunk.subarray(0, result.nread)
}

async function readAll(reader: Reader) {
  const chunkSize = 4096
  const chunks: Array<Uint8Array> = []

  while (true) {
    const chunk = await readChunk(reader, chunkSize)
    chunks.push(chunk)
    if (chunk.length < chunkSize) {
      break
    }
  }

  const all = new Uint8Array(chunks.reduce((sum, c) => sum + c.length, 0))
  for (let i = 0; i < chunks.length; ++i) {
    all.set(chunks[i], i * 4096)
  }

  return all
}

function readRequestLine(line: string) {
  const [method, path, protocol] = line.split(' ').map(s => s.trim())
  return { method, path, protocol }
}

function readHeaderLine(line: string) {
  const separator = line.indexOf(':')
  const name = line.slice(0, separator).trim()
  const value = line.slice(separator + 1, line.length).trim()
  return { name, value }
}

function readLine(array: Uint8Array) {
  const index = array.indexOf(CR)
  const line = decoder.decode(array.subarray(0, index)).trim()
  const rest = array.subarray(index + 2, array.length)
  return { line, rest }
}

export async function read(reader: Reader): Promise<HttpRequest> {
  const chunk = await readAll(reader)
  // const { chunk, finished } = await readChunk(reader, 4096)
  const first = readLine(chunk)
  const { method, path, protocol } = readRequestLine(first.line)

  let result = readLine(first.rest)
  const headers: HttpHeader[] = []
  while (result.line !== '') {
    headers.push(readHeaderLine(result.line))
    result = readLine(result.rest)
  }

  function body() {
    return Promise.resolve(result.rest)
  }

  return {
    method,
    path,
    protocol,
    headers,
    body
  }
}
