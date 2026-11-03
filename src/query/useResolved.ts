import { useEffect, useMemo, useState } from 'react'
import { toJdn } from '../shared/dates.ts'
import type { EntityIndexEntry } from '../shared/schema.ts'
import { useAtlas } from '../state/atlasStore.ts'
import { loadIndex } from './data.ts'
import { type Resolved, resolveAll, withoutBorder } from './resolve.ts'

/** What the map shows at the timeline date: resolved Snapshots + Entités without border. */
export function useResolved(): {
  resolved: Resolved[]
  missing: EntityIndexEntry[]
} {
  const [index, setIndex] = useState<EntityIndexEntry[]>([])
  const date = useAtlas((s) => s.date)
  useEffect(() => {
    loadIndex().then(setIndex, (e) => console.error(e))
  }, [])
  const day = toJdn(date)
  return useMemo(
    () => ({
      resolved: resolveAll(index, day),
      missing: withoutBorder(index, day),
    }),
    [index, day],
  )
}
