import { useRef, useState } from 'react';
import { SearchBox } from '@mapbox/search-js-react';
import mapboxgl from 'mapbox-gl';
import { accessToken } from './components/Map';
import Map from './components/Map';
import Sidebar from './components/Sidebar';

import './styles.css';

export default function Home() {
  const mapInstanceRef = useRef();
  const [searchValue, setSearchValue] = useState('');

  const handleMapLoad = (map) => {
    mapInstanceRef.current = map;
  };

  const handleSearchChange = (newValue) => {
    setSearchValue(newValue);
  };

  return (
    <main className="flex flex-col h-full w-full">
      <div className="relative flex grow shrink min-h-0">
        <div className="flex-[0.4] h-full bg-white border-r-2 border-black">
          <Sidebar />
        </div>
        <div className="flex-[0.6] grow relative">
          <div className="absolute top-3 left-[40%] z-10">
            <SearchBox
              className='w-32'
              options={{
                // proximity: [-75.16805, 39.93298],
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
              // marker
              mapboxgl={mapboxgl}
              placeholder='Search for a location'
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
          <Map onLoad={handleMapLoad} />
        </div>
      </div>
    </main>
  );
}
