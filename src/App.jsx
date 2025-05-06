import React, { useState } from 'react';
import ColorInput from './components/ColorInput';
import PaletteDisplay from './components/PaletteDisplay';
import { generatePalette } from './utils/colorUtils';

function App() {
  const [baseColors, setBaseColors] = useState(['#ff0000', '#00ff00', '#0000ff']);
  const palette = generatePalette(baseColors);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4 text-center">🎨 Color Palette Generator</h1>
      <div className="flex flex-col items-center space-y-4">
        <ColorInput baseColors={baseColors} setBaseColors={setBaseColors} />
        <PaletteDisplay palette={palette} />
      </div>
    </div>
  );
}

export default App;
