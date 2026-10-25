import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { createAvatarDefinition } from '../avatarDefinition'
import { resolveAvatarBehavior } from '../avatars'
import legacyStarters from '../../studio/legacyStarterAvatars.json'
import { parseStudioDocument, loadStudioDocument } from '../../studio/studioDocument'

it('keeps the consumer fixture synchronized with the preserved upstream Strobi example', async () => {
  const bundled = loadStudioDocument({ getItem: () => null })
  // The historical consumer example deliberately excludes the new Cinggu pack.
  bundled.expressions = bundled.expressions.filter(
    expression => !expression.id.startsWith('cinggu-reference-')
  )
  const document = parseStudioDocument(
    { ...bundled, library: { activeAvatarId: 'strobi', avatars: legacyStarters } },
    bundled
  )
  const avatar = document.library.avatars.find(candidate => candidate.id === 'strobi')
  if (!avatar) throw new Error('Bundled Strobi avatar not found')
  const behavior = resolveAvatarBehavior(avatar, {
    expressions: document.expressions,
    sequences: document.sequences,
  })
  const result = createAvatarDefinition({ avatar, behavior })
  if (!result.ok) throw new Error(result.errors.map(error => error.message).join('\n'))
  const fixture = await readFile(
    resolve('examples/react-vite-consumer/src/strobi.avatar.json'),
    'utf8'
  )
  expect(JSON.parse(fixture)).toEqual(result.value)
})
