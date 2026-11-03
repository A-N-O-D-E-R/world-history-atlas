# 02: Fond de carte Natural Earth

**What to build:** Le visiteur voit une carte du monde style parchemin, fluide au zoom et au déplacement, servie depuis un PMTiles construit par le pipeline.

**Blocked by:** 01 (Init et déploiement)

**Status:** done

- [x] Script de pipeline (TypeScript) qui construit le PMTiles Natural Earth z0–7 via tippecanoe (Docker)
- [x] Carte MapLibre plein écran, style parchemin (côtes, mers, frontières modernes)
- [x] PMTiles servi depuis Pages avec requêtes Range (vérifié en production)
- [x] Attribution Natural Earth visible

Note : avertissement MapLibre « Max vertices per segment is 65535 » sur certaines tuiles de terres (gros polygones Natural Earth 10m) ; aucun défaut visible à z2–3, à surveiller aux zooms élevés.
