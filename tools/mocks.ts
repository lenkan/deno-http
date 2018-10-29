import { ReadResult, Conn } from 'deno'

export const mockConn = (args: { data?: Uint8Array }) => {
  const { data = Uint8Array.from([]) } = args

  let current = data
  let written: ArrayBufferView[] = []
  let open = true

  const conn: Conn = {
    localAddr: '',
    remoteAddr: '',
    read(p: ArrayBufferView): Promise<ReadResult> {
      const array = p as Uint8Array
      const nread = Math.min(data.byteLength, p.byteLength)
      array.set(current.slice(0, nread))
      current = current.slice(nread)

      return Promise.resolve<ReadResult>({
        nread,
        eof: current.byteLength === 0
      })
    },

    write(p: ArrayBufferView): Promise<number> {
      written.push(p)
      return Promise.resolve(p.byteLength)
    },

    close() {
      open = false
    },

    closeRead() {
      throw new Error('NI')
    },

    closeWrite() {
      throw new Error('NI')
    }
  }

  return Object.assign(conn, {
    written() {
      return written
    },
    isOpen() {
      return open
    }
  })
}
