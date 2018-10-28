import { Reader } from 'deno'
import { HttpRequestHeaders } from './http-header'

async function read(reader: Reader, length: number): Promise<Uint8Array> {
  const chunks = []
  while (true) {
    const chunk = new Uint8Array(length)
    const result = await reader.read(chunk)
    chunks.push(chunk.slice(0, result.nread))
    if (result.nread === length) {
      return concat(chunks)
    }
  }
}

async function concat(chunks: Uint8Array[]) {
  const totalSize = chunks.reduce((sum, c) => sum + c.length, 0)
  const result = new Uint8Array(totalSize)

  let position = 0
  for (let i = 0; i < chunks.length; ++i) {
    const chunk = chunks[i]
    result.set(chunk, position)
    position += chunk.length
  }

  return result
}

export function createReader(reader: Reader, headers: HttpRequestHeaders) {
  const decoder = new TextDecoder('utf-8')
  const hasBody = headers['Content-Length'] || headers['Transfer-Encoding']
  const length = parseInt(headers['Content-Length'] || '0', 10)

  function buffer(): Promise<Uint8Array> {
    return hasBody ? read(reader, length) : Promise.resolve(new Uint8Array(0))
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