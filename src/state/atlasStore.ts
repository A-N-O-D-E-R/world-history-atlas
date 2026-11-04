import { create } from 'zustand'
import { type StepUnit, type Ymd, daysInMonth } from '../shared/dates'
import { type Speed, fromIndex, stepWithin } from './timeline'

export type LeftTab = 'explore' | 'layers'
export type BasemapLayer = 'coast' | 'modern-borders'

export interface SelectedCountry {
  code: string // ADM0_A3
  names: { fr: string; en: string }
}

interface AtlasState {
  date: Ymd // Gregorian cursor of the timeline
  stepUnit: StepUnit
  playing: boolean
  speed: Speed
  stepBy: (dir: 1 | -1) => boolean
  setYearIndex: (index: number) => void
  jumpToYear: (year: number) => void
  setStepUnit: (unit: StepUnit) => void
  setPlaying: (playing: boolean) => void
  setSpeed: (speed: Speed) => void
  leftTab: LeftTab | null
  lastLeftTab: LeftTab // content kept while the panel slides out
  rightOpen: boolean
  layers: Record<BasemapLayer, boolean>
  selectedCountry: SelectedCountry | null
  selectedEntity: string | null // id of an Entité politique
  selectedRuler: string | null // id of a Dirigeant
  toggleLeft: (tab: LeftTab) => void
  toggleRight: () => void
  setLayer: (layer: BasemapLayer, visible: boolean) => void
  selectCountry: (country: SelectedCountry | null) => void
  selectEntity: (id: string | null) => void
  selectRuler: (id: string | null) => void
  clearSelection: () => void
}

export const useAtlas = create<AtlasState>((set, get) => ({
  date: { year: 987, month: 1, day: 1 },
  stepUnit: 'year',
  playing: false,
  speed: 1,
  stepBy: (dir) => {
    const next = stepWithin(get().date, get().stepUnit, dir)
    if (next) set({ date: next })
    else set({ playing: false })
    return next !== null
  },
  setYearIndex: (index) =>
    set((s) => {
      const year = fromIndex(index)
      const day = Math.min(s.date.day, daysInMonth(year, s.date.month))
      return { date: { ...s.date, year, day } }
    }),
  jumpToYear: (year) => set({ date: { year, month: 1, day: 1 } }),
  setStepUnit: (stepUnit) => set({ stepUnit }),
  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed }),
  leftTab: null,
  lastLeftTab: 'explore',
  rightOpen: false,
  layers: { coast: true, 'modern-borders': true },
  selectedCountry: null,
  selectedEntity: null,
  selectedRuler: null,
  toggleLeft: (tab) =>
    set((s) =>
      s.leftTab === tab
        ? { leftTab: null }
        : { leftTab: tab, lastLeftTab: tab },
    ),
  toggleRight: () => set((s) => ({ rightOpen: !s.rightOpen })),
  setLayer: (layer, visible) =>
    set((s) => ({ layers: { ...s.layers, [layer]: visible } })),
  // Selection is exclusive: a Pays actuel or an Entité politique.
  selectCountry: (country) =>
    set({
      selectedCountry: country,
      selectedEntity: null,
      selectedRuler: null,
      rightOpen: country !== null,
    }),
  selectEntity: (id) =>
    set({
      selectedEntity: id,
      selectedRuler: null,
      selectedCountry: null,
      rightOpen: id !== null,
    }),
  selectRuler: (id) =>
    set({
      selectedRuler: id,
      selectedEntity: null,
      selectedCountry: null,
      rightOpen: id !== null,
    }),
  clearSelection: () =>
    set({
      selectedCountry: null,
      selectedEntity: null,
      selectedRuler: null,
      rightOpen: false,
    }),
}))
