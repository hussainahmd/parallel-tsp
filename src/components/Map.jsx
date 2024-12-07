import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'

import Marker from './Marker'
import Card from './Card'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { Navigation } from 'lucide-react'

export const accessToken = (mapboxgl.accessToken =
    'pk.eyJ1IjoibGFicy1zYW5kYm94IiwiYSI6ImNrMTZuanRmZDA2eGQzYmxqZTlnd21qY3EifQ.Q7DM5HqE5QJzDEnCx8BGFw')

const INITIAL_CENTER = [
    74.21531,
    31.40021
]

const INITIAL_ZOOM = 12

const Map = ({ onLoad }) => {
    const mapContainer = useRef(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    let mapRef = useRef(null)

    const [center, setCenter] = useState(INITIAL_CENTER)
    const [zoom, setZoom] = useState(INITIAL_ZOOM)

    useEffect(() => {
        const map = (mapRef.current = new mapboxgl.Map({
            container: mapContainer.current,
            center: center,
            zoom: zoom
        }))

        map.addControl(new mapboxgl.NavigationControl())

        map.on('load', () => {
            onLoad(map)
            setMapLoaded(true)
        })

        map.on('move', () => {
            // get the current center coordinates and zoom level from the map
            const mapCenter = map.getCenter()
            const mapZoom = map.getZoom()

            // update state
            setCenter([mapCenter.lng, mapCenter.lat])
            setZoom(mapZoom)
        })

        return () => {
            map.remove()
        }
    }, [])

    return (
        <>
            <div ref={mapContainer} className='h-full w-full' />
            {mapLoaded &&
                <>
                    <div className="map-info">
                        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
                    </div>
                    <button 
                        onClick={() => mapRef.current.flyTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM })}
                        className="absolute top-[18%] right-3 z-10 bg-white hover:bg-[#f2f2f2] transition p-2 rounded-full flex items-center shadow-[0_0_5px_4px_rgb(0,0,0,0.3)]">
                        <Navigation size={20} />
                    </button>
                </>
            }
        </>
    )
}

export default Map
