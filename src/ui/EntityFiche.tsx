import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadEntity, loadSnapshotProps, loadSource } from '../query/details.ts'
import { displayName } from '../query/names.ts'
import type { Resolved } from '../query/resolve.ts'
import { type Lang, formatDate } from '../shared/dates.ts'
import type {
  PublishedEntity,
  PublishedSnapshotProps,
  PublishedSource,
} from '../shared/schema.ts'

interface Details {
  entity: PublishedEntity
  snapshot: PublishedSnapshotProps | null
  sources: PublishedSource[]
}

function useDetails(
  id: string,
  snapshotId: string | undefined,
): Details | null {
  const [details, setDetails] = useState<{
    key: string
    value: Details
  } | null>(null)
  const key = `${id}|${snapshotId ?? ''}`
  useEffect(() => {
    let stale = false
    ;(async () => {
      const entity = await loadEntity(id)
      const snapshot = snapshotId ? await loadSnapshotProps(snapshotId) : null
      const ids = snapshot
        ? [snapshot.source, ...snapshot.extraSources]
        : entity.sources
      const sources = await Promise.all(ids.map(loadSource))
      if (!stale) setDetails({ key, value: { entity, snapshot, sources } })
    })().catch((e) => console.error(e))
    return () => {
      stale = true
    }
  }, [id, snapshotId, key])
  return details?.key === key ? details.value : null
}

export default function EntityFiche({
  id,
  resolved,
  onClose,
}: {
  id: string
  resolved?: Resolved
  onClose: () => void
}) {
  const { t, i18n } = useTranslation()
  const lang = (i18n.resolvedLanguage ?? 'fr') as Lang
  const details = useDetails(id, resolved?.snapshot.id)
  if (!details) return <p className="muted">{t('fiche.loading')}</p>
  const { entity, snapshot, sources } = details
  const name = displayName(entity.names, lang, entity.id)
  const existence = `${formatDate(entity.start, lang)} – ${entity.end ? formatDate(entity.end, lang) : t('snapshot.now')}`

  return (
    <section aria-label={t('tabs.fiche')} className="fiche">
      <button
        type="button"
        className="close"
        aria-label={t('fiche.close')}
        onClick={onClose}
      >
        ✕
      </button>
      <h2>{name}</h2>
      <p className="muted small">
        {t(`entityType.${entity.type}`, { defaultValue: entity.type })}
      </p>

      <dl>
        <dt>{t('fiche.existence')}</dt>
        <dd>{existence}</dd>
        <dt>{t('fiche.border')}</dt>
        <dd>
          {snapshot && resolved ? (
            <>
              {formatDate(snapshot.from, lang)} –{' '}
              {snapshot.to ? formatDate(snapshot.to, lang) : t('snapshot.now')}
              {!resolved.exact && (
                <span className="warn"> {t('fiche.notExact')}</span>
              )}
            </>
          ) : (
            t('fiche.noBorder')
          )}
        </dd>
        {snapshot && (
          <>
            <dt>{t('fiche.reliability')}</dt>
            <dd>
              <span className={`reliability ${snapshot.reliability}`}>
                {t(`reliability.${snapshot.reliability}`)}
              </span>
              {snapshot.note && (
                <span className="muted small"> — {snapshot.note}</span>
              )}
            </dd>
          </>
        )}
        <dt>{t('fiche.sources')}</dt>
        <dd>
          <ul className="sources">
            {sources.map((s) => (
              <li key={s.id}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}{' '}
                <span className="muted small">({s.licence})</span>
                {s.attribution && (
                  <div className="muted small">{s.attribution}</div>
                )}
              </li>
            ))}
          </ul>
        </dd>
      </dl>
      {(entity.wikipedia?.[lang] ?? entity.wikipedia?.fr) && (
        <p>
          <a
            href={`https://${entity.wikipedia?.[lang] ? lang : 'fr'}.wikipedia.org/wiki/${entity.wikipedia?.[lang] ?? entity.wikipedia?.fr}`}
            target="_blank"
            rel="noreferrer"
          >
            {t('fiche.wikipedia')}
          </a>
        </p>
      )}
    </section>
  )
}
