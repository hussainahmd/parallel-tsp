import { useState } from 'react';
import useMarkerStore from '../store';
import axios from 'axios';
import Modal from './Modal';
import { 
  MapPinIcon, 
  PlayIcon, 
  SettingsIcon, 
  ListIcon,
  AlignVerticalSpaceAroundIcon 
} from 'lucide-react';

const Sidebar = () => {
    const markers = useMarkerStore((state) => state.markers);
    const [executionType, setExecutionType] = useState('parallel');
    const [methodType, setMethodType] = useState('brute');
    const [startNode, setStartNode] = useState('');
    const [responseData, setResponseData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

        try {
            const response = await axios.post('http://127.0.0.1:5000/tsp', data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            setResponseData(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error sending markers to backend:', error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="bg-white shadow-lg overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-3">
                    <MapPinIcon className="w-6 h-6" />
                    <h1 className="text-xl font-bold">Parallel TSP Solver</h1>
                </div>
            </div>

            {/* Nodes Section */}
            <div className="flex-grow overflow-hidden flex flex-col">
                <div className="bg-gray-100 p-3 flex items-center border-b">
                    <ListIcon className="mr-2 text-blue-500" />
                    <span className="font-semibold text-gray-700">Selected Nodes</span>
                </div>
                
                <div className="overflow-y-auto max-h-[250px] bg-white">
                    {markers.length === 0 ? (
                        <div className="text-center text-gray-500 p-4">
                            No nodes selected
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr className="text-xs text-gray-600">
                                    <th className="p-2 text-left">Label</th>
                                    <th className="p-2 text-left">Longitude</th>
                                    <th className="p-2 text-left">Latitude</th>
                                </tr>
                            </thead>
                            <tbody>
                                {markers.map((marker, index) => (
                                    <tr 
                                        key={index} 
                                        className={`hover:bg-blue-50 transition ${index % 2 ? 'bg-gray-50' : 'bg-white'}`}
                                    >
                                        <td className="p-2">{marker.label}</td>
                                        <td className="p-2">{marker.coordinates.lng.toFixed(4)}</td>
                                        <td className="p-2">{marker.coordinates.lat.toFixed(4)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Configuration Section */}
            <div className="p-4 bg-gray-50 space-y-4">
                <div>
                    <div className="flex items-center mb-2 text-gray-700">
                        <AlignVerticalSpaceAroundIcon className="mr-2 text-blue-500" />
                        <label className="font-semibold">Execution Type</label>
                    </div>
                    <select
                        value={executionType}
                        onChange={(e) => setExecutionType(e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300 transition"
                    >
                        <option value="parallel">Parallel</option>
                        <option value="serial">Serial</option>
                    </select>
                </div>

                <div>
                    <div className="flex items-center mb-2 text-gray-700">
                        <SettingsIcon className="mr-2 text-blue-500" />
                        <label className="font-semibold">Method Type</label>
                    </div>
                    <select
                        value={methodType}
                        onChange={(e) => setMethodType(e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300 transition"
                    >
                        <option value="brute">Brute Force</option>
                        <option value="nearest">Nearest Neighbor</option>
                    </select>
                </div>

                <div>
                    <div className="flex items-center mb-2 text-gray-700">
                        <MapPinIcon className="mr-2 text-blue-500" />
                        <label className="font-semibold">Start Node</label>
                    </div>
                    <select
                        value={startNode}
                        onChange={(e) => setStartNode(e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300 transition"
                    >
                        <option value="">Select Start Node</option>
                        {markers.map((marker, index) => (
                            <option key={index} value={marker.label}>
                                {marker.label} ({marker.coordinates.lng.toFixed(4)}, {marker.coordinates.lat.toFixed(4)})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Execute Button */}
            <button
                onClick={handleExecute}
                className="w-full p-3 bg-blue-500 text-white font-bold hover:bg-blue-600 transition flex items-center justify-center space-x-2 group"
            >
                <PlayIcon className="w-5 h-5 group-hover:animate-pulse" />
                <span>Execute TSP</span>
            </button>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                responseData={responseData}
                onClose={closeModal}
            />
        </div>
    );
};

export default Sidebar;