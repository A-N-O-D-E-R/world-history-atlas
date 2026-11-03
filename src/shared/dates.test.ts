import { describe, expect, test } from 'vitest'
import {
  formatDate,
  formatPoint,
  formatYear,
  julianToGregorian,
  makeDatePoint,
  sortKeyOf,
  step,
  validate,
} from './dates'

describe('pas d’année 0', () => {
  test('1 av. J.-C. + 1 an = 1', () => {
    expect(step({ year: -1, month: 6, day: 1 }, 'year', 1)).toEqual({
      year: 1,
      month: 6,
      day: 1,
    })
    expect(step({ year: 1, month: 6, day: 1 }, 'year', -1)).toEqual({
      year: -1,
      month: 6,
      day: 1,
    })
  })
  test('31 déc. 1 av. J.-C. + 1 jour = 1er janv. 1', () => {
    expect(step({ year: -1, month: 12, day: 31 }, 'day', 1)).toEqual({
      year: 1,
      month: 1,
      day: 1,
    })
    expect(step({ year: 1, month: 1, day: 1 }, 'day', -1)).toEqual({
      year: -1,
      month: 12,
      day: 31,
    })
  })
  test('déc. 1 av. J.-C. + 1 mois = janv. 1', () => {
    expect(step({ year: -1, month: 12, day: 15 }, 'month', 1)).toEqual({
      year: 1,
      month: 1,
      day: 15,
    })
  })
  test('le jour est borné au mois d’arrivée', () => {
    expect(step({ year: 2023, month: 1, day: 31 }, 'month', 1)).toEqual({
      year: 2023,
      month: 2,
      day: 28,
    })
    expect(step({ year: 2024, month: 2, day: 29 }, 'year', 1)).toEqual({
      year: 2025,
      month: 2,
      day: 28,
    })
  })
  test('1 av. J.-C. est bissextile en grégorien proleptique (année astronomique 0)', () => {
    expect(step({ year: -1, month: 2, day: 28 }, 'day', 1)).toEqual({
      year: -1,
      month: 2,
      day: 29,
    })
  })
  test('l’année 0 est refusée', () => {
    expect(validate('0', 'year')).toMatch(/année 0/)
  })
})

describe('validation', () => {
  test.each([
    ['987', 'year'],
    ['-52', 'year'],
    ['1180-05', 'month'],
    ['1789-07-14', 'day'],
    ['1500', 'century'],
  ] as const)('%s (%s) est valide', (v, p) => expect(validate(v, p)).toBeNull())

  test('valeur incohérente avec la précision', () => {
    expect(validate('1789-07-14', 'year')).toMatch(/précision/)
    expect(validate('1789', 'day')).toMatch(/précision/)
  })
  test('format, mois et jour invalides', () => {
    expect(validate('vers 1150', 'year')).toMatch(/format/)
    expect(validate('1180-13', 'month')).toMatch(/mois/)
    expect(validate('1900-02-29', 'day')).toMatch(/jour/)
    expect(validate('1900-02-29', 'day', 'julian')).toBeNull() // bissextile en julien
  })
  test('makeDatePoint rejette une date invalide', () => {
    expect(() => makeDatePoint('0', 'year')).toThrow(/année 0/)
  })
})

describe('julien → grégorien', () => {
  test('passage de 1582 : 4 oct. julien = 14 oct. grégorien', () => {
    expect(julianToGregorian({ year: 1582, month: 10, day: 4 })).toEqual({
      year: 1582,
      month: 10,
      day: 14,
    })
  })
  test('mort de Clovis : 27 nov. 511 julien = 29 nov. 511 grégorien', () => {
    expect(julianToGregorian({ year: 511, month: 11, day: 27 })).toEqual({
      year: 511,
      month: 11,
      day: 29,
    })
  })
  test('ides de mars : 15 mars 44 av. J.-C. julien = 13 mars grégorien', () => {
    expect(julianToGregorian({ year: -44, month: 3, day: 15 })).toEqual({
      year: -44,
      month: 3,
      day: 13,
    })
  })
  test('la date julienne s’affiche en grégorien, la valeur source est conservée', () => {
    const d = makeDatePoint('511-11-27', 'day', 'julian')
    expect(d.value).toBe('511-11-27')
    expect(d.calendar).toBe('julian')
    expect(formatPoint(d)).toBe('29 novembre 511')
  })
})

describe('clé de tri', () => {
  test('ordre chronologique à travers l’an 1', () => {
    const keys = ['-500', '-1', '1', '987'].map(
      (v) => makeDatePoint(v, 'year').sortKey,
    )
    expect([...keys].sort((a, b) => a - b)).toEqual(keys)
    expect(keys[2] - keys[1]).toBe(366) // 1 av. J.-C. = bissextile proleptique
  })
  test('un siècle commence à sa première année', () => {
    expect(makeDatePoint('1550', 'century').sortKey).toBe(
      makeDatePoint('1501', 'year').sortKey,
    )
    expect(makeDatePoint('-450', 'century').sortKey).toBe(
      makeDatePoint('-500', 'year').sortKey,
    )
  })
  test('un intervalle se trie par sa borne au plus tôt', () => {
    const iv = {
      earliest: makeDatePoint('1150', 'year'),
      latest: makeDatePoint('1159', 'year'),
    }
    expect(sortKeyOf(iv)).toBe(iv.earliest.sortKey)
  })
})

describe('formatage', () => {
  test('années', () => {
    expect(formatYear(-500)).toBe('500 av. J.-C.')
    expect(formatYear(-500, 'en')).toBe('500 BCE')
    expect(formatYear(987)).toBe('987')
  })
  test('précisions fr / en', () => {
    expect(formatPoint(makeDatePoint('1789-07-14', 'day'))).toBe(
      '14 juillet 1789',
    )
    expect(formatPoint(makeDatePoint('1789-07-14', 'day'), 'en')).toBe(
      'July 14, 1789',
    )
    expect(formatPoint(makeDatePoint('1180-05', 'month'))).toBe('mai 1180')
    expect(formatPoint(makeDatePoint('1500', 'century'))).toBe('XVᵉ siècle')
    expect(formatPoint(makeDatePoint('-450', 'century'))).toBe(
      'Vᵉ siècle av. J.-C.',
    )
    expect(formatPoint(makeDatePoint('1801', 'century'), 'en')).toBe(
      '19th century',
    )
    expect(formatPoint(makeDatePoint('1066-01-01', 'day'))).toBe(
      '1er janvier 1066',
    )
  })
  test('intervalle', () => {
    const iv = {
      earliest: makeDatePoint('1150', 'year'),
      latest: makeDatePoint('1159', 'year'),
    }
    expect(formatDate(iv)).toBe('entre 1150 et 1159')
    expect(formatDate(iv, 'en')).toBe('between 1150 and 1159')
  })
})
