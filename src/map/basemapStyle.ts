import type { StyleSpecification } from 'maplibre-gl'

export const PALETTE = {
  sea: '#c9d3c7',
  land: '#efe4cc',
  coast: '#8a6d4b',
  border: '#7a5a3a',
  highlight: '#b08a3e',
}

/** Parchment style over the Natural Earth PMTiles basemap. */
export function basemapStyle(pmtilesUrl: string): StyleSpecification {
  return {
    version: 8,
    sources: {
      basemap: {
        type: 'vector',
        url: `pmtiles://${pmtilesUrl}`,
        attribution: '© Natural Earth',
      },
    },
    layers: [
      {
        id: 'sea',
        type: 'background',
        paint: { 'background-color': PALETTE.sea },
      },
      {
        id: 'land',
        type: 'fill',
        source: 'basemap',
        'source-layer': 'land',
        paint: { 'fill-color': PALETTE.land },
      },
      // Invisible hit layer for Pays actuel selection, plus a filtered highlight.
      {
        id: 'countries',
        type: 'fill',
        source: 'basemap',
        'source-layer': 'countries',
        paint: { 'fill-color': PALETTE.highlight, 'fill-opacity': 0 },
      },
      {
        id: 'country-selected',
        type: 'fill',
        source: 'basemap',
        'source-layer': 'countries',
        filter: ['==', ['get', 'ADM0_A3'], ''],
        paint: { 'fill-color': PALETTE.highlight, 'fill-opacity': 0.25 },
      },
      {
        id: 'coast',
        type: 'line',
        source: 'basemap',
        'source-layer': 'land',
        paint: {
          'line-color': PALETTE.coast,
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.4, 7, 1.2],
        },
      },
      {
        id: 'modern-borders',
        type: 'line',
        source: 'basemap',
        'source-layer': 'boundaries',
        paint: {
          'line-color': PALETTE.border,
          'line-opacity': 0.6,
          'line-dasharray': [3, 2],
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.3, 7, 1],
        },
      },
    ],
  }
}
