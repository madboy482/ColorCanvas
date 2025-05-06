import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorPickerModal from './ColorPickerModal';

const ColorInput = ({ baseColors, setBaseColors }) => {
  const [activeColorIndex, setActiveColorIndex] = useState(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [currentEditingColor, setCurrentEditingColor] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedColor, setDraggedColor] = useState(null);
  
  // Handle direct input of hex color
  const handleColorChange = (index, e) => {
    const value = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      const newColors = [...baseColors];
      newColors[index] = value;
      setBaseColors(newColors);
    }
  };

  // Open color picker modal for specific color
  const openColorPicker = (index) => {
    setCurrentEditingColor(index);
    setIsColorPickerOpen(true);
  };

  // Update color from color picker
  const handleColorPickerChange = (color) => {
    const newColors = [...baseColors];
    newColors[currentEditingColor] = color;
    setBaseColors(newColors);
    setIsColorPickerOpen(false);
  };

  // Add a new color
  const addColor = () => {
    if (baseColors.length < 5) {  // Limit to 5 colors
      // Add a color that complements the last color in the palette
      const lastColor = baseColors[baseColors.length - 1] || '#ff0000';
      // Convert hex to RGB
      const r = parseInt(lastColor.slice(1, 3), 16);
      const g = parseInt(lastColor.slice(3, 5), 16);
      const b = parseInt(lastColor.slice(5, 7), 16);
      
      // Generate complementary color by inverting
      const newR = (255 - r).toString(16).padStart(2, '0');
      const newG = (255 - g).toString(16).padStart(2, '0');
      const newB = (255 - b).toString(16).padStart(2, '0');
      
      setBaseColors([...baseColors, `#${newR}${newG}${newB}`]);
    }
  };

  // Remove a color
  const removeColor = (index) => {
    if (baseColors.length > 1) {  // Keep at least one color
      const newColors = baseColors.filter((_, i) => i !== index);
      setBaseColors(newColors);
    }
  };

  // Handle drag starting
  const handleDragStart = (index) => {
    setIsDragging(true);
    setDraggedColor(index);
  };

  // Handle dropping color to reorder
  const handleDrop = (targetIndex) => {
    if (draggedColor !== null && draggedColor !== targetIndex) {
      const newColors = [...baseColors];
      const colorToMove = newColors[draggedColor];
      newColors.splice(draggedColor, 1);
      newColors.splice(targetIndex, 0, colorToMove);
      setBaseColors(newColors);
    }
    setIsDragging(false);
    setDraggedColor(null);
  };

  // Allow dropping
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Get contrasting text color
  const getContrastColor = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    
    // Calculate perceived brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Base Colors</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        These are your foundation colors. Edit them to generate a new palette.
      </p>

      {/* Color inputs */}
      <div className="space-y-3 mb-6">
        {baseColors.map((color, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center p-1 rounded-lg ${
              isDragging && draggedColor === index
                ? 'opacity-50'
                : ''
            }`}
            style={{
              background: `linear-gradient(to right, ${color}33, transparent)`,
              borderLeft: `4px solid ${color}`
            }}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            onMouseEnter={() => setActiveColorIndex(index)}
            onMouseLeave={() => setActiveColorIndex(null)}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="h-10 w-10 rounded-lg shadow-sm cursor-pointer relative overflow-hidden"
              style={{ backgroundColor: color }}
              onClick={() => openColorPicker(index)}
            >
              {/* Pulsating effect when active */}
              {activeColorIndex === index && (
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    boxShadow: [
                      `inset 0 0 0 2px ${color}`,
                      `inset 0 0 0 3px ${color}80`,
                      `inset 0 0 0 2px ${color}`
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                ></motion.div>
              )}
            </motion.div>
            
            <input
              type="text"
              value={color}
              onChange={(e) => handleColorChange(index, e)}
              className="ml-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-28 text-sm font-mono"
              spellCheck="false"
            />
            
            <div className="ml-auto flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => openColorPicker(index)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Open color picker"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="13.5" cy="6.5" r="2.5"></circle>
                  <circle cx="17.5" cy="10.5" r="2.5"></circle>
                  <circle cx="8.5" cy="7.5" r="2.5"></circle>
                  <circle cx="6.5" cy="12.5" r="2.5"></circle>
                  <path d="M12 22v-6"></path>
                  <path d="M12 13V9.5"></path>
                  <path d="M12 13l4.5 2.5"></path>
                  <path d="M12 13l-4.5 2.5"></path>
                </svg>
              </motion.button>
              {baseColors.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeColor(index)}
                  className="p-2 rounded-full hover:bg-red-100 text-red-500 dark:hover:bg-red-900 dark:text-red-400 transition-colors"
                  title="Remove this color"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Preview of base colors */}
      <div className="flex mb-6 h-8 rounded-lg overflow-hidden shadow-md">
        {baseColors.map((color, index) => (
          <motion.div
            key={index}
            className="flex-1 relative cursor-pointer"
            style={{ backgroundColor: color }}
            whileHover={{ scaleY: 1.1 }}
            transition={{ duration: 0.2 }}
            onClick={() => openColorPicker(index)}
          >
            <AnimatePresence>
              {activeColorIndex === index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: `${color}80` }}
                >
                  <span 
                    className="text-xs font-semibold" 
                    style={{ color: getContrastColor(color) }}
                  >
                    {color}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Add color button */}
      {baseColors.length < 5 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addColor}
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Color ({baseColors.length}/5)
        </motion.button>
      )}

      {/* Color Picker Modal */}
      <ColorPickerModal
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        initialColor={currentEditingColor !== null ? baseColors[currentEditingColor] : '#ff0000'}
        onColorChange={handleColorPickerChange}
      />
    </div>
  );
};

export default ColorInput;
