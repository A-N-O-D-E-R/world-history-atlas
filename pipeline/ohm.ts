// OpenHistoricalMap helpers (pure).
import type { DateSrc } from '../src/shared/schema.ts'

/**
 * OHM ISO date ("1697-09-20", "1718", "-0058") → DateSrc.
 * OHM uses historical years like ours: -0058 = 58 BCE, no year 0.
 */
export function ohmDate(value: string): DateSrc {
  const m = /^(-?)(\d+)(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(value)
  if (!m) throw new Error(`date OHM illisible « ${value} »`)
  const parts = [m[3], m[4]].filter(Boolean) as string[]
  return {
    value: [`${m[1]}${Number(m[2])}`, ...parts].join('-'),
    calendar: 'gregorian',
    precision: (['year', 'month', 'day'] as const)[parts.length],
  }
}
