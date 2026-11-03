// Geometry helpers shared by the extraction scripts.
import booleanValid from '@turf/boolean-valid'
import kinks from '@turf/kinks'
import mapshaper from 'mapshaper'

/**
 * Simplify a FeatureCollection as much as the levels allow while keeping
 * valid, non self-intersecting polygons. Returns GeoJSON text, or null.
 */
export async function simplifyValid(
  input: string,
  levels: (string | null)[] = ['3%', '10%', '30%', null],
) {
  for (const level of levels) {
    const simplify = level ? `-simplify ${level} keep-shapes -clean` : ''
    const out = await mapshaper.applyCommands(
      `-i in.json -clean ${simplify} -o out.json format=geojson geojson-type=FeatureCollection precision=0.0001`,
      { 'in.json': input },
    )
    const text = String(out['out.json'])
    const fc = JSON.parse(text) as { features: { geometry: never }[] }
    if (
      fc.features.length &&
      fc.features.every(
        (f) =>
          booleanValid(f.geometry) && kinks(f.geometry).features.length === 0,
      )
    )
      return text
  }
  return null
}
