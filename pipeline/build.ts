// Regular build (CI, no network): data-src/ → public/data/.
import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
mkdirSync(resolve(root, 'public/data'), { recursive: true })
copyFileSync(
  resolve(root, 'data-src/basemap.pmtiles'),
  resolve(root, 'public/data/basemap.pmtiles'),
)
console.log('public/data ready')
