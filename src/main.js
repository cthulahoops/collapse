import { Superposition } from './superposition.js'
import { combineAllowed, buildRules, Up, Down, Left, Right } from './allowed.js'
import { createEditor } from './editor.js'
import { COLORS } from './colors.js'

window.Superposition = Superposition

const gridSize = 30

function main () {
  const canvas = document.getElementById('output')
  canvas.width = 900
  canvas.height = 900
  const context = canvas.getContext('2d')

  let world = createWorld(SAMPLE)
  displayTiles(world.tiles)

  setInterval(() => {
  // for (let i = 0; i < 14; i++) {
    const selected = selectAndCollapse(world.wave)
    if (selected < 0) {
      return
    }

    propagate(selected, world.wave, world.rules)
    display(context, world.wave, world.tiles)
  // }
  }, 100)

  const pixels = createEditor()
  const button = document.getElementById('generate')
  button.addEventListener('click', () => {
    console.log('Generate!')
    const sample = pixels.map((line) => line.join(''))
    world = createWorld(sample)
    displayTiles(world.tiles)
  })
}

function createWorld (sample) {
  const tiles = extractTiles(sample)
  const rules = buildRules(tiles)

  const ids = []
  for (let i = 0; i < tiles.length; i++) {
    ids.push(i)
  }
  const superposition = Superposition.fromItems(ids)

  const wave = []
  for (let i = 0; i < gridSize * gridSize; i++) {
    wave[i] = superposition
  }
  return { tiles, rules, wave }
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

function extractTiles (sample) {
  const tiles = []
  for (let i = 0; i < sample.length; i++) {
    for (let j = 0; j < sample[0].length; j++) {
      const pixels = []
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const value = sample[(i + y) % sample.length][(j + x) % sample[0].length]
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
  console.log('There are: ', tiles.length)

  const tilesPerRow = Math.floor(Math.sqrt(tiles.length))
  const canvas = document.getElementById('tiles')
  canvas.width = 40 * tilesPerRow
  canvas.height = 40 * (tilesPerRow + 1)
  const context = canvas.getContext('2d')
  for (let i = 0; i < tiles.length; i++) {
    displayTile(context, 40 * (i % tilesPerRow), 40 * Math.floor(i / tilesPerRow), tiles[i])
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

function displayColor (poss, tiles) {
  let r = 0
  let g = 0
  let b = 0
  let count = 0
  for (let i = 0; i < tiles.length; i++) {
    if (!poss.has(i)) {
      continue
    }
    const color = COLORS[tiles[i][4]]
    if (color) {
      r += color.r
      g += color.g
      b += color.b
    } else {
      r += 200
      g += 200
      b += 255
    }
    count += 1
  }
  if (count === 0) {
    return 'red'
  }
  return `rgb(${r / count}, ${g / count}, ${b / count})`
}

function display (context, wave, tiles) {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      context.fillStyle = displayColor(wave[i * gridSize + j], tiles)
      // if (wave[i * gridSize + j].entropy() === 1) {
      //   context.strokeStyle = 'blue'
      //   context.strokeRect(j * 30, i * 30, 29, 29)
      // }
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

  wave[best] = wave[best].collapse()
  return best
}

function propagate (selected, wave, rules) {
  const changed = [selected]

  while (changed.length > 0) {
    const selected = changed.pop()
    // console.log('Changed: ', selected)

    for (const direction of [Up, Down, Left, Right]) {
      // Accumulate set of allowed neighbours in this direction
      const allowed = combineAllowed(rules, wave[selected], direction)

      if (allowed.length === 0) {
        console.log('OH NO! ABORTING')
        return
      }

      const neighbour = getNeighbour(selected, direction)
      const possibilities = wave[neighbour]
      const newPossibilities = possibilities.intersection(allowed)
      if (newPossibilities.contents !== possibilities.contents) {
        wave[neighbour] = newPossibilities
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

function toIndex (x, y) {
  return x * gridSize + y
}

function fromIndex (index) {
  const x = Math.floor(index / gridSize)
  const y = index % gridSize
  return [x, y]
}

main()
