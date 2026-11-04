import { expect, test } from 'vitest'
import { makeDatePoint } from '../src/shared/dates.ts'
import { toRuler } from './rulers.ts'
import type { WdClaim } from './wikidata.ts'

const G = 'http://www.wikidata.org/entity/Q1985727'
const time = (t: string, precision = 9) => ({
  time: t,
  precision,
  calendarmodel: G,
})
const snak = (value: unknown) => ({ snaktype: 'value', datavalue: { value } })
const held = (
  pos: string,
  from?: string,
  to?: string,
  rank: WdClaim['rank'] = 'normal',
): WdClaim => ({
  rank,
  mainsnak: snak({ id: pos }),
  qualifiers: {
    ...(from && { P580: [snak(time(from))] }),
    ...(to && { P582: [snak(time(to))] }),
  },
})
const y = (v: string) => makeDatePoint(v, 'year')

const positions = new Map([
  ['Q18384454', ['Q70972', 'Q207162']], // roi de France : Royaume puis Restauration
])
const existence = new Map([
  ['Q70972', { start: y('987'), end: y('1791') }],
  ['Q207162', { start: y('1815'), end: y('1830') }],
])
const titles = { Q18384454: { fr: 'roi de France', en: 'King of France' } }

test('les Règnes sont rattachés à l’Entité existant à leur début', () => {
  const { ruler, skipped } = toRuler(
    {
      id: 'Q7732',
      labels: { fr: { value: 'Louis XVIII' } },
      claims: {
        P39: [
          held('Q18384454', '+1815-00-00T00:00:00Z', '+1824-00-00T00:00:00Z'),
        ],
        P569: [
          { rank: 'normal', mainsnak: snak(time('+1755-11-17T00:00:00Z', 11)) },
        ],
        P53: [{ rank: 'normal', mainsnak: snak({ id: 'Q134853' }) }],
      },
    },
    positions,
    existence,
    titles,
  )
  expect(skipped).toBe(0)
  expect(ruler).toMatchObject({
    names: { fr: 'Louis XVIII' },
    birth: { value: '1755-11-17', precision: 'day' },
    dynasty: 'Q134853',
    reigns: [
      {
        entity: 'Q207162',
        title: { fr: 'roi de France' },
        from: { value: '1815' },
        to: { value: '1824' },
      },
    ],
  })
})

test('Règne sans date de début, hors de toute Entité ou déprécié : ignoré', () => {
  const { ruler, skipped } = toRuler(
    {
      id: 'Q1',
      claims: {
        P39: [
          held('Q18384454'),
          held('Q18384454', '+1800-00-00T00:00:00Z'), // entre Royaume et Restauration
          held('Q18384454', '+1000-00-00T00:00:00Z', undefined, 'deprecated'),
          held('Q18384454', '+1180-00-00T00:00:00Z', '+1223-00-00T00:00:00Z'),
        ],
      },
    },
    positions,
    existence,
    titles,
  )
  expect(skipped).toBe(2)
  expect(ruler.reigns.map((r) => [r.entity, r.from])).toEqual([
    ['Q70972', { value: '1180', calendar: 'gregorian', precision: 'year' }],
  ])
})
