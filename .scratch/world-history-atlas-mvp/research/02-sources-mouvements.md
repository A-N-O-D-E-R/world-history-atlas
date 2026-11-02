# 02 — Sources redistribuables pour routes commerciales, migrations, mouvements de batailles

Question : [issue 02](../issues/02-sources-mouvements.md). Recherche du 2026-11-02, sources primaires (pages projet, enregistrements Zenodo via API, dépôts GitHub, requêtes SPARQL Wikidata).

## TL;DR

- **Routes / réseaux** : oui, exploitable pour l'Antiquité (Itiner-e CC BY 4.0, AWMC ODbL, ORBIS MIT). Pour 1350-1650, Viabundus (CC BY / CC BY-SA) existe mais **ne couvre pas la France**. Ces sources sont des **réseaux d'infrastructure**, pas des « routes commerciales » au sens de flux de marchandises.
- **Batailles** : oui en **points datés** (Wikidata, CC0 : 578 batailles en France avec coordonnées + date, 142 avec participants). **Aucun jeu redistribuable de tracés de mouvements de troupes** (campagnes, marches) trouvé.
- **Migrations** : **rien d'exploitable** en géométrie (lignes/flèches datées) sans digitalisation manuelle.

## Sources

### Itiner-e — routes de l'Empire romain (ca. 300 BCE – 300 CE)
- Contenu : routes romaines (14 769 tronçons, ~299 000 km) ; la version web ajoute fleuves et voies maritimes.
- Géométrie : `MultiLineString` (GeoJSON/GPKG/SHP, EPSG:3395 dans la version statique). Champs vus dans le fichier : `Name`, `Type` (Main/Secondary Road), `Lower_Date`, `Upper_Date` (9999 = inconnu), `Segment_s` (Certain/Conjectured/Hypothetical), `passabilit`, `Bibliograp`.
- Temporalité : période globale ; seule ~19 % de la longueur porte une date ou un constructeur (Hotham, Zenodo 10.5281/zenodo.23857866, dérivé d'Itiner-e). Couverture de la Gaule incluse.
- Licence : **CC BY 4.0** — texte complet de la licence sur l'enregistrement Zenodo https://doi.org/10.5281/zenodo.17122148 (version statique 2024, publiée le 2025-09-15) ; mention « © 2024 by Brughmans, Pažout, de Soto and Bjerregaard Vahlstrup is licensed under CC BY 4.0 » sur https://itiner-e.org/about. Export nocturne ndjson également.
- Papier : de Soto et al., *Scientific Data* 2025, https://doi.org/10.1038/s41597-025-06140-z.

### AWMC geodata (Ancient World Mapping Center)
- Contenu : routes, aqueducs, noms régionaux, côtes et fleuves antiques, dérivés du Barrington Atlas.
- Géométrie : GeoJSON (lignes). Pas de datation fine par tronçon.
- Licence : **ODbL-1.0** — « The GeoJson files are offered under the ODC Open Database License » (https://github.com/AWMC/geodata). Partage à l'identique sur la base de données.
- Attention : les **tuiles** AWMC utilisées par ORBIS sont en CC BY-NC 3.0 (non utilisables) ; c'est différent des GeoJSON.

### ORBIS (Stanford) — modèle de réseau romain (~200 CE)
- Contenu : maillage routes / fleuves / mer avec coûts et durées de trajet (`db/tables/o_mesh.sql`, ~75 Mo) + tables de vents/houle.
- Géométrie : arêtes de réseau en dump SQL (PostGIS), à convertir.
- Licence : **MIT** (`LICENSE.txt`, « Copyright (c) 2012 Stanford University Library ») sur https://github.com/emeeks/orbis_stanford. Licence logicielle appliquée au dépôt entier, données comprises : permissive, mais à citer.
- Temporalité : instantané unique (Haut-Empire).

### Viabundus — routes terrestres et fluviales, Europe du Nord 1350-1650
- Contenu : réseau nœuds/arêtes (villes, péages, foires, étapes, ponts, bacs) + routes terrestres et voies d'eau ; numérisation de *Hansische Handelsstraßen* (Bruns & Weczerka 1962) + réseau recherché.
- Géométrie : arêtes `LineString` (GeoJSON/GML/CSV-WKT), nœuds ponctuels ; le webmap filtre par pas de 50 ans.
- Couverture : Pays-Bas, Danemark, Finlande, plusieurs Länder allemands, partie de la Pologne. **Pas la France** (« inclusion of other regions is currently being planned »).
- Licence : métadonnées Zenodo = **CC BY 4.0**, mais la description dit « CC-BY-SA » (https://doi.org/10.5281/zenodo.16611998, v2 du 2025-04-25). Les deux sont acceptables ; appliquer la plus stricte (BY-SA) par prudence.

### Wikidata — batailles (points datés)
- Contenu : items `instance of` battle (Q178561) avec `coordinate location` (P625), `point in time` (P585), `participant` (P710), `part of` (P361 → guerre/campagne).
- Comptage SPARQL (2026-11-02, P31 = Q178561 strict, P17 = France) : **578** avec coordonnées + date ; **142** avec participants en plus. Les sous-classes (siège, etc.) et les items datés par P580/P582 ne sont pas comptés : le total réel est plus élevé.
- Géométrie : **points** uniquement. Les mouvements ne peuvent qu'être *inférés* (enchaîner les batailles d'une même campagne via P361 par ordre chronologique) : c'est une reconstruction schématique, pas un tracé sourcé.
- Licence : **CC0** (données structurées Wikidata).

### OpenStreetMap / OpenHistoricalMap
- OSM `historic=battlefield` : nœud ou zone, `historic:date` optionnel ; la doc dit qu'« OSM is not a place where events may be mapped » (https://wiki.openstreetmap.org/wiki/Tag:historic%3Dbattlefield). ODbL. Couverture irrégulière.
- OpenHistoricalMap : **CC0** ; cartographie des objets physiques (y compris routes romaines), mais les événements, personnes et mouvements sont hors périmètre pour l'instant (FAQ OHM).

## Non retenues / non vérifiées
- **DARMC (Harvard)** : routes commerciales et routes médiévales, mais le site renvoie 403 ; licence non vérifiée, donc ne pas l'utiliser sans vérification.
- **SlaveVoyages** : voyages datés de port à port (Nantes, Bordeaux…) ; licence introuvable sur les pages consultées, donc non vérifiée.
- **OWTRAD (Ciolek)** : site injoignable ; aucune licence ouverte connue.
- **Migrations (invasions, Völkerwanderung, etc.)** : aucun jeu vectoriel redistribuable trouvé. Les cartes à flèches existantes (Wikimedia Commons, atlas) sont des images : il faudrait les digitaliser manuellement, ce qui est exclu.

## Conclusion pour le MVP
1. Couche « réseaux antiques » : Itiner-e (CC BY) en base, AWMC/ORBIS en complément. Pas de couche médiévale ou moderne pour la France.
2. Couche « batailles » : points datés Wikidata (CC0), éventuellement reliés par campagne (P361) en guise d'itinéraire *schématique*, à signaler comme tel dans l'UI.
3. Couche « migrations » et vraies « routes commerciales » (flux) : **rien d'exploitable sans digitalisation manuelle**, donc hors MVP.
