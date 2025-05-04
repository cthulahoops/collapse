const DEFAULT_COLORS = {
  O: { r: 255, g: 140, b: 0 },
  M: { r: 255, g: 0, b: 255 },
  Y: { r: 255, g: 255, b: 0 },
  G: { r: 0, g: 255, b: 0 },
  g: { r: 34, g: 139, b: 34 },
  B: { r: 0, g: 0, b: 255 },
  R: { r: 255, g: 0, b: 0 },
  K: { r: 0, g: 0, b: 0 },
  C: { r: 0, g: 255, b: 255 },
  7: { r: 128, g: 128, b: 128 },
  W: { r: 255, g: 255, b: 255 },
  P: { r: 155, g: 89, b: 208 },
  b: { r: 205, g: 133, b: 63 },
  p: { r: 255, g: 192, b: 203 },
};

export class Palette {
  constructor(initialColors = DEFAULT_COLORS) {
    this._colors = { ...initialColors };
  }

  getColor(code) {
    return this._colors[code] || { r: 240, g: 240, b: 240 };
  }

  getColorString(code) {
    const { r, g, b } = this.getColor(code);
    return `rgb(${r}, ${g}, ${b})`;
  }

  getColorHex(code) {
    const { r, g, b } = this.getColor(code);
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }

  listColorCodes() {
    return Object.keys(this._colors);
  }

  setColor(code, rgb) {
    this._colors[code] = { ...rgb };
  }

  removeColor(code) {
    delete this._colors[code];
  }

  reset(colors = DEFAULT_COLORS) {
    this._colors = { ...colors };
  }

  toJSON() {
    const hexColors = {};
    Object.keys(this._colors).forEach((key) => {
      if (isRGBEqual(this._colors[key], DEFAULT_COLORS[key])) {
        return;
      }
      const hex = this.getColorHex(key);
      hexColors[key] = hex;
    });
    return hexColors;
  }

  setState(obj) {
    this.reset();
    if (!obj) {
      return;
    }
    Object.keys(obj).forEach((key) => {
      const color = obj[key];
      if (typeof color === "string") {
        this._colors[key] = hexToRgb(color);
      } else if (color) {
        this._colors[key] = color;
      }
    });
  }
}

function isRGBEqual(a, b) {
  return a.r === b.r && a.g === b.g && a.b === b.b;
}

function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length !== 6) return null;
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}
