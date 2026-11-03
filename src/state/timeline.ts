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
