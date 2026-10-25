import { useState } from 'react'
import { ChevronDown, Copy, Heart } from 'lucide-react'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/ui/menu'
import { useStudioLanguage } from '@/i18n'

// Payment options appear only in the header; Export keeps source and licence links.
const supportNumber = '087785191978'
const supportUrl = 'https://9552156224053.gumroad.com/coffee?wanted=true'

export function CreatorSupport({ details = false }: { details?: boolean }) {
  const { t } = useStudioLanguage()
  const [feedback, setFeedback] = useState('')
  async function copyNumber(provider: string) {
    try {
      await navigator.clipboard.writeText(supportNumber)
      setFeedback(`${provider}: ${t('Numéro copié')}`)
    } catch {
      setFeedback(`${provider}: ${supportNumber}`)
    }
  }
  if (details)
    return (
      <section className="creator-support-details">
        <h2>{t('Code source et licence')}</h2>
        <a href="./source.html" target="_blank" rel="noreferrer">
          {t('Projet original et crédits')}
        </a>
        <a href="./cinggu-avatar-source.tar.gz" download>
          {t('Télécharger le code source correspondant')}
        </a>
      </section>
    )
  return (
    <Menu>
      <MenuTrigger className="source-license-link creator-support-trigger">
        <Heart size={15} />
        {t('Soutenir')}
        <ChevronDown size={14} />
      </MenuTrigger>
      <MenuContent>
        <MenuItem onClick={() => void copyNumber('GoPay')}>
          <Copy size={14} />
          GoPay · {supportNumber}
        </MenuItem>
        <MenuItem onClick={() => void copyNumber('OVO')}>
          <Copy size={14} />
          OVO · {supportNumber}
        </MenuItem>
        <MenuItem render={<a href={supportUrl} target="_blank" rel="noreferrer" />}>
          {t('International · soutenir sur Gumroad')}
        </MenuItem>
        <p className="creator-support-feedback" role="status">
          {feedback || t('Copiez le numéro puis ouvrez votre application de paiement.')}
        </p>
      </MenuContent>
    </Menu>
  )
}
