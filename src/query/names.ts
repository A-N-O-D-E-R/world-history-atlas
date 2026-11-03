import type { Lang } from '../shared/dates.ts'
import type { Names } from '../shared/schema.ts'

/** Display name in the interface language, first letter capitalised
 * (Wikidata French labels are lowercase: « royaume de France »). */
export function displayName(names: Names, lang: Lang, fallback = ''): string {
  const n = names[lang] ?? names.fr ?? names.en ?? fallback
  return n.charAt(0).toLocaleUpperCase(lang) + n.slice(1)
}
