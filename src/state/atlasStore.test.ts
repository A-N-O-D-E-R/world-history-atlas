import { beforeEach, expect, test } from 'vitest'
import { useAtlas } from './atlasStore'

beforeEach(() =>
  useAtlas.setState({ leftTab: null, rightOpen: false, selectedCountry: null }),
)

test('recliquer l’onglet actif ferme le panneau', () => {
  const { toggleLeft } = useAtlas.getState()
  toggleLeft('layers')
  expect(useAtlas.getState().leftTab).toBe('layers')
  toggleLeft('explore')
  expect(useAtlas.getState().leftTab).toBe('explore')
  toggleLeft('explore')
  expect(useAtlas.getState().leftTab).toBeNull()
})

test('sélectionner un pays ouvre la Fiche, désélectionner la ferme', () => {
  useAtlas
    .getState()
    .selectCountry({ code: 'FRA', names: { fr: 'France', en: 'France' } })
  expect(useAtlas.getState().rightOpen).toBe(true)
  useAtlas.getState().selectCountry(null)
  expect(useAtlas.getState().rightOpen).toBe(false)
})

test('le contenu du panneau reste celui du dernier onglet pendant la fermeture', () => {
  const { toggleLeft } = useAtlas.getState()
  toggleLeft('layers')
  toggleLeft('layers')
  expect(useAtlas.getState()).toMatchObject({
    leftTab: null,
    lastLeftTab: 'layers',
  })
})

test('la sélection est exclusive et « Monde » l’efface', () => {
  const s = useAtlas.getState
  s().selectCountry({ code: 'FRA', names: { fr: 'France', en: 'France' } })
  s().selectEntity('Q70972')
  expect(s()).toMatchObject({
    selectedEntity: 'Q70972',
    selectedCountry: null,
    rightOpen: true,
  })
  s().selectCountry({ code: 'DEU', names: { fr: 'Allemagne', en: 'Germany' } })
  expect(s().selectedEntity).toBeNull()
  s().clearSelection()
  expect(s()).toMatchObject({
    selectedEntity: null,
    selectedCountry: null,
    rightOpen: false,
  })
})
