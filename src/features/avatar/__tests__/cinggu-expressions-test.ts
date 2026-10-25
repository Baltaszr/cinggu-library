import { describe, it, expect } from 'vitest'
import { cingguExpressions, addCingguExpressions } from '../cingguExpressions'
import { validEyeArtwork } from '../eyeArtwork'
import { withCingguExpressions, type StudioDocument } from '../../studio/studioDocument'
import baseline from '../../studio/defaultStudioDocument.json'

describe('bundled Cinggu expressions', () => {
  it('includes all 13 reference pairs with unique public names', () => {
    expect(cingguExpressions).toHaveLength(13)
    expect(new Set(cingguExpressions.map(e => e.semanticKey)).size).toBe(13)
    expect(cingguExpressions.every(e => validEyeArtwork(e.eyeArtwork))).toBe(true)
  })
  it('adds missing pairs without replacing custom copies or duplicating the pack', () => {
    const custom = { ...cingguExpressions[0], widthLeft: 81 }
    const result = addCingguExpressions([custom])
    expect(result).toHaveLength(13)
    expect(result.find(e => e.id === custom.id)?.widthLeft).toBe(81)
    expect(addCingguExpressions(result)).toEqual(result)
  })
  it('upgrades personalized mascots once and respects later deletion', () => {
    const document = structuredClone(baseline) as unknown as StudioDocument
    document.library.avatars[0].behavior = {
      expressions: document.expressions,
      sequences: document.sequences,
    }
    const result = withCingguExpressions(document)
    expect(result.library.avatars[0].behavior?.expressions.slice(0, 13).map(e => e.id)).toEqual(
      cingguExpressions.map(e => e.id)
    )
    const deleted = { ...result, expressions: result.expressions.slice(1) }
    expect(withCingguExpressions(deleted)).toBe(deleted)
  })
})
