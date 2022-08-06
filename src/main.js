const gridSize = 20

function main () {
  const canvas = document.getElementById('output')
  canvas.width = 900
  canvas.height = 900

  const context = canvas.getContext('2d')

  const wave = []
  for (let i = 0; i < gridSize * gridSize; i++) {
    wave[i] = ['L', 'S', 'C', 'M', 'O', 'T']
  }

  setInterval(() => {
    const selected = selectAndCollapse(wave)
    if (selected < 0) {
      return
    }
    propagate(selected, wave)

    display(context, wave)
  }, 20)
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
      r = (200 + r) / 2
      g = (200 + g) / 2
      b = (200 + b) / 2
    }
    if (item === 'O') {
      r = (0 + r) / 2
      g = (0 + g) / 2
      b = (128 + b) / 2
    }
    if (item === 'T') {
      r = (255 + r) / 2
      g = (255 + g) / 2
      b = (255 + b) / 2
    }
  }
  return `rgb(${r}, ${g}, ${b})`
}

function display (context, wave) {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      context.fillStyle = displayColor(wave[i * gridSize + j])
      context.fillRect(i * 30, j * 30, 29, 29)
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
        allowed.add('M')
        allowed.add('T')
      } else if (item === 'T') {
        allowed.add('M')
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
