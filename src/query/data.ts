import type { FeatureCollection } from 'geojson'
import type { EntityIndexEntry } from '../shared/schema.ts'
import { fileOf } from '../shared/schema.ts'

const url = (path: string) => new URL(`data/${path}`, document.baseURI).href

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(url(path))
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.json() as Promise<T>
}

let index: Promise<EntityIndexEntry[]> | null = null
export const loadIndex = () =>
  (index ??= getJson<EntityIndexEntry[]>('index/entities.json'))

const snapshots = new Map<string, Promise<FeatureCollection>>()
/** Lazy, cached Snapshot geometry. */
export function loadSnapshot(id: string) {
  let p = snapshots.get(id)
  if (!p) {
    p = getJson<FeatureCollection>(`snapshots/${fileOf(id)}.geojson`)
    snapshots.set(id, p)
    p.catch(() => snapshots.delete(id)) // retry on next request
  }
  return p
}
