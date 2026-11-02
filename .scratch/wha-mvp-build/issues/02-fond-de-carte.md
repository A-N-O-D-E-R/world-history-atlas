# 02: Fond de carte Natural Earth

**What to build:** Le visiteur voit une carte du monde style parchemin, fluide au zoom et au déplacement, servie depuis un PMTiles construit par le pipeline.

**Blocked by:** 01 (Init et déploiement)

**Status:** ready-for-agent

- [ ] Script de pipeline (TypeScript) qui construit le PMTiles Natural Earth z0–7 via tippecanoe (Docker)
- [ ] Carte MapLibre plein écran, style parchemin (côtes, mers, frontières modernes)
- [ ] PMTiles servi depuis Pages avec requêtes Range (vérifié en production)
- [ ] Attribution Natural Earth visible
