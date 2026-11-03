import { describe, expect, test } from 'vitest'
import { type WdClaim, type WdEntity, toEntity, wdTime } from './wikidata.ts'

const G = 'http://www.wikidata.org/entity/Q1985727'
const J = 'http://www.wikidata.org/entity/Q1985786'
const time = (time: string, precision: number, calendarmodel = G) => ({
  time,
  precision,
  calendarmodel,
})

describe('dates Wikidata (JSON)', () => {
  test('précisions jour / mois / année / siècle', () => {
    expect(wdTime(time('+1789-07-14T00:00:00Z', 11))).toEqual({
      value: '1789-07-14',
      calendar: 'gregorian',
      precision: 'day',
    })
    expect(wdTime(time('+1180-05-00T00:00:00Z', 10))).toEqual({
      value: '1180-05',
      calendar: 'gregorian',
      precision: 'month',
    })
    expect(wdTime(time('+0987-00-00T00:00:00Z', 9))).toEqual({
      value: '987',
      calendar: 'gregorian',
      precision: 'year',
    })
    expect(wdTime(time('+1500-00-00T00:00:00Z', 7))).toEqual({
      value: '1500',
      calendar: 'gregorian',
      precision: 'century',
    })
  })
  test('calendrier julien conservé', () => {
    expect(wdTime(time('+0511-11-27T00:00:00Z', 11, J))).toEqual({
      value: '511-11-27',
      calendar: 'julian',
      precision: 'day',
    })
  })
  test('-0001 = 1 av. J.-C. (pas de décalage d’un an)', () => {
    expect(wdTime(time('-0001-00-00T00:00:00Z', 9))).toMatchObject({
      value: '-1',
    })
    expect(wdTime(time('-0044-03-15T00:00:00Z', 11, J))).toMatchObject({
      value: '-44-03-15',
      calendar: 'julian',
    })
  })
  test('décennie → intervalle d’années', () => {
    expect(wdTime(time('+1150-00-00T00:00:00Z', 8))).toMatchObject({
      earliest: { value: '1150', precision: 'year' },
      latest: { value: '1159', precision: 'year' },
    })
    expect(wdTime(time('-0050-00-00T00:00:00Z', 8))).toMatchObject({
      earliest: { value: '-59' },
      latest: { value: '-50' },
    })
  })
  test('millénaire → intervalle de siècles', () => {
    expect(wdTime(time('+1000-00-00T00:00:00Z', 6))).toMatchObject({
      earliest: { value: '1', precision: 'century' },
      latest: { value: '1000', precision: 'century' },
    })
    expect(wdTime(time('-2000-00-00T00:00:00Z', 6))).toMatchObject({
      earliest: { value: '-2000' },
      latest: { value: '-1001' },
    })
  })
  test('précision trop faible ou année 0 : inutilisable', () => {
    expect(wdTime(time('+1000000-00-00T00:00:00Z', 4))).toBeNull()
    expect(wdTime(time('+0000-00-00T00:00:00Z', 9))).toBeNull()
  })
})

const claim = (value: unknown, extra: Partial<WdClaim> = {}): WdClaim => ({
  rank: 'normal',
  mainsnak: { snaktype: 'value', datavalue: { value } },
  ...extra,
})
const t = (s: string, p = 9) => time(s, p)

describe('Entité depuis Wikidata', () => {
  const item: WdEntity = {
    id: 'Q70972',
    labels: {
      fr: { value: 'royaume de France' },
      en: { value: 'Kingdom of France' },
    },
    aliases: { fr: [{ value: 'France' }] },
    sitelinks: { frwiki: { title: 'Royaume de France' } },
    claims: {
      P571: [claim(t('+0987-00-00T00:00:00Z'))],
      P576: [
        claim(t('+1848-00-00T00:00:00Z'), { rank: 'deprecated' }),
        claim(t('+1792-09-21T00:00:00Z', 11)),
      ],
      P36: [
        claim(
          { id: 'Q90' },
          {
            qualifiers: {
              P580: [
                {
                  snaktype: 'value',
                  datavalue: { value: t('+1682-00-00T00:00:00Z') },
                },
              ],
            },
          },
        ),
      ],
      P1365: [claim({ id: 'Q46370' }), claim({ id: 'Q999' })],
      P1366: [claim({ id: 'Q58296' })],
      P1448: [claim({ text: 'Royaume de France', language: 'fr' })],
    },
  }
  const known = new Set(['Q70972', 'Q46370', 'Q58296'])

  test('libellés, alias, Wikipédia, dates (rang déprécié ignoré)', () => {
    const { entity, issues } = toEntity(item, { type: 'kingdom' }, known, {
      Q90: { fr: 'Versailles' },
    })
    expect(issues).toEqual([])
    expect(entity).toMatchObject({
      names: { fr: 'royaume de France', en: 'Kingdom of France' },
      aliases: { fr: ['France'] },
      wikipedia: { fr: 'Royaume_de_France' },
      type: 'kingdom',
      start: { value: '987', precision: 'year' },
      end: { value: '1792-09-21', precision: 'day' },
      sources: ['wha:wikidata'],
    })
  })
  test('capitales datées, noms d’époque, liens limités à la liste curée', () => {
    const { entity } = toEntity(item, { type: 'kingdom' }, known, {
      Q90: { fr: 'Versailles' },
    })
    expect(entity.capitals).toEqual([
      {
        id: 'Q90',
        names: { fr: 'Versailles' },
        from: { value: '1682', calendar: 'gregorian', precision: 'year' },
      },
    ])
    expect(entity.originalNames).toEqual([
      { name: 'Royaume de France', lang: 'fr' },
    ])
    expect(entity.predecessors).toEqual(['Q46370']) // Q999 hors liste curée
    expect(entity.successors).toEqual(['Q58296'])
  })
  test('sans date de début : signalé', () => {
    const { entity, issues } = toEntity(
      { id: 'Q1', claims: {} },
      { type: 'other' },
      known,
      {},
    )
    expect(entity.start).toBeNull()
    expect(issues).toEqual(['aucune date de début exploitable (P571 / P580)'])
  })
})

test('coordonnées P625 → point [lon, lat]', () => {
  const { entity } = toEntity(
    {
      id: 'Q1',
      claims: {
        P571: [claim(t('+0987-00-00T00:00:00Z'))],
        P625: [claim({ latitude: 48.85, longitude: 2.35 })],
      },
    },
    { type: 'other' },
    new Set(),
    {},
  )
  expect(entity.point).toEqual([2.35, 48.85])
})
