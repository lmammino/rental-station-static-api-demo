/** This is a very crappy and handmade typeahead component
 * It's missing A LOT of features (e.g. key navigation, accessibility, etc.)
 * Don't use it for serious production projects and pick a component off the shelf
 * from a component library instead!
 */
import './TypeAhead.css'
import { type ChangeEvent, useEffect, useState } from 'react'
import {
  create,
  type InternalTypedDocument,
  load,
  type Orama,
  type RawData,
  type Results,
  search,
  type SearchParams,
} from '@orama/orama'
import type { Schema } from './types'

async function loadDbFromJson(data: RawData): Promise<Orama<Schema>> {
  const db = await create({
    schema: {
      __placeholder: 'string',
    },
  })
  await load(db, data)

  return db as unknown as Orama<Schema>
}

export type TypeAheadProps = {
  indexUrl: string
  placeholder?: string
  onSelect?: (result: Schema) => void
}

export function TypeAhead(props: TypeAheadProps) {
  const [isInitializing, setIsInitializing] = useState(false)
  const [, setIsSearching] = useState(false)
  const [, setSearchTerm] = useState('')
  const [db, setDb] = useState<null | Orama<Schema>>(null)
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<null | Results<
    InternalTypedDocument<Schema>
  >>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: avoids re-load loop
  useEffect(() => {
    if (isInitializing) {
      return
    }

    async function loadDb() {
      setIsInitializing(true)
      const resp = await fetch(props.indexUrl, {
        headers: {
          'accept-encoding': 'gzip',
          accept: 'application/json; charset=utf-8',
        },
      })
      const data = await resp.json()
      const db = await loadDbFromJson(data)
      setDb(db)
      setIsInitializing(false)
    }

    loadDb()
  }, [props.indexUrl])

  async function doSearch(searchTerm: string) {
    if (searchTerm.trim() !== '' && db !== null) {
      setIsSearching(true)
      setSearchTerm(searchTerm.trim())
      const searchParams: SearchParams<Orama<Schema>> = {
        term: searchTerm.trim(),
      }
      const results = await search(db, searchParams)
      setSearchResults(results)
    } else {
      setSearchResults(null)
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchText(e.target.value)
    doSearch(e.target.value)
  }

  function onClickHandler(document: Schema) {
    setSearchText(document.name)
    setSearchResults(null)
    if (props.onSelect) {
      props.onSelect(document)
    }
  }

  return (
    <div className="ta-container">
      {isInitializing ? 'Initializing...' : ''}
      <input
        className="ta-input border border-gray-300 p-2 w-full"
        disabled={isInitializing}
        value={searchText}
        placeholder={props.placeholder || 'Search ...'}
        onChange={onInputChange}
      />
      {searchResults !== null && (
        <ul className="ta-results z-50">
          {searchResults.hits.map((result) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: Keeping it simple (it's a demo)
            <li
              rel={result.document.id}
              key={result.document.id}
              onClick={() => onClickHandler(result.document)}
            >
              {result.document.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
