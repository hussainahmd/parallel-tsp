import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Navigation } from 'lucide-react';
import useMarkerStore from '../store';

export const accessToken = (mapboxgl.accessToken =
    'pk.eyJ1IjoibGFicy1zYW5kYm94IiwiYSI6ImNrMTZuanRmZDA2eGQzYmxqZTlnd21qY3EifQ.Q7DM5HqE5QJzDEnCx8BGFw');

const INITIAL_CENTER = [74.21531, 31.40021];
const INITIAL_ZOOM = 12;

const Map = ({ onLoad }) => {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const labelIndexRef = useRef(0);

    const [mapLoaded, setMapLoaded] = useState(false);
    const [center, setCenter] = useState(INITIAL_CENTER);
    const [zoom, setZoom] = useState(INITIAL_ZOOM);

    const addMarkerGlobal = useMarkerStore((state) => state.addMarker);
    const removeMarkerGlobal = useMarkerStore((state) => state.removeMarker);

    useEffect(() => {
        const map = (mapRef.current = new mapboxgl.Map({
            container: mapContainer.current,
            center: INITIAL_CENTER,
            zoom: INITIAL_ZOOM,
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
            const coordinates = e.lngLat;
            addMarker(coordinates, map);
        });

        return () => {
            map.remove();
        };
    }, []);

    const addMarker = (coordinates, map) => {
        const labelIndex = labelIndexRef.current; // Get the current label index
        const label = String.fromCharCode(65 + labelIndex); // Generate label

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(
                `<div class="p-1">
                <p class="font-bold underline">Coordinates</p>
                <p>Longitude: ${coordinates.lng.toFixed(4)}</p>
                <p>Latitude: ${coordinates.lat.toFixed(4)}</p>
                <button class="bg-red-500 transition text-white border-none p-1 rounded cursor-pointer mt-2 remove-marker">
                    Remove
                </button>
            </div>`
            );

        const marker = new mapboxgl.Marker()
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map)
            .addClassName('marker');

        // Add custom marker label
        const markerLabel = document.createElement('span');
        markerLabel.className = 'absolute top-[6px] text-xl bg-white rounded-full px-1';
        markerLabel.innerHTML = label; // Set the label

        const markerElement = marker.getElement();
        markerElement.firstChild.style.width = '60px';
        markerElement.firstChild.style.height = '60px';
        markerElement.appendChild(markerLabel);

        // Handle marker removal logic
        popup.on('open', () => {
            const removeButton = document.querySelector('.remove-marker');
            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    removeMarker(marker);
                });
            }
        });

        // Use Zustand's addMarker action to update global state
        const addMarkerToStore = useMarkerStore.getState().addMarker;
        addMarkerToStore({
            marker,
            coordinates,
            label, // Include the label in the marker data
        });

        // Increment the label index for the next marker
        labelIndexRef.current += 1;
    };




    const removeMarker = (markerToRemove) => {
        // Remove the marker from the map
        markerToRemove.remove();

        // Use Zustand's removeMarker action to update the global state
        const { markers, removeMarker, updateMarkers } = useMarkerStore.getState();

        // Remove the marker from Zustand state
        removeMarker(markerToRemove);

        // Recalculate labels and update Zustand state
        const updatedMarkers = markers
            .filter(({ marker }) => marker !== markerToRemove)
            .map((entry, index) => {
                const newLabel = String.fromCharCode(65 + index); // Recalculate label
                const markerElement = entry.marker.getElement();
                const labelElement = markerElement.querySelector('span');
                if (labelElement) {
                    labelElement.innerHTML = newLabel; // Update the label in the DOM
                }
                return {
                    ...entry,
                    label: newLabel, // Update the label in the marker object
                };
            });

        // Update the markers in Zustand state with updated labels
        updateMarkers(updatedMarkers);

        // Update the labelIndexRef to match the new markers count
        labelIndexRef.current = updatedMarkers.length;
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
