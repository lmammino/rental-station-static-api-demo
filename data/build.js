import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { gzip } from 'node:zlib'
import { promisify } from 'node:util'
import { mkdirp } from 'mkdirp'
import { create, insert } from '@orama/orama'
import { persist } from '@orama/plugin-data-persistence'

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
// compress the index with gzip
const compressedIndex = await gzipPromise(JSONIndex)

const filename = join(target, '_search.json.gz')
await writeFile(filename, compressedIndex)
console.log(filename)
