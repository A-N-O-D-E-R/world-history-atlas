import type { Dict } from './fr'

export const en: Dict = {
  brand: 'World History Atlas',
  tabs: {
    explore: 'Explore',
    layers: 'Layers',
    fiche: 'Details',
    leftNav: 'Left panels',
    rightNav: 'Right panel',
  },
  explore: {
    intro:
      'A historical atlas of the world. Historical data is added country by country, starting with France.',
    contribute: 'Contribute on GitHub',
  },
  layers: { 'modern-borders': 'Modern borders', coast: 'Coastlines' },
  fiche: {
    empty: 'Click a territory on the map.',
    close: 'Close details',
    modernCountry: 'Present-day country',
    noData: 'No historical data for this territory yet.',
  },
  timeline: {
    label: 'Timeline',
    prev: 'Previous',
    next: 'Next',
    play: 'Play',
    pause: 'Pause',
    step: 'Timeline step',
    units: { day: 'day', month: 'month', year: 'year' },
    speed: 'speed',
    slider: 'Year',
    eras: 'Eras',
    era: {
      antiquity: 'Antiquity',
      'middle-ages': 'Middle Ages',
      'early-modern': 'Early modern',
      contemporary: 'Contemporary',
    },
  },
  snapshot: {
    nearest:
      '{{name}}: border of {{from}} – {{to}} (no known border for this date)',
    now: 'today',
  },
  lang: { label: 'Language', fr: 'Français', en: 'English' },
}
