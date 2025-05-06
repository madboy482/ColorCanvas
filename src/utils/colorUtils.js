// Convert hex to HSL for better color manipulation
function hexToHSL(hex) {
  // Convert hex to RGB first
  let r = parseInt(hex.substring(1, 3), 16) / 255;
  let g = parseInt(hex.substring(3, 5), 16) / 255;
  let b = parseInt(hex.substring(5, 7), 16) / 255;
  
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return { h, s, l };
}

// Convert HSL to hex
function hslToHex(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export const generatePalette = (baseColors) => {
  const palette = [];
  
  // For each base color, generate a range of related colors
  baseColors.forEach(color => {
    // Add the original color
    palette.push(color);
    
    // Convert to HSL for better manipulation
    const { h, s, l } = hexToHSL(color);
    
    // 1. Add analogous colors (adjacent on color wheel)
    palette.push(hslToHex((h + 0.03) % 1, s, l)); // +11° on color wheel
    palette.push(hslToHex((h - 0.03) % 1, s, l)); // -11° on color wheel
    
    // 2. Add a shade (darker)
    palette.push(hslToHex(h, s, Math.max(0, l - 0.15)));
    
    // 3. Add a tint (lighter)
    palette.push(hslToHex(h, s, Math.min(0.95, l + 0.15)));
    
    // 4. Add a desaturated version
    palette.push(hslToHex(h, Math.max(0, s - 0.3), l));
    
    // 5. Add complementary color (opposite on the color wheel)
    palette.push(hslToHex((h + 0.5) % 1, s, l));
  });
  
  // Filter out duplicate colors (can happen with certain base colors)
  return [...new Set(palette)];
};

// For backwards compatibility
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
  const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
  const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

  return "#" + RR + GG + BB;
}

// Generate random colors
export const generateRandomColors = (count = 3) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let j = 0; j < 6; j++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    colors.push(color);
  }
  return colors;
};

// Helper to check if a color is light or dark
export const isLightColor = (color) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate perceived brightness using the formula from W3C
  // https://www.w3.org/TR/AERT/#color-contrast
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128;
};
