import { Palette } from "./palette.js";

const palette = new Palette();

export function listColorCodes() {
  return palette.listColorCodes();
}

export function getColor(colorCode) {
  return palette.getColor(colorCode);
}

export function getColorString(colorCode) {
  return palette.getColorString(colorCode);
}

export { palette };
