import { type HistDate, isInterval } from '../shared/dates.ts'
import type { EntityReign } from '../shared/schema.ts'

const first = (d: HistDate) => (isInterval(d) ? d.earliest.sortKey : d.sortKey)

/** Règnes in progress at the day (JDN): [from, to[, open-ended when no end. */
export function reignsAt(
  reigns: EntityReign[] | undefined,
  day: number,
): EntityReign[] {
  return (reigns ?? []).filter(
    (r) => day >= first(r.from) && (!r.to || day < first(r.to)),
  )
}
