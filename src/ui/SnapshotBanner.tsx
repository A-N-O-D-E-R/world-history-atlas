import { useTranslation } from 'react-i18next'
import { type Lang, formatDate } from '../shared/dates.ts'
import { displayName } from '../query/names.ts'
import type { Resolved } from '../query/resolve.ts'
import type { EntityIndexEntry } from '../shared/schema.ts'

/** Never present a border as exact when it does not cover the displayed year. */
export default function SnapshotBanner({
  resolved,
  missing,
}: {
  resolved: Resolved[]
  missing: EntityIndexEntry[]
}) {
  const { t, i18n } = useTranslation()
  const lang = (i18n.resolvedLanguage ?? 'fr') as Lang
  const inexact = resolved.filter((r) => !r.exact)
  if (!inexact.length && !missing.length) return null
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
              name: displayName(entity.names, lang, entity.id),
              from,
              to,
            })}
          </li>
        )
      })}
      {missing.length > 0 && (
        <li className="missing">
          {t('snapshot.missing', {
            names: missing
              .map((e) => displayName(e.names, lang, e.id))
              .join(', '),
          })}
        </li>
      )}
    </ul>
  )
}
