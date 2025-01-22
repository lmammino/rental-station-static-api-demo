import { useState } from 'react'
import Station from './Station'
import { TypeAhead } from './TypeAhead'

const API_BASE_URL = `${import.meta.env.BASE_URL}api/`

function App() {
  const [stationId, setStationId] = useState<string | null>(null)
  const [simulateSlowNetwork, setSimulateSlowNetwork] = useState(false)

  return (
    <main className="container mx-auto px-4">
      <header className="py-2">
        <h1 className="text-2xl font-bold">Our rental stations 🚗</h1>
      </header>
      <div className="flex gap-2">
        <input
          id="slow-network-check"
          type="checkbox"
          onChange={() => setSimulateSlowNetwork(!simulateSlowNetwork)}
          checked={simulateSlowNetwork}
        />{' '}
        <label htmlFor="slow-network-check">Simulate slow network</label>
      </div>

      <TypeAhead
        onSelect={(data) => {
          setStationId(data.id)
        }}
        indexUrl={`${API_BASE_URL}_search.json`}
      />

      {stationId && (
        <div className="pt-4">
          <Station
            stationId={stationId}
            simulateSlowNetwork={simulateSlowNetwork}
            apiUrl={API_BASE_URL}
          />
        </div>
      )}
    </main>
  )
}

export default App
