const gridSize = 20

function main () {
  const canvas = document.getElementById('output')
  canvas.width = 400
  canvas.height = 400

  const context = canvas.getContext('2d')

  const wave = []
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      wave[i * gridSize + j] = ['L', 'S', 'C', 'M', 'O']
    }
  }

  for (let i = 0; i < 400; i++) {
    const selected = selectAndCollapse(wave)
    if (selected < 0) {
      break
    }
    propagate(selected, wave)
  }

  display(context, wave)
}

function displayColor (poss) {
  let r = 128
  let g = 128
  let b = 128
  for (const item of poss) {
    if (item === 'L') {
      r = r / 2
      g = (g + 255) / 2
      b = b / 2
    }
    if (item === 'S') {
      r = r / 2
      g = g / 2
      b = (255 + b) / 2
    }
    if (item === 'C') {
      r = (255 + r) / 2
      g = (255 + g) / 2
      b = b / 2
    }
    if (item === 'M') {
      r = (64 + r) / 2
      g = (64 + g) / 2
      b = (64 + b) / 2
    }
    if (item === 'O') {
      r = (0 + r) / 2
      g = (0 + g) / 2
      b = (128 + b) / 2
    }
  }
  return `rgb(${r}, ${g}, ${b})`
}

function display (context, wave) {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      context.fillStyle = displayColor(wave[i * gridSize + j])
      context.fillRect(i * 20, j * 20, 19, 19)
    }
  }
}

function selectAndCollapse (wave) {
  let bestScore = 500
  let bestCandidates = []
  for (let idx = 0; idx < wave.length; idx++) {
    const possibilities = wave[idx]
    const score = possibilities.length
    if (score === 1) {
      continue
    } else if (score === bestScore) {
      bestCandidates.push(idx)
    } else if (score < bestScore) {
      bestCandidates = [idx]
      bestScore = possibilities.length
    }
  }
  if (bestScore === 500) {
    return -1
  }

  console.log('Best candidates ', bestCandidates)

  const selected = choice(bestCandidates)
  const chosenValue = choice(wave[selected])

  console.log('Force collapse: ', selected, wave[selected], ' to ', chosenValue)

  wave[selected] = [chosenValue]
  return selected
}

function propagate (selected, wave) {
  const changed = [selected]

  let count = 0
  while (changed.length > 0 && count < 30) {
    count++
    const selected = changed.pop()
    console.log('Changed: ', selected)
    const values = wave[selected]

    const allowed = new Set()
    for (const item of values) {
      if (item === 'L') {
        allowed.add('L')
        allowed.add('C')
        allowed.add('M')
      } else if (item === 'S') {
        allowed.add('C')
        allowed.add('S')
        allowed.add('O')
      } else if (item === 'C') {
        allowed.add('C')
        allowed.add('S')
        allowed.add('L')
      } else if (item === 'M') {
        allowed.add('L')
      } else if (item === 'O') {
        allowed.add('O')
        allowed.add('S')
      }
    }

    console.log('This is ', values, ' so allowed ', allowed)

    if (allowed.length === 0) {
      console.log('OH NO! ABORTING')
      return
    }

    for (const idx of neighbours(selected)) {
      const updated = []
      const possibilities = wave[idx]
      for (const poss of possibilities) {
        if (allowed.has(poss)) {
          updated.push(poss)
        }
      }
      if (possibilities.length !== updated.length) {
        console.log(`Changed ${idx} from ${possibilities} -> ${updated}`)
        wave[idx] = updated
        changed.push(idx)
      }
    }
  }
}

function neighbours (idx) {
  const i = Math.floor(idx / gridSize)
  const j = idx % gridSize

  const result = []
  if (i > 0) {
    result.push(gridSize * (i - 1) + j)
  }
  if (i < gridSize - 1) {
    result.push(gridSize * (i + 1) + j)
  }
  if (j > 0) {
    result.push(gridSize * i + j - 1)
  }
  if (j < gridSize - 1) {
    result.push(gridSize * i + j + 1)
  }

  return result
}

window.neighbours = neighbours

function choice (items) {
  const idx = Math.floor(items.length * Math.random())
  return items[idx]
}

main()
