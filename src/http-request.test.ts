import { assertEqual, assertDefined } from '../tools/assertions'
import { read } from './http-request'
import { mockReader } from '../tools/mocks';

const CRLF = '\r\n'
const encoder = new TextEncoder()


export async function testParseRequestLine() {
  const data = encoder.encode([
    'GET /foo/bar HTTP/1.1',
    CRLF,
    CRLF
  ].join(CRLF))

  const r = mockReader(data)

  const request = await read(r)

  assertEqual(request.method, 'GET')
  assertEqual(request.path, '/foo/bar')
  assertEqual(request.protocol, 'HTTP/1.1')
}

export async function testParseRequestLineWithPreceedingLineFeeds() {
  const data = encoder.encode([
    CRLF,
    CRLF,
    'GET /foo/bar HTTP/1.1',
    CRLF,
    CRLF
  ].join(CRLF))

  const r = mockReader(data)

  const request = await read(r)

  assertEqual(request.method, 'GET')
  assertEqual(request.path, '/foo/bar')
  assertEqual(request.protocol, 'HTTP/1.1')
}

export async function testParseHeaders() {
  const data = encoder.encode([
    'GET /foo/bar HTTP/1.1',
    'Content-Type: application/json',
    CRLF,
  ].join(CRLF))
  const r = mockReader(data)

  const request = await read(r)

  assertEqual(request.headers, {
    ['Content-Type']: 'application/json'
  })
}

export async function testParseSimpleJSONBody() {
  const content = encoder.encode(JSON.stringify({ foo: 'bar' }))
  const data = encoder.encode([
    'GET /foo/bar HTTP/1.1',
    'Content-Type: application/json',
    `Content-Length: ${content.byteLength}`,
    CRLF,
  ].join(CRLF))

  const r = mockReader(Uint8Array.from([
    ...data.map(v => v),
    ...content.map(v => v)
  ]))

  const request = await read(r)
  const actual = await request.json()

  assertDefined(actual)
  assertEqual(actual, { foo: 'bar' })
}
