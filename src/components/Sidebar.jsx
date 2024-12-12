import { useState } from 'react';
import useMarkerStore from '../store';
import axios from 'axios';

const Sidebar = () => {
    const markers = useMarkerStore((state) => state.markers);
    const [executionType, setExecutionType] = useState('parallel');
    const [methodType, setMethodType] = useState('brute');
    const [startNode, setStartNode] = useState('');

    const handleExecute = async () => {

        if (!executionType || !methodType || !startNode) {
            alert('Please select all options before executing.');
            return;
        }

        const markersData = markers.map(marker => ({
            coordinates: marker.coordinates,
            label: marker.label
        }));

        const data = {
            nodes: markersData,
            executionType,
            methodType,
            startNode
        }

        console.log('Data:', JSON.stringify(data, null, 2));

        try {
            const response = await axios.post('http://127.0.0.1:5000/tsp', data);
            console.log('Response from backend:', response.data);
        } catch (error) {
            console.error('Error sending markers to backend:', error);
        }
    };

    return (
        <div className="h-full w-full flex flex-col justify-between">
            <h1 className="text-lg text-center font-semibold p-2 bg-blue-500 border-b border-black text-white">Parallel TSP</h1>

            {/* <div> */}
            <div>
                <label className="block bg-gray-200 p-2 border-t border-black">Selcted Nodes:</label>
                <div className="grid grid-cols-3 p-2 bg-gray-50 font-semibold border-t border-b border-black pr-[25px]">
                    <div>Label</div>
                    <div>Longitude</div>
                    <div>Latitude</div>
                </div>
                <div className="overflow-y-scroll max-h-[250px] min-h-[250px] border-b border-black bg-blue-50">
                    {markers.length === 0 ? (
                        <div className="flex items-center justify-center p-2 min-h-[249px]">No nodes selected</div>
                    ) : (
                        markers.map((marker, index) => (
                            <div
                                key={index}
                                className={`grid grid-cols-3 p-2 hover:bg-gray-100 transition border-b border-gray-200 ${index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'}`}
                            >
                                <div>{marker.label}</div>
                                <div>{marker.coordinates.lng.toFixed(4)}</div>
                                <div>{marker.coordinates.lat.toFixed(4)}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div>
                <label className="block border-t border-b border-black bg-gray-200 p-2">Execution Type:</label>
                <select
                    value={executionType}
                    onChange={(e) => setExecutionType(e.target.value)}
                    className="w-full p-2 mb-2 border border-gray-300 rounded"
                >
                    <option value="parallel">Parallel</option>
                    <option value="serial">Serial</option>
                </select>
                <label className="block border-t border-b border-black bg-gray-200 p-2">Method Type:</label>
                <select
                    value={methodType}
                    onChange={(e) => setMethodType(e.target.value)}
                    className="w-full p-2 mb-2 border border-gray-300 rounded"
                >
                    <option value="brute">Brute Force</option>
                    <option value="nearest">Nearest Neighbor</option>
                </select>
                <label className="block border-t border-b border-black bg-gray-200 p-2">Start Node:</label>
                <select
                    value={startNode}
                    onChange={(e) => setStartNode(e.target.value)}
                    className="w-full p-2 mb-2 border border-gray-300 rounded"
                >
                    <option value="">Select Start Node</option>
                    {markers.map((marker, index) => (
                        <option key={index} value={marker.label}>
                            {marker.label} ({marker.coordinates.lng.toFixed(4)}, {marker.coordinates.lat.toFixed(4)})
                        </option>
                    ))}
                </select>
            </div>
            {/* </div> */}
            <button
                onClick={handleExecute}
                className="w-full p-2 bg-blue-500 text-white font-semibold hover:bg-blue-600 transition border-t border-black"
            >
                Execute
            </button>
        </div>
    );
};

export default Sidebar;