import { type StepUnit, type Ymd, step } from '../shared/dates'

export const MIN_YEAR = -3000
export const MAX_YEAR = new Date().getUTCFullYear()
export const SPEEDS = [0.5, 1, 2, 4, 8] as const
export type Speed = (typeof SPEEDS)[number]

/** Astronomical year index used by the slider (no gap at year 0). */
export const toIndex = (year: number) => (year < 0 ? year + 1 : year)
export const fromIndex = (i: number) => (i <= 0 ? i - 1 : i)

export const inRange = (d: Ymd) => d.year >= MIN_YEAR && d.year <= MAX_YEAR

/** One timeline step, or null when it would leave the -3000 → today range. */
export function stepWithin(d: Ymd, unit: StepUnit, dir: 1 | -1): Ymd | null {
  const next = step(d, unit, dir)
  return inRange(next) ? next : null
}

export interface Era {
  id: 'antiquity' | 'middle-ages' | 'early-modern' | 'contemporary'
  start: number // first year (inclusive)
  end: number // last year (inclusive)
  color: string
}

/** Conventional periodisation; each era starts the year the previous one ends. */
export const ERAS: Era[] = [
  { id: 'antiquity', start: MIN_YEAR, end: 476, color: '#b07a4f' },
  { id: 'middle-ages', start: 476, end: 1492, color: '#7f8f52' },
  { id: 'early-modern', start: 1492, end: 1789, color: '#4f7f8f' },
  { id: 'contemporary', start: 1789, end: MAX_YEAR, color: '#8f5a7f' },
]

/** The era shown by the zoomable slider: the one containing the year. */
export function eraOf(year: number): Era {
  return ERAS.findLast((e) => year >= e.start) ?? ERAS[0]
}

/** Position of a year inside its era, 0 → 1. */
export function fractionInEra(year: number): number {
  const e = eraOf(year)
  return (
    (toIndex(year) - toIndex(e.start)) /
    Math.max(1, toIndex(e.end) - toIndex(e.start))
  )
}
