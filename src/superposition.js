export class Superposition {
  constructor (contents) {
    this.contents = contents
  }

  static fromItems (items) {
    let contents = BigInt(0)
    for (const item of items) {
      contents |= BigInt(1) << BigInt(item)
    }
    return new Superposition(contents)
  }

  entropy () {
    let count = 0
    let contents = this.contents
    // console.log(contents)
    while (contents > BigInt(0)) {
      if (contents & BigInt(1)) {
        count += 1
      }
      contents >>= BigInt(1)
    }
    return count
  }

  intersection (allowed) {
    return new Superposition(this.contents & allowed.contents)
  }

  collapse () {
    if (this.contents === 0) {
      return
    }
    const selected = Math.floor(this.entropy() * Math.random())
    let i = -1
    let count = 0
    while (count <= selected) {
      i += 1
      if (this.contents & BigInt(1) << BigInt(i)) {
        count += 1
      }
    }

    return new Superposition(BigInt(1) << BigInt(i))
  }

  has (value) {
    return this.contents & (BigInt(1) << BigInt(value))
  }
}
