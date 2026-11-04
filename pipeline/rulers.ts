// Wikidata person → Dirigeant with Règnes (pure).
import {
  type HistDate,
  isInterval,
  makeDatePoint,
} from '../src/shared/dates.ts'
import type { DateSrc, Names } from '../src/shared/schema.ts'
import { type WdEntity, type WdSnak, wdTime } from './wikidata.ts'

export interface ReignSrc {
  entity: string
  position: string
  title: Names
  from: DateSrc
  to?: DateSrc
}
export interface RulerDraft {
  id: string
  names: Names
  birth?: DateSrc
  death?: DateSrc
  dynasty?: string
  reigns: ReignSrc[]
  sources: string[]
  wikipedia?: Names
}

const key = (d: DateSrc) => {
  const p = 'earliest' in d ? d.earliest : d
  return makeDatePoint(p.value, p.precision, p.calendar).sortKey
}
const first = (d: HistDate) => (isInterval(d) ? d.earliest.sortKey : d.sortKey)
const last = (d: HistDate) => (isInterval(d) ? d.latest.sortKey : d.sortKey)
const timeOf = (s?: WdSnak) =>
  s?.snaktype === 'value' ? wdTime(s.datavalue!.value as never) : null

export function toRuler(
  person: WdEntity,
  positionEntities: Map<string, string[]>,
  existence: Map<string, { start: HistDate; end?: HistDate }>,
  titles: Record<string, Names>,
): { ruler: RulerDraft; skipped: number } {
  const claims = (p: string) =>
    (person.claims?.[p] ?? []).filter(
      (c) => c.rank !== 'deprecated' && c.mainsnak.snaktype === 'value',
    )
  const reigns: ReignSrc[] = []
  let skipped = 0
  for (const c of claims('P39')) {
    const position = (c.mainsnak.datavalue!.value as { id: string }).id
    const from = timeOf(c.qualifiers?.P580?.[0])
    const to = timeOf(c.qualifiers?.P582?.[0])
    if (!from) {
      skipped++
      continue
    }
    // The Entité (among those of the position) existing when the reign starts.
    const k = key(from)
    const entity = (positionEntities.get(position) ?? []).find((id) => {
      const e = existence.get(id)
      return e && k >= first(e.start) && (!e.end || k <= last(e.end))
    })
    if (!entity) {
      skipped++
      continue
    }
    reigns.push({
      entity,
      position,
      title: titles[position] ?? {},
      from,
      ...(to && { to }),
    })
  }
  reigns.sort((a, b) => key(a.from) - key(b.from))
  const label = (l: string) => person.labels?.[l]?.value
  const wiki = (s: string) => person.sitelinks?.[s]?.title.replaceAll(' ', '_')
  const birth = timeOf(claims('P569')[0]?.mainsnak)
  const death = timeOf(claims('P570')[0]?.mainsnak)
  const dynasty = (
    claims('P53')[0]?.mainsnak.datavalue?.value as { id?: string } | undefined
  )?.id
  return {
    skipped,
    ruler: {
      id: person.id,
      names: {
        ...(label('fr') && { fr: label('fr') }),
        ...(label('en') && { en: label('en') }),
      },
      ...(birth && { birth }),
      ...(death && { death }),
      ...(dynasty && { dynasty }),
      reigns,
      sources: ['wha:wikidata'],
      ...((wiki('frwiki') || wiki('enwiki')) && {
        wikipedia: {
          ...(wiki('frwiki') && { fr: wiki('frwiki') }),
          ...(wiki('enwiki') && { en: wiki('enwiki') }),
        },
      }),
    },
  }
}
