// Wikidata JSON (wbgetentities) → our source model. Pure functions, no I/O.
// Dates are read from the JSON only (ADR 0001): source calendar kept,
// 1 BCE = -0001, precisions 11/10/9/7 = day/month/year/century,
// 8 (decade) and 6 (millennium) become intervals.
import type { DateSrc, EntitySrc } from '../src/shared/schema.ts'

export interface WdTime {
  time: string // "+0987-07-03T00:00:00Z"
  precision: number
  calendarmodel: string
}
export interface WdSnak {
  snaktype: string
  datavalue?: { value: unknown }
}
export interface WdClaim {
  rank: 'preferred' | 'normal' | 'deprecated'
  mainsnak: WdSnak
  qualifiers?: Record<string, WdSnak[]>
}
export interface WdEntity {
  id: string
  labels?: Record<string, { value: string }>
  aliases?: Record<string, { value: string }[]>
  sitelinks?: Record<string, { title: string }>
  claims?: Record<string, WdClaim[]>
}

const JULIAN = 'http://www.wikidata.org/entity/Q1985786'

/** Wikidata time value → DateSrc (null when unusable: precision < millennium, year 0). */
export function wdTime(t: WdTime): DateSrc | null {
  const m = /^([+-])(\d+)-(\d{2})-(\d{2})T/.exec(t.time)
  if (!m) return null
  const year = (m[1] === '-' ? -1 : 1) * Number(m[2])
  if (year === 0) return null
  const calendar: 'julian' | 'gregorian' =
    t.calendarmodel === JULIAN ? 'julian' : 'gregorian'
  const point = (
    value: string,
    precision: 'day' | 'month' | 'year' | 'century',
  ) => ({ value, calendar, precision })
  switch (t.precision) {
    case 11:
      return point(`${year}-${m[3]}-${m[4]}`, 'day')
    case 10:
      return point(`${year}-${m[3]}`, 'month')
    case 9:
      return point(String(year), 'year')
    case 8: {
      // CE "1150" = 1150–1159; BCE "-50" = the 50s BCE = 59–50 BCE
      const [a, b] = year > 0 ? [year, year + 9] : [year - 9, year]
      return {
        earliest: point(String(a), 'year'),
        latest: point(String(b), 'year'),
      }
    }
    case 7:
      return point(String(year), 'century')
    case 6: {
      const k = Math.ceil(Math.abs(year) / 1000)
      const [a, b] =
        year > 0
          ? [(k - 1) * 1000 + 1, k * 1000]
          : [-k * 1000, -(k - 1) * 1000 - 1]
      return {
        earliest: point(String(a), 'century'),
        latest: point(String(b), 'century'),
      }
    }
    default:
      return null
  }
}

/** Non-deprecated claims, preferred ones first. */
function claims(e: WdEntity, p: string): WdClaim[] {
  const list = (e.claims?.[p] ?? []).filter(
    (c) => c.rank !== 'deprecated' && c.mainsnak.snaktype === 'value',
  )
  const preferred = list.filter((c) => c.rank === 'preferred')
  return preferred.length ? preferred : list
}

const timeOf = (s?: WdSnak) =>
  s?.snaktype === 'value' ? wdTime(s.datavalue!.value as WdTime) : null
const qualifierTime = (c: WdClaim, p: string) => timeOf(c.qualifiers?.[p]?.[0])
const idOf = (s: WdSnak) => (s.datavalue!.value as { id: string }).id
const firstTime = (e: WdEntity, ...props: string[]) => {
  for (const p of props)
    for (const c of claims(e, p)) {
      const d = timeOf(c.mainsnak)
      if (d) return d
    }
  return null
}

/** P625 coordinates → [lon, lat]. */
const pointOf = (e: WdEntity): [number, number] | null => {
  const c = claims(e, 'P625')[0]?.mainsnak.datavalue?.value as
    { latitude: number; longitude: number } | undefined
  return c ? [c.longitude, c.latitude] : null
}

const optional = <K extends string, V>(key: K, v: V | null | undefined) =>
  (v === null || v === undefined ? {} : { [key]: v }) as Partial<Record<K, V>>

/**
 * Wikidata item + curated info → Entité politique source object.
 * `known` = curated ids (predecessor/successor links outside it are dropped);
 * `labels` = fr/en labels of referenced items (capitals).
 */
export function toEntity(
  e: WdEntity,
  curated: { type: string },
  known: Set<string>,
  labels: Record<string, { fr?: string; en?: string }>,
): {
  entity: Omit<EntitySrc, 'start'> & { start: DateSrc | null }
  issues: string[]
} {
  const issues: string[] = []
  const start = firstTime(e, 'P571', 'P580')
  if (!start) issues.push('aucune date de début exploitable (P571 / P580)')
  const end = firstTime(e, 'P576', 'P582')
  const linked = (...props: string[]) => [
    ...new Set(
      props
        .flatMap((p) => claims(e, p).map((c) => idOf(c.mainsnak)))
        .filter((q) => known.has(q)),
    ),
  ]
  const label = (lang: string) => e.labels?.[lang]?.value
  const aliases = (lang: string) => e.aliases?.[lang]?.map((a) => a.value)
  const wiki = (site: string) => e.sitelinks?.[site]?.title.replaceAll(' ', '_')

  return {
    issues,
    entity: {
      id: e.id,
      names: { ...optional('fr', label('fr')), ...optional('en', label('en')) },
      ...((aliases('fr') || aliases('en')) && {
        aliases: {
          ...optional('fr', aliases('fr')),
          ...optional('en', aliases('en')),
        },
      }),
      originalNames: claims(e, 'P1448').map((c) => {
        const v = c.mainsnak.datavalue!.value as {
          text: string
          language: string
        }
        return {
          name: v.text,
          lang: v.language,
          ...optional('from', qualifierTime(c, 'P580')),
          ...optional('to', qualifierTime(c, 'P582')),
        }
      }),
      capitals: claims(e, 'P36').map((c) => {
        const id = idOf(c.mainsnak)
        return {
          id,
          names: labels[id] ?? {},
          ...optional('from', qualifierTime(c, 'P580')),
          ...optional('to', qualifierTime(c, 'P582')),
        }
      }),
      ...optional('point', pointOf(e)),
      type: curated.type,
      start,
      ...optional('end', end),
      predecessors: linked('P1365', 'P155'),
      successors: linked('P1366', 'P156'),
      sources: ['wha:wikidata'],
      ...((wiki('frwiki') || wiki('enwiki')) && {
        wikipedia: {
          ...optional('fr', wiki('frwiki')),
          ...optional('en', wiki('enwiki')),
        },
      }),
    },
  }
}
