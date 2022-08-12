import { getColorString } from './colors.js'

const editorSize = 10

export function createEditor () {
  const pixels = createGrid()

  const canvas = document.getElementById('editor')
  canvas.width = 400
  canvas.height = 400

  display(canvas, pixels)

  canvas.addEventListener('click', (event) => {
    const j = Math.floor((event.clientX - canvas.offsetLeft) / 30)
    const i = Math.floor((event.clientY - canvas.offsetTop + window.pageYOffset) / 30)
    if (i > editorSize || j > editorSize) {
      return
    }
    pixels[i][j] = 'K'
    display(canvas, pixels)
  })

  document.getElementById('clear').addEventListener('click', () => {
    console.log('Clear!')
    for (let i = 0; i < editorSize; i++) {
      for (let j = 0; j < editorSize; j++) {
        pixels[i][j] = ' '
      }
    }
    display(canvas, pixels)
  })
  return pixels
}

function display (canvas, pixels) {
  const context = canvas.getContext('2d')

  for (let i = 0; i < editorSize; i++) {
    for (let j = 0; j < editorSize; j++) {
      context.fillStyle = getColorString(pixels[i][j])
      context.fillRect(j * 30, i * 30, 29, 29)
    }
  }
}

function createGrid () {
  const pixels = []
  for (let i = 0; i < editorSize; i++) {
    const line = []
    for (let j = 0; j < editorSize; j++) {
      line.push(' ')
    }
    pixels.push(line)
  }
  return pixels
}
