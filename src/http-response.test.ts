import { response } from './http-response'
import { mockConn } from '../tools/mocks'
import { assertEqual, assert } from '../tools/assertions'

const CRLF = '\r\n'
const decoder = new TextDecoder()
const encoder = new TextEncoder()

export async function testReplyWithStatusHasStatusLine() {
  const conn = mockConn({ data: Uint8Array.from([]) })

  const res = response(conn, {})

  await res.status(200, 'OK').send()

  const written = conn.written()
  assertEqual(written.length, 1)

  const text = decoder.decode(written[0]).split(CRLF)[0].trim()

  assertEqual(text, 'HTTP/1.1 200 OK')
}

export async function testReplyWithStatusAddsEmptyLine() {
  const conn = mockConn({ data: Uint8Array.from([]) })

  const res = response(conn, {})

  await res.status(200, 'OK').send()

  const written = conn.written()
  assertEqual(written.length, 1)

  const text = decoder.decode(written[0])

  assert(text.endsWith(CRLF + CRLF))
}

export async function testReplyWithJSONBody() {
  const conn = mockConn({ data: Uint8Array.from([]) })

  const res = response(conn, {})

  const body = encoder.encode(JSON.stringify({ foo: 'bar' }))
  await res
    .status(200, 'OK')
    .headers({
      'Content-Type': 'application/json',
      'Content-Length': `${body.byteLength}`
    }).send(body)

  const written = conn.written()
  assertEqual(written.length, 1)

  const text = decoder.decode(written[0]).split(CRLF)

  assertEqual(text.length, 6)
  assertEqual(text[0], 'HTTP/1.1 200 OK')
  assertEqual(text[1], 'Connection: keep-alive')
  assertEqual(text[2], 'Content-Type: application/json')
  assertEqual(text[3], 'Content-Length: 13')
  assertEqual(text[4], '')
  assertEqual(text[5], '{"foo":"bar"}')
}

export async function testSendWithConnectionCloseHeader() {
  const conn = mockConn({})

  const res = response(conn, { 'Connection': 'close' })

  const body = encoder.encode(JSON.stringify({ foo: 'bar' }))
  await res.status(200, 'OK').send(body)


  assert(!conn.isOpen())
}

export async function testSendWithConnectionKeepAliveHeader() {
  const conn = mockConn({})

  const res = response(conn, { 'Connection': 'keep-alive' })

  const body = encoder.encode(JSON.stringify({ foo: 'bar' }))
  await res.status(200, 'OK').headers({ 'Connection': 'keep-alive' }).send(body)

  assert(conn.isOpen())
}
