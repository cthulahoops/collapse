import { getColorString, listColorCodes } from "./colors.js";

const EDITOR_SIZE = 12;

export class PixelEditor {
  constructor({
    canvasId = "editor",
    clearButtonId = "clear",
    colorPickerId = "color-picker",
    size = EDITOR_SIZE,
    cellSize = 30,
  } = {}) {
    this.size = size;
    this.cellSize = cellSize;
    this.activeColor = "K";
    this.pixels = this.createGrid();

    this.canvas = document.getElementById(canvasId);
    this.clearButton = document.getElementById(clearButtonId);
    this.picker = document.getElementById(colorPickerId);

    this.canvas.width = this.size * this.cellSize + 1;
    this.canvas.height = this.size * this.cellSize + 1;

    this.display();

    this.canvas.addEventListener("click", (e) => this.handleClick(e));
    this.canvas.addEventListener("contextmenu", (e) =>
      this.handleRightClick(e),
    );
    this.clearButton.addEventListener("click", () => this.clear());
    this.setupColorPicker();
  }

  handleClick(event) {
    const [i, j] = this.getCellFromEvent(event);
    if (!this.isValidCell(i, j)) return;
    this.pixels[i][j] = this.activeColor;
    this.display();
  }

  handleRightClick(event) {
    const [i, j] = this.getCellFromEvent(event);
    if (!this.isValidCell(i, j)) return;
    this.pixels[i][j] = " ";
    this.display();
    event.preventDefault();
  }

  getCellFromEvent(event) {
    const rect = this.canvas.getBoundingClientRect();
    const j = Math.floor((event.clientX - rect.left) / this.cellSize);
    const i = Math.floor((event.clientY - rect.top) / this.cellSize);
    return [i, j];
  }

  isValidCell(i, j) {
    return i >= 0 && j >= 0 && i < this.size && j < this.size;
  }

  clear() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.pixels[i][j] = " ";
      }
    }
    this.display();
  }

  setupColorPicker() {
    this.picker.innerHTML = "";
    this.picker.style.backgroundColor = getColorString(this.activeColor);
    for (const color of listColorCodes()) {
      const button = document.createElement("button");
      button.innerText = color;
      button.style.backgroundColor = getColorString(color);
      button.addEventListener("click", () => {
        this.activeColor = color;
        this.picker.style.backgroundColor = getColorString(color);
      });
      this.picker.appendChild(button);
    }
  }

  display() {
    const ctx = this.canvas.getContext("2d");
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        ctx.fillStyle = getColorString(this.pixels[i][j]);
        ctx.fillRect(
          j * this.cellSize,
          i * this.cellSize,
          this.cellSize - 1,
          this.cellSize - 1,
        );
      }
    }
  }

  createGrid() {
    return Array.from({ length: this.size }, () => Array(this.size).fill(" "));
  }

  setState(pixelString) {
    const lines = pixelString.split("\n");
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.pixels[i][j] = lines[i]?.[j] || " ";
      }
    }
    this.display();
  }

  toPixelString() {
    return this.pixels.map((row) => row.join("")).join("\n");
  }

  lines() {
    return this.pixels.map((row) => row.join(""));
  }
}
