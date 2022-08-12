import { getColorString, listColorCodes } from './colors.js'

const editorSize = 12

export function createEditor () {
  let activeColor = 'K'
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
    pixels[i][j] = activeColor
    display(canvas, pixels)
  })

  canvas.addEventListener('contextmenu', (event) => {
    const j = Math.floor((event.clientX - canvas.offsetLeft) / 30)
    const i = Math.floor((event.clientY - canvas.offsetTop + window.pageYOffset) / 30)
    if (i > editorSize || j > editorSize) {
      return
    }
    pixels[i][j] = ' '
    display(canvas, pixels)
    event.preventDefault()
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

  const picker = document.getElementById('color-picker')
  picker.style.backgroundColor = getColorString(activeColor)
  for (const color of listColorCodes()) {
    const button = document.createElement('button')
    button.innerText = color
    button.style.backgroundColor = getColorString(color)
    button.addEventListener('click', (event) => {
      activeColor = color
      picker.style.backgroundColor = getColorString(color)
    })
    picker.appendChild(button)
  }
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
