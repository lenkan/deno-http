import { readDirSync, cwd } from "deno";

function traverse(dir: string) {
  return readDirSync(dir).reduce<string[]>((files, info) => {

    if (info.isFile() && info.name.endsWith('.test.ts')) {
      return [...files, info.path]
    }

    return files
  }, [])
}

const files = traverse('./src')

async function run() {
  for (const file of files) {
    const suite = await import(file)
    console.log(file)
    for (const test of Object.keys(suite)) {
      try {
        await suite[test]()
        console.log('PASS:', test)
      } catch (error) {
        console.log('!ERROR:', test)
        console.log(error.message)
      }
    }
    console.log('\n')
  }
}

run()
