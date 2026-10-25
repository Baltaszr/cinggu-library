import type { Raster } from './sheetExtraction'
import { extractSheet } from './sheetExtraction'
import { validHeadOutline, type OutlinePoint } from './customOutline'

// Trace pixel edges rather than taking a convex hull: notches remain part of the head.
export function outlineFromMask(pixels: string): OutlinePoint[] {
  const edges = new Map<string, string[]>()
  const lit = (x: number, y: number) =>
    x >= 0 && x < 128 && y >= 0 && y < 64 && pixels[y * 128 + x] === '1'
  const add = (a: string, b: string) => edges.set(a, [...(edges.get(a) ?? []), b])
  for (let y = 0; y < 64; y++)
    for (let x = 0; x < 128; x++)
      if (lit(x, y)) {
        if (!lit(x, y - 1)) add(`${x},${y}`, `${x + 1},${y}`)
        if (!lit(x + 1, y)) add(`${x + 1},${y}`, `${x + 1},${y + 1}`)
        if (!lit(x, y + 1)) add(`${x + 1},${y + 1}`, `${x},${y + 1}`)
        if (!lit(x - 1, y)) add(`${x},${y + 1}`, `${x},${y}`)
      }
  const loops: OutlinePoint[][] = []
  while (edges.size) {
    const start = edges.keys().next().value!,
      loop: OutlinePoint[] = []
    let current = start
    for (let guard = 0; guard < 20000; guard++) {
      loop.push(current.split(',').map(Number) as OutlinePoint)
      const options = edges.get(current)
      if (!options?.length) break
      const next = options.pop()!
      if (!options.length) edges.delete(current)
      current = next
      if (current === start) break
    }
    if (current === start && loop.length > 3) loops.push(loop)
  }
  const area = (loop: OutlinePoint[]) =>
    Math.abs(
      loop.reduce((s, p, i) => {
        const q = loop[(i + 1) % loop.length]
        return s + p[0] * q[1] - q[0] * p[1]
      }, 0)
    )
  const loop = loops.sort((a, b) => area(b) - area(a))[0]
  if (!loop) throw Error('No closed silhouette found')
  // Remove the least significant corner until the contour fits the editable point budget.
  while (loop.length > 48) {
    let index = 0,
      smallest = Infinity
    for (let i = 0; i < loop.length; i++) {
      const a = loop[(i + loop.length - 1) % loop.length],
        b = loop[i],
        c = loop[(i + 1) % loop.length]
      const score = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]))
      if (score < smallest) {
        smallest = score
        index = i
      }
    }
    loop.splice(index, 1)
  }
  const xs = loop.map(p => p[0]),
    ys = loop.map(p => p[1])
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2,
    cy = (Math.min(...ys) + Math.max(...ys)) / 2
  const scale = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2
  const outline = loop.map(([x, y]): OutlinePoint => [(x - cx) / scale, (y - cy) / scale])
  if (!validHeadOutline(outline)) throw Error('This silhouette needs a simpler outline')
  return outline
}

export function extractAvatarShapes(image: Raster, columns: number, rows: number) {
  const data = new Uint8ClampedArray(image.data.length)
  const bg = image.data.slice(0, 3)
  for (let i = 0; i < data.length; i += 4) {
    const distance = Math.max(...[0, 1, 2].map(c => Math.abs(image.data[i + c] - bg[c])))
    const on = image.data[i + 3] > 100 && (image.data[3] < 100 || distance > 35)
    data[i] = data[i + 1] = data[i + 2] = on ? 255 : 0
    data[i + 3] = 255
  }
  return extractSheet(
    { ...image, data },
    { columns, rows, autoRows: false, threshold: 128, darkInk: false, cleanup: true }
  ).flatMap((item, index) => {
    try {
      return [{ name: `My shape ${index + 1}`, outline: outlineFromMask(item.frame.pixels) }]
    } catch {
      return []
    }
  })
}
