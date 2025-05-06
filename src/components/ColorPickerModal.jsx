import React, { useState, useEffect, useRef } from 'react';
import { hexToHSL, hslToHex } from '../utils/colorUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiZap, 
  FiShuffle, 
  FiEye, 
  FiCheck, 
  FiCopy, 
  FiX, 
  FiChevronDown, 
  FiSave,
  FiDroplet,
  FiSun,
  FiGrid
} from 'react-icons/fi';

const ColorPickerModal = ({ isOpen, onClose, initialColor, onColorChange }) => {
  const [currentColor, setCurrentColor] = useState(initialColor || '#ff0000');
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [recentColors, setRecentColors] = useState(
    JSON.parse(localStorage.getItem('recentColors')) || []
  );
  const [colorFormat, setColorFormat] = useState('hex'); // 'hex', 'rgb', 'hsl'
  const [dragging, setDragging] = useState(false);
  const [pickerMode, setPickerMode] = useState('wheel'); // 'wheel', 'gradient', 'sliders'
  const [copied, setCopied] = useState(false);
  const [colorHistory, setColorHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showEffects, setShowEffects] = useState(false);
  
  const modalRef = useRef(null);
  const colorWheelRef = useRef(null);
  const satLightBoxRef = useRef(null);
  
  // Convert initial hex to HSL when modal opens
  useEffect(() => {
    if (initialColor) {
      setCurrentColor(initialColor);
      const { h, s, l } = hexToHSL(initialColor);
      setHue(Math.round(h * 360));
      setSaturation(Math.round(s * 100));
      setLightness(Math.round(l * 100));
      
      // Reset history when opening modal with new color
      setColorHistory([initialColor]);
      setHistoryIndex(0);
    }
  }, [initialColor, isOpen]);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Update color when HSL changes
  useEffect(() => {
    const newColor = hslToHex(hue / 360, saturation / 100, lightness / 100);
    
    if (newColor !== currentColor) {
      setCurrentColor(newColor);
      
      // Add to history if not just navigating through history
      if (historyIndex === colorHistory.length - 1) {
        // Only add if different from last history item
        if (colorHistory.length === 0 || colorHistory[colorHistory.length - 1] !== newColor) {
          const newHistory = [...colorHistory, newColor].slice(-50); // Keep last 50 changes
          setColorHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        }
      }
    }
  }, [hue, saturation, lightness]);

  // Handle undo/redo
  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const color = colorHistory[newIndex];
      setHistoryIndex(newIndex);
      
      // Update color without triggering history update
      setCurrentColor(color);
      const { h, s, l } = hexToHSL(color);
      setHue(Math.round(h * 360));
      setSaturation(Math.round(s * 100));
      setLightness(Math.round(l * 100));
    }
  };

  const goForward = () => {
    if (historyIndex < colorHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const color = colorHistory[newIndex];
      setHistoryIndex(newIndex);
      
      // Update color without triggering history update
      setCurrentColor(color);
      const { h, s, l } = hexToHSL(color);
      setHue(Math.round(h * 360));
      setSaturation(Math.round(s * 100));
      setLightness(Math.round(l * 100));
    }
  };

  // Handle saturation/lightness box interactions
  const handleSatLightBoxInteraction = (e) => {
    if (!satLightBoxRef.current) return;
    
    const updateValues = (clientX, clientY) => {
      const rect = satLightBoxRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      
      const newSaturation = Math.round((x / rect.width) * 100);
      const newLightness = Math.round(100 - (y / rect.height) * 100);
      
      setSaturation(newSaturation);
      setLightness(newLightness);
    };
    
    // For initial click
    updateValues(e.clientX, e.clientY);
    
    // Start dragging
    setDragging('satlight');
    
    const handleMouseMove = (moveEvent) => {
      updateValues(moveEvent.clientX, moveEvent.clientY);
    };
    
    const handleMouseUp = () => {
      setDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle color wheel interactions
  const handleColorWheelInteraction = (e) => {
    if (!colorWheelRef.current) return;
    
    const updateHue = (clientX, clientY) => {
      const rect = colorWheelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate angle from center of wheel to mouse position
      let angle = Math.atan2(clientY - centerY, clientX - centerX);
      
      // Convert angle to degrees, adjust to 0-360 range
      let angleDeg = Math.round(angle * (180 / Math.PI)) + 90;
      if (angleDeg < 0) angleDeg += 360;
      if (angleDeg >= 360) angleDeg -= 360;
      
      setHue(angleDeg);
    };
    
    // For initial click
    updateHue(e.clientX, e.clientY);
    
    // Start dragging
    setDragging('hue');
    
    const handleMouseMove = (moveEvent) => {
      updateHue(moveEvent.clientX, moveEvent.clientY);
    };
    
    const handleMouseUp = () => {
      setDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Apply selected color and update recent colors
  const applyColor = () => {
    onColorChange(currentColor);
    
    // Update recent colors
    const updatedRecentColors = [
      currentColor, 
      ...recentColors.filter(color => color !== currentColor)
    ].slice(0, 12); // Keep only last 12 colors
    
    setRecentColors(updatedRecentColors);
    localStorage.setItem('recentColors', JSON.stringify(updatedRecentColors));
    
    onClose();
  };
  
  // Copy color to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFormattedColor());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Generate random color
  const generateRandomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 100);
    const l = Math.floor(Math.random() * 60) + 20; // Keep lightness between 20-80 for better colors
    
    setHue(h);
    setSaturation(s);
    setLightness(l);
  };

  // Handle direct hex input
  const handleHexChange = (e) => {
    const value = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      setCurrentColor(value);
      
      // Only convert to HSL if we have a complete hex value
      if (value.length === 7) {
        const { h, s, l } = hexToHSL(value);
        setHue(Math.round(h * 360));
        setSaturation(Math.round(s * 100));
        setLightness(Math.round(l * 100));
      }
    }
  };
  
  // Format color based on selected format
  const getFormattedColor = () => {
    switch (colorFormat) {
      case 'rgb':
        const r = parseInt(currentColor.slice(1, 3), 16);
        const g = parseInt(currentColor.slice(3, 5), 16);
        const b = parseInt(currentColor.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
      case 'hsl':
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      default:
        return currentColor.toUpperCase();
    }
  };
  
  // Toggle between color formats
  const toggleColorFormat = () => {
    const formats = ['hex', 'rgb', 'hsl'];
    const currentIndex = formats.indexOf(colorFormat);
    const nextIndex = (currentIndex + 1) % formats.length;
    setColorFormat(formats[nextIndex]);
  };
  
  // Generate harmonious colors (complementary, triadic, etc.)
  const generateHarmoniousColors = (type) => {
    const { h, s, l } = hexToHSL(currentColor);
    let newHue = h;
    
    switch (type) {
      case 'complementary':
        newHue = (h + 0.5) % 1;
        break;
      case 'analogous1':
        newHue = (h + 1/12) % 1;
        break;
      case 'analogous2':
        newHue = (h - 1/12) % 1;
        if (newHue < 0) newHue += 1;
        break;
      case 'triadic1':
        newHue = (h + 1/3) % 1;
        break;
      case 'triadic2':
        newHue = (h + 2/3) % 1;
        break;
      case 'tetradic1':
        newHue = (h + 0.25) % 1;
        break;
      case 'tetradic2':
        newHue = (h + 0.5) % 1;
        break;
      case 'tetradic3':
        newHue = (h + 0.75) % 1;
        break;
      default:
        return;
    }
    
    setHue(Math.round(newHue * 360));
  };

  // Define trendy color palettes
  const colorPalettes = {
    "Futuristic": ['#39FF14', '#00FFFF', '#FF00FF', '#14F1FF', '#FF10F0'],
    "Neon": ['#FE00FE', '#00FEFE', '#00FF00', '#FFFF00', '#FF0000'],
    "Pastel": ['#FFD1DC', '#FADCD9', '#F9F1F0', '#AAC4FF', '#E1F0DA'],
    "Cyberpunk": ['#F618FF', '#16D6FA', '#6518F4', '#7AE800', '#F17105'],
    "Retro": ['#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0']
  };

  // Return null if modal is not open
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      >
        <motion.div 
          ref={modalRef}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          style={{
            boxShadow: showEffects 
              ? `0 0 40px 5px ${currentColor}80, 0 30px 60px -10px rgba(0, 0, 0, 0.5)` 
              : '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Modal Header */}
          <div 
            className="relative flex justify-between items-center px-6 py-4 overflow-hidden"
          >
            <div 
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500"
              style={showEffects ? {
                backgroundImage: `linear-gradient(to right, ${currentColor}, hsl(${(hue + 180) % 360}deg, ${saturation}%, ${lightness}%))`
              } : {}}
            >
              {showEffects && (
                <>
                  <div className="absolute inset-0 opacity-20" 
                    style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
                    }}
                  ></div>
                </>
              )}
            </div>
            <motion.h3 
              className="text-xl font-bold text-white z-10"
              animate={{ 
                scale: [1, 1.03, 1],
                textShadow: showEffects ? "0 0 8px rgba(255,255,255,0.5)" : "none"
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Color Lab
            </motion.h3>
            <div className="flex items-center space-x-2 z-10">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEffects(!showEffects)}
                className="p-1 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                title={showEffects ? "Disable effects" : "Enable effects"}
              >
                <FiZap size={18} className={showEffects ? "text-yellow-300" : ""} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-1 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30"
              >
                <FiX size={18} />
              </motion.button>
            </div>
          </div>

          <div className="p-6">
            {/* Color Preview with Actions */}
            <div className="flex flex-col mb-6 relative">
              <div className="flex justify-center">
                <motion.div 
                  className="relative h-28 w-28 rounded-full shadow-lg flex items-center justify-center mb-4"
                  animate={{ 
                    boxShadow: showEffects 
                      ? [
                          `0 0 20px ${currentColor}90`,
                          `0 0 30px ${currentColor}70`,
                          `0 0 20px ${currentColor}90`
                        ] 
                      : `0 5px 15px rgba(0,0,0,0.1)`
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ 
                    backgroundColor: currentColor
                  }}
                >
                  {showEffects && (
                    <motion.div 
                      className="absolute inset-0 rounded-full"
                      animate={{ 
                        background: [
                          `radial-gradient(circle, transparent 30%, ${currentColor} 70%)`,
                          `radial-gradient(circle, transparent 40%, ${currentColor} 70%)`,
                          `radial-gradient(circle, transparent 30%, ${currentColor} 70%)`
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    ></motion.div>
                  )}
                </motion.div>
              </div>
              
              {/* Color Actions */}
              <div className="flex justify-center items-center space-x-2 mb-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={historyIndex <= 0}
                  onClick={goBack}
                  className={`p-2 rounded-full ${historyIndex <= 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-mono py-1 px-3 rounded-full flex items-center space-x-1"
                >
                  {copied ? (
                    <><FiCheck size={14} className="text-green-500" /><span>{getFormattedColor()}</span></>
                  ) : (
                    <><FiCopy size={14} /><span>{getFormattedColor()}</span></>
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={historyIndex >= colorHistory.length - 1}
                  onClick={goForward}
                  className={`p-2 rounded-full ${historyIndex >= colorHistory.length - 1 ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </motion.button>
              </div>
              
              {/* Format toggle */}
              <button
                onClick={toggleColorFormat}
                className="text-xs text-gray-500 hover:text-gray-700 text-center self-center"
              >
                Click to toggle format
              </button>
            </div>
            
            {/* Picker Mode Tabs */}
            <div className="flex mb-4 border-b border-gray-200">
              {[
                { id: 'wheel', icon: <FiDroplet />, label: 'Wheel' },
                { id: 'gradient', icon: <FiGrid />, label: 'Box' },
                { id: 'sliders', icon: <FiSun />, label: 'Sliders' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setPickerMode(mode.id)}
                  className={`flex-1 py-2 flex justify-center items-center space-x-1 ${
                    pickerMode === mode.id 
                      ? 'border-b-2 border-blue-500 text-blue-500' 
                      : 'text-gray-500'
                  }`}
                >
                  {mode.icon}
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>
            
            {/* Color Picker UI based on selected mode */}
            <div className="mb-6">
              {pickerMode === 'wheel' && (
                <div className="flex justify-center">
                  <div className="relative w-56 h-56">
                    <motion.div 
                      ref={colorWheelRef}
                      className="w-full h-full rounded-full overflow-hidden cursor-pointer shadow-inner"
                      style={{
                        background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                      }}
                      onMouseDown={handleColorWheelInteraction}
                      whileHover={showEffects ? { boxShadow: `0 0 20px 5px ${currentColor}50` } : {}}
                    >
                      {/* Inner white circle */}
                      <div 
                        className="absolute rounded-full"
                        style={{
                          width: '50%',
                          height: '50%',
                          top: '25%',
                          left: '25%',
                          background: `radial-gradient(circle, 
                            rgb(${255 - saturation * 1.5}, ${255 - saturation * 1.5}, ${255 - saturation * 1.5}) 0%, 
                            rgba(255,255,255,0.8) 70%, 
                            rgba(255,255,255,0) 100%)`
                        }}
                      ></div>
                      
                      {/* Saturation/Lightness control */}
                      <div 
                        className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white cursor-pointer shadow-md z-10"
                        style={{
                          top: '50%',
                          left: '50%',
                          background: `radial-gradient(circle, ${currentColor}, ${currentColor})`
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setLightness(Math.min(100, Math.max(0, lightness + 5)));
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setSaturation(Math.min(100, Math.max(0, saturation - 5)));
                        }}
                      ></div>
                    </motion.div>
                    
                    {/* Hue indicator on color wheel */}
                    <div 
                      className="absolute w-4 h-4 rounded-full shadow-md z-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ 
                        top: '50%', 
                        left: '50%',
                        transform: `rotate(${hue}deg) translate(5.6rem, 0) rotate(-${hue}deg)`,
                        backgroundColor: `hsl(${hue}, 100%, 50%)`,
                        border: '2px solid white'
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              {pickerMode === 'gradient' && (
                <div className="flex justify-center">
                  <div 
                    ref={satLightBoxRef}
                    className="w-56 h-56 relative overflow-hidden rounded-lg cursor-pointer shadow-inner"
                    style={{
                      background: `linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
                    }}
                    onMouseDown={handleSatLightBoxInteraction}
                  >
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, #000, transparent)'
                      }}
                    ></div>
                    
                    {/* Indicator */}
                    <div 
                      className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        left: `${saturation}%`,
                        top: `${100 - lightness}%`,
                        backgroundColor: currentColor,
                        boxShadow: showEffects ? `0 0 10px 2px ${currentColor}` : '0 2px 5px rgba(0,0,0,0.3)'
                      }}
                    ></div>
                    
                    {/* Crosshair lines */}
                    {showEffects && (
                      <>
                        <motion.div 
                          className="absolute w-full h-px pointer-events-none"
                          style={{
                            top: `${100 - lightness}%`,
                            backgroundImage: `linear-gradient(to right, transparent, ${currentColor}, transparent)`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.5 }}
                        ></motion.div>
                        <motion.div 
                          className="absolute w-px h-full pointer-events-none"
                          style={{
                            left: `${saturation}%`,
                            backgroundImage: `linear-gradient(to bottom, transparent, ${currentColor}, transparent)`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.5 }}
                        ></motion.div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {pickerMode === 'sliders' && (
                <div className="space-y-4">
                  {/* Hue Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Hue</span>
                      <span>{hue}°</span>
                    </div>
                    <div className="relative h-6 rounded-md overflow-hidden">
                      <div 
                        className="absolute inset-0" 
                        style={{ 
                          background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                          borderRadius: '4px'
                        }}
                      ></div>
                      <input 
                        type="range" 
                        min="0" 
                        max="360" 
                        value={hue} 
                        onChange={(e) => setHue(parseInt(e.target.value))}
                        className="w-full h-full opacity-0 cursor-pointer"
                      />
                      {showEffects && (
                        <div 
                          className="absolute w-2 h-6 pointer-events-none"
                          style={{
                            left: `${(hue/360) * 100}%`,
                            marginLeft: '-4px',
                            backgroundColor: 'rgba(255,255,255,0.4)'
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Saturation Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Saturation</span>
                      <span>{saturation}%</span>
                    </div>
                    <div className="relative h-6 rounded-md overflow-hidden">
                      <div 
                        className="absolute inset-0" 
                        style={{ 
                          background: `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))`,
                          borderRadius: '4px'
                        }}
                      ></div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={saturation} 
                        onChange={(e) => setSaturation(parseInt(e.target.value))}
                        className="w-full h-full opacity-0 cursor-pointer"
                      />
                      {showEffects && (
                        <div 
                          className="absolute w-2 h-6 pointer-events-none"
                          style={{
                            left: `${saturation}%`,
                            marginLeft: '-4px',
                            backgroundColor: 'rgba(255,255,255,0.4)'
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Lightness Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Lightness</span>
                      <span>{lightness}%</span>
                    </div>
                    <div className="relative h-6 rounded-md overflow-hidden">
                      <div 
                        className="absolute inset-0" 
                        style={{ 
                          background: `linear-gradient(to right, #000000, hsl(${hue}, ${saturation}%, 50%), #ffffff)`,
                          borderRadius: '4px'
                        }}
                      ></div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={lightness} 
                        onChange={(e) => setLightness(parseInt(e.target.value))}
                        className="w-full h-full opacity-0 cursor-pointer"
                      />
                      {showEffects && (
                        <div 
                          className="absolute w-2 h-6 pointer-events-none"
                          style={{
                            left: `${lightness}%`,
                            marginLeft: '-4px',
                            backgroundColor: 'rgba(255,255,255,0.4)'
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <motion.div 
              className="grid grid-cols-4 gap-2 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateRandomColor}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg flex flex-col items-center justify-center"
                title="Generate random color"
              >
                <FiShuffle className="text-gray-700 mb-1" />
                <span className="text-xs text-gray-600">Random</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => generateHarmoniousColors('complementary')}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg flex flex-col items-center justify-center"
                title="Get complementary color"
              >
                <div className="w-5 h-5 rounded-full mb-1 flex items-center justify-center">
                  <div className="w-5 h-2.5 bg-black rounded-t-full"></div>
                  <div className="w-5 h-2.5 bg-white rounded-b-full"></div>
                </div>
                <span className="text-xs text-gray-600">Complement</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const l = Math.min(lightness + 20, 90);
                  setLightness(l);
                }}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg flex flex-col items-center justify-center"
                title="Lighten color"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect y="8" width="20" height="4" rx="2" fill="#D1D5DB"/>
                  <rect x="8" y="20" width="20" height="4" rx="2" transform="rotate(-90 8 20)" fill="#D1D5DB"/>
                </svg>
                <span className="text-xs text-gray-600">Lighten</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const l = Math.max(lightness - 20, 10);
                  setLightness(l);
                }}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg flex flex-col items-center justify-center"
                title="Darken color"
              >
                <svg width="20" height="4" viewBox="0 0 20 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="20" height="4" rx="2" fill="#D1D5DB"/>
                </svg>
                <span className="text-xs text-gray-600">Darken</span>
              </motion.button>
            </motion.div>
            
            {/* Color Palettes */}
            <div className="mb-6 overflow-hidden">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Palettes</h4>
              <motion.div 
                className="space-y-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {Object.entries(colorPalettes).map(([name, colors], paletteIndex) => (
                  <motion.div 
                    key={name} 
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * paletteIndex }}
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-16">{name}</span>
                    <div className="flex-1 flex">
                      {colors.map((color, index) => (
                        <motion.button
                          key={index}
                          className="flex-1 h-8 first:rounded-l-md last:rounded-r-md relative overflow-hidden"
                          style={{ backgroundColor: color }}
                          whileHover={{ 
                            scale: 1.1,
                            boxShadow: showEffects ? `0 0 15px 0 ${color}` : '0 4px 6px rgba(0,0,0,0.1)' 
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setCurrentColor(color);
                            const { h, s, l } = hexToHSL(color);
                            setHue(Math.round(h * 360));
                            setSaturation(Math.round(s * 100));
                            setLightness(Math.round(l * 100));
                          }}
                          title={color}
                        >
                          {showEffects && (
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0"
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 0.2 }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {recentColors.map((color, index) => (
                    <motion.button
                      key={index}
                      className="w-8 h-8 rounded-md"
                      style={{ 
                        backgroundColor: color, 
                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                      }}
                      whileHover={{ 
                        scale: 1.15,
                        boxShadow: showEffects ? `0 0 12px 0 ${color}` : '0 4px 6px rgba(0,0,0,0.1)' 
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setCurrentColor(color);
                        const { h, s, l } = hexToHSL(color);
                        setHue(Math.round(h * 360));
                        setSaturation(Math.round(s * 100));
                        setLightness(Math.round(l * 100));
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Apply Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={applyColor}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300"
              style={showEffects ? {
                backgroundImage: `linear-gradient(to right, ${currentColor}, hsl(${(hue + 60) % 360}deg, ${saturation}%, ${lightness}%))`,
                boxShadow: `0 4px 14px ${currentColor}80`
              } : {}}
            >
              <span className="drop-shadow-md">Apply This Color</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ColorPickerModal;