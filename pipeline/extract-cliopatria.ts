// Manual extraction: Cliopatria (Seshat) polygons → Snapshots filling the gaps
// left by OpenHistoricalMap.
//   pnpm data:extract:cliopatria   (run after data:extract:ohm)
// The 46 MB release zip is downloaded to .cache/ (not committed); only the
// selected, simplified Snapshots are written to data-src/snapshots/.
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { makeDatePoint } from '../src/shared/dates.ts'
import { fileOf } from '../src/shared/schema.ts'
import { type ClioProps, entityOf, interval, select } from './cliopatria.ts'
import { simplifyValid } from './geometry.ts'

const root = resolve(import.meta.dirname, '..')
const config: { version: string; url: string; byName: Record<string, string> } =
  JSON.parse(
    readFileSync(resolve(root, 'data-src/curated/cliopatria.json'), 'utf8'),
  )
const curated = new Set<string>(
  JSON.parse(
    readFileSync(resolve(root, 'data-src/curated/entities.json'), 'utf8'),
  ).map((c: { id: string }) => c.id),
)

// ---- download (cached) ----
const cache = resolve(root, '.cache/cliopatria')
mkdirSync(cache, { recursive: true })
const zip = resolve(cache, `cliopatria-${config.version}.geojson.zip`)
if (!existsSync(zip)) {
  console.log(`download ${config.url}`)
  const res = await fetch(config.url)
  if (!res.ok) throw new Error(`Cliopatria : HTTP ${res.status}`)
  writeFileSync(zip, Buffer.from(await res.arrayBuffer()))
}
const geojsonFile = readdirSync(cache).find((f) => f.endsWith('.geojson'))
if (!geojsonFile) execFileSync('unzip', ['-o', '-q', zip, '-d', cache])
const file = readdirSync(cache).find((f) => f.endsWith('.geojson'))!
type Feature = { properties: ClioProps; geometry: { type: string } }
const data: { features: Feature[] } = JSON.parse(
  readFileSync(resolve(cache, file), 'utf8'),
)

// ---- periods already covered by OHM Snapshots, per Entité (in days) ----
const dir = resolve(root, 'data-src/snapshots')
const day = (year: number) => makeDatePoint(String(year), 'year').sortKey
const ohm = new Map<string, [number, number][]>()
for (const f of readdirSync(dir).filter(
  (f) => f.startsWith('wha_ohm-') && f.endsWith('.json'),
)) {
  const s = JSON.parse(readFileSync(resolve(dir, f), 'utf8'))
  const key = (d: {
    value: string
    precision: 'day' | 'month' | 'year' | 'century'
    calendar: 'gregorian' | 'julian'
  }) => makeDatePoint(d.value, d.precision, d.calendar).sortKey
  ohm.set(s.entity, [
    ...(ohm.get(s.entity) ?? []),
    [key(s.from), s.to ? key(s.to) : Infinity],
  ])
}
/** Is [from, to[ (years) entirely covered by the union of OHM intervals? */
function coveredByOhm(entity: string, from: number, to: number) {
  let cursor = day(from)
  const end = day(to)
  for (const [a, b] of [...(ohm.get(entity) ?? [])].sort(
    (x, y) => x[0] - y[0],
  )) {
    if (a > cursor) break
    cursor = Math.max(cursor, b)
    if (cursor >= end) return true
  }
  return cursor >= end
}

// ---- select records ----
const byEntity = new Map<string, { props: ClioProps; feature: Feature }[]>()
for (const feature of data.features) {
  const entity = entityOf(feature.properties, curated, config.byName)
  if (!entity || !/Polygon$/.test(feature.geometry?.type ?? '')) continue
  byEntity.set(entity, [
    ...(byEntity.get(entity) ?? []),
    { props: feature.properties, feature },
  ])
}

for (const f of readdirSync(dir))
  if (f.startsWith('wha_clio-')) rmSync(resolve(dir, f))
const tag = (y: number) => (y < 0 ? `m${-y}` : String(y))
let written = 0
let skipped = 0
for (const [entity, records] of [...byEntity].sort()) {
  const chosen = select(records, (from, to) => coveredByOhm(entity, from, to))
  for (const { props, feature } of chosen) {
    const { from, to } = interval(props)
    const input = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: {}, geometry: feature.geometry },
      ],
    })
    const geojson = await simplifyValid(input, ['10%', '30%', null])
    if (!geojson) {
      console.warn(
        `  ${props.Name} ${props.FromYear}–${props.ToYear} : polygone invalide, ignoré`,
      )
      skipped++
      continue
    }
    const id = `wha:clio-${entity.toLowerCase()}-${tag(from)}`
    const base = resolve(dir, fileOf(id))
    writeFileSync(`${base}.geojson`, geojson)
    const year = (y: number) => ({
      value: String(y),
      calendar: 'gregorian',
      precision: 'year',
    })
    const meta = {
      id,
      entity,
      from: year(from),
      to: year(to),
      source: 'wha:cliopatria',
      note: `Cliopatria ${config.version} : « ${props.Name} » ${props.FromYear}–${props.ToYear}`,
    }
    writeFileSync(`${base}.json`, JSON.stringify(meta, null, 2) + '\n')
    written++
  }
  console.log(
    `${entity} : ${chosen.length}/${records.length} enregistrements retenus`,
  )
}
console.log(`${written} Snapshots Cliopatria écrits, ${skipped} ignorés`)
