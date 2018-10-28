# deno-http

This repository implements a simple http server on top of [deno](https://github.com/denoland/deno).

## Usage

```typescript
import { listen } from 'https://raw.githubusercontent.com/lenkan/deno-http/v0.0.4/src/http'

listen('127.0.0.1:3000', async (req, res) => {
  const encoder = new TextEncoder('utf8')

  const response = encoder.encode(JSON.stringify({
    request: req
  }))

  await res
    .status(200, 'OK')
    .headers({
      'Content-Type': 'application/json',
      'Content-Length': response.byteLength.toString()
    }).send(body)
})
```

# Status
Many specifics, for example `Transfer-Encoding` is not implemented.

# Development

Install [deno](https://github.com/denoland/deno) per instructions. Generate typings for `deno` with:

```
deno --types > lib.d.ts
```

Run unit tests with:

```
deno test.ts
```

Try the example with:

```
deno --allow-net examples/index.ts
```
