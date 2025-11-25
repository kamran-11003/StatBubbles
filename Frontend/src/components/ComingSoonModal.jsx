import React from 'react';
import { X } from 'lucide-react';

const ComingSoonModal = ({ isOpen, onClose, leagueName, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`relative p-6 rounded-lg shadow-xl max-w-md w-full mx-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <X size={20} />
        </button>
        
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold mb-2">Under Construction</h2>
          <p className="text-lg mb-4">
            {leagueName} statistics are currently under construction.
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            We're working hard to bring you comprehensive {leagueName} player and team data. 
            Check back soon for updates!
          </p>
          
          <button
            onClick={onClose}
            className={`mt-6 px-6 py-2 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonModal; 