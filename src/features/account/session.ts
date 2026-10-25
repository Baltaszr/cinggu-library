import { createClient } from '@supabase/supabase-js'

const env = import.meta.env
export const accountClient =
  env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY
    ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          flowType: 'pkce',
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null

type AccountState = {
  ready: boolean
  userId: string | null
  email: string | null
  expiresAt: number
}
let state: AccountState = { ready: !accountClient, userId: null, email: null, expiresAt: 0 }
const listeners = new Set<() => void>()
export const accountSnapshot = () => state
export const subscribeAccount = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
function publish(next: AccountState) {
  state = next
  listeners.forEach(listener => listener())
}
let revision = 0
async function verifyAccount() {
  const current = ++revision
  if (!accountClient) return
  try {
    const {
      data: { session },
    } = await accountClient.auth.getSession()
    if (!session) {
      if (current === revision) publish({ ready: true, userId: null, email: null, expiresAt: 0 })
      return
    }
    // getUser verifies against Supabase; a browser flag cannot grant account access.
    const { data, error } = await accountClient.auth.getUser()
    if (current !== revision) return
    publish({
      ready: true,
      userId: error ? null : (data.user?.id ?? null),
      email: error ? null : (data.user?.email ?? null),
      expiresAt: session.expires_at ?? 0,
    })
  } catch {
    if (current === revision) publish({ ready: true, userId: null, email: null, expiresAt: 0 })
  }
}
if (accountClient) {
  accountClient.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_OUT') {
      revision++
      publish({ ready: true, userId: null, email: null, expiresAt: 0 })
    }
    setTimeout(() => {
      void verifyAccount()
    }, 0)
  })
  void verifyAccount()
}
export const savingUserId = () =>
  state.userId && state.expiresAt * 1000 > Date.now() ? state.userId : null
export function requireAccountSave() {
  if (savingUserId()) return true
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('cinggu-sign-in'))
  return false
}

export const creatorSignInUrl = `${import.meta.env.VITE_CREATOR_URL || 'https://cingguexpression.eldadbaltaszar.art'}/?advanced=1&signin=1`
