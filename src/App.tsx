import { useTranslation } from 'react-i18next'
import MapView from './map/MapView'
import { useResolved } from './query/useResolved.ts'
import SnapshotBanner from './ui/SnapshotBanner.tsx'
import LangSelect from './ui/LangSelect'
import Panels from './ui/Panels'
import SourcesPage from './ui/SourcesPage.tsx'
import WorldButton from './ui/WorldButton.tsx'
import TimelineDock from './ui/TimelineDock'

export default function App() {
  const { t } = useTranslation()
  const { resolved, missing } = useResolved()
  return (
    <main className="app">
      <MapView resolved={resolved} />
      <SnapshotBanner resolved={resolved} missing={missing} />
      <h1 className="brand">{t('brand')}</h1>
      <LangSelect />
      <Panels resolved={resolved} />
      <WorldButton />
      <SourcesPage />
      <TimelineDock />
    </main>
  )
}
