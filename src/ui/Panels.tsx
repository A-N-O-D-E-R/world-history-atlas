import { type BasemapLayer, useAtlas } from '../state/atlasStore'

const LAYER_LABELS: Record<BasemapLayer, string> = {
  'modern-borders': 'Frontières modernes',
  coast: 'Côtes',
}

function ExplorePanel() {
  return (
    <section aria-label="Explorer">
      <h2>Explorer</h2>
      <p className="muted">
        Atlas historique du monde. Les données historiques arrivent pays par
        pays, en commençant par la France.
      </p>
      <p>
        <a
          href="https://github.com/A-N-O-D-E-R/world-history-atlas"
          target="_blank"
          rel="noreferrer"
        >
          Contribuer sur GitHub
        </a>
      </p>
    </section>
  )
}

function LayersPanel() {
  const layers = useAtlas((s) => s.layers)
  const setLayer = useAtlas((s) => s.setLayer)
  return (
    <section aria-label="Couches">
      <h2>Couches</h2>
      {(Object.keys(LAYER_LABELS) as BasemapLayer[]).map((id) => (
        <label key={id} className="check">
          <input
            type="checkbox"
            checked={layers[id]}
            onChange={(e) => setLayer(id, e.target.checked)}
          />
          {LAYER_LABELS[id]}
        </label>
      ))}
    </section>
  )
}

function FichePanel() {
  const country = useAtlas((s) => s.selectedCountry)
  const select = useAtlas((s) => s.selectCountry)
  if (!country)
    return <p className="muted">Cliquez sur un territoire de la carte.</p>
  return (
    <section aria-label="Fiche">
      <button
        type="button"
        className="close"
        aria-label="Fermer la fiche"
        onClick={() => select(null)}
      >
        ✕
      </button>
      <h2>{country.name}</h2>
      <p className="muted small">Pays actuel</p>
      <p>Pas encore de données historiques pour ce territoire.</p>
    </section>
  )
}

export default function Panels() {
  const { leftTab, lastLeftTab, rightOpen, toggleLeft, toggleRight } =
    useAtlas()
  return (
    <>
      <aside
        className={`side side-left ${leftTab ? '' : 'off'}`}
        aria-hidden={!leftTab}
      >
        {lastLeftTab === 'layers' ? <LayersPanel /> : <ExplorePanel />}
      </aside>
      <nav
        className={`tabs tabs-left ${leftTab ? 'shifted' : ''}`}
        aria-label="Panneaux de gauche"
      >
        <button
          type="button"
          aria-pressed={leftTab === 'explore'}
          onClick={() => toggleLeft('explore')}
        >
          Explorer
        </button>
        <button
          type="button"
          aria-pressed={leftTab === 'layers'}
          onClick={() => toggleLeft('layers')}
        >
          Couches
        </button>
      </nav>
      <aside
        className={`side side-right ${rightOpen ? '' : 'off'}`}
        aria-hidden={!rightOpen}
      >
        <FichePanel />
      </aside>
      <nav
        className={`tabs tabs-right ${rightOpen ? 'shifted' : ''}`}
        aria-label="Panneau de droite"
      >
        <button type="button" aria-pressed={rightOpen} onClick={toggleRight}>
          Fiche
        </button>
      </nav>
    </>
  )
}
