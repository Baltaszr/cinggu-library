import { describe, it, expect } from 'vitest'
import { createHeadOutline, insertOutlinePoint, validHeadOutline } from '../customOutline'
import document from '@/features/studio/defaultStudioDocument.json'
import currentFamily from './current-family.json'

describe('custom head creation in the current Cinggu editor', () => {
  it('preserves all eleven exact current head recipes, colours and eyes', () => {
    expect(document.library.avatars).toEqual(currentFamily)
    expect(document.library.avatars.map(a => a.name)).toEqual([
      'Cinggu',
      'Orbi',
      'Momo',
      'Zizi',
      'Flo',
      'Bomi',
      'Sunny',
      'Mello',
      'Nubi',
      'Kubo',
      'Pebbi',
    ])
  })
  it('allows editing every existing custom silhouette', () => {
    for (const a of currentFamily) {
      if ('outline' in a.body.primary)
        expect(validHeadOutline(a.body.primary.outline as [number, number][]), a.name).toBe(true)
    }
  })
  it('creates an independent editable outline', () => {
    const a = createHeadOutline(),
      b = createHeadOutline()
    expect(validHeadOutline(a)).toBe(true)
    a[0][0] = 0.5
    expect(b[0][0]).toBe(1)
  })
  it('inserts a point without moving existing vertices', () => {
    const points = createHeadOutline(),
      next = insertOutlinePoint(points, 0)
    expect(next).toHaveLength(13)
    expect(next[0]).toEqual(points[0])
    expect(next[2]).toEqual(points[1])
    expect(validHeadOutline(next)).toBe(true)
  })
  it('rejects crossed, degenerate, oversized and non-finite outlines', () => {
    expect(
      validHeadOutline([
        [1, 1],
        [-1, -1],
        [-1, 1],
        [1, -1],
      ])
    ).toBe(false)
    expect(
      validHeadOutline([
        [0, 0],
        [0, 0],
        [1, 1],
      ])
    ).toBe(false)
    expect(
      validHeadOutline([
        [Infinity, 0],
        [0, 1],
        [1, 0],
      ])
    ).toBe(false)
    expect(validHeadOutline(Array.from({ length: 65 }, () => [0, 0]))).toBe(false)
  })
  it('accepts concave head shapes', () => {
    expect(
      validHeadOutline([
        [-1, -1],
        [1, -1],
        [1, 1],
        [0, 0.3],
        [-1, 1],
      ])
    ).toBe(true)
  })
})
