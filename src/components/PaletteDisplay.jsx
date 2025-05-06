import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorSwatch from './ColorSwatch';

const PaletteDisplay = ({ palette, animateItems }) => {
  const [activeColorIndex, setActiveColorIndex] = useState(null);
  const [copiedColor, setCopiedColor] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Copy color code to clipboard
  const copyColorToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Calculate contrasting text color for a background
  const getContrastColor = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white based on luminance
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Process palette to ensure it's in the proper format
  const processPalette = () => {
    // If palette is not an array or is empty, return an empty array
    if (!Array.isArray(palette) || palette.length === 0) {
      return [];
    }
    
    // If palette is already a 2D array (array of arrays), return it as is
    if (Array.isArray(palette[0])) {
      return palette;
    }
    
    // If palette is a flat array, organize it into groups of 6 colors each
    const groupSize = 6;
    const groups = [];
    
    // Chunk the flat palette array into groups
    for (let i = 0; i < palette.length; i += groupSize) {
      groups.push(palette.slice(i, i + groupSize));
    }
    
    return groups;
  };

  const processedPalette = processPalette();

  return (
    <div className="space-y-6">
      {/* View mode toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
          <button 
            className={`px-3 py-1 text-sm flex items-center ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            onClick={() => setViewMode('grid')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
            Grid
          </button>
          <button 
            className={`px-3 py-1 text-sm flex items-center ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            onClick={() => setViewMode('list')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            List
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {processedPalette.map((group, groupIndex) => (
            Array.isArray(group) ? group.map((color, colorIndex) => (
              <motion.div
                key={`${groupIndex}-${colorIndex}`}
                initial={animateItems ? { opacity: 0, scale: 0.8 } : false}
                animate={animateItems ? 
                  { opacity: 1, scale: 1, transition: { delay: (groupIndex * 0.1) + (colorIndex * 0.03) } } : 
                  false
                }
                whileHover={{ y: -5, boxShadow: "0 15px 25px -5px rgba(0, 0, 0, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={() => copyColorToClipboard(color)}
                className="relative rounded-xl overflow-hidden cursor-pointer"
              >
                <div 
                  className="h-32 w-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                  onMouseEnter={() => setActiveColorIndex(`${groupIndex}-${colorIndex}`)}
                  onMouseLeave={() => setActiveColorIndex(null)}
                >
                  {/* Overlay with color info */}
                  <AnimatePresence>
                    {(activeColorIndex === `${groupIndex}-${colorIndex}` || copiedColor === color) && (
                      <motion.div 
                        className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{ 
                          backgroundColor: `${color}CC`,
                          color: getContrastColor(color)
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <span className="font-mono font-bold text-lg">{color.toUpperCase()}</span>
                        {copiedColor === color && (
                          <span className="mt-1 px-2 py-1 bg-black bg-opacity-20 rounded-full text-xs">
                            Copied!
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )) : null
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {processedPalette.map((group, groupIndex) => (
            Array.isArray(group) && group.length > 0 ? (
              <motion.div 
                key={groupIndex}
                initial={animateItems ? { opacity: 0, y: 20 } : false}
                animate={animateItems ? { opacity: 1, y: 0, transition: { delay: groupIndex * 0.1 } } : false}
                className="rounded-xl overflow-hidden shadow-lg dark:bg-gray-700"
              >
                <div className="flex items-stretch">
                  {group.map((color, colorIndex) => (
                    <motion.div
                      key={`${groupIndex}-${colorIndex}`}
                      whileHover={{ scaleY: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => copyColorToClipboard(color)}
                      className="relative flex-1 cursor-pointer"
                      style={{ backgroundColor: color }}
                      onMouseEnter={() => setActiveColorIndex(`${groupIndex}-${colorIndex}`)}
                      onMouseLeave={() => setActiveColorIndex(null)}
                    >
                      <div className="h-16 flex items-center justify-center">
                        <AnimatePresence>
                          {(activeColorIndex === `${groupIndex}-${colorIndex}` || copiedColor === color) && (
                            <motion.div 
                              className="absolute inset-0 flex items-center justify-center"
                              style={{ 
                                backgroundColor: `${color}E6`,
                                color: getContrastColor(color)
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <span className="font-mono text-xs sm:text-sm">{color.toUpperCase()}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Color codes row */}
                <div className="flex">
                  {group.map((color, colorIndex) => (
                    <div 
                      key={`code-${groupIndex}-${colorIndex}`}
                      className="flex-1 py-2 text-center text-xs font-mono bg-white dark:bg-gray-800 truncate px-1"
                    >
                      {copiedColor === color ? (
                        <span className="text-green-500">Copied!</span>
                      ) : (
                        color.toUpperCase()
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : null
          ))}
        </div>
      )}
      
      {processedPalette.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-lg font-medium">No colors in the palette yet</p>
          <p className="mt-2">Try adding some base colors to generate a palette!</p>
        </div>
      )}
    </div>
  );
};

export default PaletteDisplay;