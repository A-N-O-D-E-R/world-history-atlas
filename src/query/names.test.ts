import { expect, test } from 'vitest'
import { displayName } from './names.ts'

test('majuscule initiale, repli fr puis en', () => {
  expect(
    displayName({ fr: 'royaume de France', en: 'Kingdom of France' }, 'fr'),
  ).toBe('Royaume de France')
  expect(displayName({ fr: 'royaume de France' }, 'en')).toBe(
    'Royaume de France',
  )
  expect(displayName({}, 'fr', 'Q1')).toBe('Q1')
})
