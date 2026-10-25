import { describe, expect, it } from 'vitest'
import { artworkFromFrame, validEyeArtwork } from '../eyeArtwork'
import { parseExpressions } from '../avatars'
import { defaultExpression } from '../presets'
import { poseFromExpression, renderAvatar } from '../geometry'
import { extractSheet } from '../sheetExtraction'
import { expressionFromDefinition } from '@bible-strong/avatar-core'
import family from './current-family.json'

describe('Cinggu image expressions and solid heads', () => {
  const artwork = artworkFromFrame('1'.repeat(8192))
  it('accepts only bounded binary artwork and retains it after persistence', () => {
    expect(validEyeArtwork(artwork)).toBe(true)
    expect(validEyeArtwork({ left: ['<script>'], right: [] })).toBe(false)
    expect(parseExpressions([{ ...defaultExpression, eyeArtwork: artwork }])[0].eyeArtwork).toEqual(
      artwork
    )
    expect(
      parseExpressions([{ ...defaultExpression, eyeArtwork: { left: [], right: [] } }])[0]
        .eyeArtwork
    ).toBeUndefined()
  })
  it('keeps left and right halves separate', () => {
    const pixels = Array.from({ length: 64 }, () => '1'.repeat(64) + '0'.repeat(64)).join('')
    const result = artworkFromFrame(pixels, 64)
    expect(result.left.join('').split('1').length - 1).toBe(3600)
    expect(result.right.every(row => row === '0'.repeat(64))).toBe(true)
  })
  it('projects imported artwork and removes procedural pupils', () => {
    const surface = { type: 'sphere' as const, width: 240, height: 240, depth: 80, roundness: 1 }
    const geometry = renderAvatar(
      poseFromExpression({ ...defaultExpression, eyeArtwork: artwork }),
      surface
    )
    expect(geometry.leftPath.match(/M/g)?.length).toBe(60)
    expect(geometry.pupilPath).toBe('')
    expect(geometry.leftPath).not.toContain('NaN')
  })
  it('keeps exported artwork in runtime definitions', () => {
    const expression = expressionFromDefinition('custom', {
      head: { x: 0, y: 0, z: 0 },
      eyes: {
        left: { width: 50, height: 50, x: 0, y: 0, angle: 0 },
        right: { width: 50, height: 50, x: 0, y: 0, angle: 0 },
        spacing: 60,
      },
      perspective: 1,
      motion: { eyes: 'none', body: 'none' },
      eyeArtwork: artwork,
    })
    expect(expression.eyeArtwork).toEqual(artwork)
  })
  it('extracts a grid pair and ignores empty cells', () => {
    const data = new Uint8ClampedArray(100 * 100 * 4)
    for (let y = 20; y < 50; y++)
      for (let x = 10; x < 40; x++) for (let c = 0; c < 4; c++) data[(y * 100 + x) * 4 + c] = 255
    const result = extractSheet(
      { width: 100, height: 100, data },
      { columns: 2, rows: 1, autoRows: false, threshold: 150, darkInk: false, cleanup: true }
    )
    expect(result).toHaveLength(1)
    expect(validEyeArtwork(artworkFromFrame(result[0].frame.pixels))).toBe(true)
  })
  it('uses a consistent fill winding for all rotated prism faces', () => {
    const avatar = family[0]
    for (const headY of [0, 45, 90, 135, 180]) {
      const geometry = renderAvatar(
        poseFromExpression({ ...defaultExpression, headY }),
        avatar.body.primary as Parameters<typeof renderAvatar>[1]
      )
      const polygons = geometry.headPath
        .split('M')
        .filter(Boolean)
        .map(section =>
          [...section.matchAll(/(-?\d+\.\d+) (-?\d+\.\d+)/g)].map(match => [
            Number(match[1]),
            Number(match[2]),
          ])
        )
      const areas = polygons.map(points =>
        points.reduce((sum, p, i) => {
          const q = points[(i + 1) % points.length]
          return sum + p[0] * q[1] - q[0] * p[1]
        }, 0)
      )
      expect(areas.every(area => area >= -0.1)).toBe(true)
      if (headY === 90) expect(areas.reduce((a, b) => a + b, 0)).toBeGreaterThan(1000)
    }
  })
})
