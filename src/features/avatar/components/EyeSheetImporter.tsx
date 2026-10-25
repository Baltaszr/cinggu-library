import { requireAccountSave } from '@/features/account/session'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useStudioLanguage } from '@/i18n'
import { artworkFromFrame, eyeSvg, type EyeArtwork } from '../eyeArtwork'
import { extractSheet, type Raster } from '../sheetExtraction'

export function ArtworkPreview({ artwork }: { artwork: EyeArtwork }) {
  return (
    <svg viewBox="0 0 128 64" aria-hidden="true" style={{ background: '#111213', width: '100%' }}>
      {[artwork.left, artwork.right].flatMap((rows, side) =>
        rows.flatMap((row, y) =>
          [...row].map((pixel, x) =>
            pixel === '1' ? (
              <rect
                key={`${side}-${x}-${y}`}
                x={x + side * 64}
                y={y}
                width="1"
                height="1"
                fill="white"
              />
            ) : null
          )
        )
      )}
    </svg>
  )
}

// Import stays inside the expression draft: applying a crop never saves or changes another mascot.
export function EyeSheetImporter({
  value,
  onChange,
}: {
  value?: EyeArtwork
  onChange: (artwork?: EyeArtwork) => void
}) {
  const { t } = useStudioLanguage()
  const [image, setImage] = useState<Raster | null>(null)
  const [columns, setColumns] = useState(4)
  const [rows, setRows] = useState(4)
  const [autoRows, setAutoRows] = useState(true)
  const [threshold, setThreshold] = useState(150)
  const [split, setSplit] = useState(0)
  const [darkInk, setDarkInk] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function load(blob: Blob) {
    setBusy(true)
    setError('')
    try {
      if (blob.size > 8 * 1024 * 1024) throw Error('Use an image smaller than 8 MB.')
      const bitmap = await createImageBitmap(blob)
      try {
        const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(bitmap.width * scale))
        canvas.height = Math.max(1, Math.round(bitmap.height * scale))
        const context = canvas.getContext('2d')!
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        setImage(context.getImageData(0, 0, canvas.width, canvas.height))
      } finally {
        bitmap.close()
      }
    } catch {
      setError(t('Impossible de lire cette image. Utilisez PNG, JPEG ou WebP (8 Mo maximum).'))
    } finally {
      setBusy(false)
    }
  }
  let crops: EyeArtwork[] = []
  let detectionError = ''
  if (image) {
    try {
      crops = extractSheet(image, {
        columns,
        rows,
        autoRows,
        threshold,
        darkInk,
        cleanup: true,
      }).map(item => artworkFromFrame(item.frame.pixels, split || undefined))
    } catch {
      detectionError = t('Ajustez la grille ou le contraste pour détecter les expressions.')
    }
  }
  return (
    <details className="dialog-group cinggu-eye-importer">
      <summary>{t('Importer mes yeux')}</summary>
      <p className="field-help">
        {t(
          'Dessinez une paire par case. Importez une image, choisissez une paire, puis enregistrez cette expression. Les contrôles ci-dessous ajustent sa taille et sa position.'
        )}
      </p>
      <div className="cinggu-head-actions">
        <Button
          variant="outline"
          disabled={busy}
          onClick={async () => {
            try {
              const response = await fetch('./reference/expression-sheet.png')
              if (!response.ok) throw Error()
              await load(await response.blob())
            } catch {
              setError(t('Impossible de charger la référence.'))
            }
          }}
        >
          {t('Essayer la référence Cinggu')}
        </Button>
        <a href="./reference/expression-template.svg" download>
          {t('Télécharger le modèle')}
        </a>
      </div>
      <label>
        {t('Image des expressions')}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={event => {
            const file = event.currentTarget.files?.[0]
            if (file) void load(file)
            event.currentTarget.value = ''
          }}
        />
      </label>
      {image && (
        <>
          <label>
            {t('Colonnes')}
            <input
              type="number"
              min="1"
              max="8"
              value={columns}
              onChange={event =>
                setColumns(Math.max(1, Math.min(8, Math.round(Number(event.target.value) || 1))))
              }
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={autoRows}
              onChange={event => setAutoRows(event.target.checked)}
            />
            {t('Détecter les lignes automatiquement')}
          </label>
          {!autoRows && (
            <label>
              {t('Lignes')}
              <input
                type="number"
                min="1"
                max="8"
                value={rows}
                onChange={event =>
                  setRows(Math.max(1, Math.min(8, Math.round(Number(event.target.value) || 1))))
                }
              />
            </label>
          )}
          <label>
            {t('Contraste')} · {threshold}
            <input
              type="range"
              min="20"
              max="240"
              value={threshold}
              onChange={event => setThreshold(Number(event.target.value))}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={darkInk}
              onChange={event => setDarkInk(event.target.checked)}
            />
            {t('Yeux sombres sur fond clair')}
          </label>
          <label>
            {t('Séparation des yeux')} · {split || t('Automatique')}
            <input
              type="range"
              min="0"
              max="120"
              value={split}
              onChange={event => setSplit(Number(event.target.value))}
            />
          </label>
          <p className="field-help">
            {crops.length} · {t('Paires détectées — cliquez pour appliquer')}
          </p>
          <div className="cinggu-eye-crops">
            {crops.map((artwork, index) => (
              <button
                type="button"
                key={index}
                aria-label={`${t('Appliquer la paire')} ${index + 1}`}
                onClick={() => onChange(artwork)}
              >
                <ArtworkPreview artwork={artwork} />
                <span>{index + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {(error || detectionError) && <p role="alert">{error || detectionError}</p>}
      {value && (
        <>
          <ArtworkPreview artwork={value} />
          <div className="cinggu-head-actions">
            {(['left', 'right'] as const).map(side => (
              <Button
                key={side}
                variant="outline"
                onClick={() => {
                  if (!requireAccountSave()) return
                  const url = URL.createObjectURL(
                    new Blob([eyeSvg(value[side])], { type: 'image/svg+xml' })
                  )
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `cinggu-${side}-eye.svg`
                  a.click()
                  setTimeout(() => URL.revokeObjectURL(url), 1000)
                }}
              >
                {t(side === 'left' ? 'SVG œil gauche' : 'SVG œil droit')}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={() => onChange(undefined)}>
            {t('Revenir aux yeux procéduraux')}
          </Button>
        </>
      )}
    </details>
  )
}
