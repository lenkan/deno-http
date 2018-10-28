export { assert, assertEqual, equal } from 'https://raw.githubusercontent.com/denoland/deno/v0.1.10/js/testing/util'

export function assertDefined(a: any) {
  if(a === undefined || a === null) {
    throw new Error('Expected value to be defined')
  }
}