import { expect, test } from '@playwright/test'

// Parcours E : aller en 500 av. J.-C. et vérifier qu'aucune année 0 n'apparaît.
test('parcours E — 500 av. J.-C., jamais d’année 0', async ({ page }) => {
  await page.goto('./')
  const date = page.getByTestId('current-date')
  const slider = page.getByRole('slider', { name: 'Année' })

  await slider.fill('-499') // index astronomique de 500 av. J.-C.
  await expect(date).toHaveText('500 av. J.-C.')

  await slider.fill('-1') // 2 av. J.-C.
  const seen: string[] = []
  for (let i = 0; i < 3; i++) {
    seen.push((await date.textContent()) ?? '')
    await page.getByRole('button', { name: 'Suivant' }).click()
  }
  seen.push((await date.textContent()) ?? '')
  expect(seen).toEqual(['2 av. J.-C.', '1 av. J.-C.', '1', '2'])
  expect(seen).not.toContain('0')
})

test('pas jour : 31 déc. 1 av. J.-C. + 1 jour = 1er janvier 1', async ({
  page,
}) => {
  await page.goto('./')
  const date = page.getByTestId('current-date')
  await page.getByRole('slider', { name: 'Année' }).fill('0') // 1 av. J.-C.
  await page.getByRole('button', { name: 'jour' }).click()
  await expect(date).toHaveText('1er janvier 1 av. J.-C.')
  await page.getByRole('button', { name: 'Précédent' }).click()
  await expect(date).toHaveText('31 décembre 2 av. J.-C.')
})
