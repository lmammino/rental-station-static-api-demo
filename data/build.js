import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { gzip } from 'node:zlib'
import { create, insert } from '@orama/orama'
import { persist } from '@orama/plugin-data-persistence'
import { mkdirp } from 'mkdirp'

const gzipPromise = promisify(gzip)

const source = join(import.meta.dirname, 'data.json')
const data = JSON.parse(await readFile(source, 'utf8'))

const target = join(import.meta.dirname, '..', 'public', 'api')
await mkdirp(target)

const searchIndex = create({
  schema: {
    id: 'string',
    name: 'string',
    city: 'string',
    country: 'string',
    postalCode: 'string',
    province: 'string',
    iata: 'string',
  },
})

for (const r of data) {
  insert(searchIndex, {
    id: r.id,
    name: r.name,
    city: r.city,
    country: r.country,
    postalCode: r.postalCode,
    province: r.province,
    iata: r.iata,
  })
  const filename = join(target, `${r.id}.json`)
  await writeFile(filename, JSON.stringify(r, null, 2))
  console.log(filename)
}

const JSONIndex = await persist(searchIndex, 'json')
const filename = join(target, '_search.json')
await writeFile(filename, JSONIndex)
console.log(filename)

// compress the index with gzip
// NOTE: GitHub page does not support Accept-Encoding: gzip
//   so we will actually use the uncompressed file in the demo app
//   if you are using another CDN consider using the compressed file instead
const compressedIndex = await gzipPromise(JSONIndex)
await writeFile(`${filename}.gz`, compressedIndex)
console.log(`${filename}.gz`)
