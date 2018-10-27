type GeneralHeaderName =
  'Cache-Control' |
  'Connection' |
  'Date' |
  'Pragma' |
  'Trailer' |
  'Transfer-Encoding' |
  'Upgrade' |
  'Via' |
  'Warning'

type EntityHeaderName =
  'Content-Encoding' |
  'Content-Language' |
  'Content-Length' |
  'Content-Location' |
  'Content-MD5' |
  'Content-Range' |
  'Content-Type' |
  'Expires' |
  'Last-Modified'

type RequestHeaderName =
  'Accept' |
  'Accept-Charset' |
  'Accept-Encoding' |
  'Accept-Language' |
  'Authorization' |
  'Expect' |
  'From' |
  'Host' |
  'If-Match' |
  'If-Modified-Since' |
  'If-None-Match' |
  'If-Range' |
  'If-Unmodified-Since' |
  'Max-Forwards' |
  'Proxy-Authorization' |
  'Range' |
  'Referer' |
  'TE' |
  'User-Agent'


type ResponseHeaderName =
  'Accept-Ranges' |
  'Age' |
  'ETag' |
  'Location' |
  'Proxy-Authenticate' |
  'Retry-After' |
  'Server' |
  'Vary' |
  'WWW-Authenticate'

function parseHeader(header: string) {
  const separator = header.indexOf(':')
  const name = header.slice(0, separator).trim()
  const value = header.slice(separator + 1, header.length).trim()
  return { name, value }
}

export function parse(lines: string[]): HttpRequestHeaders {
  return lines.reduce((all, line) => {
    const { name, value } = parseHeader(line)
    return {
      ...all,
      [name]: value
    }
  }, {})
}

export type HttpRequestHeaders =
  { [key in GeneralHeaderName]?: string } &
  { [key in EntityHeaderName]?: string } &
  { [key in RequestHeaderName]?: string } &
  { [key: string]: string }

export type HttpResponseHeaders =
  { [key in GeneralHeaderName]?: string } &
  { [key in EntityHeaderName]?: string } &
  { [key in ResponseHeaderName]?: string } &
  { [key: string]: string }
