const gridSize = 10

function main () {
  const tiles = extractTiles()
  displayTiles(tiles)
  const rules = buildRules(tiles)

  const canvas = document.getElementById('output')
  canvas.width = 900
  canvas.height = 900

  const context = canvas.getContext('2d')

  const wave = []
  for (let i = 0; i < gridSize * gridSize; i++) {
    wave[i] = new Superposition(tiles)
  }

  //  setInterval(() => {
  for (let i = 0; i < 100; i++) {
    const selected = selectAndCollapse(wave)
    if (selected < 0) {
      return
    }

    propagate(selected, wave, rules)
    display(context, wave, tiles)
  }
  // }, 1000)
}

const SAMPLE = [
  ' A  ',
  ' A  ',
  ' A  ',
  ' A  '
]

function extractTiles () {
  const tiles = []
  for (let i = 0; i < SAMPLE.length; i++) {
    for (let j = 0; j < SAMPLE[0].length; j++) {
      const pixels = []
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const value = SAMPLE[(i + y) % SAMPLE.length][(j + x) % SAMPLE[0].length]
          pixels.push(value)
        }
      }
      tiles.push(pixels.join(''))
    }
  }
  return Array.from(new Set(tiles))
}

function displayTiles (tiles) {
  const canvas = document.getElementById('tiles')
  canvas.width = 400
  canvas.height = 400
  const context = canvas.getContext('2d')
  for (let i = 0; i < tiles.length; i++) {
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const value = tiles[i][y * 3 + x]
        if (value === 'A') {
          context.fillStyle = 'black'
        } else {
          context.fillStyle = '#ccccff'
        }
        context.fillRect(i * 40 + 10 * x, 10 * y, 9, 9)
      }
    }
  }
}

const Up = 'Up'
const Down = 'Down'
const Left = 'Left'
const Right = 'Right'

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

function buildRules (tiles) {
  const rules = []
  for (let i = 0; i < tiles.length; i++) {
    rules.push(new Map())
    for (const direction of [Up, Down, Left, Right]) {
      const allowed = new Set()
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

class Superposition {
  constructor (tiles) {
    this.values = []
    for (let i = 0; i < tiles.length; i++) {
      this.values.push(i)
    }
  }

  entropy () {
    return this.values.length
  }

  intersection (allowed) {
    this.values = this.values.filter((x) => allowed.has(x))
  }

  collapse () {
    this.values = [choice(this.values)]
  }
}

function displayColor (poss, tiles) {
  let r = 0
  let g = 0
  let b = 0
  for (const item of poss.values) {
    if (tiles[item][0] === 'A') {
      r += 255
      g += 255
      b += 255
    }
  }
  r /= poss.values.length
  g /= poss.values.length
  b /= poss.values.length
  return `rgb(${r}, ${g}, ${b})`
}

function display (context, wave, tiles) {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      context.fillStyle = displayColor(wave[i * gridSize + j], tiles)
      context.fillRect(i * 30, j * 30, 29, 29)
    }
  }
}

function selectAndCollapse (wave) {
  let bestScore = 500
  let bestCandidates = []
  for (let idx = 0; idx < wave.length; idx++) {
    const possibilities = wave[idx]
    const score = possibilities.entropy()
    if (score === 0) {
      continue
    }
    if (score === 1) {
      continue
    } else if (score === bestScore) {
      bestCandidates.push(idx)
    } else if (score < bestScore) {
      bestCandidates = [idx]
      bestScore = possibilities.entropy()
    }
  }
  if (bestScore === 500) {
    return -1
  }

  const selected = choice(bestCandidates)

  wave[selected].collapse()
  return selected
}

function propagate (selected, wave, rules) {
  const changed = [selected]

  let count = 0
  while (changed.length > 0 && count < 30) {
    count++
    const selected = changed.pop()
    // console.log('Changed: ', selected)
    const values = wave[selected].values

    for (const direction of [Up, Down, Left, Right]) {
      // Accumulate set of allowed neighbours in this direction
      const allowed = new Set()
      for (const tile1 of values) {
        for (const tile2 of rules[tile1].get(direction)) {
          allowed.add(tile2)
        }
      }

      if (allowed.length === 0) {
        console.log('OH NO! ABORTING')
        return
      }

      const neighbour = getNeighbour(selected, direction)
      const possibilities = wave[neighbour]
      const oldEntropy = possibilities.entropy()
      possibilities.intersection(allowed)
      if (possibilities.entropy() !== oldEntropy) {
        // console.log(neighbour, ' -> ', possibilities)
        changed.push(neighbour)
      }
    }
  }
}

function getNeighbour (index, direction) {
  const [i, j] = fromIndex(index)

  if (direction === Up) {
    return toIndex((gridSize + i - 1) % gridSize, j)
  } else if (direction === Down) {
    return toIndex((i + 1) % gridSize, j)
  } else if (direction === Left) {
    return toIndex(i, (gridSize + j - 1) % gridSize)
  } else if (direction === Right) {
    return toIndex(i, (j + 1) % gridSize)
  }
}

function neighbours (idx) {
  const [i, j] = fromIndex(idx)

  const result = []
  if (i > 0) {
    result.push(toIndex(i - 1, j))
  }
  if (i < gridSize - 1) {
    result.push(toIndex(i + 1, j))
  }
  if (j > 0) {
    result.push(toIndex(i, j - 1))
  }
  if (j < gridSize - 1) {
    result.push(toIndex(i, j + 1))
  }

  return result
}

function toIndex (x, y) {
  return x * gridSize + y
}

function fromIndex (index) {
  const x = Math.floor(index / gridSize)
  const y = index % gridSize
  return [x, y]
}

function choice (items) {
  const idx = Math.floor(items.length * Math.random())
  return items[idx]
}

main()
