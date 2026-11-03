// Data schemas shared by the pipeline (validation) and the app (types).
// Source files live in data-src/, published files in public/data/.
import { z } from 'zod'
import type { HistDate } from './dates.ts'

// ---------- source files (data-src/) ----------

const id = z
  .string()
  .regex(
    /^(Q\d+|wha:[a-z0-9-]+)$/,
    'identifiant attendu : QID Wikidata ou wha:<slug>',
  )
const datePointSrc = z.object({
  value: z.string(),
  calendar: z.enum(['gregorian', 'julian']),
  precision: z.enum(['day', 'month', 'year', 'century']),
})
export const dateSrc = z.union(
  [z.object({ earliest: datePointSrc, latest: datePointSrc }), datePointSrc],
  {
    error:
      'date attendue : { value, calendar, precision } ou { earliest, latest } — calendrier et précision obligatoires',
  },
)
export type DateSrc = z.infer<typeof dateSrc>

export const RELIABILITY = ['high', 'medium', 'approximate'] as const
export type Reliability = (typeof RELIABILITY)[number]
export const LICENCE_WHITELIST = [
  'CC0-1.0',
  'CC-BY-4.0',
  'ODbL-1.0',
  'public-domain',
  'GPL-3.0',
] as const

const names = z.object({ fr: z.string().optional(), en: z.string().optional() })

export const sourceSrc = z.object({
  id,
  name: z.string().min(1),
  url: z.url().optional(),
  licence: z.string().optional(), // presence + whitelist checked as rules
  attribution: z.string().optional(),
  author: z.string().optional(),
  published: z.string().optional(),
  scale: z.string().optional(),
  method: z.string().optional(),
  reliability: z.enum(RELIABILITY),
})
export type SourceSrc = z.infer<typeof sourceSrc>

export const entitySrc = z.object({
  id,
  names,
  type: z.string().min(1),
  start: dateSrc,
  end: dateSrc.optional(),
  point: z
    .tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
    .optional(),
  predecessors: z.array(id).default([]),
  successors: z.array(id).default([]),
  sources: z.array(id).default([]),
  wikipedia: names.optional(),
})
export type EntitySrc = z.infer<typeof entitySrc>

export const snapshotSrc = z.object({
  id,
  entity: id,
  from: dateSrc,
  to: dateSrc.optional(),
  source: id.optional(), // presence checked as a rule
  extraSources: z.array(id).default([]), // e.g. CC BY segments inside an OHM boundary
  reliability: z.enum(RELIABILITY).optional(),
  note: z.string().optional(),
})
export type SnapshotSrc = z.infer<typeof snapshotSrc>

// ---------- published files (public/data/) ----------

export type Names = z.infer<typeof names>
export type BBox = [number, number, number, number]

export interface PublishedSource extends Omit<SourceSrc, 'licence'> {
  licence: string
}

export interface SnapshotRef {
  id: string
  from: HistDate
  to?: HistDate
  reliability: Reliability
}

export interface PublishedEntity {
  id: string
  names: Names
  type: string
  start: HistDate
  end?: HistDate
  point?: [number, number]
  predecessors: string[]
  successors: string[]
  sources: string[]
  wikipedia?: Names
  snapshots: SnapshotRef[]
}

/** Properties of the single Feature published per Snapshot. */
export interface PublishedSnapshotProps extends SnapshotRef {
  entity: string
  source: string
  extraSources: string[]
  note?: string
}

export interface EntityIndexEntry {
  id: string
  names: Names
  start: HistDate
  end?: HistDate
  bbox?: BBox
  snapshots: SnapshotRef[]
}

/** File name for an identifier (":" is not portable in paths). */
export const fileOf = (identifier: string) => identifier.replace(':', '_')
