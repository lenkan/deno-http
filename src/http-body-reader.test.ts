import { Reader, ReadResult } from 'deno'
import { assertEqual } from '../tools/assertions'
import { mockReader } from '../tools/mocks'
import { createReader } from './http-body-reader'

const encoder = new TextEncoder()

export async function testReadJSONWhenContentLengthIsSpecified() {
  const data = encoder.encode(JSON.stringify({ foo: 'bar' }))
  const r = mockReader(data)
  const reader = createReader(r, { "Content-Length": data.length.toString() })

  const result = await reader.json()
  assertEqual(result.foo, 'bar')
}

export async function testReadJSONWhenThereIsNoContentLength() {
  const data = encoder.encode(JSON.stringify({ foo: 'bar' }))
  const r = mockReader(data)
  const reader = createReader(r, { })

  const result = await reader.json()
  assertEqual(result, undefined)
}

export async function testReadTextWhenContentLengthIsSpecified() {
  const data = encoder.encode('hallo')
  const r = mockReader(data)
  const reader = createReader(r, { 'Content-Length': data.byteLength.toString() })

  const result = await reader.text()
  assertEqual(result, 'hallo')
}
