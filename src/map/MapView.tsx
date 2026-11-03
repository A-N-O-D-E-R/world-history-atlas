import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { Protocol } from 'pmtiles'
import { useEffect, useRef, useState } from 'react'
import { type BasemapLayer, useAtlas } from '../state/atlasStore'
import { basemapStyle } from './basemapStyle'

maplibregl.setWorkerUrl(workerUrl)
maplibregl.addProtocol('pmtiles', new Protocol().tile)

export default function MapView() {
  const container = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const layers = useAtlas((s) => s.layers)
  const selected = useAtlas((s) => s.selectedCountry)

  useEffect(() => {
    const url = new URL('data/basemap.pmtiles', document.baseURI).href
    const m = new maplibregl.Map({
      container: container.current!,
      style: basemapStyle(url),
      center: [10, 42],
      zoom: 2.5,
      maxZoom: 9,
      attributionControl: { compact: true },
    })
    m.on('click', 'countries', (e) => {
      const p = e.features?.[0]?.properties
      if (p)
        useAtlas
          .getState()
          .selectCountry({ code: p.ADM0_A3, name: p.NAME_FR || p.NAME_EN })
    })
    m.on(
      'mouseenter',
      'countries',
      () => (m.getCanvas().style.cursor = 'pointer'),
    )
    m.on('mouseleave', 'countries', () => (m.getCanvas().style.cursor = ''))
    m.on('load', () => setMap(m))
    return () => m.remove()
  }, [])

  useEffect(() => {
    if (!map) return
    for (const [id, visible] of Object.entries(layers) as [
      BasemapLayer,
      boolean,
    ][])
      map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
  }, [map, layers])

  useEffect(() => {
    map?.setFilter('country-selected', [
      '==',
      ['get', 'ADM0_A3'],
      selected?.code ?? '',
    ])
  }, [map, selected])

  return <div ref={container} className="map" />
}
