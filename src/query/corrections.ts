import {
  type HistDate,
  type Lang,
  formatDate,
  makeDatePoint,
} from '../shared/dates.ts'
import type { DateSrc } from '../shared/schema.ts'

type PointSrc = Exclude<DateSrc, { earliest: unknown }>
const isPoint = (v: unknown): v is PointSrc =>
  typeof v === 'object' &&
  v !== null &&
  'value' in v &&
  'calendar' in v &&
  'precision' in v
const isDateSrc = (v: unknown): v is DateSrc =>
  isPoint(v) ||
  (typeof v === 'object' &&
    v !== null &&
    'earliest' in v &&
    isPoint((v as { earliest: unknown }).earliest))

/** Human-readable value of a corrected field (dates formatted, text as is). */
export function formatValue(v: unknown, lang: Lang): string {
  if (v === undefined || v === null) return '—'
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (isDateSrc(v)) {
    const p = (d: PointSrc) => makeDatePoint(d.value, d.precision, d.calendar)
    const h: HistDate =
      'earliest' in v ? { earliest: p(v.earliest), latest: p(v.latest) } : p(v)
    return formatDate(h, lang)
  }
  return JSON.stringify(v)
}
