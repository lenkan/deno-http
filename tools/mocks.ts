import { Reader as DenoReader, ReadResult as DenoReadResult } from 'deno'
import { Reader } from '../src/buffered-reader';

export const mockDenoReader = (data: Uint8Array) => {
  let current = data
  const r: DenoReader = {
    read(p: ArrayBufferView): Promise<DenoReadResult> {
      const array = p as Uint8Array
      const nread = Math.min(data.byteLength, p.byteLength)
      array.set(current.slice(0, nread))
      current = current.slice(nread)
      
      return Promise.resolve<DenoReadResult>({
        nread,
        eof: false
      })
    }
  }

  return r
}

export const mockReader = (data: Uint8Array) => {
  let pos = 0
  const r: Reader = {
    read(length: number): Promise<Uint8Array> {
      const result = data.subarray(pos, length + pos)
      pos += length
      return Promise.resolve(result)
    },

    readUint8(): Promise<number> {
      return Promise.resolve(data[pos++])
    }
  }
  return r
}