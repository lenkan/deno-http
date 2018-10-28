import { Reader, ReadResult } from 'deno'

export const mockReader = (data: Uint8Array) => {
  let current = data
  const r: Reader = {
    read(p: ArrayBufferView): Promise<ReadResult> {
      const array = p as Uint8Array
      const nread = Math.min(data.byteLength, p.byteLength)
      array.set(current.slice(0, nread))
      current = current.slice(nread)
      
      return Promise.resolve<ReadResult>({
        nread,
        eof: false
      })
    }
  }

  return r
}