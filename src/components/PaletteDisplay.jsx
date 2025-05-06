import React, { useState } from 'react';
import ColorSwatch from './ColorSwatch';

const PaletteDisplay = ({ palette }) => {
  const [paletteView, setPaletteView] = useState('grid'); // 'grid' or 'stack'

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Generated Palette</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setPaletteView('grid')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 
              ${paletteView === 'grid' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Grid
          </button>
          <button 
            onClick={() => setPaletteView('stack')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 
              ${paletteView === 'stack' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Stack
          </button>
        </div>
      </div>

      {paletteView === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
          {palette.map((color, index) => (
            <ColorSwatch key={index} color={color} />
          ))}
        </div>
      ) : (
        <div className="relative h-96 w-full bg-gray-100 rounded-xl overflow-hidden shadow-lg">
          {palette.map((color, index) => {
            const offset = (index * (100 / palette.length));
            const width = `${100 / palette.length}%`;
            return (
              <div 
                key={index} 
                className="absolute top-0 h-full transition-all duration-300 hover:z-10 hover:transform hover:scale-105 cursor-pointer"
                style={{ 
                  left: `${offset}%`,
                  width,
                  backgroundColor: color,
                  zIndex: index
                }}
                onClick={() => {
                  navigator.clipboard.writeText(color);
                }}
              >
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 px-1">
                  {color.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-center text-gray-500 text-sm mt-4">Click on any color to copy its hex value to clipboard</p>
    </div>
  );
};

export default PaletteDisplay;