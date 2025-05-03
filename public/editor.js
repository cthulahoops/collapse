import { Palette } from "./palette.js";

const EDITOR_SIZE = 12;

export class PixelEditor {
  constructor({
    canvasId = "editor",
    clearButtonId = "clear",
    colorPickerId = "color-picker",
    size = EDITOR_SIZE,
    palette = null,
  } = {}) {
    this.size = size;
    this.activeColor = "K";
    this.pixels = this.createGrid();
    this.palette = palette || new Palette();

    this.canvas = document.getElementById(canvasId);
    this.clearButton = document.getElementById(clearButtonId);
    this.picker = document.getElementById(colorPickerId);

    this.canvas.height = this.canvas.width;

    this.display();

    this.clickTimer = null;
    this.canvas.addEventListener("click", (e) => this.handleClick(e));
    this.canvas.addEventListener("dblclick", (e) => this.handleDoubleClick(e));

    this.canvas.addEventListener("contextmenu", (e) =>
      this.handleRightClick(e),
    );
    this.clearButton.addEventListener("click", () => this.clear());
    this.setupColorPicker();
  }

  handleClick(event) {
    const [i, j] = this.getCellFromEvent(event);

    const [lastI, lastJ, lastColor] = this.lastCell || [];
    if (lastI !== i || lastJ !== j) {
      this.lastCell = [i, j, this.pixels[i][j]];
    }

    this.pixels[i][j] = this.activeColor;
    this.display();

    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
    }

    this.clickTimer = setTimeout(() => {
      this.clickTimer = null;
      this.lastCell = null;
    }, 200);
  }

  handleDoubleClick(event) {
    const [i, j] = this.getCellFromEvent(event);

    if (!this.isValidCell(i, j)) return;

    const [lastI, lastJ, lastColor] = this.lastCell || [];

    let targetColor;
    if (i === lastI && j === lastJ) {
      targetColor = lastColor;
    } else {
      targetColor = this.pixels[i][j];
    }

    if (targetColor === this.activeColor) return;
    this.pixels[i][j] = targetColor;
    this.floodFill(i, j, targetColor, this.activeColor);
    this.display();
  }

  handleRightClick(event) {
    const [i, j] = this.getCellFromEvent(event);
    if (!this.isValidCell(i, j)) return;
    this.pixels[i][j] = " ";
    this.display();
    event.preventDefault();
  }

  floodFill(i, j, targetColor, replacementColor) {
    if (targetColor === replacementColor) return;
    const stack = [[i, j]];
    while (stack.length) {
      const [x, y] = stack.pop();
      const modX = mod(x, this.size);
      const modY = mod(y, this.size);
      if (this.pixels[modX][modY] !== targetColor) {
        continue;
      }
      this.pixels[modX][y] = replacementColor;
      stack.push([modX + 1, modY]);
      stack.push([modX - 1, modY]);
      stack.push([modX, modY + 1]);
      stack.push([modX, modY - 1]);
    }
  }

  getCellFromEvent(event) {
    const rect = this.canvas.getBoundingClientRect();

    // Scale mouse coordinates to canvas coordinates
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const cellSize = this.canvas.width / this.size;
    const j = Math.floor(x / cellSize);
    const i = Math.floor(y / cellSize);

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
    if (!this.colorInput) {
      this.colorInput = document.createElement("input");
      this.colorInput.type = "color";
      this.colorInput.style.display = "none";
      document.body.appendChild(this.colorInput);
    }
    this.picker.style.backgroundColor = this.palette.getColorString(
      this.activeColor,
    );
    for (const color of this.palette.listColorCodes()) {
      const button = document.createElement("button");
      button.innerText = color;
      button.style.backgroundColor = this.palette.getColorString(color);
      button.addEventListener("click", () => {
        this.activeColor = color;
        this.picker.style.backgroundColor = this.palette.getColorString(color);
      });

      button.addEventListener("dblclick", () => {
        const rgb = this.palette.getColor(color);
        this.colorInput.value = rgbToHex(rgb);

        this.colorInput.onchange = () => {
          const newRgb = hexToRgb(this.colorInput.value);
          if (newRgb) {
            this.palette.setColor(color, newRgb);
            this.setupColorPicker();
            this.display();
          }
        };

        this.colorInput.click();
      });
      this.picker.appendChild(button);
    }
  }

  display() {
    const ctx = this.canvas.getContext("2d");
    const cellSize = this.canvas.width / this.size;
    console.log(cellSize);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        ctx.fillStyle = this.palette.getColorString(this.pixels[i][j]);
        ctx.fillRect(j * cellSize, i * cellSize, cellSize - 1, cellSize - 1);
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

function mod(x, n) {
  return ((x % n) + n) % n;
}

function rgbToHex({ r, g, b }) {
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
