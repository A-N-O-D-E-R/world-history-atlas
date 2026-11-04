import { expect, test } from 'vitest'
import { makeDatePoint, toJdn } from '../shared/dates.ts'
import type { EntityReign } from '../shared/schema.ts'
import { reignsAt } from './reigns.ts'

const d = (v: string) => makeDatePoint(v, 'day')
const reign = (ruler: string, from: string, to?: string): EntityReign => ({
  ruler,
  names: { fr: ruler },
  position: 'Q18384454',
  title: { fr: 'roi de France' },
  from: d(from),
  ...(to && { to: d(to) }),
})
const reigns = [
  reign('Louis XIV', '1643-05-14', '1715-09-01'),
  reign('Louis XV', '1715-09-01', '1774-05-10'),
]
const day = (year: number, month = 1, dd = 1) => toJdn({ year, month, day: dd })

test('Dirigeant en place à la date', () => {
  expect(reignsAt(reigns, day(1700)).map((r) => r.ruler)).toEqual(['Louis XIV'])
  expect(reignsAt(reigns, day(1715, 9, 1)).map((r) => r.ruler)).toEqual([
    'Louis XV',
  ]) // fin exclue
  expect(reignsAt(reigns, day(1600))).toEqual([])
  expect(reignsAt(undefined, day(1700))).toEqual([])
})
