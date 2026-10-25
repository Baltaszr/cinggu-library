import { queueCloudWorkspace } from '../account/cloud'
import { savingUserId } from '../account/session'
import { artworkFromFrame, joinEyeArtwork } from '../avatar/eyeArtwork'
import { addCingguExpressions } from '../avatar/cingguExpressions'
import {
  parseAvatarLibrary,
  parseExpressions,
  restoreLegacyBehaviorSemanticKeys,
  type AvatarBehaviorLibrary,
  type AvatarLibrary,
} from '../avatar/avatars'
import type { Expression } from '../avatar/geometry'
import {
  normalizeSequencesForExpressions,
  parseSequences,
  type AvatarSequence,
} from '../animation/sequences'
import defaultStudioDocument from './defaultStudioDocument.json'
import legacyStarters from './legacyStarterAvatars.json'

export type StatePlaybackSelection = { stateId: string | null; playing: boolean }

export type StudioDocument = {
  version: 2
  cingguExpressionsVersion?: 1 | 2
  library: AvatarLibrary
  expressions: Expression[]
  sequences: AvatarSequence[]
  playback: StatePlaybackSelection
}

export type StudioDocumentPatch = Partial<Omit<StudioDocument, 'version'>>

const DOCUMENT_STORAGE_KEY = 'cinggu-matching-preview-v1'

const defaultPlayback: StatePlaybackSelection = { stateId: 'idle', playing: true }

const parsePlayback = (
  value: unknown,
  fallback: StatePlaybackSelection = defaultPlayback
): StatePlaybackSelection => {
  const candidate = value as Partial<StatePlaybackSelection> | null
  if (!candidate || (typeof candidate.stateId !== 'string' && candidate.stateId !== null)) {
    return { ...fallback }
  }
  return { stateId: candidate.stateId, playing: candidate.playing === true }
}

export const parseStudioDocument = (value: unknown, fallback: StudioDocument): StudioDocument => {
  const candidate = value as Partial<StudioDocument> | null
  if (!candidate || candidate.version !== 2) return fallback
  const expressions =
    Array.isArray(candidate.expressions) && candidate.expressions.length
      ? parseExpressions(candidate.expressions)
      : fallback.expressions
  const sequences = Array.isArray(candidate.sequences)
    ? normalizeSequencesForExpressions(parseSequences(candidate.sequences), expressions)
    : fallback.sequences
  const baseBehavior = restoreLegacyBehaviorSemanticKeys(
    { expressions, sequences },
    { expressions: fallback.expressions, sequences: fallback.sequences }
  )
  const library = parseAvatarLibrary(candidate.library, fallback.library, baseBehavior)
  return {
    version: 2,
    ...(candidate.cingguExpressionsVersion === 1 || candidate.cingguExpressionsVersion === 2
      ? { cingguExpressionsVersion: candidate.cingguExpressionsVersion }
      : {}),
    library,
    expressions: baseBehavior.expressions,
    sequences: baseBehavior.sequences,
    playback: parsePlayback(candidate.playback, fallback.playback),
  }
}

export const serializeStudioDocument = (document: StudioDocument) =>
  JSON.stringify(document, null, 2)

export const parseImportedStudioDocument = (
  source: string,
  fallback: StudioDocument
): StudioDocument => {
  let value: unknown
  try {
    value = JSON.parse(source)
  } catch {
    throw new Error('Invalid Avatar Studio project')
  }
  const candidate = value as Partial<StudioDocument> | null
  if (!candidate || candidate.version !== 2) {
    throw new Error('Unsupported Avatar Studio project')
  }
  if (
    !candidate.library ||
    !Array.isArray(candidate.library.avatars) ||
    !candidate.library.avatars.length ||
    !Array.isArray(candidate.expressions) ||
    !candidate.expressions.length ||
    !Array.isArray(candidate.sequences)
  ) {
    throw new Error('Invalid Avatar Studio project')
  }
  return parseStudioDocument(candidate, fallback)
}

// Upgrade existing previews once; never overwrite custom eyes or restore deleted presets.
export function withCingguExpressions(document: StudioDocument): StudioDocument {
  if (document.cingguExpressionsVersion === 2) return document
  const upgrade = (expressions: Expression[]) => {
    const fixed = expressions.map(expression =>
      expression.eyeArtwork
        ? { ...expression, eyeArtwork: artworkFromFrame(joinEyeArtwork(expression.eyeArtwork)) }
        : expression
    )
    return document.cingguExpressionsVersion === 1 ? fixed : addCingguExpressions(fixed)
  }
  return {
    ...document,
    cingguExpressionsVersion: 2,
    expressions: upgrade(document.expressions),
    library: {
      ...document.library,
      avatars: document.library.avatars.map(avatar => ({
        ...avatar,
        ...(avatar.behavior
          ? { behavior: { ...avatar.behavior, expressions: upgrade(avatar.behavior.expressions) } }
          : {}),
      })),
    },
  }
}

const createBundledStudioDocument = () => {
  const snapshot = JSON.parse(JSON.stringify(defaultStudioDocument)) as StudioDocument
  return withCingguExpressions(parseStudioDocument(snapshot, snapshot))
}

export const loadStudioDocument = (
  storage: Pick<Storage, 'getItem'> = window.localStorage
): StudioDocument => {
  const fallback = createBundledStudioDocument()
  try {
    const saved = JSON.parse(
      storage.getItem(
        savingUserId() ? `${DOCUMENT_STORAGE_KEY}:${savingUserId()}` : DOCUMENT_STORAGE_KEY
      ) ?? 'null'
    ) as StudioDocument | null
    if (
      !saved?.library?.avatars?.some(a => fallback.library.avatars.some(f => f.id === a.id)) &&
      saved?.library?.avatars?.some(avatar => legacyStarters.some(old => old.id === avatar.id))
    ) {
      const kept = saved.library.avatars.filter(
        avatar =>
          !legacyStarters.some(
            old =>
              old.id === avatar.id &&
              JSON.stringify(old.body) === JSON.stringify(avatar.body) &&
              JSON.stringify(old.eyes) === JSON.stringify(avatar.eyes) &&
              JSON.stringify(old.colors) === JSON.stringify(avatar.colors) &&
              old.name === avatar.name &&
              !avatar.behavior &&
              (!avatar.renderStyle || avatar.renderStyle.type === 'vector')
          )
      )
      saved.library.avatars = [
        ...fallback.library.avatars.filter(a => !kept.some(k => k.id === a.id)),
        ...kept,
      ]
      if (!kept.some(a => a.id === saved.library.activeAvatarId))
        saved.library.activeAvatarId = 'cinggu'
    }
    return withCingguExpressions(parseStudioDocument(saved, fallback))
  } catch {
    return fallback
  }
}

export const persistStudioDocument = (document: StudioDocument) => {
  const userId = savingUserId()
  if (!userId) return false
  try {
    window.localStorage.setItem(`${DOCUMENT_STORAGE_KEY}:${userId}`, JSON.stringify(document))
    queueCloudWorkspace(document)
    return true
  } catch {
    // The in-memory document remains authoritative when storage is unavailable.
    return false
  }
}

export const clearPersistedStudioDocument = (
  storage: Pick<Storage, 'removeItem'> = window.localStorage
) => {
  try {
    storage.removeItem(
      savingUserId() ? `${DOCUMENT_STORAGE_KEY}:${savingUserId()}` : DOCUMENT_STORAGE_KEY
    )
    return true
  } catch {
    return false
  }
}

export const createStudioDocumentStore = (
  initial: StudioDocument,
  persist: (document: StudioDocument) => void = persistStudioDocument
) => {
  let current = initial
  return {
    update: (patch: StudioDocumentPatch) => {
      const expressions = patch.expressions ?? current.expressions
      current = {
        ...current,
        ...patch,
        version: 2,
        expressions,
        sequences: normalizeSequencesForExpressions(
          patch.sequences ?? current.sequences,
          expressions
        ),
      }
      persist(current)
      return current
    },
  }
}
