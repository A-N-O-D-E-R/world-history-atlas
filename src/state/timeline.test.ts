import { beforeEach, expect, test } from 'vitest'
import { useAtlas } from './atlasStore'
import { MAX_YEAR, eraOf, fractionInEra, fromIndex, toIndex } from './timeline'

beforeEach(() =>
  useAtlas.setState({
    date: { year: 987, month: 1, day: 1 },
    stepUnit: 'year',
    playing: false,
  }),
)

test('l’index du curseur saute l’année 0', () => {
  expect([-2, -1, 1, 2].map(toIndex)).toEqual([-1, 0, 1, 2])
  expect([-1, 0, 1].map(fromIndex)).toEqual([-2, -1, 1])
})

test('avancer d’un an depuis 1 av. J.-C. donne 1', () => {
  useAtlas.setState({ date: { year: -1, month: 6, day: 1 } })
  useAtlas.getState().stepBy(1)
  expect(useAtlas.getState().date.year).toBe(1)
})

test('la frise s’arrête aux bornes et coupe la lecture', () => {
  useAtlas.setState({
    date: { year: MAX_YEAR, month: 6, day: 1 },
    playing: true,
  })
  expect(useAtlas.getState().stepBy(1)).toBe(false)
  expect(useAtlas.getState()).toMatchObject({
    date: { year: MAX_YEAR },
    playing: false,
  })
  useAtlas.setState({ date: { year: -3000, month: 1, day: 1 } })
  expect(useAtlas.getState().stepBy(-1)).toBe(false)
})

test('le curseur borne le jour (29 févr. → année non bissextile)', () => {
  useAtlas.setState({ date: { year: 2024, month: 2, day: 29 } })
  useAtlas.getState().setYearIndex(2023)
  expect(useAtlas.getState().date).toEqual({ year: 2023, month: 2, day: 28 })
})

test('époques : la borne appartient à l’époque qui commence', () => {
  expect(eraOf(-500).id).toBe('antiquity')
  expect(eraOf(475).id).toBe('antiquity')
  expect(eraOf(476).id).toBe('middle-ages')
  expect(eraOf(1492).id).toBe('early-modern')
  expect(eraOf(1789).id).toBe('contemporary')
  expect(eraOf(MAX_YEAR).id).toBe('contemporary')
})

test('position dans l’époque', () => {
  expect(fractionInEra(476)).toBe(0)
  expect(fractionInEra(1491)).toBeCloseTo(1015 / 1016)
  expect(fractionInEra(-3000)).toBe(0)
})
