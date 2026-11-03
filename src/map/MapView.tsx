import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { useEffect, useRef } from 'react'
import { basemapStyle } from './basemapStyle'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

maplibregl.setWorkerUrl(workerUrl)
maplibregl.addProtocol('pmtiles', new Protocol().tile)

export default function MapView() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const url = new URL('data/basemap.pmtiles', document.baseURI).href
    const map = new maplibregl.Map({
      container: container.current!,
      style: basemapStyle(url),
      center: [10, 42],
      zoom: 2.5,
      maxZoom: 9,
      attributionControl: { compact: true },
    })
    return () => map.remove()
  }, [])

  return <div ref={container} className="map" />
}
