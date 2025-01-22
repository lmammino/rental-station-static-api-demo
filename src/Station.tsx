import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import type { Schema } from './types'

export type StationProps = {
  stationId: string
  apiUrl: string
  simulateSlowNetwork?: boolean
}

export default function Station(props: StationProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<Schema | null>(null)

  useEffect(() => {
    async function fetchStationData() {
      setData(null)
      setIsLoading(true)

      if (props.simulateSlowNetwork) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      try {
        const response = await fetch(`${props.apiUrl}${props.stationId}.json`)
        const data = await response.json()
        setData(data)
      } catch (e) {
        setError((e as unknown as Error).toString())
      }

      setIsLoading(false)
    }

    fetchStationData()
  }, [props.stationId, props.apiUrl, props.simulateSlowNetwork])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    data && (
      <div>
        <MapContainer
          className="w-full h-96 border border-gray-300 z-0"
          center={[data.lat, data.lon]}
          zoom={15}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[data.lat, data.lon]}>
            <Popup>{data.name}</Popup>
          </Marker>
        </MapContainer>

        <div className="w-full grid sm:grid-cols-2 gap-2 pt-4">
          <div className="border border-gray-300 p-2">
            <div
              className="flex gap-1 flex-col"
              itemProp="address"
              itemScope
              itemType="https://schema.org/PostalAddress"
            >
              <span itemProp="streetAddress">{data.address}</span>
              {data.postalCode && (
                <span itemProp="postalCode">{data.postalCode}</span>
              )}
              <span>
                <span itemProp="addressLocality">{data.city}</span> (
                <span itemProp="addressRegion">
                  {data.province || data.city}
                </span>
                ), <span itemProp="addressCountry">{data.country}</span>
              </span>
            </div>
            <div className="pt-4 flex flex-col gap-2">
              <span itemProp="telephone">
                <a
                  href={`tel:${data.phoneNumber}`}
                  className="flex gap-2 text-blue-800 hover:underline hover:text-blue-950"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    className="lucide lucide-phone"
                    {...props}
                  >
                    <title>Phone</title>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {data.phoneNumber}
                </a>
              </span>
              <span itemProp="email">
                <a
                  href={`mailto:${data.email}`}
                  className="flex gap-2 text-blue-800 hover:underline hover:text-blue-950"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    className="lucide lucide-mail"
                    {...props}
                  >
                    <title>Email</title>
                    <rect width={20} height={16} x={2} y={4} rx={2} />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  {data.email}
                </a>
              </span>
            </div>
          </div>
          <div className="border border-gray-300 p-2">
            <h2 className="font-bold">Reviews</h2>
            <div>
              <div>
                {[1, 2, 3, 4, 5].map((star) => {
                  return (
                    <span
                      key={star}
                      className={`text-[2em] ${data.reviewsRating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      {' '}
                      ★{' '}
                    </span>
                  )
                })}
              </div>
              <span className="font-bold">{data.reviewsRating}</span> (
              {data.reviewsCount} reviews)
            </div>
          </div>
        </div>
      </div>
    )
  )
}
