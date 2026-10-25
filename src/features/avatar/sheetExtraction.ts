const W = 128,
  H = 64
const uid = () => crypto.randomUUID()
type Frame = { id: string; name: string; pixels: string; hold: number }
export type Raster = { width: number; height: number; data: Uint8ClampedArray }
export type SheetOptions = {
  columns: number
  rows: number
  autoRows: boolean
  threshold: number
  darkInk: boolean
  cleanup: boolean
}
export type Extracted = {
  frame: Frame
  box: { x: number; y: number; width: number; height: number }
}
// Remove disconnected speckles while keeping both eyes and their detached details.
export function cleanMask(mask: Uint8Array, w: number, h: number, ratio = 0.025) {
  const seen = new Uint8Array(mask.length),
    queue = new Int32Array(mask.length),
    groups: number[][] = []
  for (let i = 0; i < mask.length; i++)
    if (mask[i] && !seen[i]) {
      let head = 0,
        tail = 1
      queue[0] = i
      seen[i] = 1
      const pixels: number[] = []
      while (head < tail) {
        const p = queue[head++]
        pixels.push(p)
        const x = p % w,
          y = Math.floor(p / w)
        for (const n of [
          x > 0 ? p - 1 : -1,
          x < w - 1 ? p + 1 : -1,
          y > 0 ? p - w : -1,
          y < h - 1 ? p + w : -1,
        ])
          if (n >= 0 && mask[n] && !seen[n]) {
            seen[n] = 1
            queue[tail++] = n
          }
      }
      groups.push(pixels)
    }
  const largest = groups.reduce((n, g) => Math.max(n, g.length), 0),
    out = new Uint8Array(mask.length)
  for (const g of groups)
    if (g.length >= Math.max(3, largest * ratio)) for (const p of g) out[p] = 1
  return out
}
export function extractSheet(image: Raster, o: SheetOptions): Extracted[] {
  const { width: w, height: h, data } = image
  if (w < 1 || h < 1 || w * h > 2560000 || data.length !== w * h * 4)
    throw Error('Image is too large or invalid.')
  if (
    !Number.isInteger(o.columns) ||
    o.columns < 1 ||
    o.columns > 8 ||
    !Number.isInteger(o.rows) ||
    o.rows < 1 ||
    o.rows > 8
  )
    throw Error('Choose 1–8 columns and rows.')
  let mask = new Uint8Array(w * h)
  for (let i = 0; i < mask.length; i++) {
    const p = i * 4,
      a = data[p + 3] / 255
    const v =
      (data[p] * 0.2126 + data[p + 1] * 0.7152 + data[p + 2] * 0.0722) * a +
      (o.darkInk ? 255 * (1 - a) : 0)
    mask[i] = +(o.darkInk ? v < o.threshold : v > o.threshold)
  }
  // Automatic row bands use a coarse projection; manual grid remains available.
  let bands: { start: number; end: number }[] = []
  if (o.autoRows) {
    let start = -1,
      last = -1
    const gap = Math.max(3, Math.round(h * 0.025))
    for (let y = 0; y < h; y++) {
      let count = 0
      for (let x = 0; x < w; x++) count += mask[y * w + x]
      if (count >= Math.max(3, w * 0.035)) {
        if (start < 0) start = y
        last = y
      }
      if (start >= 0 && (y - last > gap || y === h - 1)) {
        bands.push({
          start: Math.max(0, start - 3),
          end: Math.min(h, last + 4),
        })
        start = -1
      }
    }
    if (bands.length > 8) throw Error('Too many rows detected. Use grid mode or increase contrast.')
  } else
    for (let r = 0; r < o.rows; r++)
      bands.push({
        start: Math.floor((r * h) / o.rows),
        end: Math.floor(((r + 1) * h) / o.rows),
      })
  const results: Extracted[] = []
  for (const band of bands)
    for (let col = 0; col < o.columns; col++) {
      const x0 = Math.floor((col * w) / o.columns),
        cw = Math.floor(((col + 1) * w) / o.columns) - x0,
        ch = band.end - band.start
      let cell = new Uint8Array(cw * ch)
      for (let y = 0; y < ch; y++)
        cell.set(mask.subarray((band.start + y) * w + x0, (band.start + y) * w + x0 + cw), y * cw)
      if (o.cleanup) cell = cleanMask(cell, cw, ch)
      let left = cw,
        right = -1,
        top = ch,
        bottom = -1,
        count = 0
      for (let i = 0; i < cell.length; i++)
        if (cell[i]) {
          const x = i % cw,
            y = Math.floor(i / cw)
          left = Math.min(left, x)
          right = Math.max(right, x)
          top = Math.min(top, y)
          bottom = Math.max(bottom, y)
          count++
        }
      if (count < Math.max(12, cw * ch * 0.003) || right - left < 3 || bottom - top < 2) continue
      const bw = right - left + 1,
        bh = bottom - top + 1,
        scale = Math.min(112 / bw, 52 / bh),
        dw = Math.max(1, Math.round(bw * scale)),
        dh = Math.max(1, Math.round(bh * scale)),
        ox = Math.floor((W - dw) / 2),
        oy = Math.floor((H - dh) / 2)
      const output = Array(W * H).fill('0')
      for (let y = 0; y < dh; y++)
        for (let x = 0; x < dw; x++) {
          // Area coverage preserves thin outlines when reducing a large drawing.
          const sx = left + Math.floor(x / scale),
            sy = top + Math.floor(y / scale)
          let lit = 0,
            total = 0
          for (let yy = sy; yy <= Math.min(bottom, top + Math.ceil((y + 1) / scale) - 1); yy++)
            for (let xx = sx; xx <= Math.min(right, left + Math.ceil((x + 1) / scale) - 1); xx++) {
              lit += cell[yy * cw + xx]
              total++
            }
          if (total && lit / total >= 0.28) output[(oy + y) * W + ox + x] = '1'
        }
      results.push({
        frame: {
          id: uid(),
          name: `Expression ${results.length + 1}`,
          pixels: output.join(''),
          hold: 8000,
        },
        box: { x: x0 + left, y: band.start + top, width: bw, height: bh },
      })
    }
  return results
}
