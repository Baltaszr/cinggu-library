import { accountClient, savingUserId } from './session'

// One private workspace per account. Optimistic timestamps prevent silent multi-tab overwrites.
let revision: string | null = null
let owner: string | null = null
let timer: ReturnType<typeof setTimeout> | undefined
let pending: unknown = null
let writing = false
let status = 'Not synced'
const listeners = new Set<() => void>()
export const cloudSnapshot = () => status
export const subscribeCloud = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
function report(message: string) {
  status = message
  listeners.forEach(listener => listener())
}

export async function loadCloudWorkspace(userId: string): Promise<unknown | null> {
  clearTimeout(timer)
  pending = null
  owner = userId
  revision = null
  if (!accountClient) return null
  const { data, error } = await accountClient
    .from('library_workspaces')
    .select('document,updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (owner !== userId) return null
  if (error) {
    report('Cloud unavailable — edits remain in this browser')
    return null
  }
  revision = data?.updated_at ?? null
  report(data ? 'Saved to Cinggu' : 'Ready to save to Cinggu')
  return data?.document ?? null
}
export function queueCloudWorkspace(document: unknown) {
  const userId = savingUserId()
  if (!userId || userId !== owner || !accountClient) return
  pending = document
  clearTimeout(timer)
  report('Saving to Cinggu…')
  timer = setTimeout(() => void flushCloudWorkspace(), 1500)
}
async function flushCloudWorkspace() {
  if (writing || !pending || !accountClient || savingUserId() !== owner) return
  const document = pending,
    userId = owner,
    expected = revision
  pending = null
  writing = true
  try {
    const query = expected
      ? accountClient
          .from('library_workspaces')
          .update({ document })
          .eq('user_id', userId!)
          .eq('updated_at', expected)
      : accountClient.from('library_workspaces').insert({ user_id: userId, document })
    const { data, error } = await query.select('updated_at').maybeSingle()
    if (owner !== userId) return
    if (error || !data) {
      pending = null
      report('Cloud save failed or changed elsewhere — reload before saving again')
      return
    }
    revision = data.updated_at
    report('Saved to Cinggu')
  } catch {
    report('Cloud unavailable — edits remain in this browser')
  } finally {
    writing = false
    if (pending) timer = setTimeout(() => void flushCloudWorkspace(), 1500)
  }
}
