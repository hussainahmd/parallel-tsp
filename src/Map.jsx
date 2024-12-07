import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'

import Marker from './Marker'
import Card from './Card'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

export const accessToken = (mapboxgl.accessToken =
    'pk.eyJ1IjoibGFicy1zYW5kYm94IiwiYSI6ImNrMTZuanRmZDA2eGQzYmxqZTlnd21qY3EifQ.Q7DM5HqE5QJzDEnCx8BGFw')

const Map = ({ onLoad }) => {
    const mapContainer = useRef(null)
    const [mapLoaded, setMapLoaded] = useState(false)

    let mapRef = useRef(null)

    useEffect(() => {
        const map = (mapRef.current = new mapboxgl.Map({
            container: mapContainer.current,
            center: [-75.15654, 39.94596],
            zoom: 12
        }))

        map.addControl(new mapboxgl.NavigationControl())

        map.on('load', () => {
            onLoad(map)
            setMapLoaded(true)
        })
    }, [])

    return (
        <>
            <div ref={mapContainer} className='h-full w-full' />
            {/* {mapLoaded &&
        <div>Loaded</div>
      } */}
        </>
    )
}

export default Map
