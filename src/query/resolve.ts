import { type HistDate, isInterval } from '../shared/dates.ts'
import type {
  EntityIndexEntry,
  Reliability,
  SnapshotRef,
} from '../shared/schema.ts'

export interface Resolved {
  entity: EntityIndexEntry
  snapshot: SnapshotRef
  /** false when the Snapshot does not cover the date (nearest one shown). */
  exact: boolean
}

const RANK: Record<Reliability, number> = { approximate: 0, medium: 1, high: 2 }
const first = (d: HistDate) => (isInterval(d) ? d.earliest.sortKey : d.sortKey)
const last = (d: HistDate) => (isInterval(d) ? d.latest.sortKey : d.sortKey)

/** Does the Entité politique exist at this day (JDN)? */
export function existsAt(e: EntityIndexEntry, day: number): boolean {
  return day >= first(e.start) && (!e.end || day <= last(e.end))
}

/**
 * Snapshot to display for an Entité at a day (JDN): the one whose interval
 * [from, to[ covers it, otherwise the nearest one. Null when the Entité does
 * not exist at that day or has no Snapshot.
 */
export function resolveSnapshot(
  e: EntityIndexEntry,
  day: number,
): Resolved | null {
  if (!existsAt(e, day) || !e.snapshots.length) return null
  // Several Snapshots may cover the day (OHM + Cliopatria): the most reliable wins.
  const covering = e.snapshots
    .filter((s) => day >= first(s.from) && (!s.to || day < first(s.to)))
    .reduce<SnapshotRef | undefined>(
      (best, s) =>
        !best || RANK[s.reliability] > RANK[best.reliability] ? s : best,
      undefined,
    )
  if (covering) return { entity: e, snapshot: covering, exact: true }
  const distance = (s: SnapshotRef) =>
    day < first(s.from) ? first(s.from) - day : day - last(s.to ?? s.from)
  const nearest = e.snapshots.reduce((a, b) =>
    distance(b) < distance(a) ? b : a,
  )
  return { entity: e, snapshot: nearest, exact: false }
}

export function resolveAll(index: EntityIndexEntry[], day: number): Resolved[] {
  return index.flatMap((e) => resolveSnapshot(e, day) ?? [])
}

/** Entités existing at the day for which no border is known at all. */
export function withoutBorder(
  index: EntityIndexEntry[],
  day: number,
): EntityIndexEntry[] {
  return index.filter((e) => existsAt(e, day) && !e.snapshots.length)
}
