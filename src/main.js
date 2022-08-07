const gridSize = 30

function main () {
  const tiles = extractTiles()
  const rules = buildRules(tiles)

  displayTiles(tiles)

  const canvas = document.getElementById('output')
  canvas.width = 900
  canvas.height = 900

  const context = canvas.getContext('2d')

  const wave = []
  for (let i = 0; i < gridSize * gridSize; i++) {
    wave[i] = new Superposition(tiles)
  }

  setInterval(() => {
  // for (let i = 0; i < 14; i++) {
    const selected = selectAndCollapse(wave)
    if (selected < 0) {
      return
    }

    propagate(selected, wave, rules)
    display(context, wave, tiles)
  // }
  }, 10)
  // canvas.addEventListener('mousemove', (event) => {
  //   const j = Math.floor((event.clientX - canvas.offsetLeft) / 30)
  //   const i = Math.floor((event.clientY - canvas.offsetTop + window.pageYOffset) / 30)
  //   if (i > gridSize || j > gridSize) {
  //     return
  //   }
  //   displaySuperposition(wave[toIndex(i, j)], tiles)
  // })
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

const SAMPLE = [
  'BBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBYYYYYYYBBBBBBBBB',
  'BBBBBBYGGYGGGYBBBBBBBB',
  'BBBBBYGGGGGGGGYBBBBBBB',
  'BBBYYYGGGGGGGGYBBBBBBB',
  'BBBYGGGG777GGGYBBBBBBB',
  'BBBYGGG77W77GGYBBBBBBB',
  'BBBYGG77W77GGGYBBBBBBB',
  'BBBYGGG777GGGGYBBBBBBB',
  'BBBYGGGGGGGGGGYBBBBBBB',
  'BBBYGGGGGYYGYYYBBBBBBB',
  'BBBBYGYYYBYGYBBBBBBBBB',
  'BBBBBYBBBBYYBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBB'
]

// const SAMPLE = [
//   'KKKK KKKKKKKKKK KKKKKK',
//   'KKKK KKKKKKKKKK KKKKKK',
//   'KKKK    KKKK       KKK',
//   '              BB      ',
//   'KKK     KKKK  BB   KKK',
//   'KKK     KKKK  BB   KKK',
//   'KKKK KKKKKKK       KKK',
//   'KKKK KKKYRKKKKK KKKKKK',
//   'KKKK KKKYKKKKKK KKKKKK'
// ]

function uniq (list) {
  return Array.from(new Set(list))
}

function flipHorizonally (tile) {
  const result = []
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result.push(tile[3 * i + (2 - j)])
    }
  }
  return result.join('')
}

function flipVertically (tile) {
  const result = []
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result.push(tile[3 * (2 - i) + j])
    }
  }
  return result.join('')
}

function rotate (tile) {
  const result = []
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result.push(tile[3 * j + i])
    }
  }
  return result.join('')
}

function rotateAndReflect (tiles) {
  tiles = tiles.concat(tiles.map(flipHorizonally))
  tiles = tiles.concat(tiles.map(flipVertically))
  tiles = tiles.concat(tiles.map(rotate))
  return tiles
}

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

  return uniq(rotateAndReflect(tiles))
}

function displayTile (context, x, y, tile) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const value = tile[3 * i + j]
      const color = COLORS[value]
      if (color) {
        context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
      } else {
        context.fillStyle = '#ccccff'
      }
      context.fillRect(x + 10 * j, y + 10 * i, 9, 9)
    }
  }
}

export function displayTiles (tiles) {
  const canvas = document.getElementById('tiles')
  canvas.width = 400
  canvas.height = 1000
  const context = canvas.getContext('2d')
  console.log('There are: ', tiles.length)
  for (let i = 0; i < tiles.length; i++) {
    displayTile(context, 40 * (i % 10), 40 * Math.floor(i / 10), tiles[i])
  }
}

function displayRules (rules, tiles) {
  const canvas = document.getElementById('tiles')
  canvas.width = 400
  canvas.height = 700
  const context = canvas.getContext('2d')
  let y = 0
  for (let i = 0; i < rules.length; i++) {
    for (const direction of [Up, Down, Left, Right]) {
      displayTile(context, 0, y, tiles[i])
      let x = 60
      for (const t2 of rules[i].get(direction)) {
        displayTile(context, x, y, tiles[t2])
        x += 40
      }
      y += 40
    }
  }
}

function displaySuperposition (sp, tiles) {
  const canvas = document.getElementById('super')
  canvas.width = 400
  canvas.height = 700
  const context = canvas.getContext('2d')
  for (let i = 0; i < sp.values.length; i++) {
    displayTile(context, 40 * i, 0, tiles[sp.values[i]])
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
  if (poss.values.length === 0) {
    return 'red'
  }
  for (const item of poss.values) {
    const color = COLORS[tiles[item][4]]
    if (color) {
      r += color.r
      g += color.g
      b += color.b
    } else {
      r += 200
      g += 200
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
      if (wave[i * gridSize + j].values.length === 1) {
        context.strokeStyle = 'blue'
        context.strokeRect(j * 30, i * 30, 29, 29)
      }
      context.fillRect(j * 30, i * 30, 29, 29)
    }
  }
}

function selectAndCollapse (wave) {
  let bestScore = 500
  let best
  for (let idx = 0; idx < wave.length; idx++) {
    const possibilities = wave[idx]
    const score = possibilities.entropy() + Math.random()
    if (score < 2) {
      continue
    } else if (score + Math.random() < bestScore) {
      best = idx
      bestScore = score
    }
  }
  if (bestScore === 500) {
    return -1
  }

  wave[best].collapse()
  return best
}

function propagate (selected, wave, rules) {
  const changed = [selected]

  while (changed.length > 0) {
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

window.getNeighbour = getNeighbour

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
