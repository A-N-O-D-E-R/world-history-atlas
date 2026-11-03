import MapView from './map/MapView'
import Panels from './ui/Panels'

export default function App() {
  return (
    <main className="app">
      <MapView />
      <h1 className="brand">World History Atlas</h1>
      <Panels />
    </main>
  )
}
