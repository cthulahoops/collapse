export class Superposition {
  constructor(contents) {
    this.contents = contents;
  }

  static fromItems(items) {
    let contents = BigInt(0);
    for (const item of items) {
      contents |= BigInt(1) << BigInt(item);
    }
    return new Superposition(contents);
  }

  entropy() {
    if (this._entropy) {
      return this._entropy;
    }
    let count = 0;
    let contents = this.contents;
    // console.log(contents)
    while (contents > BigInt(0)) {
      if (contents & BigInt(1)) {
        count += 1;
      }
      contents >>= BigInt(1);
    }
    this._entropy = count;
    return count;
  }

  displayColor(palette, tiles) {
    if (this._color) {
      return this._color;
    }
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < tiles.length; i++) {
      if (!this.has(i)) {
        continue;
      }
      const color = palette.getColor(tiles[i][4]);
      r += color.r;
      g += color.g;
      b += color.b;
      count += 1;
    }
    if (count === 0) {
      return;
    }
    this._color = `rgb(${r / count}, ${g / count}, ${b / count})`;
    return this._color;
  }

  intersection(allowed) {
    return new Superposition(this.contents & allowed.contents);
  }

  collapse() {
    if (this.contents === 0) {
      return;
    }
    const selected = Math.floor(this.entropy() * Math.random());
    let i = -1;
    let count = 0;
    while (count <= selected) {
      i += 1;
      if (this.contents & (BigInt(1) << BigInt(i))) {
        count += 1;
      }
    }

    return new Superposition(BigInt(1) << BigInt(i));
  }

  has(value) {
    return this.contents & (BigInt(1) << BigInt(value));
  }
}
