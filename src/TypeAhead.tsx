/** This is a very crappy and handmade typeahead component
 * It's missing A LOT of features (e.g. key navigation, accessibility, etc.)
 * Don't use it for serious production projects and pick a component off the shelf
 * from a component library instead!
 */
import './TypeAhead.css'
import {
  type InternalTypedDocument,
  type Orama,
  type Results,
  type SearchParams,
  search,
} from '@orama/orama'
import { restore } from '@orama/plugin-data-persistence'
import { type ChangeEvent, useEffect, useState } from 'react'
import type { Schema } from './types'

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
          // 'accept-encoding': 'gzip', // (not supported by GitHub pages)
          accept: 'application/json; charset=utf-8',
        },
      })
      const data = await resp.text()
      const db = await restore<Orama<Schema>>('json', data)
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
      console.log(document)
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
