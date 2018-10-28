
export function assertEqual(a: any, b: any) {
  if(a !== b) {
    throw new Error(`Expected '${a}' to equal '${b}'`)
  }
}

export function assertDefined(a: any) {
  if(a === undefined || a === null) {
    throw new Error('Expected value to be defined')
  }
}