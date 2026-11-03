import { useTranslation } from 'react-i18next'
import MapView from './map/MapView'
import LangSelect from './ui/LangSelect'
import Panels from './ui/Panels'

export default function App() {
  const { t } = useTranslation()
  return (
    <main className="app">
      <MapView />
      <h1 className="brand">{t('brand')}</h1>
      <LangSelect />
      <Panels />
    </main>
  )
}
