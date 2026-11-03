import { useTranslation } from 'react-i18next'
import { useAtlas } from '../state/atlasStore.ts'

/** « Monde » : back to the default view, no selection. */
export default function WorldButton() {
  const { t } = useTranslation()
  const clear = useAtlas((s) => s.clearSelection)
  return (
    <button
      type="button"
      className="fab world"
      onClick={clear}
      aria-label={t('world.label')}
      title={t('world.label')}
    >
      ◎
    </button>
  )
}
