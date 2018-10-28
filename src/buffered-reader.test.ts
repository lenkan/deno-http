import { mockConn as mockReader } from '../tools/mocks'
import { assertEqual } from '../tools/assertions'
import { BufferedReader } from './buffered-reader'

const create = BufferedReader.from
const encoder = new TextEncoder()

export async function testReadBytes() {
  const data = encoder.encode('foo')
  const r = mockReader({ data })
  const reader = create(r, 1024)

  const result = [
    await reader.readUint8(),
    await reader.readUint8(),
    await reader.readUint8()
  ]

  assertEqual(result[0], 102)
  assertEqual(result[1], 111)
  assertEqual(result[2], 111)
}

export async function testReadBytesWhenInputIsChunked() {
  const data = encoder.encode('foobar')
  const r = mockReader({ data })
  const reader = create(r, 2)

  const result = [
    await reader.readUint8(),
    await reader.readUint8(),
    await reader.readUint8(),
    await reader.readUint8(),
    await reader.readUint8(),
    await reader.readUint8(),
  ]

  assertEqual(result[0], 102)
  assertEqual(result[1], 111)
  assertEqual(result[2], 111)
  assertEqual(result[3], 98)
  assertEqual(result[4], 97)
  assertEqual(result[5], 114)
}

export async function testReadLength() {
  const data = encoder.encode('foo')
  const r = mockReader({ data })
  const reader = create(r, 1024)

  const result = await reader.read(3)
  assertEqual(result, Uint8Array.from([102, 111, 111]))
}

export async function testReadLengthWhenDataIsChunked() {
  const data = encoder.encode('foobar')
  const r = mockReader({ data })
  const reader = create(r, 3)

  const result = await reader.read(6)
  assertEqual(result, Uint8Array.from([102, 111, 111, 98, 97, 114]))
}

export async function testReadLengthMultipleTimes() {
  const data = encoder.encode('foobar')
  const r = mockReader({ data })
  const reader = create(r, 1024)

  const result = [
    await reader.read(3),
    await reader.read(3)
  ]

  assertEqual(result[0], Uint8Array.from([102, 111, 111]))
  assertEqual(result[1], Uint8Array.from([98, 97, 114]))
}

export async function testReadLengthMultipleTimesWhenDataIsChunked() {
  const encoder = new TextEncoder()
  const data = encoder.encode('foobar')
  const r = mockReader({ data })
  const reader = create(r, 2)

  const result = [
    await reader.read(3),
    await reader.read(3)
  ]

  assertEqual(result[0], Uint8Array.from([102, 111, 111]))
  assertEqual(result[1], Uint8Array.from([98, 97, 114]))
}
