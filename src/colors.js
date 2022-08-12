const COLORS = {
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
  p: { r: 255, g: 192, b: 203 }
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
