// Manual extraction: Wikidata JSON (wbgetentities) for the curated Entités.
//   pnpm data:extract:wikidata
// Writes trimmed, frozen extracts to data-src/raw/wikidata/ (committed) so the
// build stays reproducible and offline. WDQS is never used for dates (ADR 0001).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { WdClaim, WdEntity } from './wikidata.ts'

const API = 'https://www.wikidata.org/w/api.php'
const USER_AGENT =
  'world-history-atlas/0.1 (https://github.com/A-N-O-D-E-R/world-history-atlas)'
const PROPS = [
  'P571',
  'P576',
  'P580',
  'P582',
  'P36',
  'P1365',
  'P1366',
  'P155',
  'P156',
  'P1448',
  'P625',
]
const QUALIFIERS = ['P580', 'P582']
const LANGS = ['fr', 'en']

const root = resolve(import.meta.dirname, '..')
const out = resolve(root, 'data-src/raw/wikidata')
mkdirSync(out, { recursive: true })
const curated: { id: string }[] = JSON.parse(
  readFileSync(resolve(root, 'data-src/curated/entities.json'), 'utf8'),
)

async function get(
  ids: string[],
  props: string,
): Promise<Record<string, WdEntity>> {
  const params = new URLSearchParams({
    action: 'wbgetentities',
    format: 'json',
    ids: ids.join('|'),
    props,
    languages: LANGS.join('|'),
    sitefilter: 'frwiki|enwiki',
    maxlag: '5',
  })
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${API}?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
    })
    const body = res.ok
      ? ((await res.json()) as {
          entities?: Record<string, WdEntity>
          error?: unknown
        })
      : null
    if (body?.entities) return body.entities
    if (attempt === 4)
      throw new Error(
        `wbgetentities: HTTP ${res.status} ${JSON.stringify(body?.error ?? '')}`,
      )
    await new Promise((r) => setTimeout(r, 5_000 * attempt)) // maxlag / 429
  }
}

const chunks = <T>(list: T[], n: number) =>
  Array.from({ length: Math.ceil(list.length / n) }, (_, i) =>
    list.slice(i * n, i * n + n),
  )

/** Keep only what the converter reads: smaller, reviewable diffs. */
function trim(e: WdEntity): WdEntity {
  const claims: Record<string, WdClaim[]> = {}
  for (const p of PROPS) {
    const list = e.claims?.[p]
    if (!list?.length) continue
    claims[p] = list.map((c) => ({
      rank: c.rank,
      mainsnak: {
        snaktype: c.mainsnak.snaktype,
        ...(c.mainsnak.datavalue && {
          datavalue: { value: c.mainsnak.datavalue.value },
        }),
      },
      ...(c.qualifiers && {
        qualifiers: Object.fromEntries(
          QUALIFIERS.filter((q) => c.qualifiers![q]).map((q) => [
            q,
            c.qualifiers![q].map((s) => ({
              snaktype: s.snaktype,
              ...(s.datavalue && { datavalue: { value: s.datavalue.value } }),
            })),
          ]),
        ),
      }),
    }))
  }
  return {
    id: e.id,
    labels: e.labels,
    aliases: e.aliases,
    sitelinks: e.sitelinks,
    claims,
  }
}

const referenced = new Set<string>()
for (const batch of chunks(
  curated.map((c) => c.id),
  50,
)) {
  const entities = await get(batch, 'labels|aliases|claims|sitelinks')
  for (const id of batch) {
    const e = entities[id]
    if (!e || 'missing' in e) throw new Error(`${id} introuvable sur Wikidata`)
    const t = trim(e)
    for (const c of t.claims?.P36 ?? []) {
      const v = c.mainsnak.datavalue?.value as { id?: string } | undefined
      if (v?.id) referenced.add(v.id)
    }
    writeFileSync(resolve(out, `${id}.json`), JSON.stringify(t, null, 1) + '\n')
    console.log(`${id} ${e.labels?.fr?.value ?? e.labels?.en?.value ?? ''}`)
  }
}

// Labels of referenced items (capitals), fr/en.
const labels: Record<string, { fr?: string; en?: string }> = {}
for (const batch of chunks([...referenced].sort(), 50)) {
  const entities = await get(batch, 'labels')
  for (const [id, e] of Object.entries(entities))
    labels[id] = Object.fromEntries(
      LANGS.flatMap((l) => (e.labels?.[l] ? [[l, e.labels[l].value]] : [])),
    )
}
writeFileSync(
  resolve(out, '_labels.json'),
  JSON.stringify(labels, null, 1) + '\n',
)
console.log(
  `${curated.length} Entités, ${referenced.size} libellés de capitales`,
)
