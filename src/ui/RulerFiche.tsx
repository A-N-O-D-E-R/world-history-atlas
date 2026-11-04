import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadIndex } from '../query/data.ts'
import { loadRuler } from '../query/details.ts'
import { displayName } from '../query/names.ts'
import { type Lang, formatDate } from '../shared/dates.ts'
import type { EntityIndexEntry, PublishedRuler } from '../shared/schema.ts'
import { useAtlas } from '../state/atlasStore.ts'

export default function RulerFiche({
  id,
  onClose,
}: {
  id: string
  onClose: () => void
}) {
  const { t, i18n } = useTranslation()
  const lang = (i18n.resolvedLanguage ?? 'fr') as Lang
  const selectEntity = useAtlas((s) => s.selectEntity)
  const [data, setData] = useState<{
    id: string
    ruler: PublishedRuler
    index: EntityIndexEntry[]
  } | null>(null)
  useEffect(() => {
    let stale = false
    Promise.all([loadRuler(id), loadIndex()]).then(
      ([ruler, index]) => !stale && setData({ id, ruler, index }),
      (e) => console.error(e),
    )
    return () => {
      stale = true
    }
  }, [id])
  if (data?.id !== id) return <p className="muted">{t('fiche.loading')}</p>
  const { ruler, index } = data
  const entityName = (e: string) => {
    const entry = index.find((x) => x.id === e)
    return entry ? displayName(entry.names, lang, e) : e
  }
  const life = [
    ruler.birth && formatDate(ruler.birth, lang),
    ruler.death && formatDate(ruler.death, lang),
  ]
  const wiki = ruler.wikipedia?.[lang]
    ? lang
    : ruler.wikipedia?.fr
      ? 'fr'
      : null

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
      <h2>{displayName(ruler.names, lang, ruler.id)}</h2>
      <p className="muted small">{t('ruler.kind')}</p>
      <dl>
        {(life[0] || life[1]) && (
          <>
            <dt>{t('ruler.life')}</dt>
            <dd>
              {life[0] ?? '?'} – {life[1] ?? '?'}
            </dd>
          </>
        )}
        <dt>{t('ruler.reigns')}</dt>
        <dd>
          <ul className="reigns">
            {ruler.reigns.map((r, i) => (
              <li key={i}>
                {displayName(r.title, lang)},{' '}
                <button
                  type="button"
                  className="link"
                  onClick={() => selectEntity(r.entity)}
                >
                  {entityName(r.entity)}
                </button>
                <div className="muted small">
                  {formatDate(r.from, lang)} –{' '}
                  {r.to ? formatDate(r.to, lang) : '?'}
                </div>
              </li>
            ))}
          </ul>
        </dd>
        <dt>{t('fiche.sources')}</dt>
        <dd>
          <a
            href={`https://www.wikidata.org/wiki/${ruler.id}`}
            target="_blank"
            rel="noreferrer"
          >
            {t('ruler.source')}
          </a>{' '}
          <span className="muted small">(CC0-1.0)</span>
        </dd>
      </dl>
      {wiki && (
        <p>
          <a
            href={`https://${wiki}.wikipedia.org/wiki/${ruler.wikipedia![wiki]}`}
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
