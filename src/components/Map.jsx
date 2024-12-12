import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Navigation } from 'lucide-react';

export const accessToken = (mapboxgl.accessToken =
    'pk.eyJ1IjoibGFicy1zYW5kYm94IiwiYSI6ImNrMTZuanRmZDA2eGQzYmxqZTlnd21qY3EifQ.Q7DM5HqE5QJzDEnCx8BGFw');

const INITIAL_CENTER = [74.21531, 31.40021];
const INITIAL_ZOOM = 12;

const Map = ({ onLoad }) => {
    const mapContainer = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef(null);

    const [center, setCenter] = useState(INITIAL_CENTER);
    const [zoom, setZoom] = useState(INITIAL_ZOOM);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        const map = (mapRef.current = new mapboxgl.Map({
            container: mapContainer.current,
            center: center,
            zoom: zoom,
            style: 'mapbox://styles/mapbox/streets-v11',
        }));

        map.addControl(new mapboxgl.NavigationControl());

        map.on('load', () => {
            onLoad(map);
            setMapLoaded(true);
        });

        map.on('move', () => {
            const mapCenter = map.getCenter();
            const mapZoom = map.getZoom();
            setCenter([mapCenter.lng, mapCenter.lat]);
            setZoom(mapZoom);
        });

        map.on('contextmenu', (e) => {
            console.log('contextmenu', e);
            const coordinates = e.lngLat;
            addMarker(coordinates, map);
        });

        return () => {
            map.remove();
        };
    }, []);

    const addMarker = (coordinates, map) => {
        const markerEl = document.createElement('div')
        markerEl.className = 'bg-cover w-14 h-14 rounded-full cursor-pointer relative flex items-center justify-center'
        markerEl.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/5860/5860579.png)'
        markerEl.innerHTML = `
            <span class="bg-white absolute rounded-full px-1">A</span>
        `

        const markerLabel = document.createElement('span')


        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, })
            .setHTML(
            `<div>
            <p>Coordinates</p>
            <p>Longitude: ${coordinates.lng.toFixed(4)}</p>
            <p>Latitude: ${coordinates.lat.toFixed(4)}</p>
            <button class="remove-marker" style="background: red; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer;">
                Remove Marker
            </button>
            </div>`
            );

        const marker = new mapboxgl.Marker()
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map)

        // marker.addClassName('marker')
        // marker.getElement().appendChild() = markerEl.innerHTML

        popup.on('open', () => {
            const removeButton = document.querySelector('.remove-marker');
            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    removeMarker(marker);
                });
            }
        });

        setMarkers((prevMarkers) => [...prevMarkers, { marker, coordinates }]);
    };


    const removeMarker = (markerToRemove) => {
        markerToRemove.remove();
        setMarkers((prevMarkers) => prevMarkers.filter(({ marker }) => marker !== markerToRemove));
    };

    return (
        <>
            <div ref={mapContainer} className="h-full w-full" />
            {mapLoaded && (
                <>
                    <div className="map-info">
                        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
                    </div>
                    <button
                        onClick={() =>
                            mapRef.current.flyTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM })
                        }
                        className="absolute top-[18%] right-3 z-10 bg-white hover:bg-[#f2f2f2] transition p-2 rounded-full flex items-center shadow-[0_0_5px_4px_rgb(0,0,0,0.3)]">
                        <Navigation size={20} />
                    </button>
                </>
            )}
        </>
    );
};

export default Map;
