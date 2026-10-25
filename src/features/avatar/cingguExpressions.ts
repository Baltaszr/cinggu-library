import { artworkFromFrame, joinEyeArtwork } from './eyeArtwork'
import artwork from './cingguExpressionArtwork.json'
import { defaultExpression } from './presets'
import type { Expression } from './geometry'

// Reference drawings are bundled once, so every mascot starts with Cinggu eyes
// without requiring an upload. Copies remain editable and deletable per mascot.
export const cingguExpressions: Expression[] = artwork.map(item => ({
  ...defaultExpression,
  id: `cinggu-reference-${item.name}`,
  semanticKey: `cinggu-${item.name}`,
  widthLeft: 64,
  widthRight: 64,
  heightLeft: 64,
  heightRight: 64,
  spacing: 64,
  positionXLeft: 0,
  positionXRight: 0,
  positionYLeft: 0,
  positionYRight: 0,
  eyeArtwork: artworkFromFrame(joinEyeArtwork(item.eyeArtwork)),
}))

export function addCingguExpressions(expressions: Expression[]): Expression[] {
  const missing = cingguExpressions.filter(
    preset =>
      !expressions.some(
        existing => existing.id === preset.id || existing.semanticKey === preset.semanticKey
      )
  )
  return [...structuredClone(missing), ...expressions]
}
