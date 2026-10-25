import { CreatorSupport } from './CreatorSupport'
import { AccountControl } from '@/features/account/AccountControl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StudioController } from '@/features/studio/useStudioController'
import { type StudioLanguage } from '@/i18n'

type StudioIdentityProps = Pick<StudioController, 'language' | 'setLanguage' | 't'> & {
  className?: string
}

export function StudioIdentity({ className = '', language, setLanguage, t }: StudioIdentityProps) {
  return (
    <div className={`studio-identity ${className}`.trim()}>
      <div className="brand">
        <a href="/" aria-label="Cinggu creator dashboard">
          <img src="./brand/cinggu-wordmark.svg" alt="Cinggu" width="120" />
        </a>{' '}
        <em>{t('atelier de personnages')}</em>
      </div>
      <AccountControl />
      <div className="language-picker">
        <CreatorSupport />
        <Select
          value={language}
          items={[
            { value: 'en', label: '🇬🇧' },
            { value: 'id', label: '🇮🇩' },
            { value: 'fr', label: '🇫🇷' },
            { value: 'zh-CN', label: '🇨🇳' },
          ]}
          onValueChange={next => next && setLanguage(next as StudioLanguage)}
        >
          <SelectTrigger aria-label={t('Langue de l’interface')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
            <SelectItem value="fr">🇫🇷</SelectItem>
            <SelectItem value="zh-CN">🇨🇳</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
