import React from 'react';
import { 
  ChevronRightIcon, 
  TimerIcon, 
  CheckCircleIcon, 
  CopyIcon 
} from 'lucide-react';

const Modal = ({ isOpen, responseData, onClose }) => {
  if (!isOpen || !responseData) return null;

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: Add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] md:w-[60%] lg:w-[40%] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircleIcon className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-bold">Optimization Results</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 py-2 border-b">
            <span className="font-medium">Execution Type</span>
            <span>{responseData.executionType}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 py-2 border-b">
            <span className="font-medium">Method Type</span>
            <span>{responseData.methodType}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 py-2 border-b">
            <span className="font-medium flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
              Status
            </span>
            <span>{responseData.status}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 py-2 border-b">
            <span className="font-medium flex items-center">
              <TimerIcon className="w-4 h-4 mr-2" />
              Execution Time
            </span>
            <span>{responseData.result.execution_time_seconds} seconds</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 py-2 border-b">
            <span className="font-medium">Minimum Cost</span>
            <div className="flex items-center">
              <span>{responseData.result.minimum_cost.toFixed(4)}</span>
              <button 
                onClick={() => handleCopyToClipboard(responseData.result.minimum_cost.toFixed(4))}
                className="ml-2 p-1 hover:bg-gray-100 rounded"
              >
                <CopyIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 py-2">
            <span className="font-medium">Optimal Tour</span>
            <div className="flex items-center">
              <span>{responseData.result.optimal_tour.join(' → ')}</span>
              <ChevronRightIcon className="w-4 h-4 ml-2 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;