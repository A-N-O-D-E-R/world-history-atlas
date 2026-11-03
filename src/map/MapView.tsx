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
  const selectedEntity = useAtlas((s) => s.selectedEntity)

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
    // Historical territory first, otherwise the Pays actuel underneath.
    m.on('click', (e) => {
      const [polity] = m.queryRenderedFeatures(e.point, {
        layers: ['polity-fill'],
      })
      if (polity)
        return useAtlas
          .getState()
          .selectEntity(String(polity.properties.entity))
      const [country] = m.queryRenderedFeatures(e.point, {
        layers: ['countries'],
      })
      const p = country?.properties
      if (p)
        useAtlas.getState().selectCountry({
          code: p.ADM0_A3,
          names: { fr: p.NAME_FR || p.NAME_EN, en: p.NAME_EN || p.NAME_FR },
        })
    })
    let hover: string | number | undefined
    const setHover = (id?: string | number) => {
      if (hover !== undefined)
        m.setFeatureState({ source: 'polities', id: hover }, { hover: false })
      hover = id
      if (id !== undefined)
        m.setFeatureState({ source: 'polities', id }, { hover: true })
      m.getCanvas().style.cursor = id !== undefined ? 'pointer' : ''
    }
    m.on('mousemove', 'polity-fill', (e) => setHover(e.features?.[0]?.id))
    m.on('mouseleave', 'polity-fill', () => setHover())
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

  useEffect(() => {
    if (!map || !selectedEntity) return
    const target = { source: 'polities', id: selectedEntity }
    map.setFeatureState(target, { selected: true })
    return () => {
      map.setFeatureState(target, { selected: false })
    }
  }, [map, selectedEntity])

  // Year change: swap the source data only (no map reload); ignore stale loads.
  useEffect(() => {
    if (!map) return
    let stale = false
    snapshotsCollection(resolved).then(
      (data) => {
        if (stale) return
        map.getSource<GeoJSONSource>('polities')?.setData(data)
        // Rendered-state marker (used by end-to-end tests).
        map.once('idle', () => {
          if (!stale)
            container.current!.dataset.snapshots = resolved
              .map((r) => r.snapshot.id)
              .join(' ')
        })
      },
      (e) => console.error(e),
    )
    return () => {
      stale = true
    }
  }, [map, resolved])

  return <div ref={container} className="map" />
}
