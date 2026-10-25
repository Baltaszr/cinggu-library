import { describe, expect, it } from 'vitest'
import { artworkFromFrame, eyeSvg } from '../eyeArtwork'
import { extractAvatarShapes } from '../silhouetteImport'
import { validHeadOutline } from '../customOutline'
import { expressionPackage, expressionName } from '../expressionPackages'
import { defaultExpression } from '../presets'

describe('community library imports', () => {
  it('finds an off-centre gap without cutting either eye', () => {
    const pixels = Array.from({ length: 8192 }, (_, i) => {
      const x = i % 128,
        y = Math.floor(i / 128)
      return y > 10 && y < 50 && ((x > 8 && x < 75) || (x > 86 && x < 115)) ? '1' : '0'
    }).join('')
    const eyes = artworkFromFrame(pixels)
    for (const rows of [eyes.left, eyes.right]) {
      expect(rows.join('')).toContain('1')
      expect(rows.every(row => row[0] === '0' && row[63] === '0')).toBe(true)
      expect(eyeSvg(rows)).toContain('viewBox="0 0 64 64"')
    }
  })
  it('imports eleven silhouettes and skips the empty twelfth cell', () => {
    const width = 160,
      height = 120,
      data = new Uint8ClampedArray(width * height * 4)
    for (let n = 0; n < 11; n++)
      for (let y = 8; y < 32; y++)
        for (let x = 8; x < 32; x++) {
          const i = ((Math.floor(n / 4) * 40 + y) * width + (n % 4) * 40 + x) * 4
          data[i] = 200
          data[i + 1] = 80
          data[i + 2] = 50
          data[i + 3] = 255
        }
    const shapes = extractAvatarShapes({ width, height, data }, 4, 3)
    expect(shapes).toHaveLength(11)
    expect(shapes.every(shape => validHeadOutline(shape.outline))).toBe(true)
  })
  it('keeps user names and packages independent of built-in keys', () => {
    const custom = { ...defaultExpression, label: 'My happy eyes', packageName: 'Paper friends' }
    expect(expressionName(custom)).toBe('My happy eyes')
    expect(expressionPackage(custom)).toBe('Paper friends')
    expect(expressionPackage({ ...defaultExpression, id: 'cinggu-reference-joy' })).toBe('Cinggu')
    expect(expressionPackage(defaultExpression)).toBe('Base')
  })
})
