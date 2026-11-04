import type { Page } from '@playwright/test'

// Pixel of a lon/lat in the initial view (center [10, 42], zoom 2.5, 512 px tiles).
export function pixel(page: Page, lon: number, lat: number) {
  const { width, height } = page.viewportSize()!
  const world = 512 * 2 ** 2.5
  const x = (l: number) => ((l + 180) / 360) * world
  const y = (l: number) => {
    const r = (l * Math.PI) / 180
    return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * world
  }
  return { x: width / 2 + x(lon) - x(10), y: height / 2 + y(lat) - y(42) }
}

export async function clickMap(page: Page, lon: number, lat: number) {
  const { x, y } = pixel(page, lon, lat)
  await page.mouse.click(x, y)
}

/** Move the timeline to a year (era button first: the slider spans one era). */
export async function goToYear(page: Page, era: string, year: number) {
  await page.getByRole('button', { name: era }).click()
  await page
    .getByRole('slider', { name: 'Année' })
    .fill(String(year < 0 ? year + 1 : year))
}
