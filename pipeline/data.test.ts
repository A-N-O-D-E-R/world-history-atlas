import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, test } from 'vitest'
import { buildData } from './data.ts'

let src: string
let out: string

const square = (x: number, y: number, s = 1) => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [x, y],
        [x + s, y],
        [x + s, y + s],
        [x, y + s],
        [x, y],
      ],
    ],
  },
})
const year = (value: string) => ({
  value,
  calendar: 'gregorian',
  precision: 'year',
})

function put(path: string, value: unknown) {
  const full = join(src, path)
  mkdirSync(join(full, '..'), { recursive: true })
  writeFileSync(full, typeof value === 'string' ? value : JSON.stringify(value))
}

/** A minimal valid dataset: one Source, one Entité, one Snapshot. */
function valid() {
  put('sources/wha_ohm.json', {
    id: 'wha:ohm',
    name: 'OpenHistoricalMap',
    licence: 'CC0-1.0',
    reliability: 'medium',
  })
  put('entities/Q70972.json', {
    id: 'Q70972',
    names: { fr: 'Royaume de France', en: 'Kingdom of France' },
    type: 'kingdom',
    start: year('987'),
    end: year('1792'),
    sources: ['wha:ohm'],
    wikipedia: { fr: 'Royaume_de_France' },
  })
  put('snapshots/wha_fr-1180.json', {
    id: 'wha:fr-1180',
    entity: 'Q70972',
    from: year('1180'),
    to: year('1223'),
    source: 'wha:ohm',
  })
  put('snapshots/wha_fr-1180.geojson', {
    type: 'FeatureCollection',
    features: [square(0, 45, 2)],
  })
}

const run = () => buildData(src, out)
const messages = (
  r: ReturnType<typeof run>,
  kind: 'errors' | 'warnings' = 'errors',
) => r[kind].map((i) => `${i.file}: ${i.message}`)
const read = (path: string) => JSON.parse(readFileSync(join(out, path), 'utf8'))

beforeEach(() => {
  src = mkdtempSync(join(tmpdir(), 'wha-src-'))
  out = mkdtempSync(join(tmpdir(), 'wha-out-'))
})

describe('publication', () => {
  test('un jeu valide est publié sans erreur', () => {
    valid()
    const r = run()
    expect(r.errors).toEqual([])
    const entity = read('entities/Q70972.json')
    expect(entity.start).toMatchObject({
      value: '987',
      calendar: 'gregorian',
      precision: 'year',
    })
    expect(entity.start.sortKey).toBeTypeOf('number')
    expect(entity.snapshots).toEqual([
      expect.objectContaining({ id: 'wha:fr-1180', reliability: 'medium' }), // hérite de la Source
    ])
    const snap = read('snapshots/wha_fr-1180.geojson')
    expect(snap.features[0].properties).toMatchObject({
      entity: 'Q70972',
      source: 'wha:ohm',
      reliability: 'medium',
    })
    expect(read('sources/wha_ohm.json').licence).toBe('CC0-1.0')
    const [entry] = read('index/entities.json')
    expect(entry).toMatchObject({ id: 'Q70972', bbox: [0, 45, 2, 47] })
  })

  test('la fiabilité surchargée avec note remplace celle de la Source', () => {
    valid()
    put('snapshots/wha_fr-1180.json', {
      id: 'wha:fr-1180',
      entity: 'Q70972',
      from: year('1180'),
      source: 'wha:ohm',
      reliability: 'high',
      note: 'Traité de Paris cité',
    })
    expect(run().errors).toEqual([])
    expect(read('index/entities.json')[0].snapshots[0].reliability).toBe('high')
  })

  test('les dates juliennes gardent leur valeur source', () => {
    valid()
    put('entities/Q70972.json', {
      ...JSON.parse(readFileSync(join(src, 'entities/Q70972.json'), 'utf8')),
      start: { value: '987-07-03', calendar: 'julian', precision: 'day' },
    })
    expect(run().errors).toEqual([])
    expect(read('entities/Q70972.json').start).toMatchObject({
      value: '987-07-03',
      calendar: 'julian',
    })
  })

  test('rien n’est publié quand il y a une erreur', () => {
    valid()
    put('sources/wha_ohm.json', {
      id: 'wha:ohm',
      name: 'OHM',
      reliability: 'medium',
    })
    expect(run().errors.length).toBeGreaterThan(0)
    expect(() => read('index/entities.json')).toThrow()
  })
})

describe('erreurs bloquantes', () => {
  test.each([
    [
      'JSON invalide',
      () => put('sources/wha_x.json', '{ pas du json'),
      /JSON invalide/,
    ],
    [
      'GeoJSON invalide',
      () => put('snapshots/wha_fr-1180.geojson', '{"type":"Point"}'),
      /GeoJSON invalide/,
    ],
    [
      'polygone invalide (auto-intersection)',
      () =>
        put('snapshots/wha_fr-1180.geojson', {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [2, 2],
                [2, 0],
                [0, 2],
                [0, 0],
              ],
            ],
          },
        }),
      /polygone invalide/,
    ],
    [
      'géométrie manquante',
      () =>
        put('snapshots/wha_fr-1300.json', {
          id: 'wha:fr-1300',
          entity: 'Q70972',
          from: year('1300'),
          source: 'wha:ohm',
        }),
      /géométrie manquante/,
    ],
    [
      'identifiant dupliqué',
      () =>
        put('sources/wha_ohm2.json', {
          id: 'wha:ohm',
          name: 'Doublon',
          licence: 'CC0-1.0',
          reliability: 'medium',
        }),
      /identifiant dupliqué/,
    ],
    [
      'référence inexistante (Entité)',
      () =>
        put('snapshots/wha_fr-1180.json', {
          id: 'wha:fr-1180',
          entity: 'Q1',
          from: year('1180'),
          source: 'wha:ohm',
        }),
      /référence inexistante : Entité « Q1 »/,
    ],
    [
      'référence inexistante (Source)',
      () =>
        put('snapshots/wha_fr-1180.json', {
          id: 'wha:fr-1180',
          entity: 'Q70972',
          from: year('1180'),
          source: 'wha:nope',
        }),
      /référence inexistante : Source/,
    ],
    [
      'intervalle incohérent',
      () =>
        put('snapshots/wha_fr-1180.json', {
          id: 'wha:fr-1180',
          entity: 'Q70972',
          from: year('1223'),
          to: year('1180'),
          source: 'wha:ohm',
        }),
      /intervalle incohérent/,
    ],
    [
      'année 0',
      () =>
        put('snapshots/wha_fr-1180.json', {
          id: 'wha:fr-1180',
          entity: 'Q70972',
          from: year('0'),
          source: 'wha:ohm',
        }),
      /année 0/,
    ],
    [
      'date sans calendrier',
      () =>
        put('snapshots/wha_fr-1180.json', {
          id: 'wha:fr-1180',
          entity: 'Q70972',
          from: { value: '1180', precision: 'year' },
          source: 'wha:ohm',
        }),
      /from : date attendue.*calendrier et précision obligatoires/,
    ],
    [
      'date sans précision',
      () =>
        put('snapshots/wha_fr-1180.json', {
          id: 'wha:fr-1180',
          entity: 'Q70972',
          from: { value: '1180', calendar: 'gregorian' },
          source: 'wha:ohm',
        }),
      /from : date attendue.*calendrier et précision obligatoires/,
    ],
    [
      'Source sans licence',
      () =>
        put('sources/wha_ohm.json', {
          id: 'wha:ohm',
          name: 'OHM',
          reliability: 'medium',
        }),
      /Source sans licence/,
    ],
    [
      'licence hors liste blanche',
      () =>
        put('sources/wha_ohm.json', {
          id: 'wha:ohm',
          name: 'CShapes',
          licence: 'CC-BY-NC-SA-4.0',
          reliability: 'medium',
        }),
      /hors liste blanche/,
    ],
    [
      'Snapshot sans Source',
      () =>
        put('snapshots/wha_fr-1180.json', {
          id: 'wha:fr-1180',
          entity: 'Q70972',
          from: year('1180'),
        }),
      /Snapshot sans Source/,
    ],
    [
      'fiabilité surchargée sans note',
      () =>
        put('snapshots/wha_fr-1180.json', {
          id: 'wha:fr-1180',
          entity: 'Q70972',
          from: year('1180'),
          source: 'wha:ohm',
          reliability: 'high',
        }),
      /sans note/,
    ],
    [
      'identifiant mal formé',
      () =>
        put('sources/wha_x.json', {
          id: 'ohm',
          name: 'X',
          licence: 'CC0-1.0',
          reliability: 'medium',
        }),
      /identifiant attendu/,
    ],
  ])('%s', (_name, mutate, expected) => {
    valid()
    mutate()
    expect(messages(run()).join('\n')).toMatch(expected)
  })
})

describe('avertissements (non bloquants)', () => {
  test('libellés, Wikipédia, Entité sans Snapshot ni point', () => {
    valid()
    put('entities/wha_gaul.json', {
      id: 'wha:gaul',
      names: { fr: 'Gaule' },
      type: 'other',
      start: year('-500'),
    })
    const r = run()
    expect(r.errors).toEqual([])
    expect(messages(r, 'warnings')).toEqual([
      'entities/wha_gaul.json: libellé en manquant',
      'entities/wha_gaul.json: pas de lien Wikipédia',
      'entities/wha_gaul.json: Entité sans Snapshot ni point',
    ])
  })

  test('une Entité avec un point mais sans Snapshot ne déclenche pas d’avertissement de géométrie', () => {
    valid()
    put('entities/wha_arverni.json', {
      id: 'wha:arverni',
      names: { fr: 'Arvernes', en: 'Arverni' },
      type: 'tribal',
      start: year('-200'),
      point: [3.08, 45.77],
      wikipedia: { fr: 'Arvernes' },
    })
    expect(messages(run(), 'warnings')).toEqual([])
  })
})
