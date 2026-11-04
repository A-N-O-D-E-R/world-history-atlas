import { expect, test } from '@playwright/test'

test('page Sources et licences, générée depuis les Sources publiées', async ({
  page,
}) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Explorer' }).click()
  await page.getByRole('link', { name: 'Sources et licences' }).click()

  const dialog = page.getByRole('dialog', { name: 'Sources et licences' })
  await expect(
    dialog.getByRole('heading', { name: 'OpenHistoricalMap' }),
  ).toBeVisible()
  await expect(
    dialog.getByRole('heading', { name: /Cliopatria/ }),
  ).toBeVisible()
  await expect(
    dialog.getByRole('link', { name: 'CC BY 4.0' }).first(),
  ).toHaveAttribute('href', /creativecommons\.org\/licenses\/by\/4\.0/)
  await expect(dialog).toContainText('Domaine public') // Natural Earth
  await expect(dialog).toContainText('Reconstitution approximative') // Cliopatria

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page).not.toHaveURL(/#sources/)
})

test('l’ancre #sources ouvre directement la page', async ({ page }) => {
  await page.goto('./#sources')
  await expect(
    page.getByRole('dialog', { name: 'Sources et licences' }),
  ).toBeVisible()
})
