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

test('aucun texte d’interface codé en dur dans les composants', async () => {
  const { readdirSync, readFileSync } = await import('node:fs')
  const files = readdirSync('src', {
    recursive: true,
    encoding: 'utf8',
  }).filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))
  const offenders = files.flatMap((f) => {
    const src = readFileSync(`src/${f}`, 'utf8')
    const hits = [
      ...src.matchAll(/(?<!=)>\s*([A-Za-zÀ-ÿ][^<>{}]*[A-Za-zÀ-ÿ])\s*</g), // JSX text
      ...src.matchAll(/(?:aria-label|title|placeholder|alt)="([^"]+)"/g), // literal attributes
    ]
    return hits.map((m) => `${f}: ${m[1]}`)
  })
  expect(offenders).toEqual([])
})
