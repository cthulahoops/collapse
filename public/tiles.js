export function extractTiles(sample, rotate, flip) {
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

function rotateAll(tiles) {
  let r = tiles;
  for (let i = 0; i < 3; i++) {
    r = r.map(rotate);
    tiles = tiles.concat(r);
  }
  return tiles;
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

function uniq(list) {
  return Array.from(new Set(list));
}
