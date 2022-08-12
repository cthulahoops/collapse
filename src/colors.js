const COLORS = {
  Y: { r: 255, g: 255, b: 0 },
  G: { r: 0, g: 255, b: 0 },
  B: { r: 0, g: 0, b: 255 },
  R: { r: 255, g: 0, b: 0 },
  K: { r: 0, g: 0, b: 0 },
  C: { r: 0, g: 255, b: 255 },
  7: { r: 128, g: 128, b: 128 },
  W: { r: 255, g: 255, b: 255 },
  P: { r: 155, g: 89, b: 208 }
}

export function listColorCodes () {
  return Object.keys(COLORS)
}

export function getColor (colorCode) {
  const color = COLORS[colorCode]
  if (!color) { return { r: 240, g: 240, b: 240 } }
  return color
}

export function getColorString (colorCode) {
  const color = getColor(colorCode)
  return `rgb(${color.r}, ${color.g}, ${color.b})`
}
