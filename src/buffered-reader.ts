import { Reader as DenoReader } from 'deno'

export interface Reader {
  read(length: number): Promise<Uint8Array>
  readUint8(): Promise<number>
}

async function readChunk(reader: DenoReader, size: number): Promise<Uint8Array> {
  const chunk = new Uint8Array(size)
  const result = await reader.read(chunk)
  return chunk.subarray(0, result.nread)
}

function concat(chunks: Uint8Array[]) {
  const totalSize = chunks.reduce((sum, c) => sum + c.length, 0)
  const result = new Uint8Array(totalSize)

  let position = 0
  for (let i = 0; i < chunks.length; ++i) {
    const chunk = chunks[i]
    result.set(chunk, position)
    position += chunk.length
  }

  return result
}

export class BufferedReader implements Reader {
  private chunk: Uint8Array
  private pos: number = 0

  constructor(private reader: DenoReader, private size : number) {}

  async readUint8(): Promise<number> {
    if (!this.chunk) {
      this.chunk = await readChunk(this.reader, this.size)
      this.pos = 0
    }

    if (this.chunk.byteLength - this.pos < 1) {
      this.chunk = await readChunk(this.reader, this.size)
      this.pos = 0
    }

    return this.chunk[this.pos++]
  }

  async read(length: number): Promise<Uint8Array> {
    if (!this.chunk) {
      this.chunk = await readChunk(this.reader, this.size)
      this.pos = 0
    }

    while (this.chunk.byteLength - this.pos < length) {
      const next = await readChunk(this.reader, this.size)
      this.chunk = concat([this.chunk, next])
    }

    const result = this.chunk.subarray(this.pos, this.pos + length)
    this.pos += length

    return result
  }

  static from(reader: DenoReader, size:number) {
    return new BufferedReader(reader, size)
  }
}
