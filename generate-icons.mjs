// アイコン生成スクリプト
import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

function generateIcon(size, path) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // 背景
  ctx.fillStyle = '#1F3A5F'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.2)
  ctx.fill()

  // テキスト「T」
  ctx.fillStyle = '#E8743B'
  ctx.font = `bold ${size * 0.55}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('T', size / 2, size / 2)

  writeFileSync(path, canvas.toBuffer('image/png'))
  console.log(`生成: ${path}`)
}

generateIcon(192, 'public/icon-192.png')
generateIcon(512, 'public/icon-512.png')
