import React, { useState } from 'react';
import { isLightColor } from '../utils/colorUtils';

const ColorSwatch = ({ color }) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Determine if we should use dark or light text based on background color
  const textColor = isLightColor(color) ? '#000000' : '#ffffff';

  return (
    <div 
      className={`w-24 h-32 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 ${isHovered ? 'scale-105 shadow-xl' : ''}`} 
      style={{ backgroundColor: color }}
      onClick={copyToClipboard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full flex flex-col justify-between p-2">
        <div></div>
        <div 
          className={`text-center py-1 px-2 rounded transition-all duration-300 ${copied ? 'bg-opacity-80' : 'bg-opacity-0'}`}
          style={{ 
            backgroundColor: copied ? (isLightColor(color) ? '#222222' : '#ffffff') : 'transparent',
            color: copied ? (isLightColor(color) ? '#ffffff' : '#000000') : textColor
          }}
        >
          <p className="font-mono text-xs tracking-wider">
            {copied ? 'Copied!' : color.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorSwatch;
