import React, { useState, useEffect } from 'react';
import ColorInput from './components/ColorInput';
import PaletteDisplay from './components/PaletteDisplay';
import { generatePalette, generateRandomColors, hexToHSL } from './utils/colorUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMoon, 
  FiSun, 
  FiRefreshCw, 
  FiSave, 
  FiEye, 
  FiEyeOff, 
  FiCoffee, 
  FiDownload,
  FiHash,
  FiImage,
  FiShare2,
  FiInfo
} from 'react-icons/fi';
import './App.css';

function App() {
  const [baseColors, setBaseColors] = useState(['#ff0000', '#00ff00', '#0000ff']);
  const [palette, setPalette] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [showSavedPalettes, setShowSavedPalettes] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);
  const [paletteMode, setPaletteMode] = useState('normal'); // normal, monochrome, analogous
  const [infoTooltip, setInfoTooltip] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  // Generate palette whenever baseColors change
  useEffect(() => {
    setPalette(generatePalette(baseColors, paletteMode));
    
    // Trigger item animations when palette changes
    setAnimateItems(true);
    const timer = setTimeout(() => setAnimateItems(false), 1000);
    return () => clearTimeout(timer);
  }, [baseColors, paletteMode]);

  // Load saved palettes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedPalettes');
    if (saved) {
      setSavedPalettes(JSON.parse(saved));
    }
    
    // Check for preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Save current palette
  const savePalette = () => {
    const newSavedPalettes = [...savedPalettes, { 
      id: Date.now(), 
      baseColors: [...baseColors],
      paletteMode,
      timestamp: new Date().toLocaleString()
    }];
    setSavedPalettes(newSavedPalettes);
    localStorage.setItem('savedPalettes', JSON.stringify(newSavedPalettes));
    
    // Show notification (could be enhanced with a proper toast system)
    setInfoTooltip("Palette saved!");
    setTimeout(() => setInfoTooltip(null), 2000);
  };

  // Load a saved palette
  const loadPalette = (saved) => {
    setBaseColors(saved.baseColors);
    setPaletteMode(saved.paletteMode || 'normal');
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
  
  // Export current palette as PNG
  const exportPalette = () => {
    // A placeholder function - in a real implementation, this would
    // generate an image file of the color palette for download
    setInfoTooltip("Export feature coming soon!");
    setTimeout(() => setInfoTooltip(null), 2000);
  };
  
  // Share palette (copy URL with color codes)
  const sharePalette = () => {
    const url = new URL(window.location.href);
    url.hash = baseColors.map(c => c.replace('#', '')).join(',');
    navigator.clipboard.writeText(url.toString());
    
    setInfoTooltip("Palette URL copied to clipboard!");
    setTimeout(() => setInfoTooltip(null), 2000);
  };
  
  // Get gradient background based on the first base color
  const getGradientBackground = () => {
    if (baseColors.length > 0) {
      const { h, s, l } = hexToHSL(baseColors[0]);
      const hue1 = h * 360;
      const hue2 = ((h + 0.2) % 1) * 360;
      
      return {
        backgroundImage: isDarkMode 
          ? `radial-gradient(circle at top right, hsla(${hue1}, ${s * 100}%, ${l * 100}%, 0.1), transparent 80%),
             radial-gradient(circle at bottom left, hsla(${hue2}, ${s * 100}%, ${l * 100}%, 0.1), transparent 80%)`
          : `radial-gradient(circle at top right, hsla(${hue1}, ${s * 100}%, ${l * 100}%, 0.2), transparent 60%),
             radial-gradient(circle at bottom left, hsla(${hue2}, ${s * 100}%, ${l * 100}%, 0.2), transparent 60%)`
      };
    }
    return {};
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`} style={getGradientBackground()}>
      {/* Header */}
      <motion.header 
        className={`py-6 ${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} shadow-md backdrop-blur-sm sticky top-0 z-20`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
          >
            <motion.span 
              className="text-3xl"
              animate={{ 
                rotate: animateItems ? [0, 15, -15, 0] : 0,
                scale: animateItems ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.6 }}
            >
              🎨
            </motion.span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Color Palette Generator
            </h1>
          </motion.div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={generateRandomPalette}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg shadow transition-all duration-200 flex items-center space-x-2"
            >
              <FiRefreshCw size={16} />
              <span>Random Palette</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Palette Mode Selection */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <button 
            onClick={() => setPaletteMode('normal')}
            className={`px-4 py-2 rounded-md transition-all ${paletteMode === 'normal' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Standard
          </button>
          <button 
            onClick={() => setPaletteMode('monochrome')}
            className={`px-4 py-2 rounded-md transition-all ${paletteMode === 'monochrome' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Monochrome
          </button>
          <button 
            onClick={() => setPaletteMode('analogous')}
            className={`px-4 py-2 rounded-md transition-all ${paletteMode === 'analogous' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Analogous
          </button>
          <button 
            onClick={() => setPaletteMode('triad')}
            className={`px-4 py-2 rounded-md transition-all ${paletteMode === 'triad' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Triadic
          </button>
          <button 
            onClick={() => setPaletteMode('complement')}
            className={`px-4 py-2 rounded-md transition-all ${paletteMode === 'complement' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Complementary
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Controls */}
          <motion.div 
            className="lg:w-1/3 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ColorInput baseColors={baseColors} setBaseColors={setBaseColors} />
            </motion.div>
            
            <motion.div 
              className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Your Palettes</h2>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={savePalette}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                  >
                    <FiSave size={14} />
                    <span>Save</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSavedPalettes(!showSavedPalettes)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                  >
                    {showSavedPalettes ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    <span>{showSavedPalettes ? 'Hide' : 'Show'}</span>
                  </motion.button>
                </div>
              </div>

              <AnimatePresence>
                {showSavedPalettes && (
                  <motion.div 
                    className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {savedPalettes.length === 0 ? (
                      <motion.p 
                        className="text-center text-gray-500 py-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        No saved palettes yet. Create something beautiful and save it!
                      </motion.p>
                    ) : (
                      savedPalettes.map((saved, idx) => (
                        <motion.div 
                          key={saved.id} 
                          className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex flex-col space-y-2 transition-colors duration-200 cursor-pointer`}
                          onClick={() => loadPalette(saved)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs opacity-70">{saved.timestamp}</span>
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadPalette(saved);
                                }}
                                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded flex items-center space-x-1"
                              >
                                <FiEye size={10} />
                                <span>Load</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSavedPalette(saved.id);
                                }}
                                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center space-x-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                <span>Delete</span>
                              </motion.button>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {saved.baseColors.map((color, idx) => (
                              <div 
                                key={idx}
                                className="h-8 flex-1 rounded transition-transform hover:scale-105"
                                style={{ backgroundColor: color }}
                                title={color}
                              ></div>
                            ))}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Quick Actions */}
            <motion.div 
              className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportPalette}
                  className={`p-4 rounded-lg flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <FiDownload size={20} className="mb-2" />
                  <span className="text-sm">Export</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sharePalette}
                  className={`p-4 rounded-lg flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <FiShare2 size={20} className="mb-2" />
                  <span className="text-sm">Share</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowInfo(!showInfo)}
                  className={`p-4 rounded-lg flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <FiInfo size={20} className="mb-2" />
                  <span className="text-sm">Info</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Palette Display */}
          <motion.div 
            className="lg:w-2/3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} relative overflow-hidden`}
              whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {animateItems && (
                <motion.div 
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              <PaletteDisplay palette={palette} animateItems={animateItems} />
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        className={`py-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} mt-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-70">
            Color Palette Generator | Made with <span className="text-red-500">❤️</span> | {new Date().getFullYear()}
          </p>
        </div>
      </motion.footer>
      
      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6`}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">About This App</h2>
                <button 
                  onClick={() => setShowInfo(false)}
                  className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <p>The Color Palette Generator helps you create beautiful, harmonious color palettes for your design projects.</p>
                
                <div>
                  <h3 className="font-bold mb-1">Features:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Generate color palettes from base colors</li>
                    <li>Choose from different palette modes</li>
                    <li>Save your favorite palettes</li>
                    <li>Copy color codes with a click</li>
                    <li>Dark/light theme support</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold mb-1">Palette Modes:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><span className="font-medium">Standard:</span> Creates varied shades and tints</li>
                    <li><span className="font-medium">Monochrome:</span> Different shades of the same hue</li>
                    <li><span className="font-medium">Analogous:</span> Colors adjacent on the color wheel</li>
                    <li><span className="font-medium">Triadic:</span> Three colors equally spaced on the color wheel</li>
                    <li><span className="font-medium">Complementary:</span> Opposite colors on the color wheel</li>
                  </ul>
                </div>
              </div>
              
              <button 
                onClick={() => setShowInfo(false)}
                className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Info Tooltip */}
      <AnimatePresence>
        {infoTooltip && (
          <motion.div 
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {infoTooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
