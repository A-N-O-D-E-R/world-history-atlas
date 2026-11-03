// data-src/ → public/data/ : validation + publication (CI, no network).
import turfBbox from '@turf/bbox'
import booleanValid from '@turf/boolean-valid'
import kinks from '@turf/kinks'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import type { ZodType } from 'zod'
import {
  type DatePoint,
  type HistDate,
  isInterval,
  makeDatePoint,
  validate,
} from '../src/shared/dates.ts'
import { type WdEntity, toEntity } from './wikidata.ts'
import {
  type BBox,
  type DateSrc,
  type EntityIndexEntry,
  type EntitySrc,
  LICENCE_WHITELIST,
  type PublishedEntity,
  type PublishedSnapshotProps,
  type SnapshotSrc,
  type SourceSrc,
  entitySrc,
  fileOf,
  snapshotSrc,
  sourceSrc,
} from '../src/shared/schema.ts'

export interface Issue {
  file: string
  message: string
}
export interface Report {
  errors: Issue[]
  warnings: Issue[]
}

const MAX_SNAPSHOT_GZIP = 1024 * 1024

export function buildData(srcDir: string, outDir: string): Report {
  const report: Report = { errors: [], warnings: [] }
  const error = (file: string, message: string) =>
    report.errors.push({ file, message })
  const warn = (file: string, message: string) =>
    report.warnings.push({ file, message })

  function load<T>(
    kind: string,
    schema: ZodType<T>,
  ): { file: string; data: T }[] {
    const dir = join(srcDir, kind)
    if (!existsSync(dir)) return []
    return readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .flatMap((f) => {
        const file = `${kind}/${f}`
        let raw: unknown
        try {
          raw = JSON.parse(readFileSync(join(dir, f), 'utf8'))
        } catch (e) {
          error(file, `JSON invalide : ${(e as Error).message}`)
          return []
        }
        const parsed = schema.safeParse(raw)
        if (!parsed.success) {
          for (const i of parsed.error.issues)
            error(file, `${i.path.join('.') || '(racine)'} : ${i.message}`)
          return []
        }
        return [{ file, data: parsed.data }]
      })
  }

  const sources = load<SourceSrc>('sources', sourceSrc)
  const entities = [
    ...load<EntitySrc>('entities', entitySrc),
    ...loadWikidataEntities(srcDir, error, warn),
  ]
  const snapshots = load<SnapshotSrc>('snapshots', snapshotSrc)

  // ---- identifiers ----
  const seen = new Map<string, string>()
  for (const { file, data } of [...sources, ...entities, ...snapshots]) {
    const prev = seen.get(data.id)
    if (prev)
      error(file, `identifiant dupliqué « ${data.id} » (déjà dans ${prev})`)
    else seen.set(data.id, file)
  }
  const sourceById = new Map(sources.map((s) => [s.data.id, s.data]))
  const entityIds = new Set(entities.map((e) => e.data.id))

  // ---- dates ----
  function toDate(file: string, field: string, d: DateSrc): HistDate | null {
    const point = (p: {
      value: string
      calendar: DatePoint['calendar']
      precision: DatePoint['precision']
    }) => {
      const err = validate(p.value, p.precision, p.calendar)
      if (err) {
        error(file, `${field} « ${p.value} » : ${err}`)
        return null
      }
      return makeDatePoint(p.value, p.precision, p.calendar)
    }
    if ('earliest' in d) {
      const earliest = point(d.earliest)
      const latest = point(d.latest)
      if (!earliest || !latest) return null
      if (latest.sortKey < earliest.sortKey)
        error(file, `${field} : borne « au plus tard » avant « au plus tôt »`)
      return { earliest, latest }
    }
    return point(d)
  }
  const first = (d: HistDate) =>
    isInterval(d) ? d.earliest.sortKey : d.sortKey
  const last = (d: HistDate) => (isInterval(d) ? d.latest.sortKey : d.sortKey)
  function checkInterval(
    file: string,
    from: HistDate | null,
    to: HistDate | null | undefined,
    label: string,
  ) {
    if (from && to && last(to) < first(from))
      error(
        file,
        `intervalle incohérent : ${label} se termine avant de commencer`,
      )
  }

  // ---- sources ----
  for (const { file, data } of sources) {
    if (!data.licence) error(file, 'Source sans licence')
    else if (!(LICENCE_WHITELIST as readonly string[]).includes(data.licence))
      error(
        file,
        `licence « ${data.licence} » hors liste blanche (${LICENCE_WHITELIST.join(', ')})`,
      )
  }
  const checkSourceRef = (file: string, ref: string) => {
    if (!sourceById.has(ref))
      error(file, `référence inexistante : Source « ${ref} »`)
  }

  // ---- snapshots ----
  const refsByEntity = new Map<string, PublishedEntity['snapshots']>()
  const bboxByEntity = new Map<string, BBox>()
  const publishedSnapshots: { id: string; geojson: object }[] = []
  for (const { file, data } of snapshots) {
    if (!entityIds.has(data.entity))
      error(file, `référence inexistante : Entité « ${data.entity} »`)
    if (!data.source) error(file, 'Snapshot sans Source')
    else checkSourceRef(file, data.source)
    for (const ref of data.extraSources) checkSourceRef(file, ref)
    if (data.reliability && !data.note)
      error(file, 'fiabilité surchargée sans note')

    const from = toDate(file, 'from', data.from)
    const to = data.to ? toDate(file, 'to', data.to) : undefined
    checkInterval(file, from, to, 'le Snapshot')

    const geoFile = file.replace(/\.json$/, '.geojson')
    const features = readGeometry(join(srcDir, geoFile), geoFile, error)
    if (!features || !from || to === null || !data.source) continue

    const reliability =
      data.reliability ??
      sourceById.get(data.source)?.reliability ??
      'approximate'
    const props: PublishedSnapshotProps = {
      id: data.id,
      entity: data.entity,
      source: data.source,
      extraSources: data.extraSources,
      from,
      ...(to && { to }),
      reliability,
      ...(data.note && { note: data.note }),
    }
    const geojson = {
      type: 'FeatureCollection',
      features: features.map((f) => ({
        type: 'Feature',
        properties: props,
        geometry: f.geometry,
      })),
    }
    const size = gzipSync(JSON.stringify(geojson)).length
    if (size > MAX_SNAPSHOT_GZIP)
      warn(
        geoFile,
        `Snapshot de ${(size / 1024 / 1024).toFixed(1)} Mo gzip (> 1 Mo)`,
      )

    publishedSnapshots.push({ id: data.id, geojson })
    const {
      entity: _entity,
      source: _source,
      extraSources: _extra,
      note: _note,
      ...ref
    } = props
    refsByEntity.set(data.entity, [
      ...(refsByEntity.get(data.entity) ?? []),
      ref,
    ])
    const b = turfBbox(geojson as never) as BBox
    const prev = bboxByEntity.get(data.entity)
    bboxByEntity.set(
      data.entity,
      prev
        ? [
            Math.min(prev[0], b[0]),
            Math.min(prev[1], b[1]),
            Math.max(prev[2], b[2]),
            Math.max(prev[3], b[3]),
          ]
        : b,
    )
  }

  // ---- entities ----
  const publishedEntities: PublishedEntity[] = []
  for (const { file, data } of entities) {
    for (const ref of [...data.predecessors, ...data.successors])
      if (!entityIds.has(ref))
        error(file, `référence inexistante : Entité « ${ref} »`)
    for (const ref of data.sources) checkSourceRef(file, ref)
    if (!data.names.fr) warn(file, 'libellé fr manquant')
    if (!data.names.en) warn(file, 'libellé en manquant')
    if (!data.wikipedia?.fr && !data.wikipedia?.en)
      warn(file, 'pas de lien Wikipédia')

    const start = toDate(file, 'start', data.start)
    const end = data.end ? toDate(file, 'end', data.end) : undefined
    checkInterval(file, start, end, "l'Entité")
    const refs = (refsByEntity.get(data.id) ?? []).sort(
      (a, b) => first(a.from) - first(b.from),
    )
    if (!refs.length && !data.point) warn(file, 'Entité sans Snapshot ni point')
    if (!start || end === null) continue
    const optDate = (field: string, d?: DateSrc) =>
      d ? (toDate(file, field, d) ?? undefined) : undefined
    const { start: _start, end: _end, originalNames, capitals, ...rest } = data
    publishedEntities.push({
      ...rest,
      start,
      ...(end && { end }),
      originalNames: originalNames.map((n) => ({
        ...n,
        from: optDate('originalNames.from', n.from),
        to: optDate('originalNames.to', n.to),
      })),
      capitals: capitals.map((c) => ({
        ...c,
        from: optDate('capitals.from', c.from),
        to: optDate('capitals.to', c.to),
      })),
      snapshots: refs,
    })
  }

  if (report.errors.length) return report

  // ---- publish ----
  for (const kind of ['entities', 'snapshots', 'sources', 'index']) {
    rmSync(join(outDir, kind), { recursive: true, force: true })
    mkdirSync(join(outDir, kind), { recursive: true })
  }
  const write = (path: string, value: unknown) =>
    writeFileSync(join(outDir, path), JSON.stringify(value))
  for (const e of publishedEntities) write(`entities/${fileOf(e.id)}.json`, e)
  for (const s of publishedSnapshots)
    write(`snapshots/${fileOf(s.id)}.geojson`, s.geojson)
  for (const { data } of sources) write(`sources/${fileOf(data.id)}.json`, data)
  const index: EntityIndexEntry[] = publishedEntities.map((e) => ({
    id: e.id,
    names: e.names,
    start: e.start,
    ...(e.end && { end: e.end }),
    ...(bboxByEntity.has(e.id) && { bbox: bboxByEntity.get(e.id) }),
    snapshots: e.snapshots,
  }))
  write('index/entities.json', index)
  return report
}

type Geometry = { type: string; coordinates: unknown }

function readGeometry(
  path: string,
  file: string,
  error: (f: string, m: string) => void,
) {
  if (!existsSync(path)) {
    error(file, 'géométrie manquante (fichier .geojson du même nom)')
    return null
  }
  let gj: {
    type?: string
    geometry?: Geometry
    features?: { geometry?: Geometry }[]
  }
  try {
    gj = JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    error(file, `GeoJSON invalide : ${(e as Error).message}`)
    return null
  }
  const features =
    gj.type === 'FeatureCollection'
      ? (gj.features ?? [])
      : gj.type === 'Feature'
        ? [gj]
        : null
  if (!features?.length) {
    error(
      file,
      'GeoJSON invalide : Feature ou FeatureCollection non vide attendue',
    )
    return null
  }
  let ok = true
  features.forEach((f, i) => {
    if (!f.geometry || !/^(Multi)?Polygon$/.test(f.geometry.type)) {
      error(file, `feature ${i} : Polygon ou MultiPolygon attendu`)
      ok = false
    } else if (
      !booleanValid(f.geometry as never) ||
      kinks(f.geometry as never).features.length > 0
    ) {
      error(
        file,
        `feature ${i} : polygone invalide (anneau ouvert, auto-intersection…)`,
      )
      ok = false
    }
  })
  return ok ? (features as { geometry: Geometry }[]) : null
}

export function formatReport(r: Report): string {
  const lines = [
    `## Validation des données`,
    '',
    r.errors.length
      ? `❌ **${r.errors.length} erreur(s)** — le merge est bloqué.`
      : '✅ Aucune erreur.',
    r.warnings.length ? `⚠️ ${r.warnings.length} avertissement(s).` : '',
  ]
  const section = (title: string, list: Issue[]) =>
    list.length
      ? [
          '',
          `### ${title}`,
          '',
          ...list.map((i) => `- \`${i.file}\` : ${i.message}`),
        ]
      : []
  return (
    [
      ...lines,
      ...section('Erreurs', r.errors),
      ...section('Avertissements', r.warnings),
    ].join('\n') + '\n'
  )
}

/**
 * Entités politiques backed by Wikidata: curated list (data-src/curated/
 * entities.json) + frozen extracts (data-src/raw/wikidata/<QID>.json).
 */
function loadWikidataEntities(
  srcDir: string,
  error: (f: string, m: string) => void,
  warn: (f: string, m: string) => void,
): { file: string; data: EntitySrc }[] {
  const curatedPath = join(srcDir, 'curated/entities.json')
  if (!existsSync(curatedPath)) return []
  const curated: { id: string; type: string }[] = JSON.parse(
    readFileSync(curatedPath, 'utf8'),
  )
  const known = new Set(curated.map((c) => c.id))
  const labelsPath = join(srcDir, 'raw/wikidata/_labels.json')
  const labels = existsSync(labelsPath)
    ? JSON.parse(readFileSync(labelsPath, 'utf8'))
    : {}
  return curated.flatMap((c) => {
    const file = `raw/wikidata/${c.id}.json`
    const path = join(srcDir, file)
    if (!existsSync(path)) {
      error(
        file,
        'extrait Wikidata manquant (lancer pnpm data:extract:wikidata)',
      )
      return []
    }
    const { entity, issues } = toEntity(
      JSON.parse(readFileSync(path, 'utf8')) as WdEntity,
      c,
      known,
      labels,
    )
    issues.forEach((i) => warn(file, i))
    if (!entity.start) return []
    const parsed = entitySrc.safeParse(entity)
    if (!parsed.success) {
      for (const i of parsed.error.issues)
        error(file, `${i.path.join('.')} : ${i.message}`)
      return []
    }
    return [{ file, data: parsed.data }]
  })
}
