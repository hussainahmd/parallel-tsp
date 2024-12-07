import { useState, useRef } from 'react'
import { SearchBox } from '@mapbox/search-js-react'
import mapboxgl from 'mapbox-gl'
import { accessToken } from './components/Map'

import Map from './components/Map'
import Card from './components/Card'
import Modal from './components/Modal'

import './styles.css'

export default function Home() {
  // a ref to hold the Mapbox GL JS Map instance
  const mapInstanceRef = useRef()

  // the current search value, used in the controlled mapbox-search-js input
  const [searchValue, setSearchValue] = useState('')

  // when the map loads
  const handleMapLoad = (map) => {
    mapInstanceRef.current = map
  }

  // set the search value as the user types
  const handleSearchChange = (newValue) => {
    setSearchValue(newValue)
  }

  return (
    <>
      <main className='flex flex-col h-full w-full'>
        <nav className='flex h-14 justify-center items-center border-b-2 border-black '>
          <div className='font-semibold'>
            Parallel TSP
          </div>
        </nav>
        <div className='relative flex grow shrink min-h-0'>
          <div className='flex-[0.7] grow relative border-t-4 border-red-200'>
            <div className='absolute top-3 left-[40%] z-10'>
              <SearchBox
                className='w-32'
                options={{
                  proximity: [-75.16805, 39.93298],
                  types: [
                    'postcode',
                    'place',
                    'locality',
                    'neighborhood',
                    'street',
                    'address'
                  ]
                }}
                value={searchValue}
                onChange={handleSearchChange}
                accessToken={accessToken}
                marker
                mapboxgl={mapboxgl}
                placeholder='Search for an address, city, zip, etc'
                map={mapInstanceRef.current}
                theme={{
                  variables: {
                    fontFamily: '"Open Sans", sans-serif',
                    fontWeight: 300,
                    unit: '16px',
                    borderRadius: '8px',
                    boxShadow: '0px 2.44px 9.75px 0px rgba(95, 126, 155, 0.2)'
                  }
                }}
              />
            </div>
            <Map
              onLoad={handleMapLoad}
            />
          </div>

          {/* sidebar */}
          <div className='flex-[0.3] h-full bg-white border-l-2 border-black'>
            <div className='text-2xl text-black font-semibold w-full mb-1.5'>
              Sidebar
            </div>
            <div className='grid grid-cols-1 gap-4'>
              Other content
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
