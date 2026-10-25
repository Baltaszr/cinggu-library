import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { NumericField } from '@/app/components/controls'
import { useStudioLanguage } from '@/i18n'
import {
  insertOutlinePoint,
  validHeadOutline,
  type OutlinePoint,
} from '@/features/avatar/customOutline'

// Selection is transient; only validated geometry enters the existing avatar draft.
export function CustomHeadEditor({
  points,
  onChange,
}: {
  points: OutlinePoint[]
  onChange: (points: OutlinePoint[]) => void
}) {
  const { t } = useStudioLanguage()
  const [selected, setSelected] = useState<number[]>([0])
  const [box, setBox] = useState<{ start: OutlinePoint; end: OutlinePoint } | null>(null)
  const [warning, setWarning] = useState('')
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<{
    start: OutlinePoint
    points: OutlinePoint[]
    selected: number[]
    box: boolean
  } | null>(null)
  const indices = selected.filter(i => i < points.length)
  const index = indices[0] ?? 0
  function apply(next: OutlinePoint[]) {
    if (!validHeadOutline(next)) {
      setWarning(t('Gardez un contour fermé sans croisement.'))
      return
    }
    setWarning('')
    onChange(next)
  }
  function location(e: { clientX: number; clientY: number }): OutlinePoint {
    const matrix = svg.current?.getScreenCTM()
    if (!matrix) return [0, 0]
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse())
    return [p.x / 100, p.y / 100]
  }
  function move(base: OutlinePoint[], selection: number[], dx: number, dy: number) {
    // Clamp the whole selection together so relative distances stay unchanged.
    const chosen = base.filter((_, i) => selection.includes(i))
    if (!chosen.length) return
    dx = Math.max(
      -1.5 - Math.min(...chosen.map(p => p[0])),
      Math.min(1.5 - Math.max(...chosen.map(p => p[0])), dx)
    )
    dy = Math.max(
      -1.5 - Math.min(...chosen.map(p => p[1])),
      Math.min(1.5 - Math.max(...chosen.map(p => p[1])), dy)
    )
    apply(base.map((p, i) => (selection.includes(i) ? [p[0] + dx, p[1] + dy] : [...p])))
  }
  return (
    <div className="cinggu-outline-editor">
      <p>
        {t(
          'Maj-clic pour sélectionner plusieurs points. Glissez sur le fond pour tracer une sélection. Glissez un point sélectionné pour déplacer le groupe.'
        )}
      </p>
      <svg
        ref={svg}
        viewBox="-170 -170 340 340"
        style={{ touchAction: 'none' }}
        role="group"
        aria-label={t('Contour de la tête')}
        tabIndex={0}
        onKeyDown={e => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            e.preventDefault()
            setSelected(points.map((_, i) => i))
          }
        }}
        onPointerDown={e => {
          const start = location(e)
          drag.current = { start, points, selected: e.shiftKey ? indices : [], box: true }
          setBox({ start, end: start })
          svg.current?.setPointerCapture(e.pointerId)
        }}
        onPointerMove={e => {
          const d = drag.current
          if (!d) return
          const p = location(e)
          if (d.box) {
            setBox({ start: d.start, end: p })
            const hits = points.flatMap(([x, y], i) =>
              x >= Math.min(d.start[0], p[0]) &&
              x <= Math.max(d.start[0], p[0]) &&
              y >= Math.min(d.start[1], p[1]) &&
              y <= Math.max(d.start[1], p[1])
                ? [i]
                : []
            )
            setSelected([...new Set([...d.selected, ...hits])])
          } else move(d.points, d.selected, p[0] - d.start[0], p[1] - d.start[1])
        }}
        onPointerUp={e => {
          drag.current = null
          setBox(null)
          if (svg.current?.hasPointerCapture(e.pointerId))
            svg.current.releasePointerCapture(e.pointerId)
        }}
        onPointerCancel={() => {
          drag.current = null
          setBox(null)
        }}
      >
        <polygon
          points={points.map(([x, y]) => `${x * 100},${y * 100}`).join(' ')}
          fill="#d9ee95"
          stroke="#26382c"
        />
        {box && (
          <rect
            x={Math.min(box.start[0], box.end[0]) * 100}
            y={Math.min(box.start[1], box.end[1]) * 100}
            width={Math.abs(box.end[0] - box.start[0]) * 100}
            height={Math.abs(box.end[1] - box.start[1]) * 100}
            fill="#486b5020"
            stroke="#486b50"
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={x * 100}
            cy={y * 100}
            r={indices.includes(i) ? 7 : 5}
            fill={indices.includes(i) ? '#f5754e' : '#26382c'}
            role="button"
            tabIndex={0}
            aria-label={`${t('Point')} ${i + 1}`}
            aria-pressed={indices.includes(i)}
            onPointerDown={e => {
              e.stopPropagation()
              e.preventDefault()
              const next = e.shiftKey
                ? indices.includes(i)
                  ? indices.filter(n => n !== i)
                  : [...indices, i]
                : indices.includes(i)
                  ? indices
                  : [i]
              setSelected(next)
              drag.current = {
                start: location(e),
                points: structuredClone(points),
                selected: next,
                box: false,
              }
              svg.current?.setPointerCapture(e.pointerId)
            }}
            onKeyDown={e => {
              if (e.key === ' ') {
                e.preventDefault()
                setSelected(current =>
                  current.includes(i) ? current.filter(n => n !== i) : [...current, i]
                )
                return
              }
              const delta: Record<string, OutlinePoint> = {
                ArrowLeft: [-0.02, 0],
                ArrowRight: [0.02, 0],
                ArrowUp: [0, -0.02],
                ArrowDown: [0, 0.02],
              }
              if (delta[e.key]) {
                e.preventDefault()
                move(points, indices.includes(i) ? indices : [i], ...delta[e.key])
              }
            }}
          />
        ))}
      </svg>
      <div className="cinggu-head-actions">
        <Button variant="outline" size="sm" onClick={() => setSelected(points.map((_, i) => i))}>
          {t('Tout sélectionner')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSelected([])}>
          {t('Désélectionner')}
        </Button>
        <span>
          {indices.length} {t('points sélectionnés')}
        </span>
      </div>
      {(['X', 'Y'] as const).map((axis, n) => (
        <NumericField
          key={axis}
          label={axis}
          value={points[index][n]}
          min={-1.5}
          max={1.5}
          step={0.01}
          onChange={value =>
            move(
              points,
              indices,
              n === 0 ? value - points[index][0] : 0,
              n === 1 ? value - points[index][1] : 0
            )
          }
        />
      ))}
      <div className="cinggu-head-actions">
        <Button
          variant="outline"
          size="sm"
          disabled={points.length >= 64}
          onClick={() => {
            apply(insertOutlinePoint(points, index))
            setSelected([index + 1])
          }}
        >
          {t('Ajouter un point')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!indices.length || points.length - indices.length < 3}
          onClick={() => {
            apply(points.filter((_, i) => !indices.includes(i)))
            setSelected([])
          }}
        >
          {t('Retirer le point')}
        </Button>
      </div>
      <p role="status">
        {warning ||
          t('Enregistrez l’avatar pour conserver la tête. Annuler restaure la version précédente.')}
      </p>
    </div>
  )
}
