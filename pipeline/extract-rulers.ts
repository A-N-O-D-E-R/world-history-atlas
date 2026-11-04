// Manual extraction: holders of the curated positions (Dirigeants).
//   pnpm data:extract:rulers
// WDQS only collects the person QIDs (ADR 0001); every fact, dates
// included, is read from the wbgetentities JSON and frozen in
// data-src/raw/wikidata-rulers/.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { WdClaim, WdEntity } from './wikidata.ts'

const API = 'https://www.wikidata.org/w/api.php'
const WDQS = 'https://query.wikidata.org/sparql'
const USER_AGENT =
  'world-history-atlas/0.1 (https://github.com/A-N-O-D-E-R/world-history-atlas)'
const LANGS = ['fr', 'en']

const root = resolve(import.meta.dirname, '..')
const out = resolve(root, 'data-src/raw/wikidata-rulers')
const config: { positions: { entities: string[]; positions: string[] }[] } =
  JSON.parse(
    readFileSync(resolve(root, 'data-src/curated/rulers.json'), 'utf8'),
  )
const positions = [...new Set(config.positions.flatMap((p) => p.positions))]

async function retry<T>(
  label: string,
  run: () => Promise<T | null>,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const v = await run()
    if (v) return v
    if (attempt === 5) throw new Error(`${label} : échec après 5 essais`)
    await new Promise((r) => setTimeout(r, 5_000 * attempt))
  }
}

// ---- holders (WDQS: identifiers only) ----
const sparql = `SELECT DISTINCT ?p WHERE { VALUES ?pos { ${positions.map((q) => `wd:${q}`).join(' ')} } ?p p:P39/ps:P39 ?pos . }`
const holders: string[] = await retry('WDQS', async () => {
  const res = await fetch(
    `${WDQS}?${new URLSearchParams({ query: sparql, format: 'json' })}`,
    {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/sparql-results+json',
      },
    },
  )
  if (!res.ok) return null
  const body = (await res.json()) as {
    results: { bindings: { p: { value: string } }[] }
  }
  return body.results.bindings.map((b) => b.p.value.split('/').pop()!).sort()
})
console.log(`${holders.length} titulaires`)

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
  return retry('wbgetentities', async () => {
    const res = await fetch(`${API}?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
    })
    const body = res.ok
      ? ((await res.json()) as { entities?: Record<string, WdEntity> })
      : null
    return body?.entities ?? null
  })
}

const snak = (s: WdClaim['mainsnak']) => ({
  snaktype: s.snaktype,
  ...(s.datavalue && { datavalue: { value: s.datavalue.value } }),
})
const keep = (list: WdClaim[] | undefined, qualifiers: string[] = []) =>
  (list ?? []).map((c) => ({
    rank: c.rank,
    mainsnak: snak(c.mainsnak),
    ...(c.qualifiers && {
      qualifiers: Object.fromEntries(
        qualifiers
          .filter((q) => c.qualifiers![q])
          .map((q) => [q, c.qualifiers![q].map(snak)]),
      ),
    }),
  }))
const posSet = new Set(positions)

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
for (let i = 0; i < holders.length; i += 50) {
  const batch = holders.slice(i, i + 50)
  const entities = await get(batch, 'labels|aliases|claims|sitelinks')
  for (const id of batch) {
    const e = entities[id]
    if (!e?.claims) continue
    const p39 = (e.claims.P39 ?? []).filter((c) =>
      posSet.has((c.mainsnak.datavalue?.value as { id?: string })?.id ?? ''),
    )
    const trimmed: WdEntity = {
      id,
      labels: e.labels,
      aliases: e.aliases,
      sitelinks: e.sitelinks,
      claims: {
        P39: keep(p39, ['P580', 'P582']),
        P569: keep(e.claims.P569),
        P570: keep(e.claims.P570),
        P53: keep(e.claims.P53),
      },
    }
    writeFileSync(
      resolve(out, `${id}.json`),
      JSON.stringify(trimmed, null, 1) + '\n',
    )
  }
  console.log(`  ${Math.min(i + 50, holders.length)}/${holders.length}`)
}

// Position labels (Règne titles), fr/en.
const labels = await get(positions, 'labels')
writeFileSync(
  resolve(out, '_positions.json'),
  JSON.stringify(
    Object.fromEntries(
      Object.entries(labels).map(([id, e]) => [
        id,
        Object.fromEntries(
          LANGS.flatMap((l) => (e.labels?.[l] ? [[l, e.labels[l].value]] : [])),
        ),
      ]),
    ),
    null,
    1,
  ) + '\n',
)
