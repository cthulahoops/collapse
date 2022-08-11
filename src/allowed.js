
export const Up = 'Up'
export const Down = 'Down'
export const Left = 'Left'
export const Right = 'Right'

class Allowed {
  constructor () {
    this.contents = BigInt(0)
  }

  add (value) {
    this.contents |= BigInt(1) << BigInt(value)
  }

  has (value) {
    return this.contents & BigInt(1) << BigInt(value)
  }

  union (other) {
    this.contents |= other.contents
  }
}

export function buildRules (tiles) {
  const rules = []
  for (let i = 0; i < tiles.length; i++) {
    rules.push(new Map())
    for (const direction of [Up, Down, Left, Right]) {
      const allowed = new Allowed()
      rules[i].set(direction, allowed)

      for (let j = 0; j < tiles.length; j++) {
        if (allowedAdjacent(tiles[i], tiles[j], direction)) {
          allowed.add(j)
        }
      }
    }
  }

  return rules
}

export function combineAllowed (rules, tiles, direction) {
  const allowed = new Allowed()
  for (let i = 0; i < rules.length; i++) {
    if (tiles.has(i)) {
      allowed.union(rules[i].get(direction))
    }
  }
  return allowed
}

function allowedAdjacent (tile1, tile2, direction) {
  if (direction === Right) {
    let result = true
    for (let i = 0; i < 3; i++) {
      result &&= tile1[3 * i + 1] === tile2[3 * i] && tile1[3 * i + 2] === tile2[3 * i + 1]
    }
    return result
  } else if (direction === Left) {
    return allowedAdjacent(tile2, tile1, Right)
  } else
  if (direction === Down) {
    let result = true
    for (let i = 0; i < 3; i++) {
      result &&= tile1[3 + i] === tile2[0 + i] && tile1[6 + i] === tile2[3 + i]
    }
    return result
  } else if (direction === Up) {
    return allowedAdjacent(tile2, tile1, Down)
  }
}
