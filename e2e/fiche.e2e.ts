import { type Page, expect, test } from '@playwright/test'

// Pixel of a lon/lat in the initial view (center [10, 42], zoom 2.5, 512 px tiles).
function pixel(page: Page, lon: number, lat: number) {
  const { width, height } = page.viewportSize()!
  const world = 512 * 2 ** 2.5
  const x = (l: number) => ((l + 180) / 360) * world
  const y = (l: number) => {
    const r = (l * Math.PI) / 180
    return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * world
  }
  return { x: width / 2 + x(lon) - x(10), y: height / 2 + y(lat) - y(42) }
}

async function clickMap(page: Page, lon: number, lat: number) {
  const { x, y } = pixel(page, lon, lat)
  await page.mouse.click(x, y)
}

test('clic sur un territoire historique → Fiche Entité, « Monde » efface', async ({
  page,
}) => {
  await page.goto('./')
  await expect(page.locator('.map')).toHaveAttribute(
    'data-snapshots',
    /wha:fr-kingdom/,
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
    /wha:fr-kingdom/,
  )
  await clickMap(page, 10.45, 51.16) // Allemagne
  await expect(
    page
      .getByRole('region', { name: 'Fiche' })
      .getByRole('heading', { name: 'Allemagne' }),
  ).toBeVisible()
})
