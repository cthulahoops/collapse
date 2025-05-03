import {
  addPondiverseButton,
  fetchPondiverseCreation,
} from "https://www.pondiverse.com/pondiverse.js";

import { Superposition } from "./superposition.js";
import {
  combineAllowed,
  buildRules,
  Up,
  Down,
  Left,
  Right,
} from "./allowed.js";
import { Palette } from "./palette.js";
import { PixelEditor } from "./editor.js";

window.Superposition = Superposition;

const gridSize = 60;

function main() {
  const urlParams = new URLSearchParams(window.location.search);
  const creationId = urlParams.get("creation");

  const palette = new Palette();
  const pixels = new PixelEditor({ palette });

  if (creationId) {
    fetchPondiverseCreation(creationId).then((result) => {
      const { data } = result;
      const { editor, rotate, flip, palette: paletteData } = JSON.parse(data);

      if (paletteData) {
        palette.setState(paletteData);
        pixels.setupColorPicker();
      }
      pixels.setState(editor);

      document.getElementById("rotate").checked = !!rotate;
      document.getElementById("flip").checked = !!flip;
    });
  }

  const canvas = document.getElementById("output");
  canvas.width = 900;
  canvas.height = 900;
  const context = canvas.getContext("2d");

  let world = createWorld(pixels, true, true);
  displayTiles(world.tiles, palette);

  setInterval(() => {
    const selected = selectAndCollapse(world.wave);
    if (selected < 0) {
      return;
    }
    displayOutput(context, world.wave, world.tiles, palette);
    propagate(selected, world.wave, world.rules);
    displayOutput(context, world.wave, world.tiles, palette);
  }, 100);

  const button = document.getElementById("generate");
  button.addEventListener("click", () => {
    console.log("Generate!");
    const rotate = document.getElementById("rotate").checked;
    const flip = document.getElementById("flip").checked;
    world = createWorld(pixels.lines(), rotate, flip);
    displayTiles(world.tiles, palette);
  });

  addPondiverseButton(() => {
    return {
      type: "collapse",
      data: JSON.stringify({
        editor: pixels.toPixelString(),
        palette: pixels.palette.toJSON(),
        rotate: document.getElementById("rotate").checked,
        flip: document.getElementById("flip").checked,
      }),
      image: getScreenshot(),
    };
  });
}

function getScreenshot() {
  const canvas = document.getElementById("output");
  return canvas.toDataURL("image/png");
}

function createWorld(sample, rotate, flip) {
  const tiles = extractTiles(sample, rotate, flip);
  const rules = buildRules(tiles);

  const ids = [];
  for (let i = 0; i < tiles.length; i++) {
    ids.push(i);
  }
  const superposition = Superposition.fromItems(ids);

  const wave = [];
  for (let i = 0; i < gridSize * gridSize; i++) {
    wave[i] = superposition;
  }
  return { tiles, rules, wave };
}

function uniq(list) {
  return Array.from(new Set(list));
}

function flipHorizonally(tile) {
  const result = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result.push(tile[3 * i + (2 - j)]);
    }
  }
  return result.join("");
}

function flipVertically(tile) {
  const result = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result.push(tile[3 * (2 - i) + j]);
    }
  }
  return result.join("");
}

function rotate(tile) {
  const result = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result.push(tile[3 * j + (2 - i)]);
    }
  }
  return result.join("");
}

function rotateAll(tiles) {
  let r = tiles;
  for (let i = 0; i < 3; i++) {
    r = r.map(rotate);
    tiles = tiles.concat(r);
  }
  return tiles;
}

function extractTiles(sample, rotate, flip) {
  let tiles = [];
  for (let i = 0; i < sample.length; i++) {
    for (let j = 0; j < sample[0].length; j++) {
      const pixels = [];
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const value =
            sample[(i + y) % sample.length][(j + x) % sample[0].length];
          pixels.push(value);
        }
      }
      tiles.push(pixels.join(""));
    }
  }

  if (rotate) {
    tiles = rotateAll(tiles);
  }
  if (flip) {
    tiles = tiles.concat(tiles.map(flipHorizonally));
  }
  return uniq(tiles);
}

export function displayTiles(tiles, palette) {
  const container = document.getElementById("tiles");
  container.innerHTML = "";
  for (let i = 0; i < tiles.length; i++) {
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    displayTile(canvas, tiles[i], palette);
  }
}
function displayTile(canvas, tile, palette) {
  canvas.width = 30;
  canvas.height = 30;

  const context = canvas.getContext("2d");
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      context.fillStyle = palette.getColorString(tile[3 * i + j]);
      context.fillRect(10 * j, 10 * i, 9, 9);
    }
  }
}

function displayOutput(context, wave, tiles, palette) {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      context.fillStyle = wave[i * gridSize + j].displayColor(palette, tiles);
      // if (wave[i * gridSize + j].entropy() === 1) {
      //   context.strokeStyle = 'blue'
      //   context.strokeRect(j * 30, i * 30, 29, 29)
      // }
      context.fillRect(j * 15, i * 15, 14, 14);
    }
  }
}

function selectAndCollapse(wave) {
  let bestScore = 500;
  let best;
  for (let idx = 0; idx < wave.length; idx++) {
    const possibilities = wave[idx];
    const score = possibilities.entropy() + Math.random();
    if (score < 2) {
      continue;
    } else if (score + Math.random() < bestScore) {
      best = idx;
      bestScore = score;
    }
  }
  if (bestScore === 500) {
    return -1;
  }

  wave[best] = wave[best].collapse();
  return best;
}

function propagate(selected, wave, rules) {
  const changed = [selected];
  let count = 0;
  while (changed.length > 0) {
    count += 1;
    const selected = changed.pop();

    for (const direction of [Up, Down, Left, Right]) {
      // Accumulate set of allowed neighbours in this direction
      const allowed = combineAllowed(rules, wave[selected], direction);

      if (allowed.length === 0) {
        console.log("OH NO! ABORTING");
        return;
      }

      const neighbour = getNeighbour(selected, direction);
      const possibilities = wave[neighbour];
      const newPossibilities = possibilities.intersection(allowed);
      if (newPossibilities.contents !== possibilities.contents) {
        wave[neighbour] = newPossibilities;
        changed.push(neighbour);
      }
    }
  }
}

function getNeighbour(index, direction) {
  const [i, j] = fromIndex(index);

  if (direction === Up) {
    return toIndex((gridSize + i - 1) % gridSize, j);
  } else if (direction === Down) {
    return toIndex((i + 1) % gridSize, j);
  } else if (direction === Left) {
    return toIndex(i, (gridSize + j - 1) % gridSize);
  } else if (direction === Right) {
    return toIndex(i, (j + 1) % gridSize);
  }
}

function toIndex(x, y) {
  return x * gridSize + y;
}

function fromIndex(index) {
  const x = Math.floor(index / gridSize);
  const y = index % gridSize;
  return [x, y];
}

main();
