# 13: Toutes les frontières OHM

**What to build:** Les Snapshots OpenHistoricalMap couvrant le territoire français sont extraits et publiés pour toutes les Entités concernées.

**Blocked by:** 10 (Fiche Entité minimale), 11 (Extraction Wikidata des Entités)

**Status:** done

- [x] Extraction OHM (relations datées), rattachement aux Entités par identifiant
- [x] Filtrage du tag `license` ; segments CC BY (CNIG) gardés et attribués
- [x] Simplification mapshaper, GeoJSON par Snapshot
- [x] Intervalles de validité des Snapshots issus des dates OHM

Notes : 220 Snapshots pour 29 Entités. Relations écartées (à signaler à OHM) : 2810171, 2830620, 2857597 (aucun polygone assemblé), 2913630 (fin 1807-12-10 avant début 1808-05-24), 2955284 (polygone invalide à la source). Surcharge Q142 (début 1958-10-04) pour éviter les frontières de 1947 au Moyen Âge.
