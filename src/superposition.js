export class Superposition {
  constructor (values) {
    this.values = values
  }

  entropy () {
    return this.values.length
  }

  intersection (allowed) {
    return new Superposition(this.values.filter((x) => allowed.has(x)))
  }

  collapse () {
    return new Superposition([choice(this.values)])
  }
}

function choice (items) {
  const idx = Math.floor(items.length * Math.random())
  return items[idx]
}
