import { expect, test } from 'vitest'
import { makeDatePoint, toJdn } from '../shared/dates.ts'
import type { EntityIndexEntry } from '../shared/schema.ts'
import { resolveAll, resolveSnapshot, withoutBorder } from './resolve.ts'

const y = (v: string) => makeDatePoint(v, 'year')
const day = (year: number, month = 1, d = 1) => toJdn({ year, month, day: d })
const ref = (id: string, from: string, to?: string) => ({
  id,
  from: y(from),
  ...(to && { to: y(to) }),
  reliability: 'medium' as const,
})

const kingdom: EntityIndexEntry = {
  id: 'Q70972',
  names: { fr: 'Royaume de France' },
  start: y('987'),
  end: makeDatePoint('1792-09-21', 'day'),
  snapshots: [ref('a', '1697', '1714'), ref('b', '1766', '1769')],
}

test('le Snapshot qui couvre la date est exact', () => {
  expect(resolveSnapshot(kingdom, day(1700))).toMatchObject({
    snapshot: { id: 'a' },
    exact: true,
  })
  expect(resolveSnapshot(kingdom, day(1767))).toMatchObject({
    snapshot: { id: 'b' },
    exact: true,
  })
})

test('la fin d’un intervalle est exclue : [from, to[', () => {
  expect(resolveSnapshot(kingdom, day(1714))).toMatchObject({
    snapshot: { id: 'a' },
    exact: false,
  })
})

test('sinon le Snapshot le plus proche, signalé comme non exact', () => {
  expect(resolveSnapshot(kingdom, day(1720))).toMatchObject({
    snapshot: { id: 'a' },
    exact: false,
  })
  expect(resolveSnapshot(kingdom, day(1760))).toMatchObject({
    snapshot: { id: 'b' },
    exact: false,
  })
  expect(resolveSnapshot(kingdom, day(1000))).toMatchObject({
    snapshot: { id: 'a' },
    exact: false,
  })
})

test('rien hors de l’existence de l’Entité', () => {
  expect(resolveSnapshot(kingdom, day(986, 12, 31))).toBeNull()
  expect(resolveSnapshot(kingdom, day(1792, 9, 22))).toBeNull()
  expect(resolveSnapshot(kingdom, day(1792, 9, 21))).not.toBeNull()
})

test('une Entité sans Snapshot n’est pas affichée', () => {
  expect(resolveAll([{ ...kingdom, snapshots: [] }], day(1700))).toEqual([])
})

test('plusieurs Snapshots couvrent la date : le plus fiable gagne (OHM > Cliopatria)', () => {
  const e: EntityIndexEntry = {
    ...kingdom,
    snapshots: [
      { ...ref('clio', '1690', '1720'), reliability: 'approximate' },
      ref('ohm', '1697', '1714'),
    ],
  }
  expect(resolveSnapshot(e, day(1700))).toMatchObject({
    snapshot: { id: 'ohm' },
  })
  expect(resolveSnapshot(e, day(1692))).toMatchObject({
    snapshot: { id: 'clio' },
    exact: true,
  })
})

test('Entités existantes sans aucune frontière', () => {
  const none = { ...kingdom, id: 'Q2991382', snapshots: [] }
  expect(withoutBorder([kingdom, none], day(1700)).map((e) => e.id)).toEqual([
    'Q2991382',
  ])
  expect(withoutBorder([none], day(900))).toEqual([])
})
