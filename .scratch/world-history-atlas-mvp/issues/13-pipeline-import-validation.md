Type: grilling
Status: resolved

## Question

Comment fonctionne le pipeline `data-src/` → `public/data/` (cf. Modèle de données) : étapes et outils (scripts Python GeoPandas/Shapely, mapshaper, tippecanoe), extraction (Wikidata JSON, OHM avec filtrage du tag `license`, Cliopatria `Type=POLITY`, Itiner-e, Natural Earth), contrôles de validation en CI (JSON, GeoJSON, polygones valides, cohérence des dates et intervalles, références manquantes, doublons d'identifiants, métadonnées de Source et licence), attributions générées, et réglages de performance (zoom max du fond 5 ou 7, seuil de bascule des Snapshots en PMTiles, cache) ?

## Answer

ADR : [docs/adr/0002-pipeline-typescript.md](../../../docs/adr/0002-pipeline-typescript.md).

- **Langage** : pipeline 100 % TypeScript/Node (Turf, mapshaper, fetch Wikidata JSON) ; tippecanoe via Docker ; un seul jeu de schémas pour valider en CI et typer l'app. QGIS = outil manuel pour géométries.
- **Extraction vs build** : extraction (Wikidata JSON, OHM avec filtrage/attribution du tag `license`, Cliopatria `Type=POLITY`, Itiner-e, AWMC, Natural Earth) = script lancé **à la main**, écrit `data-src/raw/`, commité. Build + validation en CI depuis `data-src/` seul, **sans réseau** (reproductible, pas de quota WDQS).
- **Validation CI** :
  - *erreurs bloquantes* : JSON/GeoJSON invalide, polygone invalide, identifiant en double, référence inexistante, intervalle incohérent (fin < début), date sans calendrier/précision, Source sans licence, licence hors liste blanche (CC0, CC BY, ODbL, domaine public, GPL), Snapshot sans Source ;
  - *avertissements* : libellé fr/en manquant, pas de lien Wikipédia, Snapshot > 1 Mo gzip, Entité sans Snapshot ni point.
  - Rapport posté en commentaire de chaque PR.
- **Attributions** : page « Sources & licences » générée depuis les Sources + attribution compacte MapLibre. Segments OHM CC BY (CNIG) gardés et attribués.
- **Performance** : fond Natural Earth PMTiles z0–7 (~16 Mo) ; bascule des Snapshots en PMTiles si l'un dépasse 1 Mo gzip (avertissement CI) ; pas de service worker au MVP (cache navigateur + mémoire ; Pages impose max-age=600).
- **CI/CD (GitHub Actions)** : PR → build + validation + rapport ; push `main` → build complet (données + app) + déploiement GitHub Pages ; + workflow issue → PR (cf. Contribution depuis site statique).
