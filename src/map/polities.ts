import type { Feature, FeatureCollection } from 'geojson'
import type { Map as MapLibre } from 'maplibre-gl'
import { loadSnapshot } from '../query/data.ts'
import type { Resolved } from '../query/resolve.ts'

const COLORS = [
  '#c9a27a',
  '#a9b38a',
  '#b98d8d',
  '#c4a35a',
  '#c7b07d',
  '#a68fb3',
  '#b5a28a',
]

/** Stable muted colour per Entité politique. */
export function colorOf(id: string): string {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return COLORS[h % COLORS.length]
}

export function addPolityLayers(map: MapLibre) {
  map.addSource('polities', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })
  map.addLayer(
    {
      id: 'polity-fill',
      type: 'fill',
      source: 'polities',
      paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.55 },
    },
    'coast',
  )
  map.addLayer(
    {
      id: 'polity-line',
      type: 'line',
      source: 'polities',
      paint: {
        'line-color': '#5a3d22',
        'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.8, 7, 2],
      },
    },
    'coast',
  )
}

/** Feature collection of the resolved Snapshots (geometries loaded lazily, cached). */
export async function snapshotsCollection(
  resolved: Resolved[],
): Promise<FeatureCollection> {
  const collections = await Promise.all(
    resolved.map((r) => loadSnapshot(r.snapshot.id)),
  )
  const features: Feature[] = collections.flatMap((fc, i) =>
    fc.features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        color: colorOf(resolved[i].entity.id),
        exact: resolved[i].exact,
      },
    })),
  )
  return { type: 'FeatureCollection', features }
}
