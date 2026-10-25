import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useStudioLanguage } from '@/i18n'
import { extractAvatarShapes } from '@/features/avatar/silhouetteImport'
import type { Raster } from '@/features/avatar/sheetExtraction'
import type { OutlinePoint } from '@/features/avatar/customOutline'

export function AvatarSheetImporter({
  onAdd,
}: {
  onAdd: (shapes: { name: string; outline: OutlinePoint[] }[]) => void
}) {
  const { t } = useStudioLanguage()
  const [image, setImage] = useState<Raster | null>(null)
  const [columns, setColumns] = useState(4),
    [rows, setRows] = useState(3)
  const [selected, setSelected] = useState<number[] | null>(null)
  const [names, setNames] = useState<Record<number, string>>({})
  const [error, setError] = useState('')
  let shapes: ReturnType<typeof extractAvatarShapes> = []
  if (image)
    try {
      shapes = extractAvatarShapes(image, columns, rows)
    } catch {
      /* Invalid grids leave the preview empty. */
    }
  return (
    <details className="dialog-group cinggu-shape-importer">
      <summary>{t('Importer une planche d’avatars')}</summary>
      <p className="field-help">
        {t(
          'Placez une silhouette par case sur un fond uni ou transparent, sans texte. Les contours deviennent des têtes modifiables avec profondeur. Ajoutez les yeux ensuite. Les éléments détachés doivent être ajoutés comme primitives.'
        )}
      </p>
      <input
        aria-label={t('Image des avatars')}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={async e => {
          const file = e.currentTarget.files?.[0]
          e.currentTarget.value = ''
          if (!file) return
          setError('')
          try {
            if (file.size > 8 * 1024 * 1024) throw Error()
            const bitmap = await createImageBitmap(file)
            try {
              const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
              const canvas = document.createElement('canvas')
              canvas.width = Math.round(bitmap.width * scale)
              canvas.height = Math.round(bitmap.height * scale)
              const ctx = canvas.getContext('2d')!
              ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
              setImage(ctx.getImageData(0, 0, canvas.width, canvas.height))
              setSelected(null)
              setNames({})
            } finally {
              bitmap.close()
            }
          } catch {
            setError(
              t('Impossible de lire cette image. Utilisez PNG, JPEG ou WebP (8 Mo maximum).')
            )
          }
        }}
      />
      <div className="cinggu-library-filters">
        <label>
          {t('Colonnes')}
          <input
            type="number"
            min="1"
            max="8"
            value={columns}
            onChange={e => {
              setColumns(Math.max(1, Math.min(8, +e.target.value || 1)))
              setSelected(null)
            }}
          />
        </label>
        <label>
          {t('Lignes')}
          <input
            type="number"
            min="1"
            max="8"
            value={rows}
            onChange={e => {
              setRows(Math.max(1, Math.min(8, +e.target.value || 1)))
              setSelected(null)
            }}
          />
        </label>
      </div>
      <div className="cinggu-eye-crops">
        {shapes.map((shape, i) => (
          <label key={i}>
            <input
              type="checkbox"
              checked={selected === null || selected.includes(i)}
              onChange={e => {
                const current = selected ?? shapes.map((_, n) => n)
                setSelected(e.target.checked ? [...current, i] : current.filter(n => n !== i))
              }}
            />
            <svg viewBox="-1.2 -1.2 2.4 2.4">
              <polygon points={shape.outline.map(p => p.join(',')).join(' ')} fill="#486b50" />
            </svg>
            <input
              aria-label={`${t('Nom de l’avatar')} ${i + 1}`}
              value={names[i] ?? shape.name}
              maxLength={80}
              onChange={e => setNames({ ...names, [i]: e.target.value })}
            />
          </label>
        ))}
      </div>
      {image && !shapes.length && (
        <p>{t('Aucune silhouette détectée. Vérifiez la grille et le fond.')}</p>
      )}
      {error && <p role="alert">{error}</p>}
      {shapes.length > 0 && (
        <Button
          disabled={selected?.length === 0}
          onClick={() => {
            onAdd(
              shapes
                .filter((_, i) => selected === null || selected.includes(i))
                .map(shape => {
                  const i = shapes.indexOf(shape)
                  return { ...shape, name: names[i]?.trim() || shape.name }
                })
            )
            setImage(null)
          }}
        >
          {t('Ajouter les formes à l’aperçu')}
        </Button>
      )}
    </details>
  )
}
