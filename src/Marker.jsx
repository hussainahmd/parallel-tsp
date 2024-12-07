// Component for Mapbox GL JS custom HTML Markers
// Given a point feature and map instance, it handles the creation of a Marker and its associated Popup
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

const Marker = ({ item, map, children }) => {
  const markerRef = useRef()
  const markerEl = useRef()

  useEffect(() => {
    const marker = new mapboxgl.Marker({
      element: markerEl.current
    })
      .setLngLat(item.coordinates)
      .addTo(map)

    marker.addTo(map)

    markerRef.current = marker
  }, [item])


  if (!item) return null

  return (
    <div>
      <div
        ref={markerEl}
        className=''
      >
      Custom Marker
      </div>
    </div>
  )
}

export default Marker
