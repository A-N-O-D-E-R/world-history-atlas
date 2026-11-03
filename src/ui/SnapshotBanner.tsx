import { useTranslation } from 'react-i18next'
import { type Lang, formatDate } from '../shared/dates.ts'
import type { Resolved } from '../query/resolve.ts'

/** Never present a border as exact when it does not cover the displayed year. */
export default function SnapshotBanner({ resolved }: { resolved: Resolved[] }) {
  const { t, i18n } = useTranslation()
  const lang = (i18n.resolvedLanguage ?? 'fr') as Lang
  const inexact = resolved.filter((r) => !r.exact)
  if (!inexact.length) return null
  return (
    <ul className="snapshot-banner" role="status">
      {inexact.map(({ entity, snapshot }) => {
        const from = formatDate(snapshot.from, lang)
        const to = snapshot.to
          ? formatDate(snapshot.to, lang)
          : t('snapshot.now')
        return (
          <li key={entity.id}>
            {t('snapshot.nearest', {
              name: entity.names[lang] ?? entity.names.fr ?? entity.id,
              from,
              to,
            })}
          </li>
        )
      })}
    </ul>
  )
}
