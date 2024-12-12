import { create } from 'zustand';

const useMarkerStore = create((set) => ({
    markers: [],
    addMarker: (newMarker) =>
        set((state) => ({
            markers: [...state.markers, newMarker],
        })),
    removeMarker: (markerToRemove) =>
        set((state) => ({
            markers: state.markers.filter(({ marker }) => marker !== markerToRemove),
        })),
    updateMarkers: (updatedMarkers) =>
        set(() => ({
            markers: updatedMarkers,
        })),
}));

export default useMarkerStore;
