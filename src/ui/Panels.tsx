import { useTranslation } from 'react-i18next'
import type { Resolved } from '../query/resolve.ts'
import { type BasemapLayer, useAtlas } from '../state/atlasStore'
import EntityFiche from './EntityFiche.tsx'

const LAYERS: BasemapLayer[] = ['modern-borders', 'coast']

function ExplorePanel() {
  const { t } = useTranslation()
  return (
    <section aria-label={t('tabs.explore')}>
      <h2>{t('tabs.explore')}</h2>
      <p className="muted">{t('explore.intro')}</p>
      <p>
        <a
          href="https://github.com/A-N-O-D-E-R/world-history-atlas"
          target="_blank"
          rel="noreferrer"
        >
          {t('explore.contribute')}
        </a>
      </p>
    </section>
  )
}

function LayersPanel() {
  const { t } = useTranslation()
  const layers = useAtlas((s) => s.layers)
  const setLayer = useAtlas((s) => s.setLayer)
  return (
    <section aria-label={t('tabs.layers')}>
      <h2>{t('tabs.layers')}</h2>
      {LAYERS.map((id) => (
        <label key={id} className="check">
          <input
            type="checkbox"
            checked={layers[id]}
            onChange={(e) => setLayer(id, e.target.checked)}
          />
          {t(`layers.${id}`)}
        </label>
      ))}
    </section>
  )
}

function FichePanel({ resolved }: { resolved: Resolved[] }) {
  const { t, i18n } = useTranslation()
  const country = useAtlas((s) => s.selectedCountry)
  const entity = useAtlas((s) => s.selectedEntity)
  const select = useAtlas((s) => s.selectCountry)
  const clear = useAtlas((s) => s.clearSelection)
  if (entity)
    return (
      <EntityFiche
        id={entity}
        resolved={resolved.find((r) => r.entity.id === entity)}
        onClose={clear}
      />
    )
  if (!country) return <p className="muted">{t('fiche.empty')}</p>
  return (
    <section aria-label={t('tabs.fiche')}>
      <button
        type="button"
        className="close"
        aria-label={t('fiche.close')}
        onClick={() => select(null)}
      >
        ✕
      </button>
      <h2>
        {i18n.resolvedLanguage === 'en' ? country.names.en : country.names.fr}
      </h2>
      <p className="muted small">{t('fiche.modernCountry')}</p>
      <p>{t('fiche.noData')}</p>
    </section>
  )
}

export default function Panels({ resolved }: { resolved: Resolved[] }) {
  const { t } = useTranslation()
  const { leftTab, lastLeftTab, rightOpen, toggleLeft, toggleRight } =
    useAtlas()
  return (
    <>
      <aside
        className={`side side-left ${leftTab ? '' : 'off'}`}
        inert={!leftTab}
      >
        {lastLeftTab === 'layers' ? <LayersPanel /> : <ExplorePanel />}
      </aside>
      <nav
        className={`tabs tabs-left ${leftTab ? 'shifted' : ''}`}
        aria-label={t('tabs.leftNav')}
      >
        <button
          type="button"
          aria-pressed={leftTab === 'explore'}
          onClick={() => toggleLeft('explore')}
        >
          {t('tabs.explore')}
        </button>
        <button
          type="button"
          aria-pressed={leftTab === 'layers'}
          onClick={() => toggleLeft('layers')}
        >
          {t('tabs.layers')}
        </button>
      </nav>
      <aside
        className={`side side-right ${rightOpen ? '' : 'off'}`}
        inert={!rightOpen}
      >
        <FichePanel resolved={resolved} />
      </aside>
      <nav
        className={`tabs tabs-right ${rightOpen ? 'shifted' : ''}`}
        aria-label={t('tabs.rightNav')}
      >
        <button type="button" aria-pressed={rightOpen} onClick={toggleRight}>
          {t('tabs.fiche')}
        </button>
      </nav>
    </>
  )
}
