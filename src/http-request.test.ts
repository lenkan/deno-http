import { assertEqual, assertDefined } from '../tools/assertions'
import { read } from './http-request'
import { mockConn } from '../tools/mocks';

const CRLF = '\r\n'
const encoder = new TextEncoder()

const encodeLines = lines => encoder.encode(lines.join(CRLF))

const encodeJson = body => {
  const content = encoder.encode(JSON.stringify(body))
  const envelope = encodeLines([
    'GET /foo/bar HTTP/1.1',
    'Content-Type: application/json',
    `Content-Length: ${content.byteLength}`,
    CRLF
  ])

  return Uint8Array.from([...envelope.map(v => v), ...content.map(v => v)])
}

const encodeText = body => {
  const content = encoder.encode(body)
  const envelope = encodeLines([
    'GET /foo/bar HTTP/1.1',
    'Content-Type: text/plain',
    `Content-Length: ${content.byteLength}`,
    CRLF
  ])

  return Uint8Array.from([...envelope.map(v => v), ...content.map(v => v)])
}

export async function testParseRequestLine() {
  const data = encodeLines([
    'GET /foo/bar HTTP/1.1',
    CRLF,
    CRLF
  ])

  const conn = mockConn({ data })

  const request = await read(conn).next()

  assertEqual(request.value.method, 'GET')
  assertEqual(request.value.path, '/foo/bar')
  assertEqual(request.value.protocol, 'HTTP/1.1')
}

export async function testParseRequestLineWithPreceedingLineFeeds() {
  const data = encodeLines([
    CRLF,
    CRLF,
    'GET /foo/bar HTTP/1.1',
    CRLF,
    CRLF
  ])

  const connection = mockConn({ data })

  const request = await read(connection).next()

  assertEqual(request.value.method, 'GET')
  assertEqual(request.value.path, '/foo/bar')
  assertEqual(request.value.protocol, 'HTTP/1.1')
}

export async function testParseHeaders() {
  const data = encodeLines([
    'GET /foo/bar HTTP/1.1',
    'Content-Type: application/json',
    CRLF,
  ])
  const conn = mockConn({ data })

  const request = await read(conn).next()

  assertEqual(request.value.headers, {
    ['Content-Type']: 'application/json'
  })
}

export async function testParseSimpleJSONBody() {
  const data = encodeJson({ foo: 'bar' })

  const request = await read(mockConn({ data })).next()
  const actual = request.value.json()

  assertDefined(actual)
  assertEqual(actual, { foo: 'bar' })
}

export async function testReadJSONWhenThereIsNoContentLength() {
  const data = encodeLines([
    'GET /foo/bar HTTP/1.1',
    'Content-Type: application/json',
    CRLF,
    JSON.stringify({ foo: 'bar' })
  ])

  const request = await read(mockConn({ data })).next()
  const result = request.value.json()
  assertEqual(result, undefined)
}

export async function testReadTextWhenContentLengthIsSpecified() {
  const data = encodeText('hallo')

  const request = await read(mockConn({ data })).next()

  const result = request.value.text()
  assertEqual(result, 'hallo')
}
