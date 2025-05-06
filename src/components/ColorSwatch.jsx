import React from 'react';

const ColorSwatch = ({ color }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(color);
    alert(`Copied ${color} to clipboard!`);
  };

  return (
    <div className="w-24 h-24 rounded shadow cursor-pointer" style={{ backgroundColor: color }} onClick={copyToClipboard}>
      <p className="text-center text-xs mt-2">{color}</p>
    </div>
  );
};

export default ColorSwatch;
