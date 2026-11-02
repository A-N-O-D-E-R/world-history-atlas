import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'
import App from './App'

test('affiche le titre de l’atlas', () => {
  expect(renderToString(<App />)).toContain('World History Atlas')
})
