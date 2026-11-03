import { useEffect, useMemo, useState } from 'react'
import { toJdn } from '../shared/dates.ts'
import type { EntityIndexEntry } from '../shared/schema.ts'
import { useAtlas } from '../state/atlasStore.ts'
import { loadIndex } from './data.ts'
import { type Resolved, resolveAll } from './resolve.ts'

/** Snapshots to display at the timeline date (recomputed on every date change). */
export function useResolved(): Resolved[] {
  const [index, setIndex] = useState<EntityIndexEntry[]>([])
  const date = useAtlas((s) => s.date)
  useEffect(() => {
    loadIndex().then(setIndex, (e) => console.error(e))
  }, [])
  const day = toJdn(date)
  return useMemo(() => resolveAll(index, day), [index, day])
}
