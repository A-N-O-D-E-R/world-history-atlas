import { expect, test } from '@playwright/test'
import { clickMap, goToYear } from './map.ts'

test('Dirigeant à la date dans la Fiche Entité, puis Fiche Dirigeant', async ({
  page,
}) => {
  await page.goto('./')
  await goToYear(page, 'Temps modernes', 1700)
  await expect(page.getByTestId('current-date')).toHaveText('1700')
  await expect(page.locator('.map')).toHaveAttribute(
    'data-snapshots',
    /wha:ohm-/,
  )
  await clickMap(page, 2.35, 48.86) // Paris

  const fiche = page.getByRole('region', { name: 'Fiche' })
  await expect(
    fiche.getByRole('heading', { name: 'Royaume de France' }),
  ).toBeVisible()
  await expect(fiche).toContainText('Dirigeant à cette date')
  await fiche.getByRole('button', { name: 'Louis XIV' }).click()

  await expect(fiche.getByRole('heading', { name: 'Louis XIV' })).toBeVisible()
  await expect(fiche).toContainText('Roi de France et de Navarre')
  await expect(fiche).toContainText('14 mai 1643 – 1er septembre 1715')
  await expect(
    fiche.getByRole('link', { name: 'Article Wikipédia' }),
  ).toBeVisible()

  await fiche.getByRole('button', { name: 'Royaume de France' }).first().click()
  await expect(
    fiche.getByRole('heading', { name: 'Royaume de France' }),
  ).toBeVisible()
})
