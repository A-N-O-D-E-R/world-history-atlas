import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { Protocol } from 'pmtiles'
import { useEffect, useRef, useState } from 'react'
import { type BasemapLayer, useAtlas } from '../state/atlasStore'
import type { GeoJSONSource } from 'maplibre-gl'
import type { Resolved } from '../query/resolve.ts'
import { basemapStyle } from './basemapStyle'
import { addPolityLayers, snapshotsCollection } from './polities.ts'

maplibregl.setWorkerUrl(workerUrl)
maplibregl.addProtocol('pmtiles', new Protocol().tile)

export default function MapView({ resolved }: { resolved: Resolved[] }) {
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
        useAtlas.getState().selectCountry({
          code: p.ADM0_A3,
          names: { fr: p.NAME_FR || p.NAME_EN, en: p.NAME_EN || p.NAME_FR },
        })
    })
    m.on(
      'mouseenter',
      'countries',
      () => (m.getCanvas().style.cursor = 'pointer'),
    )
    m.on('mouseleave', 'countries', () => (m.getCanvas().style.cursor = ''))
    m.on('load', () => {
      addPolityLayers(m)
      setMap(m)
    })
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

  // Year change: swap the source data only (no map reload); ignore stale loads.
  useEffect(() => {
    if (!map) return
    let stale = false
    snapshotsCollection(resolved).then(
      (data) => {
        if (!stale) map.getSource<GeoJSONSource>('polities')?.setData(data)
      },
      (e) => console.error(e),
    )
    return () => {
      stale = true
    }
  }, [map, resolved])

  return <div ref={container} className="map" />
}
