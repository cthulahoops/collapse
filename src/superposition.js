export class Superposition {
  constructor (values) {
    this.values = values
  }

  entropy () {
    return this.values.length
  }

  intersection (allowed) {
    this.values = this.values.filter((x) => allowed.has(x))
  }

  collapse () {
    return new Superposition([choice(this.values)])
  }
}

export class SuperpositionAll {
  constructor (tiles) {
    this.count = tiles.length
  }

  entropy () {
    return this.count
  }

  color (tiles) {
    return '#aaaaaa'
  }

  intersection (other) {
    return new Superposition(other.values)
  }

  collapse () {
    return new Superposition(new Set([Math.floor(Math.random() * this.count)]))
  }
}

function choice (items) {
  const idx = Math.floor(items.length * Math.random())
  return items[idx]
}

function getColor (value) {
  const color = COLORS[value]
  if (color) {
    return `rgb(${color.r}, ${color.g}, ${color.b})`
  }
  return '#ccccff'
}

const COLORS = {
  Y: { r: 255, g: 255, b: 0 },
  G: { r: 0, g: 255, b: 0 },
  B: { r: 0, g: 0, b: 255 },
  R: { r: 255, g: 0, b: 0 },
  K: { r: 0, g: 0, b: 0 },
  C: { r: 0, g: 255, b: 255 },
  7: { r: 128, g: 128, b: 128 },
  W: { r: 255, g: 255, b: 255 }
}
