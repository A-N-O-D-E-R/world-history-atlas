import { expect, test } from 'vitest'
import { en } from './en'
import { fr } from './fr'

const keys = (o: object, p = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`],
  )

test('fr et en ont exactement les mêmes clés, toutes non vides', () => {
  expect(keys(en).sort()).toEqual(keys(fr).sort())
  for (const d of [fr, en])
    for (const k of keys(d))
      expect(k.split('.').reduce((o: any, x) => o[x], d)).not.toBe('')
})

test('aucun texte d’interface codé en dur dans les composants', () => {
  const sources = import.meta.glob<string>(
    ['../**/*.tsx', '!../**/*.test.tsx'],
    {
      query: '?raw',
      import: 'default',
      eager: true,
    },
  )
  expect(Object.keys(sources).length).toBeGreaterThan(3)
  const offenders = Object.entries(sources).flatMap(([f, src]) => {
    const hits = [
      ...src.matchAll(/(?<!=)>\s*([A-Za-zÀ-ÿ][^<>{}]*[A-Za-zÀ-ÿ])\s*</g), // JSX text
      ...src.matchAll(/(?:aria-label|title|placeholder|alt)="([^"]+)"/g), // literal attributes
    ]
    return hits.map((m) => `${f}: ${m[1]}`)
  })
  expect(offenders).toEqual([])
})
