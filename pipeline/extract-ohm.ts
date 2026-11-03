// Manual extraction: OpenHistoricalMap relations → Snapshots in data-src/.
//   pnpm data:extract:ohm
// The curated list (data-src/curated/ohm-snapshots.json) maps OHM relations
// to Entités politiques. Geometry is simplified with mapshaper; member ways
// carrying their own licence are credited through extraSources.
import mapshaper from 'mapshaper'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import osmtogeojson from 'osmtogeojson'
import { fileOf } from '../src/shared/schema.ts'

const OVERPASS = 'https://overpass-api.openhistoricalmap.org/api/interpreter'
const USER_AGENT =
  'world-history-atlas/0.1 (https://github.com/A-N-O-D-E-R/world-history-atlas)'
/** Licences found on member ways → Source crediting them. */
const LICENCE_SOURCES: Record<string, string> = {
  'CC-BY-4.0': 'wha:cnig-lilim',
}

const root = resolve(import.meta.dirname, '..')
const curated: { relation: number; entity: string; id: string }[] = JSON.parse(
  readFileSync(resolve(root, 'data-src/curated/ohm-snapshots.json'), 'utf8'),
)

interface OsmElement {
  type: string
  id: number
  tags?: Record<string, string>
}

async function overpass(query: string): Promise<{ elements: OsmElement[] }> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(OVERPASS, {
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ data: query }),
    })
    if (res.ok) return (await res.json()) as { elements: OsmElement[] }
    if (attempt === 3 || ![429, 504].includes(res.status))
      throw new Error(`Overpass HTTP ${res.status}`)
    await new Promise((r) => setTimeout(r, 30_000 * attempt))
  }
}

/** OHM ISO date ("1697-09-20", "1718") → DateSrc. */
export function ohmDate(value: string) {
  const parts = value.split('-').filter(Boolean).length
  return {
    value,
    calendar: 'gregorian',
    precision: ['year', 'month', 'day'][parts - 1],
  } as const
}

for (const { relation, entity, id } of curated) {
  console.log(`relation ${relation} → ${id}`)
  const osm = await overpass(
    `[out:json][timeout:120];rel(${relation});(._;>;);out body;`,
  )
  const rel = osm.elements.find(
    (e: { type: string; id: number }) =>
      e.type === 'relation' && e.id === relation,
  )
  if (!rel) throw new Error(`relation ${relation} introuvable`)
  const tags = rel.tags ?? {}
  if (tags.license && tags.license !== 'CC0-1.0')
    throw new Error(`relation ${relation}: licence ${tags.license}`)

  const licences = new Set<string>(
    osm.elements.flatMap((e: { type: string; tags?: { license?: string } }) =>
      e.type === 'way' && e.tags?.license && e.tags.license !== 'CC0-1.0'
        ? [e.tags.license]
        : [],
    ),
  )
  const extraSources = [...licences].map((l) => {
    const source = LICENCE_SOURCES[l]
    if (!source)
      throw new Error(
        `relation ${relation}: licence de segment non gérée « ${l} »`,
      )
    return source
  })

  const gj = osmtogeojson(osm)
  const feature = gj.features.find(
    (f) =>
      f.id === `relation/${relation}` &&
      /Polygon$/.test(f.geometry?.type ?? ''),
  )
  if (!feature) throw new Error(`relation ${relation}: aucun polygone assemblé`)
  const input = JSON.stringify({
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: feature.geometry }],
  })
  const out = await mapshaper.applyCommands(
    '-i in.json -clean -simplify 3% keep-shapes -clean -o out.json format=geojson geojson-type=FeatureCollection precision=0.0001',
    { 'in.json': input },
  )

  const base = resolve(root, 'data-src/snapshots', fileOf(id))
  writeFileSync(`${base}.geojson`, String(out['out.json']))
  const meta = {
    id,
    entity,
    from: ohmDate(tags.start_date),
    ...(tags.end_date && { to: ohmDate(tags.end_date) }),
    source: 'wha:ohm',
    ...(extraSources.length && { extraSources }),
    note: `OpenHistoricalMap relation ${relation} (${tags.name ?? ''})`,
  }
  writeFileSync(`${base}.json`, JSON.stringify(meta, null, 2) + '\n')
}
