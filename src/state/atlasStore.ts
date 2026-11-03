import { create } from 'zustand'

export type LeftTab = 'explore' | 'layers'
export type BasemapLayer = 'coast' | 'modern-borders'

export interface SelectedCountry {
  code: string // ADM0_A3
  name: string
}

interface AtlasState {
  leftTab: LeftTab | null
  lastLeftTab: LeftTab // content kept while the panel slides out
  rightOpen: boolean
  layers: Record<BasemapLayer, boolean>
  selectedCountry: SelectedCountry | null
  toggleLeft: (tab: LeftTab) => void
  toggleRight: () => void
  setLayer: (layer: BasemapLayer, visible: boolean) => void
  selectCountry: (country: SelectedCountry | null) => void
}

export const useAtlas = create<AtlasState>((set) => ({
  leftTab: null,
  lastLeftTab: 'explore',
  rightOpen: false,
  layers: { coast: true, 'modern-borders': true },
  selectedCountry: null,
  toggleLeft: (tab) =>
    set((s) =>
      s.leftTab === tab
        ? { leftTab: null }
        : { leftTab: tab, lastLeftTab: tab },
    ),
  toggleRight: () => set((s) => ({ rightOpen: !s.rightOpen })),
  setLayer: (layer, visible) =>
    set((s) => ({ layers: { ...s.layers, [layer]: visible } })),
  selectCountry: (country) =>
    set({ selectedCountry: country, rightOpen: country !== null }),
}))
