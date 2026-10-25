import type { Expression } from './geometry'
export type EyeArtwork = NonNullable<Expression['eyeArtwork']>

export function validEyeArtwork(value: unknown): value is EyeArtwork {
  if (!value || typeof value !== 'object') return false
  const candidate = value as EyeArtwork
  return [candidate.left, candidate.right].every(
    rows =>
      Array.isArray(rows) &&
      rows.length === 64 &&
      rows.every(row => typeof row === 'string' && /^[01]{64}$/.test(row))
  )
}

// Enclosed eye centres identify touching rings. Grow each centre back through its
// surrounding stroke, allowing shared pixels instead of slicing a ring in half.
function ringMasks(pixels: string): string[] | null {
  const visited = new Uint8Array(8192),
    holes: number[][] = []
  const neighbours = (i: number) =>
    [
      i % 128 > 0 ? i - 1 : -1,
      i % 128 < 127 ? i + 1 : -1,
      i >= 128 ? i - 128 : -1,
      i < 8064 ? i + 128 : -1,
    ].filter(n => n >= 0)
  for (let start = 0; start < 8192; start++) {
    if (visited[start] || pixels[start] === '1') continue
    const region = [start]
    visited[start] = 1
    let border = false
    for (let j = 0; j < region.length; j++) {
      const i = region[j],
        x = i % 128,
        y = Math.floor(i / 128)
      if (x === 0 || x === 127 || y === 0 || y === 63) border = true
      for (const n of neighbours(i))
        if (!visited[n] && pixels[n] === '0') {
          visited[n] = 1
          region.push(n)
        }
    }
    if (!border && region.length > 30) holes.push(region)
  }
  if (holes.length !== 2) return null
  holes.sort(
    (a, b) =>
      a.reduce((s, i) => s + (i % 128), 0) / a.length -
      b.reduce((s, i) => s + (i % 128), 0) / b.length
  )
  return holes.map(hole => {
    const distance = new Int16Array(8192).fill(-1),
      queue = [...hole]
    hole.forEach(i => (distance[i] = 0))
    for (let j = 0; j < queue.length; j++)
      for (const n of neighbours(queue[j]))
        if (distance[n] < 0) {
          distance[n] = distance[queue[j]] + 1
          queue.push(n)
        }
    // The nearest exterior background gives the local ring thickness.
    const exterior = queue.filter(i => pixels[i] === '0' && distance[i] > 0)
    const thickness = Math.max(1, Math.min(...exterior.map(i => distance[i])) - 1)
    return Array.from({ length: 8192 }, (_, i) =>
      pixels[i] === '1' && distance[i] <= thickness + 2 ? '1' : '0'
    ).join('')
  })
}

// Find the space between the two eyes, not the geometric middle of the image.
export function artworkFromFrame(pixels: string, manualSplit?: number): EyeArtwork {
  if (!/^[01]{8192}$/.test(pixels)) throw Error('Invalid expression frame')
  const counts = Array.from({ length: 128 }, (_, x) =>
    Array.from({ length: 64 }, (_, y) => +(pixels[y * 128 + x] === '1')).reduce((a, b) => a + b, 0)
  )
  let split = 64
  if (manualSplit !== undefined) split = Math.max(8, Math.min(120, Math.round(manualSplit)))
  else {
    let score = Infinity
    for (let x = 24; x <= 104; x++) {
      const value = counts[x] + Math.abs(x - 64) * 0.03
      if (value < score) {
        score = value
        split = x
      }
    }
  }
  const rings = manualSplit === undefined ? ringMasks(pixels) : null
  const sources = rings ?? [pixels, pixels]
  const bounds = (
    rings
      ? [
          [0, 128],
          [0, 128],
        ]
      : [
          [0, split],
          [split, 128],
        ]
  ).map(([start, end], side) => {
    const lit: [number, number][] = []
    for (let y = 0; y < 64; y++)
      for (let x = start; x < end; x++) if (sources[side][y * 128 + x] === '1') lit.push([x, y])
    return lit.length
      ? {
          left: Math.min(...lit.map(p => p[0])),
          right: Math.max(...lit.map(p => p[0])),
          top: Math.min(...lit.map(p => p[1])),
          bottom: Math.max(...lit.map(p => p[1])),
        }
      : null
  })
  const extent = Math.max(
    1,
    ...bounds.flatMap(b => (b ? [b.right - b.left + 1, b.bottom - b.top + 1] : []))
  )
  const scale = 60 / extent
  const masks = bounds.map((b, side) => {
    if (!b) return Array(64).fill('0'.repeat(64)) as string[]
    const w = b.right - b.left + 1,
      h = b.bottom - b.top + 1,
      ox = (64 - w * scale) / 2,
      oy = (64 - h * scale) / 2
    return Array.from({ length: 64 }, (_, y) =>
      Array.from({ length: 64 }, (_, x) => {
        const sx = Math.floor((x - ox) / scale) + b.left,
          sy = Math.floor((y - oy) / scale) + b.top
        return sx >= b.left &&
          sx <= b.right &&
          sy >= b.top &&
          sy <= b.bottom &&
          sources[side][sy * 128 + sx] === '1'
          ? '1'
          : '0'
      }).join('')
    )
  })
  return { left: masks[0], right: masks[1] }
}

export const joinEyeArtwork = (artwork: EyeArtwork) =>
  artwork.left.map((row, y) => row + artwork.right[y]).join('')

// Safe standalone SVG: only numeric paths are emitted, never the source image's markup.
export function eyeSvg(rows: string[]): string {
  const runs: string[] = []
  rows.forEach((row, y) => {
    for (let x = 0; x < 64;) {
      if (row[x] !== '1') {
        x++
        continue
      }
      const start = x
      while (x < 64 && row[x] === '1') x++
      runs.push(`M${start} ${y}h${x - start}v1h-${x - start}Z`)
    }
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="white" d="${runs.join('')}"/></svg>`
}
