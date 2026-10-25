import { describe, expect, it } from 'vitest'
import { defaultExpression } from '@/features/avatar/presets'
import { createExpressionPackagePreview, resolveSequenceExpression } from '../sequences'

describe('expression package preview', () => {
  it('plays imported and built-in presets in order without replacing their artwork', () => {
    const presets = [
      { ...defaultExpression, id: 'uploaded-eyes', label: 'My smile' },
      { ...defaultExpression, id: 'cinggu-reference-love' },
    ]
    const original = structuredClone(presets)
    const preview = createExpressionPackagePreview(presets, 'My expressions')
    expect(preview.steps.map(step => step.expressionId)).toEqual(presets.map(preset => preset.id))
    expect(resolveSequenceExpression(presets, preview.steps[0].expressionId).expression).toBe(
      presets[0]
    )
    expect(preview.steps.every(step => step.holdMs >= 3000)).toBe(true)
    expect(preview.blink.enabled).toBe(false)
    expect(preview.playbackMode).toBe('loop')
    expect(presets).toEqual(original)
  })
  it('does not invent expressions for an empty package', () => {
    expect(createExpressionPackagePreview([], 'Empty').steps).toEqual([])
  })
})
