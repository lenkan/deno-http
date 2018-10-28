# deno-http

This repository implements a simple http server on top of [deno](https://github.com/denoland/deno).

## Usage

```typescript
import { listen } from 'https://raw.githubusercontent.com/lenkan/deno-http/v0.0.2/src/http'

listen('127.0.0.1:3000', async (req, res) => {
  const encoder = new TextEncoder('utf8')

  const body = encoder.encode(JSON.stringify({
    foo: 'bar'
  }))


  // Add HTTP response message properties, finish of with
  // `reply` to send and close the connection
  await res
    .status(200)
    .reason('OK')
    .header({
      name: 'Content-Type',
      value: 'application/json',
    })
    .body(body)
    .reply()
})
```

# Status
Currently, some parts of the implementation is fairly naive and inefficient. But can be greatly improved. Parts of `Transfer-Encoding` is not implemented.

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
