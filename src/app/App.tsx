import { loadCloudWorkspace } from '@/features/account/cloud'
import { loadStudioDocument, parseImportedStudioDocument } from '@/features/studio/studioDocument'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { accountSnapshot, subscribeAccount } from '@/features/account/session'
import { StudioView } from '@/features/studio/components/StudioView'
import { useStudioController } from '@/features/studio/useStudioController'
import { StudioLanguageProvider } from '@/i18n'

function CloudStudio({ userId }: { userId: string | null }) {
  const [ready, setReady] = useState(!userId)
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void loadCloudWorkspace(userId)
      .then(document => {
        if (cancelled) return
        if (document)
          try {
            const parsed = parseImportedStudioDocument(
              JSON.stringify(document),
              loadStudioDocument()
            )
            localStorage.setItem(`cinggu-matching-preview-v1:${userId}`, JSON.stringify(parsed))
          } catch {
            /* Keep the existing local copy if the cloud document is incompatible. */
          }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [userId])
  return ready ? <StudioApp /> : <p role="status">Loading your Cinggu library…</p>
}

function StudioApp() {
  const controller = useStudioController()
  return <StudioView {...controller} />
}

export default function App() {
  const account = useSyncExternalStore(subscribeAccount, accountSnapshot)
  return (
    <StudioLanguageProvider>
      {account.ready ? (
        <CloudStudio key={account.userId ?? 'guest'} userId={account.userId} />
      ) : (
        <p role="status">Checking account…</p>
      )}
    </StudioLanguageProvider>
  )
}
