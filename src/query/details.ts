import type { FeatureCollection } from 'geojson'
import type {
  PublishedEntity,
  PublishedSnapshotProps,
  PublishedSource,
  PublishedRuler,
} from '../shared/schema.ts'
import { fileOf } from '../shared/schema.ts'
import { getJson, loadSnapshot } from './data.ts'

const entities = new Map<string, Promise<PublishedEntity>>()
const sources = new Map<string, Promise<PublishedSource>>()
const rulers = new Map<string, Promise<PublishedRuler>>()

const cached = <T>(
  cache: Map<string, Promise<T>>,
  key: string,
  load: () => Promise<T>,
) => {
  let p = cache.get(key)
  if (!p) {
    p = load()
    cache.set(key, p)
    p.catch(() => cache.delete(key))
  }
  return p
}

export const loadEntity = (id: string) =>
  cached(entities, id, () =>
    getJson<PublishedEntity>(`entities/${fileOf(id)}.json`),
  )
export const loadSource = (id: string) =>
  cached(sources, id, () =>
    getJson<PublishedSource>(`sources/${fileOf(id)}.json`),
  )

/** Snapshot metadata (Source, extra Sources, note) from its published geometry. */
export async function loadSnapshotProps(
  id: string,
): Promise<PublishedSnapshotProps> {
  const fc: FeatureCollection = await loadSnapshot(id)
  return fc.features[0].properties as PublishedSnapshotProps
}

export const loadRuler = (id: string) =>
  cached(rulers, id, () => getJson<PublishedRuler>(`rulers/${fileOf(id)}.json`))
