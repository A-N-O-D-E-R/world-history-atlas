import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { type Lang, type StepUnit, formatYmd } from '../shared/dates'
import { useAtlas } from '../state/atlasStore'
import { formatYear } from '../shared/dates'
import {
  ERAS,
  SPEEDS,
  type Speed,
  eraOf,
  fractionInEra,
  toIndex,
} from '../state/timeline'

const UNITS: StepUnit[] = ['day', 'month', 'year']

export default function TimelineDock() {
  const { t, i18n } = useTranslation()
  const {
    date,
    stepUnit,
    playing,
    speed,
    stepBy,
    setYearIndex,
    jumpToYear,
    setStepUnit,
    setPlaying,
    setSpeed,
  } = useAtlas()
  const lang = (i18n.resolvedLanguage ?? 'fr') as Lang

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => useAtlas.getState().stepBy(1), 600 / speed)
    return () => clearInterval(id)
  }, [playing, speed])

  const label = formatYmd(date, stepUnit, lang)
  const era = eraOf(date.year)
  return (
    <>
      <output
        className="big-date"
        aria-live="polite"
        data-testid="current-date"
      >
        {label}
      </output>
      <section className="dock" aria-label={t('timeline.label')}>
        <div className="dock-row">
          <button
            type="button"
            onClick={() => stepBy(-1)}
            aria-label={t('timeline.prev')}
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => setPlaying(!playing)}
            aria-label={t(playing ? 'timeline.pause' : 'timeline.play')}
          >
            {playing ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            onClick={() => stepBy(1)}
            aria-label={t('timeline.next')}
          >
            ▶▶
          </button>
          <span className="units" role="group" aria-label={t('timeline.step')}>
            {UNITS.map((u) => (
              <button
                key={u}
                type="button"
                aria-pressed={stepUnit === u}
                onClick={() => setStepUnit(u)}
              >
                {t(`timeline.units.${u}`)}
              </button>
            ))}
          </span>
          <label className="speed">
            {t('timeline.speed')}
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value) as Speed)}
            >
              {SPEEDS.map((s) => (
                <option key={s} value={s}>
                  ×{s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <input
          type="range"
          className="slider"
          aria-label={t('timeline.slider')}
          aria-valuetext={label}
          min={toIndex(era.start)}
          max={toIndex(era.end)}
          value={toIndex(date.year)}
          onChange={(e) => setYearIndex(Number(e.target.value))}
        />
        <div className="slider-ends" aria-hidden="true">
          <span>{formatYear(era.start, lang)}</span>
          <span>{formatYear(era.end, lang)}</span>
        </div>
        <div className="eras" role="group" aria-label={t('timeline.eras')}>
          {ERAS.map((e) => (
            <button
              key={e.id}
              type="button"
              aria-pressed={e === era}
              style={{
                flexGrow: toIndex(e.end) - toIndex(e.start),
                ['--c' as string]: e.color,
              }}
              title={`${formatYear(e.start, lang)} – ${formatYear(e.end, lang)}`}
              onClick={() => jumpToYear(e.start)}
            >
              <span>{t(`timeline.era.${e.id}`)}</span>
              {e === era && (
                <i
                  className="era-mark"
                  style={{ left: `${fractionInEra(date.year) * 100}%` }}
                />
              )}
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
