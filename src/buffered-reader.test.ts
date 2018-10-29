import { mockConn as mockResource } from '../tools/mocks'
import { assertEqual } from '../tools/assertions'
import { BufferedReader } from './buffered-reader'

const create = BufferedReader.from
const encoder = new TextEncoder()

export async function testReadUntilLineFeed() {
  const data = encoder.encode('foobar\r\n')
  const r = mockResource({ data })
  const reader = create(r, 1024)

  const result = await reader.readLine()
  assertEqual(result, 'foobar')
}

export async function testReadUntilLineFeedWithChunkedReader() {
  const data = encoder.encode('foobar\r\n')
  const r = mockResource({ data })
  const reader = create(r, 2)

  const result = await reader.readLine()
  assertEqual(result, 'foobar')
}

export async function testReadLineUntilEnd() {
  const data = encoder.encode('foo')
  const r = mockResource({ data })
  const reader = create(r, 1024)

  const result = await reader.readLine()
  assertEqual(result, 'foo')
}

export async function testReadLines() {
  const data = encoder.encode('foo\r\nbar\r\n')
  const r = mockResource({ data })
  const reader = create(r, 1024)

  assertEqual(await reader.readLine(), 'foo')
  assertEqual(await reader.readLine(), 'bar')
}

export async function testReadLinesUntilEnd() {
  const data = encoder.encode('foo\r\nbar')
  const r = mockResource({ data })
  const reader = create(r, 1024)

  assertEqual(await reader.readLine(), 'foo')
  assertEqual(await reader.readLine(), 'bar')
}

export async function testReadLinesUntilWithEmptyLineAtEnd() {
  const data = encoder.encode('foo\r\nbar\r\n\r\n')
  const r = mockResource({ data })
  const reader = create(r, 1024)

  assertEqual(await reader.readLine(), 'foo')
  assertEqual(await reader.readLine(), 'bar')
  assertEqual(await reader.readLine(), '')
}

export async function testRead() {
  const data = encoder.encode('foo')
  const r = mockResource({ data })
  const reader = create(r, 1024)

  const result = await reader.read(3)
  assertEqual(result, Uint8Array.from([102, 111, 111]))
}

export async function testReadAfterReadLines() {
  const data = encoder.encode('foo\r\nbar\r\n\r\nbody')
  const r = mockResource({ data })
  const reader = create(r, 1024)

  assertEqual(await reader.readLine(), 'foo')
  assertEqual(await reader.readLine(), 'bar')
  assertEqual(await reader.readLine(), '')
  assertEqual(await reader.read(4), [98, 111, 100, 121])
}

export async function testReadWhenDataIsChunked() {
  const data = encoder.encode('foobar')
  const r = mockResource({ data })
  const reader = create(r, 3)

  const result = await reader.read(6)
  assertEqual(result, Uint8Array.from([102, 111, 111, 98, 97, 114]))
}

export async function testReadMultipleTimes() {
  const data = encoder.encode('foobar')
  const r = mockResource({ data })
  const reader = create(r, 1024)

  const result = [
    await reader.read(3),
    await reader.read(3)
  ]

  assertEqual(result[0], Uint8Array.from([102, 111, 111]))
  assertEqual(result[1], Uint8Array.from([98, 97, 114]))
  assertEqual(reader.finished(), true)
}

export async function testReadMultipleTimesWhenDataIsChunked() {
  const encoder = new TextEncoder()
  const data = encoder.encode('foobar')
  const r = mockResource({ data })
  const reader = create(r, 2)

  const result = [
    await reader.read(3),
    await reader.read(3)
  ]

  assertEqual(result[0], Uint8Array.from([102, 111, 111]))
  assertEqual(result[1], Uint8Array.from([98, 97, 114]))
  assertEqual(reader.finished(), true)
}

export async function testCloseReaderOnEOF() {
  const encoder = new TextEncoder()
  const data = encoder.encode('foobar')
  const r = mockResource({ data })
  const reader = create(r, 1024)

  await reader.read(6)

  assertEqual(r.wasClosed(), true)
}

export async function testCloseReaderOnEOF_MultipleChunks() {
  const encoder = new TextEncoder()
  const data = encoder.encode('foobar')
  const r = mockResource({ data })
  const reader = create(r, 3)

  await reader.read(6)

  assertEqual(r.wasClosed(), true)
}

export async function testCloseReaderOnEOF_MultipleReads() {
  const encoder = new TextEncoder()
  const data = encoder.encode('foobar')
  const r = mockResource({ data })
  const reader = create(r, 3)

  await reader.read(3)
  assertEqual(r.wasClosed(), false)
  await reader.read(3)
  assertEqual(r.wasClosed(), true)
}

export async function testCloseReaderOnEOF_MultipleReadsOneChunk() {
  const encoder = new TextEncoder()
  const data = encoder.encode('foobar')
  const r = mockResource({ data })
  const reader = create(r, 1024)

  await reader.read(3)
  // Closes here becuase the big chunk has already been read
  assertEqual(r.wasClosed(), true) 
  await reader.read(3)
  assertEqual(r.wasClosed(), true)
}
