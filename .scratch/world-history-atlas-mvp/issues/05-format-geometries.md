Type: research
Status: resolved

## Question

Quel format servir pour les géométries (Snapshots + fond Natural Earth) depuis GitHub Pages avec MapLibre GL JS : GeoJSON, TopoJSON, PMTiles, vector tiles pré-découpées ? Vérifier : support des requêtes HTTP Range par GitHub Pages (requis par PMTiles), limites GitHub Pages (taille fichier, taille site, bande passante), compression servie (gzip/brotli), outils de génération (tippecanoe, mapshaper), simplification par zoom, taille estimée pour la France sur ~40 Snapshots et pour Natural Earth monde.

## Answer

**Fond Natural Earth → 1 fichier PMTiles (tippecanoe) ; Snapshots France → 1 GeoJSON par Snapshot (mapshaper), chargé à la demande.** TopoJSON et tuiles .pbf pré-découpées sont écartés.

- **Range** : GitHub Pages répond 206 avec `accept-ranges: bytes` et CORS `*` (testé avec curl). Piège : si un client envoie `Range` avec `Accept-Encoding: gzip`, Pages renvoie une plage du flux gzippé. Les navigateurs ne sont pas concernés, car la spec Fetch impose `Accept-Encoding: identity` dès qu'il y a `Range`.
- **Compression** : gzip seulement (pas de brotli ni de zstd). `cache-control: max-age=600` fixe.
- **Limites** : site ≤ 1 Go ; bande passante souple de 100 Go/mois ; fichier git bloqué à 100 MiB (avertissement à 50 MiB) ; déploiement ≤ 10 min.
- **Tailles mesurées** :
  - fond NE 10m en PMTiles : 7,2 Mo (z0-5) à 15,7 Mo (z0-7) ;
  - contour 10m de la France métropolitaine : 30 Ko gzip.
- **Tailles estimées** : 30-100 Ko gzip par Snapshot, 1,5-4 Mo pour les 40.
- **Simplification par zoom** :
  - pour le PMTiles, faite par tippecanoe (`-zg`, `-S`, `-pn` pour des frontières partagées cohérentes) ;
  - pour le GeoJSON, faite côté client par MapLibre (geojson-vt, `tolerance`), après simplification et quantification avec mapshaper.
- **Bascule** : passer les Snapshots en PMTiles (propriété `snapshot` + `filter`) si un Snapshot dépasse environ 1-2 Mo.

Détails et sources : [../research/05-format-geometries.md](../research/05-format-geometries.md)
