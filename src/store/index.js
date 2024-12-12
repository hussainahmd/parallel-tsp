import { create } from 'zustand';

const useMarkerStore = create((set) => ({
    markers: [],
    addMarker: (marker) =>
        set((state) => ({
            markers: [...state.markers, marker],
        })),
    removeMarker: (label) =>
        set((state) => ({
            markers: state.markers.filter((m) => m.label !== label),
        })),
    updateMarkers: (updatedMarkers) => set({ markers: updatedMarkers }),
}));

export default useMarkerStore;
