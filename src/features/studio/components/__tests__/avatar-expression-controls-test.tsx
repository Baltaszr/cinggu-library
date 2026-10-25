// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
vi.mock('../AvatarSheetImporter', () => ({ AvatarSheetImporter: () => null }))
import { cleanup, fireEvent, render } from '@testing-library/react'
import { AvatarPage } from '../AvatarDrawer'
import { defaultExpression } from '@/features/avatar/presets'
import type { StudioController } from '../../useStudioController'

afterEach(cleanup)
it('keeps packages separate and follows newly saved expressions without reloading', () => {
  const expressions = [
    { ...defaultExpression, id: 'cinggu-reference-love', label: 'Love' },
    { ...defaultExpression, id: 'base-smile', label: 'Base smile' },
  ]
  const controller = {
    expressions,
    activeExpression: null,
    activeAvatarId: 'cinggu',
    avatars: [],
    t: (text: string) => text,
  } as unknown as StudioController
  const view = render(<AvatarPage controller={controller} />)
  const packages = view.getByLabelText('Paquet d’expressions') as HTMLSelectElement
  const picker = view.getByLabelText('Expression') as HTMLSelectElement
  expect(packages.value).toBe('Cinggu')
  expect([...picker.options].map(option => option.text)).not.toContain('Base smile')
  const uploaded = {
    ...defaultExpression,
    id: 'my-eyes',
    label: 'My new eyes',
    packageName: 'My pack',
  }
  view.rerender(
    <AvatarPage
      controller={{ ...controller, expressions: [...expressions, uploaded], activeExpression: 2 }}
    />
  )
  expect(packages.value).toBe('My pack')
  expect(picker.value).toBe('my-eyes')
  expect([...packages.options].map(option => option.value)).toEqual(['Cinggu', 'Base', 'My pack'])
  let applied = ''
  view.rerender(
    <AvatarPage
      controller={{
        ...controller,
        expressions: [...expressions, uploaded],
        activeExpression: 2,
        transitionToExpression: preset => {
          applied = preset.id
        },
      }}
    />
  )
  fireEvent.change(packages, { target: { value: 'Base' } })
  expect(applied).toBe('base-smile')
  expect([...picker.options].map(option => option.text)).not.toContain('Love')
})
