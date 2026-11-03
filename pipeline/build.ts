// Regular build (CI, no network): validate data-src/ and publish public/data/.
//   pnpm data:build  → exits 1 on validation errors; report in .cache/data-report.md
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildData, formatReport } from './data.ts'

const root = resolve(import.meta.dirname, '..')
const out = resolve(root, 'public/data')
mkdirSync(out, { recursive: true })
copyFileSync(
  resolve(root, 'data-src/basemap.pmtiles'),
  resolve(out, 'basemap.pmtiles'),
)

const report = buildData(resolve(root, 'data-src'), out)
const md = formatReport(report)
mkdirSync(resolve(root, '.cache'), { recursive: true })
writeFileSync(resolve(root, '.cache/data-report.md'), md)
console.log(md)
if (report.errors.length) process.exit(1)
