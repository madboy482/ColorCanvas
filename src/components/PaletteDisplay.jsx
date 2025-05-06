import React from 'react';
import ColorSwatch from './ColorSwatch';

const PaletteDisplay = ({ palette }) => {
  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {palette.map((color, index) => (
        <ColorSwatch key={index} color={color} />
      ))}
    </div>
  );
};

export default PaletteDisplay;
