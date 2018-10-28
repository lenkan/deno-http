import { HttpRequestHeaders } from './http-header'
import { Reader } from './buffered-reader';

export function createReader(reader: Reader, headers: HttpRequestHeaders) {
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