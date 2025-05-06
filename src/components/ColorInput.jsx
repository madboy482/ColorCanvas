import React from 'react';
import { generateRandomColors } from '../utils/colorUtils';

const ColorInput = ({ baseColors, setBaseColors }) => {
  const handleChange = (index, value) => {
    const updatedColors = [...baseColors];
    updatedColors[index] = value;
    setBaseColors(updatedColors);
  };
  
  const addColor = () => {
    setBaseColors([...baseColors, '#ffffff']);
  };
  
  const removeColor = (index) => {
    if (baseColors.length <= 1) return; // Keep at least one color
    const updatedColors = baseColors.filter((_, i) => i !== index);
    setBaseColors(updatedColors);
  };
  
  const generateRandom = () => {
    setBaseColors(generateRandomColors(baseColors.length));
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Base Colors</h2>
        <div className="flex space-x-2">
          <button 
            onClick={generateRandom}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Random
          </button>
          <button 
            onClick={addColor}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Add Color
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {baseColors.map((color, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="relative group">
              <input
                type="color"
                value={color}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-14 h-14 p-1 rounded-lg cursor-pointer border-2 border-gray-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
            </div>
            <input
              type="text"
              value={color.toUpperCase()}
              onChange={(e) => {
                const value = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  handleChange(index, value);
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            {baseColors.length > 1 && (
              <button
                onClick={() => removeColor(index)}
                className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorInput;
