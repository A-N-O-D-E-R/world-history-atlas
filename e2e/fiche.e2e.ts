import { expect, test } from '@playwright/test'
import { clickMap } from './map.ts'

test('clic sur un territoire historique → Fiche Entité, « Monde » efface', async ({
  page,
}) => {
  await page.goto('./')
  await expect(page.locator('.map')).toHaveAttribute(
    'data-snapshots',
    /wha:ohm-/,
  )
  await clickMap(page, 2.35, 48.86) // Paris

  const fiche = page.getByRole('region', { name: 'Fiche' })
  await expect(
    fiche.getByRole('heading', { name: 'Royaume de France' }),
  ).toBeVisible()
  await expect(fiche).toContainText('Royaume')
  await expect(fiche).toContainText('987 – 4 septembre 1791')
  await expect(fiche).toContainText('Fiabilité moyenne')
  await expect(fiche).toContainText('la plus proche') // 987: no Snapshot covers the date
  await expect(
    fiche.getByRole('link', { name: 'OpenHistoricalMap' }),
  ).toBeVisible()
  await expect(fiche).toContainText('CNIG')

  await page.getByRole('button', { name: /^Monde/ }).click()
  await expect(page.locator('.side-right')).toHaveClass(/off/)
})

test('hors du territoire historique → Pays actuel', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('.map')).toHaveAttribute(
    'data-snapshots',
    /wha:ohm-/,
  )
  await clickMap(page, 37.62, 55.75) // Moscou : hors de toute Entité du jeu
  await expect(
    page
      .getByRole('region', { name: 'Fiche' })
      .getByRole('heading', { name: 'Russie' }),
  ).toBeVisible()
})

// Parcours B : Empire romain en 117, Snapshot disponible affiché.
test('parcours B — Empire romain en 117', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Antiquité' }).click()
  await page.getByRole('slider', { name: 'Année' }).fill('117')
  await expect(page.getByTestId('current-date')).toHaveText('117')
  await expect(page.locator('.map')).toHaveAttribute(
    'data-snapshots',
    /wha:ohm-2849539/,
  )
  await clickMap(page, 12.5, 41.9) // Rome

  const fiche = page.getByRole('region', { name: 'Fiche' })
  await expect(
    fiche.getByRole('heading', { name: 'Empire romain' }),
  ).toBeVisible()
  await expect(fiche).toContainText('117 – 118') // frontière OHM de l'année
  await expect(fiche).not.toContainText('la plus proche')
  await expect(
    fiche.getByRole('link', { name: 'OpenHistoricalMap' }),
  ).toBeVisible()
})
