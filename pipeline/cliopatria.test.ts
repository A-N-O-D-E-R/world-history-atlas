import { expect, test } from 'vitest'
import { type ClioProps, entityOf, interval, select } from './cliopatria.ts'

const p = (
  Name: string,
  FromYear: number,
  ToYear: number,
  Wikidata = 'Q207162',
  Type = 'POLITY',
): ClioProps => ({
  Name,
  FromYear,
  ToYear,
  Wikidata,
  Type,
})
const curated = new Set(['Q70972', 'Q207162', 'Q12548'])
const byName = { 'Kingdom of France': 'Q70972' }

test('rattachement : par nom curé d’abord (QID faux de Cliopatria), sinon par QID', () => {
  expect(entityOf(p('Kingdom of France', 1497, 1501), curated, byName)).toBe(
    'Q70972',
  )
  expect(entityOf(p('(Kingdom of France)', 1497, 1501), curated, byName)).toBe(
    'Q70972',
  )
  expect(
    entityOf(p('Bourbon Kingdom of France', 1815, 1847), curated, byName),
  ).toBe('Q207162')
  expect(
    entityOf(p('Holy Roman Empire', 962, 1000, 'Q12548'), curated, byName),
  ).toBe('Q12548')
  expect(
    entityOf(p('Nazi Germany', 1940, 1944, 'Q7318'), curated, byName),
  ).toBeNull()
  expect(
    entityOf(p('(Alliance)', 1, 2, 'Q12548', 'RELATION'), curated, byName),
  ).toBeNull()
})

test('années inclusives → intervalle [début, fin[ sans année 0', () => {
  expect(interval(p('X', 1497, 1501))).toEqual({ from: 1497, to: 1502 })
  expect(interval(p('X', -31, -1))).toEqual({ from: -31, to: 1 })
})

test('agrégat préféré, simple seulement là où aucun agrégat ; écarté si déjà couvert', () => {
  const r = (props: ClioProps) => ({ props })
  const records = [
    r(p('Kingdom of France', 1490, 1496)),
    r(p('Kingdom of France', 1497, 1501)),
    r(p('(Kingdom of France)', 1497, 1501)),
  ]
  expect(select(records, () => false).map((x) => x.props.Name)).toEqual([
    'Kingdom of France',
    '(Kingdom of France)',
  ])
  expect(select(records, (from) => from === 1490)).toHaveLength(1)
})
