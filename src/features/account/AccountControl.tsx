import { useEffect, useState, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { useStudioLanguage } from '@/i18n'
import { accountClient, accountSnapshot, subscribeAccount, creatorSignInUrl } from './session'
import { cloudSnapshot, subscribeCloud } from './cloud'

// All hosted sign-in happens on the creator site; no tokens travel through URLs.
export function AccountControl() {
  const { t } = useStudioLanguage()
  const account = useSyncExternalStore(subscribeAccount, accountSnapshot)
  const cloud = useSyncExternalStore(subscribeCloud, cloudSnapshot)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener('cinggu-sign-in', show)
    return () => window.removeEventListener('cinggu-sign-in', show)
  }, [])
  return (
    <div className="cinggu-account">
      <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
        {account.userId ? t('Mon compte') : t('Se connecter pour enregistrer')}
      </Button>
      {open && (
        <div className="cinggu-account-panel" role="dialog" aria-label={t('Compte Cinggu')}>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            {t('Fermer')}
          </Button>
          {account.userId ? (
            <>
              <p>{account.email}</p>
              <p role="status">{t(cloud)}</p>
              <p>
                {t(
                  'Your account and saved-library activity are visible to the Cinggu owner. Drawings stay private unless you share them.'
                )}
              </p>
              <Button
                onClick={async () => {
                  await accountClient?.auth.signOut({ scope: 'local' })
                  setOpen(false)
                }}
              >
                {t('Se déconnecter')}
              </Button>
            </>
          ) : (
            <>
              <p>
                {t(
                  'Try the full editor as a guest. Sign in on Cinggu to save your library across devices. Guest edits are temporary.'
                )}
              </p>
              <a className="source-license-link" href={creatorSignInUrl} target="_top">
                {t('Continue to Cinggu sign-in')}
              </a>
            </>
          )}
        </div>
      )}
    </div>
  )
}
