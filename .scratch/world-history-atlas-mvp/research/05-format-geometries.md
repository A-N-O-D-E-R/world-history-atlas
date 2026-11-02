# 05 — Format des géométries (Snapshots France + fond Natural Earth) sur GitHub Pages / MapLibre

Date : 2026-11-02. Sources primaires + mesures faites localement (curl sur `*.github.io`, tippecanoe compilé depuis `felt/tippecanoe` main).

## Recommandation

- **Fond Natural Earth monde → un seul fichier PMTiles** généré par tippecanoe, lu via le plugin `pmtiles` (`addProtocol`). Mesuré : 7,2 Mo (z0-5) à 15,7 Mo (z0-7) pour land+ocean+frontières+rivières+lacs en 10m. Le navigateur ne télécharge que les tuiles visibles.
- **Snapshots France → un GeoJSON par Snapshot**, simplifié et quantifié en amont avec mapshaper (npm), chargé à la demande (`source.setData(url)`). Environ 30-100 Ko gzip chacun ; MapLibre découpe et simplifie par zoom côté client (geojson-vt, option `tolerance`).
- Passer les Snapshots en PMTiles (un seul fichier, une propriété `snapshot` + `filter`) **seulement si** un Snapshot dépasse environ 1-2 Mo ou si on vise beaucoup plus de détail ou de pays.
- Écartés : **TopoJSON** (MapLibre ne le lit pas, il faudrait `topojson-client` en plus, et le gzip récupère déjà l'essentiel du gain) ; **répertoire de tuiles .pbf pré-découpées** (des milliers de fichiers, et elles doivent être stockées non compressées, voir plus bas).

## Faits vérifiés

### GitHub Pages et les requêtes HTTP Range (testé avec curl)

`curl -H 'Range: bytes=0-126' https://pmtiles.io/protomaps(vector)ODbL_firenze.pmtiles` (hébergé sur Pages, `server: GitHub.com`) :

| Accept-Encoding | Statut | Content-Encoding | Content-Range | Premiers octets |
|---|---|---|---|---|
| `identity` | 206 | aucun | `bytes 0-126/6601156` | `PMTiles\x03` (correct) |
| *(aucun, défaut curl)* | 206 | aucun | idem | `PMTiles\x03` (correct) |
| `gzip` | 206 | gzip | `bytes 0-126/6602554` | `1f8b…` (**plage prise dans le flux gzippé**) |

- Range fonctionne (`accept-ranges: bytes`, réponses 206). Les en-têtes `access-control-allow-origin: *` et `vary: Accept-Encoding` sont présents.
- **Piège** : Pages gzippe même `application/octet-stream` et applique la plage au flux compressé. Un client qui envoie à la fois `Range` et `Accept-Encoding: gzip` reçoit donc des octets faux.
- Pour les navigateurs, il n'y a pas de problème : la spec Fetch impose « If httpRequest's header list contains `Range`, then append (`Accept-Encoding`, `identity`) » (https://fetch.spec.whatwg.org/, HTTP-network-or-cache fetch). C'est ce qui permet au visualiseur pmtiles.io de fonctionner sur Pages.
- La doc PMTiles cite GitHub Pages comme hébergement valide : « If your PMTiles file fits, it's an easy way to host » (https://docs.protomaps.com/pmtiles/cloud-storage#github-pages).
- `cache-control: max-age=600` est fixe et non configurable sur Pages.

### Compression servie

- Gzip uniquement. Avec `Accept-Encoding: br` ou `zstd` seul, la réponse arrive non compressée (testé sur pages.github.com : 14 446 octets bruts, 3 844 en gzip).
- Les GeoJSON statiques seront donc gzippés à la volée (déduit du comportement observé sur octet-stream et text/html ; non testé sur un `.geojson` précis).
- Les tuiles dans un PMTiles sont déjà gzippées par tippecanoe : le double gzip de Pages est inoffensif, puisque le navigateur demande `identity` sur les requêtes Range.
- Des `.pbf` pré-gzippés dans un répertoire seraient servis sans `Content-Encoding: gzip`, et MapLibre ne pourrait pas les décoder. Il faudrait générer avec `tippecanoe --no-tile-compression -e dir/`. C'est l'une des raisons d'écarter cette option.

### Limites GitHub Pages (https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

- Site publié ≤ 1 Go ; dépôt source recommandé ≤ 1 Go.
- Bande passante : limite **souple** de 100 Go/mois. Rate limit possible, avec une réponse 429.
- Un déploiement expire après 10 min. Limite souple de 10 builds/h, qui ne s'applique pas avec un workflow Actions personnalisé.
- Taille de fichier côté git (https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github) : avertissement à 50 MiB, blocage à 100 MiB, 25 MiB via l'interface web. Les fichiers mesurés ici restent tous sous 16 Mo.

### MapLibre (style spec v8, https://github.com/maplibre/maplibre-style-spec `src/reference/v8.json`)

- Types de sources : vector, raster, raster-dem, geojson, video, image. **Pas de TopoJSON.**
- Source `geojson` : `data` (URL ou inline), `maxzoom`, `tolerance` (« Douglas-Peucker simplification tolerance »), `buffer`, `filter`. Le découpage en tuiles et la simplification par zoom se font côté client.
- Source `vector` avec PMTiles : `"url": "pmtiles://https://…/x.pmtiles"` après `maplibregl.addProtocol("pmtiles", new Protocol().tile)`. Le `minzoom`/`maxzoom` est déduit du fichier (https://docs.protomaps.com/pmtiles/maplibre). Une seule dépendance ajoutée : `pmtiles` (npm).

### Outils

- **tippecanoe** (https://github.com/felt/tippecanoe) : « the supported tool » pour PMTiles, avec sortie PMTiles directe depuis la v2.17 (https://docs.protomaps.com/pmtiles/create). Pas de paquet npm ni d'image Docker officielle accessible : compilation C++ (environ 3 min dans alpine) ou brew. Options utiles :
  - `-zg` : maxzoom automatique ;
  - `-S scale` : multiplicateur de simplification ;
  - `-pn` / `--no-simplification-of-shared-nodes` : frontières communes simplifiées de la même façon. `--detect-shared-borders` est déprécié ;
  - `--coalesce-densest-as-needed` ;
  - `-pk` : pas de limite de 500 Ko par tuile ;
  - `tile-join` : fusion de plusieurs PMTiles.
- **mapshaper** (npm) : simplification (Visvalingam/DP), conservation de la topologie, quantification, export GeoJSON/TopoJSON. Bon outil pour préparer chaque Snapshot sans dépendance native.

## Tailles

### Mesurées

- Natural Earth GeoJSON bruts (dépôt `nvkelso/natural-earth-vector`, via l'API GitHub) :
  - admin_0_countries : 10m = 13,3 Mo, 50m = 3,1 Mo, 110m = 0,84 Mo ;
  - land : 10m = 10,2 Mo, 50m = 1,6 Mo ;
  - coastline 10m = 10,1 Mo ; rivers 10m = 7,3 Mo.
- Pays 10m réduits à la géométrie seule (une propriété par pays) : 12,4 Mo brut, **4,4 Mo gzip**.
- France métropolitaine, contour 10m : 3 672 points, 78 Ko brut, **30 Ko gzip**.
- PMTiles produits par tippecanoe :
  - fond NE 10m (land, ocean, frontières terrestres, rivières, lacs), z0-7 `-pn` : **15,7 Mo** ;
  - même fond en z0-5 : **7,2 Mo** ;
  - admin_0_countries 10m `-zg` : 4,5 Mo.

### Estimées (inférence, pas mesurée)

- Un Snapshot France avec un découpage interne (provinces ou départements) et quelques voisins, au détail NE 10m : environ 100-300 Ko brut, 30-100 Ko gzip.
- 40 Snapshots : environ 4-12 Mo bruts au total, 1,5-4 Mo gzip. L'utilisateur n'en charge qu'un à la fois.
- Total du site : moins de 40 Mo, soit moins de 4 % de la limite de 1 Go. À 16 Mo par visite complète (pire cas), la limite souple de 100 Go correspond à environ 6 000 visites par mois. En pratique, Range ne télécharge qu'une fraction du fichier.

## Questions ouvertes

- Le niveau de détail réel des sources historiques des Snapshots (ticket séparé) peut changer l'estimation par Snapshot.
- Le zoom maximum voulu pour le fond (z5 ou z7) fait varier la taille de 7 à 16 Mo.
