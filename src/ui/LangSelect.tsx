import { useTranslation } from 'react-i18next'
import { LANGS } from '../i18n'

export default function LangSelect() {
  const { t, i18n } = useTranslation()
  return (
    <label className="lang">
      <span className="sr-only">{t('lang.label')}</span>
      <select
        value={i18n.resolvedLanguage}
        onChange={(e) => void i18n.changeLanguage(e.target.value)}
      >
        {LANGS.map((l) => (
          <option key={l} value={l}>
            {t(`lang.${l}`)}
          </option>
        ))}
      </select>
    </label>
  )
}
