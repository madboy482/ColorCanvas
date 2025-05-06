import React from 'react';

const ColorInput = ({ baseColors, setBaseColors }) => {
  const handleChange = (index, value) => {
    const updatedColors = [...baseColors];
    updatedColors[index] = value;
    setBaseColors(updatedColors);
  };

  return (
    <div className="space-y-2">
      {baseColors.map((color, index) => (
        <input
          key={index}
          type="color"
          value={color}
          onChange={(e) => handleChange(index, e.target.value)}
          className="w-12 h-12 p-1 rounded"
        />
      ))}
    </div>
  );
};

export default ColorInput;
