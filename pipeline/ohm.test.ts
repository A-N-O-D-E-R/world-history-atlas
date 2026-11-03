import { expect, test } from 'vitest'
import { ohmDate } from './ohm.ts'

test('dates OHM : jour, mois, année, av. J.-C.', () => {
  expect(ohmDate('1697-09-20')).toEqual({
    value: '1697-09-20',
    calendar: 'gregorian',
    precision: 'day',
  })
  expect(ohmDate('1718-05')).toEqual({
    value: '1718-05',
    calendar: 'gregorian',
    precision: 'month',
  })
  expect(ohmDate('0987')).toEqual({
    value: '987',
    calendar: 'gregorian',
    precision: 'year',
  })
  expect(ohmDate('-0058')).toEqual({
    value: '-58',
    calendar: 'gregorian',
    precision: 'year',
  })
})

test('date illisible refusée', () => {
  expect(() => ohmDate('vers 1150')).toThrow(/illisible/)
})
