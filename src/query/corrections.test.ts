import { expect, test } from 'vitest'
import { formatValue } from './corrections.ts'

test('valeurs corrigées lisibles', () => {
  expect(
    formatValue(
      { value: '1791-09-04', calendar: 'gregorian', precision: 'day' },
      'fr',
    ),
  ).toBe('4 septembre 1791')
  expect(
    formatValue({ value: '-52', calendar: 'julian', precision: 'year' }, 'fr'),
  ).toBe('52 av. J.-C.')
  expect(formatValue('Royaume des Français', 'fr')).toBe('Royaume des Français')
  expect(formatValue(undefined, 'fr')).toBe('—')
  expect(formatValue([2.35, 48.85], 'fr')).toBe('[2.35,48.85]')
})
