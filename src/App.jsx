import React, { useState, useEffect } from 'react';
import ColorInput from './components/ColorInput';
import PaletteDisplay from './components/PaletteDisplay';
import { generatePalette, generateRandomColors } from './utils/colorUtils';
import './App.css';

function App() {
  const [baseColors, setBaseColors] = useState(['#ff0000', '#00ff00', '#0000ff']);
  const [palette, setPalette] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [showSavedPalettes, setShowSavedPalettes] = useState(false);

  // Generate palette whenever baseColors change
  useEffect(() => {
    setPalette(generatePalette(baseColors));
  }, [baseColors]);

  // Load saved palettes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedPalettes');
    if (saved) {
      setSavedPalettes(JSON.parse(saved));
    }
  }, []);

  // Save current palette
  const savePalette = () => {
    const newSavedPalettes = [...savedPalettes, { 
      id: Date.now(), 
      baseColors: [...baseColors],
      timestamp: new Date().toLocaleString()
    }];
    setSavedPalettes(newSavedPalettes);
    localStorage.setItem('savedPalettes', JSON.stringify(newSavedPalettes));
  };

  // Load a saved palette
  const loadPalette = (baseColors) => {
    setBaseColors(baseColors);
    setShowSavedPalettes(false);
  };

  // Delete a saved palette
  const deleteSavedPalette = (id) => {
    const filtered = savedPalettes.filter(palette => palette.id !== id);
    setSavedPalettes(filtered);
    localStorage.setItem('savedPalettes', JSON.stringify(filtered));
  };

  // Generate a random palette
  const generateRandomPalette = () => {
    setBaseColors(generateRandomColors(3));
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`py-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🎨</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Color Palette Generator
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={generateRandomPalette}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg shadow transition-all duration-200"
            >
              Random Palette
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Controls */}
          <div className="lg:w-1/3 space-y-6">
            <ColorInput baseColors={baseColors} setBaseColors={setBaseColors} />
            
            <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Your Palettes</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={savePalette}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Save Current
                  </button>
                  <button
                    onClick={() => setShowSavedPalettes(!showSavedPalettes)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {showSavedPalettes ? 'Hide' : 'Show'} Saved
                  </button>
                </div>
              </div>

              {showSavedPalettes && (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {savedPalettes.length === 0 ? (
                    <p className="text-center text-gray-500">No saved palettes yet</p>
                  ) : (
                    savedPalettes.map(saved => (
                      <div 
                        key={saved.id} 
                        className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex flex-col space-y-2`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs opacity-70">{saved.timestamp}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => loadPalette(saved.baseColors)}
                              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => deleteSavedPalette(saved.id)}
                              className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {saved.baseColors.map((color, idx) => (
                            <div 
                              key={idx}
                              className="h-8 flex-1 rounded"
                              style={{ backgroundColor: color }}
                              title={color}
                            ></div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Palette Display */}
          <div className="lg:w-2/3">
            <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <PaletteDisplay palette={palette} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} mt-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-70">
            Color Palette Generator | Made with ❤️ | {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
