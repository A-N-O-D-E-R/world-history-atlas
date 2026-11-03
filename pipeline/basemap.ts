// Manual step: build the Natural Earth basemap PMTiles (z0–7) with tippecanoe.
// Output is committed in data-src/; the regular build only copies it.
//   pnpm data:basemap
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const NE =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson'
const LAYERS = {
  land: 'ne_10m_land',
  countries: 'ne_10m_admin_0_countries',
  boundaries: 'ne_10m_admin_0_boundary_lines_land',
} as const

const root = resolve(import.meta.dirname, '..')
const cache = resolve(root, '.cache/natural-earth')
const out = resolve(root, 'data-src/basemap.pmtiles')
mkdirSync(cache, { recursive: true })

for (const file of Object.values(LAYERS)) {
  const path = resolve(cache, `${file}.geojson`)
  if (existsSync(path)) continue
  console.log(`download ${file}`)
  const res = await fetch(`${NE}/${file}.geojson`)
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`)
  writeFileSync(path, Buffer.from(await res.arrayBuffer()))
}

execFileSync(
  'docker',
  [
    'build',
    '-q',
    '-t',
    'wha-tippecanoe',
    '-f',
    'pipeline/tippecanoe.Dockerfile',
    'pipeline',
  ],
  {
    cwd: root,
    stdio: 'inherit',
  },
)
execFileSync(
  'docker',
  [
    'run',
    '--rm',
    '-u',
    `${process.getuid?.()}:${process.getgid?.()}`,
    '-v',
    `${root}:/work`,
    'wha-tippecanoe',
    '-o',
    'data-src/basemap.pmtiles',
    '--force',
    '--quiet',
    '-Z0',
    '-z7',
    '--no-simplification-of-shared-nodes',
    '--coalesce-densest-as-needed',
    '--extend-zooms-if-still-dropping',
    '-y',
    'NAME_FR',
    '-y',
    'NAME_EN',
    '-y',
    'ADM0_A3',
    '-y',
    'ISO_A2',
    '-y',
    'CONTINENT',
    '--attribution',
    'Natural Earth',
    ...Object.entries(LAYERS).flatMap(([name, file]) => [
      '-L',
      `${name}:.cache/natural-earth/${file}.geojson`,
    ]),
  ],
  { cwd: root, stdio: 'inherit' },
)
console.log(`wrote ${out}`)
