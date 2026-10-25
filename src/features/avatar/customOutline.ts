/** Normalized head coordinates: the current studio maps these onto width and height. */
export type OutlinePoint = [number, number]
export const createHeadOutline = (): OutlinePoint[] =>
  Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2
    return [Math.cos(angle), Math.sin(angle)]
  })

const cross = (a: OutlinePoint, b: OutlinePoint, c: OutlinePoint) =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])

// Reject crossings and degenerate edges before saving; concave shapes are deliberately allowed.
export function validHeadOutline(points: OutlinePoint[]): boolean {
  if (
    points.length < 3 ||
    points.length > 64 ||
    points.some(p => p.some(n => !Number.isFinite(n) || Math.abs(n) > 1.5))
  )
    return false
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length]
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.005) return false
    area += a[0] * b[1] - b[0] * a[1]
    for (let j = i + 2; j < points.length; j++) {
      if (i === 0 && j === points.length - 1) continue
      const c = points[j],
        d = points[(j + 1) % points.length]
      const abC = cross(a, b, c),
        abD = cross(a, b, d),
        cdA = cross(c, d, a),
        cdB = cross(c, d, b)
      if (abC * abD < 0 && cdA * cdB < 0) return false
      if (
        Math.abs(abC) < 1e-8 &&
        c[0] >= Math.min(a[0], b[0]) &&
        c[0] <= Math.max(a[0], b[0]) &&
        c[1] >= Math.min(a[1], b[1]) &&
        c[1] <= Math.max(a[1], b[1])
      )
        return false
    }
  }
  return Math.abs(area) > 0.02
}

export function insertOutlinePoint(points: OutlinePoint[], selected: number): OutlinePoint[] {
  const result = points.map(([x, y]): OutlinePoint => [x, y])
  const a = points[selected],
    b = points[(selected + 1) % points.length]
  result.splice(selected + 1, 0, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2])
  return result
}
