// Manual extraction: OpenHistoricalMap boundaries → Snapshots in data-src/.
//   pnpm data:extract:ohm
// Relations are discovered by their `wikidata` tag among the curated
// Entités (data-src/curated/entities.json), plus manual entries
// (data-src/curated/ohm.json) for relations without a usable tag.
// OHM dates use historical years like ours (-0058 = 58 BCE, no year 0).
// Member ways under another licence are credited through extraSources;
// an unknown licence stops the extraction.
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import osmtogeojson from 'osmtogeojson'
import { makeDatePoint } from '../src/shared/dates.ts'
import { fileOf } from '../src/shared/schema.ts'
import { simplifyValid } from './geometry.ts'
import { ohmDate } from './ohm.ts'

const OVERPASS = 'https://overpass-api.openhistoricalmap.org/api/interpreter'
const USER_AGENT =
  'world-history-atlas/0.1 (https://github.com/A-N-O-D-E-R/world-history-atlas)'
const BATCH = 10

/** Way licence (+ source tag pattern) → Source crediting it. */
const LICENCE_SOURCES: { licence: string; source: RegExp; id: string }[] = [
  { licence: 'CC-BY-4.0', source: /cnig\.es/i, id: 'wha:cnig-lilim' },
  { licence: 'CC-BY-4.0', source: /eprostor\.gov\.si/i, id: 'wha:gurs-si' },
]
/** "CC-BY 4.0", "CC BY 4.0" → "CC-BY-4.0"; "CC0", "CC0 1.0" → "CC0-1.0". */
const normaliseLicence = (l: string) => {
  const n = l
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, '-')
  return n === 'CC0' ? 'CC0-1.0' : n
}

interface OsmElement {
  type: string
  id: number
  tags?: Record<string, string>
  members?: { type: string; ref: number }[]
}

const root = resolve(import.meta.dirname, '..')
const curatedIds: string[] = JSON.parse(
  readFileSync(resolve(root, 'data-src/curated/entities.json'), 'utf8'),
).map((c: { id: string }) => c.id)
const manual: {
  extra: { relation: number; entity: string }[]
  wikidataAliases: Record<string, string>
} = JSON.parse(readFileSync(resolve(root, 'data-src/curated/ohm.json'), 'utf8'))

async function overpass(query: string): Promise<OsmElement[]> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(OVERPASS, {
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ data: query }),
    })
    const text = await res.text()
    // Overpass sometimes answers 200 with an XML/HTML error page (server busy).
    if (res.ok && text.trimStart().startsWith('{'))
      return (JSON.parse(text) as { elements: OsmElement[] }).elements
    if (attempt === 5)
      throw new Error(
        `Overpass HTTP ${res.status} : ${text.slice(0, 300).replace(/\s+/g, ' ')}`,
      )
    console.warn(
      `  Overpass indisponible (HTTP ${res.status}), nouvel essai ${attempt + 1}/5…`,
    )
    await new Promise((r) => setTimeout(r, 20_000 * attempt))
  }
}

// ---- discovery ----
const qids = [...curatedIds, ...Object.keys(manual.wikidataAliases)].join('|')
const tagged = await overpass(
  `[out:json][timeout:170];rel["wikidata"~"^(${qids})$"]["boundary"="administrative"];out tags;`,
)
const targets = new Map<number, string>() // relation → Entité
for (const r of tagged) {
  const q = r.tags!.wikidata
  targets.set(r.id, manual.wikidataAliases[q] ?? q)
}
for (const { relation, entity } of manual.extra) targets.set(relation, entity)
console.log(`${targets.size} relations`)

// ---- previous OHM Snapshots are regenerated ----
const dir = resolve(root, 'data-src/snapshots')
mkdirSync(dir, { recursive: true })
for (const f of readdirSync(dir))
  if (f.startsWith('wha_ohm-')) rmSync(resolve(dir, f))

const relations = [...targets.keys()].sort((a, b) => a - b)
const unknownLicences = new Set<string>()
for (let i = 0; i < relations.length; i += BATCH) {
  const batch = relations.slice(i, i + BATCH)
  const elements = await overpass(
    `[out:json][timeout:170];rel(id:${batch.join(',')});(._;>;);out body;`,
  )
  const ways = new Map(
    elements.filter((e) => e.type === 'way').map((e) => [e.id, e]),
  )
  const gj = osmtogeojson({ elements } as never)

  for (const relation of batch) {
    const rel = elements.find((e) => e.type === 'relation' && e.id === relation)
    const tags = rel?.tags ?? {}
    if (!rel || !tags.start_date) {
      console.warn(
        `  relation ${relation} : ignorée (absente ou sans start_date)`,
      )
      continue
    }
    if (tags.license && normaliseLicence(tags.license) !== 'CC0-1.0')
      throw new Error(`relation ${relation} : licence ${tags.license}`)

    const extraSources = new Set<string>()
    for (const m of rel.members ?? []) {
      const w = m.type === 'way' ? ways.get(m.ref) : undefined
      const licence = w?.tags?.license && normaliseLicence(w.tags.license)
      if (!licence || licence === 'CC0-1.0') continue
      const match = LICENCE_SOURCES.find(
        (l) => l.licence === licence && l.source.test(w!.tags!.source ?? ''),
      )
      if (match) extraSources.add(match.id)
      else
        unknownLicences.add(
          `${licence} (source « ${w!.tags!.source ?? '?'} », relation ${relation})`,
        )
    }

    const feature = gj.features.find(
      (f) =>
        f.id === `relation/${relation}` &&
        /Polygon$/.test(f.geometry?.type ?? ''),
    )
    if (!feature) {
      console.warn(`  relation ${relation} : aucun polygone assemblé, ignorée`)
      continue
    }
    const input = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: {}, geometry: feature.geometry },
      ],
    })
    const geojson = await simplifyValid(input)
    if (!geojson) {
      console.warn(
        `  relation ${relation} : polygone invalide même sans simplification, ignorée`,
      )
      continue
    }
    const id = `wha:ohm-${relation}`
    const base = resolve(dir, fileOf(id))
    const from = ohmDate(tags.start_date)
    const to = tags.end_date ? ohmDate(tags.end_date) : undefined
    const key = (d: typeof from) =>
      'value' in d ? makeDatePoint(d.value, d.precision, d.calendar).sortKey : 0
    if (to && key(to) < key(from)) {
      console.warn(
        `  relation ${relation} : fin (${tags.end_date}) avant début (${tags.start_date}) dans OHM, ignorée`,
      )
      continue
    }
    writeFileSync(`${base}.geojson`, geojson)
    const meta = {
      id,
      entity: targets.get(relation),
      from,
      ...(to && { to }),
      source: 'wha:ohm',
      ...(extraSources.size && { extraSources: [...extraSources] }),
      note: `OpenHistoricalMap relation ${relation} (${tags.name ?? ''})`,
    }
    writeFileSync(`${base}.json`, JSON.stringify(meta, null, 2) + '\n')
  }
  console.log(`  ${Math.min(i + BATCH, relations.length)}/${relations.length}`)
}
if (unknownLicences.size) {
  console.error(
    `Licences de segments sans Source :\n- ${[...unknownLicences].join('\n- ')}`,
  )
  process.exit(1)
}
