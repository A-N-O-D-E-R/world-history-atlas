import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadSources } from '../query/data.ts'
import { LICENCE_NAMES, LICENCE_URLS } from '../shared/licences.ts'
import type { PublishedSource } from '../shared/schema.ts'

export const SOURCES_HASH = '#sources'

/** « Sources et licences », generated from the published Sources (open with #sources). */
export default function SourcesPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(() => location.hash === SOURCES_HASH)
  const [sources, setSources] = useState<PublishedSource[] | null>(null)

  useEffect(() => {
    const onHash = () => setOpen(location.hash === SOURCES_HASH)
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        history.replaceState(null, '', location.pathname + location.search)
        setOpen(false)
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open])
  useEffect(() => {
    if (open && !sources)
      loadSources().then(setSources, (e) => console.error(e))
  }, [open, sources])
  if (!open) return null

  const close = () => {
    history.replaceState(null, '', location.pathname + location.search)
    setOpen(false) // replaceState does not fire hashchange
  }
  const licence = (id: string) => LICENCE_NAMES[id] ?? t('sources.publicDomain')
  return (
    <div className="page-backdrop" onClick={close}>
      <section
        className="page"
        role="dialog"
        aria-modal="true"
        aria-label={t('sources.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="close"
          aria-label={t('sources.close')}
          onClick={close}
        >
          ✕
        </button>
        <h2>{t('sources.title')}</h2>
        <p className="muted">{t('sources.intro')}</p>
        {!sources ? (
          <p className="muted">{t('fiche.loading')}</p>
        ) : (
          <ul className="source-list">
            {sources.map((s) => (
              <li key={s.id}>
                <h3>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.name}
                    </a>
                  ) : (
                    s.name
                  )}
                </h3>
                <p>
                  {LICENCE_URLS[s.licence] ? (
                    <a
                      href={LICENCE_URLS[s.licence]}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {licence(s.licence)}
                    </a>
                  ) : (
                    licence(s.licence)
                  )}{' '}
                  ·{' '}
                  <span className={`reliability ${s.reliability}`}>
                    {t(`reliability.${s.reliability}`)}
                  </span>
                </p>
                {s.attribution && <p className="small">{s.attribution}</p>}
                <dl className="small">
                  {s.author && (
                    <>
                      <dt>{t('sources.author')}</dt>
                      <dd>{s.author}</dd>
                    </>
                  )}
                  {s.published && (
                    <>
                      <dt>{t('sources.published')}</dt>
                      <dd>{s.published}</dd>
                    </>
                  )}
                  {s.scale && (
                    <>
                      <dt>{t('sources.scale')}</dt>
                      <dd>{s.scale}</dd>
                    </>
                  )}
                  {s.method && (
                    <>
                      <dt>{t('sources.method')}</dt>
                      <dd>{s.method}</dd>
                    </>
                  )}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
