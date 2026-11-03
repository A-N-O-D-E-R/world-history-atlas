// Cliopatria helpers (pure).

export interface ClioProps {
  Name: string
  FromYear: number
  ToYear: number
  Type: string
  Wikidata: string
}

/** Curated Entité for a Cliopatria record, or null. Aggregates "(Name)" map like Name. */
export function entityOf(
  p: ClioProps,
  curated: Set<string>,
  byName: Record<string, string>,
): string | null {
  if (p.Type !== 'POLITY') return null
  const name = p.Name.replace(/^\((.*)\)$/, '$1')
  return byName[name] ?? (curated.has(p.Wikidata) ? p.Wikidata : null)
}

export const isAggregate = (p: ClioProps) => /^\(.*\)$/.test(p.Name)

/** Inclusive historical years [FromYear, ToYear] → Snapshot interval [from, to[ (no year 0). */
export function interval(p: ClioProps): { from: number; to: number } {
  const to = p.ToYear + 1
  return { from: p.FromYear, to: to === 0 ? 1 : to }
}

/**
 * Keep aggregates (polity + vassals) when they exist; plain records only for
 * years no aggregate covers. Drop records fully covered by better Snapshots.
 */
export function select<T extends { props: ClioProps }>(
  records: T[],
  covered: (from: number, to: number) => boolean,
): T[] {
  const aggregates = records.filter((r) => isAggregate(r.props))
  const overlapsAggregate = (r: T) => {
    const a = interval(r.props)
    return aggregates.some((g) => {
      const b = interval(g.props)
      return a.from < b.to && b.from < a.to
    })
  }
  return records.filter((r) => {
    if (!isAggregate(r.props) && overlapsAggregate(r)) return false
    const { from, to } = interval(r.props)
    return !covered(from, to)
  })
}
