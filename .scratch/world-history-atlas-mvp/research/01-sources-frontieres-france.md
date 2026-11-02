# Sources de frontières historiques redistribuables pour le territoire de la France (~-500 à aujourd'hui)

Ticket : [issues/01-sources-frontieres-france.md](../issues/01-sources-frontieres-france.md)
Date de la recherche : 2026-11-02

## Méthode

- Licences vérifiées dans le texte lui-même : fichier LICENSE du dépôt, page copyright officielle, métadonnées Zenodo/Commons, ou tags de licence au niveau de chaque élément.
- Couverture mesurée sur les données, pas lue dans un README : test point-dans-polygone sur 6 à 9 villes témoins (Paris, Marseille, Bordeaux, Strasbourg, Rennes, Lyon, Nice, Lille, Ajaccio). Pour historical-basemaps et Cliopatria, les fichiers ont été téléchargés (scripts stdlib dans `/tmp/hb_scripts`, non versionnés). Pour OpenHistoricalMap, on a interrogé l'API Overpass officielle (`is_in` + `boundary=administrative`).
- Un « trou » est une période où une ville témoin n'est couverte par aucun polygone nommé.

## Synthèse

| Source | Licence (vérifiée) | Utilisable ? | Couverture France | Snapshots | Précision |
|---|---|---|---|---|---|
| OpenHistoricalMap (OHM) | CC0, sauf éléments tagués autrement | **Oui, source principale** | -58 → aujourd'hui, avec trous (voir plus bas) | ~120 relations `admin_level=2` par ville, datées au jour près | Variable : de l'échelle cadastrale à un tracé grossier |
| Cliopatria (Seshat) v0.2.1 | CC BY 4.0 | **Oui, complément / bouche-trou** | -500 → 2024, quasi continu | Pas annuel par entité ; 459 `FromYear` distincts dans la bbox France | Grossière : raster ~40 km² par pixel, côtes simplifiées |
| historical-basemaps (aourednik) | GPL-3.0 | Acceptable mais risqué (copyleft) | -500 → 2010 | 44 fichiers « monde » | Échelle monde/continent ; `BORDERPRECISION` 1–3 |
| AWMC geodata | ODbL 1.0 | Oui, ponctuellement (Antiquité romaine) | Rome -60, 117, 200 (+ provinces), après Dioclétien | ~5 couches | Bonne (Barrington Atlas) |
| Natural Earth | Domaine public | Oui, **frontière actuelle seulement** | Aujourd'hui | 1 | 1:10m / 1:50m / 1:110m |
| Wikidata geoshapes (P3896 → Commons `Data:*.map`) | Licence par page (CC0, CC BY 4.0…) | Marginal | France actuelle, Rome 117 ; rien pour les États français historiques | ~2 | Variable |
| CShapes 2.0 / CShapes-Europe | **CC BY-NC-SA 4.0** | **Non (NC)** | 1886–2019 (Europe : depuis 1816) | Annuel | Bonne |
| Atlas nationaux (IGN ADMIN EXPRESS…) | Licence Ouverte 2.0 (non revérifiée, page en JS) | Seulement pour l'actuel | Aujourd'hui | — | Cadastrale |

## Détail par source

### OpenHistoricalMap (OHM)

- **Licence.** La page copyright dit : « dedicated to the public domain under a Creative Commons CC0 dedication », avec l'exception « The OpenHistoricalMap database incorporates some individual map features under copyright », signalée par des tags `license` sur chaque élément ([copyright](https://www.openhistoricalmap.org/copyright)). L'en-tête des réponses Overpass dit aussi : « The data is made available under CC0 ». Crédit demandé mais non obligatoire : « Map data courtesy of the OpenHistoricalMap project, in the public domain unless otherwise noted ». Il faut respecter le share-alike pour toute « significant portion » sous licence SA.
- **Piège de licence, mesuré.** Les relations `admin_level=2` sont CC0, mais leurs *ways* membres portent parfois une licence propre. Par exemple, la relation France 2007→ (r2826451) compte 85 ways en `license=CC-BY-4.0` (source CNIG Espagne, limites LILIM). On les retrouve aussi dans le Royaume de France 1648 et la République romaine -58. Des ways sourcés LSIB (US Dept. of State, domaine public) et cadastre DGI apparaissent aussi. Dans la bbox France, 505 relations `admin_level=8` (communes) sont en `ODBL` (copiées d'OSM), sans effet sur le niveau 2. **Conséquence :** il faut un crédit CC BY (CNIG) en plus d'OHM, et un filtre sur les tags `license` lors de l'extraction.
- **Méthode.** Contributions communautaires à la main, dans l'esprit OSM. Le tag `source` est irrégulier : par exemple `Droysens-21a.jpg` pour le Carolingien, « Cassini/Academy's Map of France », des tampons QGIS de 3 NM pour les côtes. Parfois il n'y a ni source ni `fixme` (« border with Spain »).
- **Format.** Modèle OSM (relations/ways), avec `start_date`/`end_date` au format ISO, possiblement négatif (`-0058`), `wikidata` et `name:*` multilingues. Accès par Overpass API ou par les dumps de planet.openhistoricalmap.org (PBF/XML).
- **Couverture mesurée (`admin_level=2`, ville témoin = trous).**
  - Paris : -500→-58, 476→532, 695→768, 788→800, **1050→1648**.
  - Marseille : -500→-121, 695→768, 788→800, 855→879, **1201→1648**.
  - Strasbourg : -500→-58, 409→496, 746→768, 788→800, 843→962, 1002→1017, **1201→1648**, 1659→1678.
  - Nice : comme Marseille, plus **1201→1720** et 1814→1815.
  - Ajaccio : -500→-238, 476→725, 756→774, 788→800, **843→1648**.
  - Rennes : comme Paris.
  - Partout : 1944-08-09→1945-04-22 (fin de l'État français → France).
  - Le niveau 3–4 bouche un peu : Gallia Lugdunensis/Narbonensis -27/-121→476, Royaume de Bourgogne 1032→1378, Provence 1487→1714.
- **Granularité.** La période moderne et contemporaine est très fine : une relation par traité, par exemple 1659 Pyrénées, 1668, 1678, 1697, 1766 Lorraine, 1769 Corse… jusqu'en 2007.

### Cliopatria (Seshat Global History Databank)

- **Licence.** Le fichier `LICENSE.md` du dépôt dit : « Creative Commons Attribution 4.0 International License … as long as you give appropriate credit … provide a link to the Creative Commons license, and indicate if changes were made » ([LICENSE.md](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/main/LICENSE.md)). Zenodo indique `cc-by-4.0` ([13363121](https://zenodo.org/records/13363121)). GitHub affiche `NOASSERTION` parce que le fichier n'est pas un modèle standard. **Obligations :** attribution, lien vers la licence, mention des modifications. Pas de share-alike, aucun effet sur la licence du dépôt.
- **Version.** v0.2.1 du 2026-10-03, un seul fichier `cliopatria.geojson` (zip de 46 Mo, 173 Mo décompressé), 13 797 enregistrements. Champs : `Name, FromYear, ToYear, Area, Type, Wikipedia, Wikidata, SeshatID, Components, MemberOf`. EPSG:4326.
- **Méthode.** D'après l'article ([Sci. Data 2025, doi:10.1038/s41597-025-04516-9](https://doi.org/10.1038/s41597-025-04516-9), CC BY 4.0), des frontières tirées d'atlas imprimés ont été « redrawn by hand … onto a common, digital base map ». Les images raster ont ensuite été vectorisées automatiquement puis revues à la main. Résolution : « 2400 × 4800 pixels provide a resolution of approximately 40 km² at the equator ». « The dataset does not currently encode possible border uncertainty and territorial disputes ». Les références France sont les n° 86–88 de l'article.
- **Couverture mesurée.** Paris est couvert sans trou de -50 à 2024 (pas de polygone gaulois avant César). Marseille est couvert de -500 à 2024 (« Greek City-States » jusqu'à -121, trou 475–480). Strasbourg et Rennes ont de petits trous en 409–462. Nice a des trous en -500→-110 et 1201–1272, puis plusieurs entre 1539 et 1848 : la Savoie/Sardaigne manque par endroits. Les points côtiers exacts (Marseille, Nice) tombent hors des polygones, signe d'une côte grossière.
- **Anomalies vues à Paris.** « German Empire » 1871–72, « Grand Duchy of Berg » 1814, « Nazi Germany » 1940–44 (l'occupation est codée comme une possession). Il y a aussi des lignes « (Alliance …) » et « (… Empire) » de type RELATION qui se superposent aux polités : il faut filtrer sur `Type=POLITY`.
- La France de 2024 tient en **288 sommets** : utilisable seulement à petite échelle.

### historical-basemaps (aourednik)

- **Licence.** Le fichier `LICENSE` est la GNU GPL v3 (texte complet, `spdx_id: GPL-3.0` via l'API GitHub). Le README ne contient aucune section licence. **Effet :** les géométries dérivées doivent rester sous GPL-3.0. Placées dans des fichiers distincts, elles relèvent de l'« agrégation », et le code de l'application n'est pas contaminé. En revanche, fusionner ces géométries avec d'autres jeux impose la GPL au résultat. Appliquer la GPL à des données reste juridiquement flou.
- **Méthode et précision.** Le README dit que les cartes sont « collected, adapted, and converted from diverse sources », dont un ancien site ThinkQuest, et que le projet est un « work in progress ». La précision est « adapted for mapping data on world/continent scale ». L'attribut `BORDERPRECISION` vaut 1 (approximatif), 2 (modéré) ou 3 (fixé par le droit international).
- **Snapshots utilisables.** 44 fichiers : -500, -400, -323, -300, -200, -100, -1, 100, 200 … 900, 1000, 1100, 1200, 1279, 1300, 1400, 1492, 1500, 1530, 1600, 1650, 1700, 1715, 1783, 1800, 1815, 1878, 1880, 1900, 1914, 1920, 1930, 1938, 1945, 1960, 1994, 2000, 2010. Format GeoJSON, EPSG:4326, propriétés `NAME, ABBREVN, SUBJECTO, PARTOF, BORDERPRECISION`.
- **Couverture mesurée.** De -500 à -100, la Gaule est un polygone **sans nom** (`NAME=null`), sauf « Hallstatt culture » en -400, ce qui est anachronique. Jusqu'en 1600, `BORDERPRECISION` vaut 1 partout ; à partir de 1650, il vaut 3.
- **Erreurs vues.** Strasbourg est classée « Germany » de 1920 à 2010 et « Baden » de 1715 à 1815 : la géométrie déborde le Rhin. Lille est classée « Luxembourg » en 1700 et Ajaccio « Holy Roman Empire » en 1492. Le Royaume de France de l'an 1000 tient en 262 sommets, la France de 2010 en 877.

### AWMC geodata (Ancient World Mapping Center)

- **Licence.** Le README dit : « The GeoJson files are offered under the ODC Open Database License », données « derived from the Barrington Atlas » plus OSM ([README](https://github.com/AWMC/geodata)). **ODbL :** attribution obligatoire, et la base dérivée doit rester ODbL si elle est redistribuée. Un « Produced Work » (rendu, tuiles) peut avoir une autre licence. À isoler dans un fichier ou une couche à part.
- **Couches utiles.** `roman_empire_bce_60` (donc la Narbonnaise avant César), `roman_empire_ce_117_extent`, `ce_200_extent`, `ce_200_provinces`, `provinces post_diocletian`, `senatorial_provinces`. **Aucun peuple gaulois** : seule une couche de linework `regional_names` existe.

### Natural Earth

- **Licence.** « All versions of Natural Earth raster + vector map data … are in the public domain … Crediting the authors is unnecessary » ([terms](https://www.naturalearthdata.com/about/terms-of-use/)).
- **Contenu.** Frontières actuelles uniquement, aux échelles 1:10m, 1:50m et 1:110m. Utile pour le contour du Pays actuel France et pour les côtes et fleuves de fond, pas pour l'histoire.

### Wikidata geoshapes

- La propriété P3896 pointe vers des pages Commons `Data:*.map` dont la licence est donnée **page par page**. Exemples : `Data:France.map` est en `CC0-1.0`, issue de datahub geo-countries ; `Data:Imperio_Romano_117.map` est en `CC-BY-4.0`, avec pour source « Trabajo propio ».
- Une requête SPARQL sur les États historiques (Q3024240) qui ont une P3896 et des coordonnées en France renvoie seulement Cornouailles et l'« empire colonial français 1938 ». Les éléments royaume de France, royaume des Francs, Empire carolingien, Premier Empire et République(s) française(s) n'ont **aucun** geoshape. → Wikidata n'apporte pas de géométries ; on l'utilise comme référentiel d'identifiants (ticket 06).

### CShapes 2.0 (ETH Zürich ICR)

- La page officielle annonce « Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License » ([icr.ethz.ch/data/cshapes](https://icr.ethz.ch/data/cshapes/)). La clause NC est définie comme « not primarily intended for or directed towards commercial advantage », et la SA impose « a Creative Commons license with the same License Elements » ([legalcode](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.en)).
- **Exclu**, car NC ne figure pas dans la liste des licences autorisées. Couverture : 1886–2019, et Europe depuis 1816.

### Atlas nationaux numérisés

- IGN ADMIN EXPRESS : contours administratifs actuels, sous Licence Ouverte Etalab 2.0 d'après mes connaissances. Je n'ai **pas pu le revérifier**, la page cartes.gouv.fr est rendue en JS.
- Aucun atlas national historique vectoriel sous licence ouverte n'a été trouvé pendant cette recherche. geohistoricaldata.org (communes de Cassini, EHESS) était inaccessible (connexion refusée), à revoir. Euratlas et GeaCron sont propriétaires.

## Trous de couverture (toutes sources libres confondues)

1. **-500 → -58/-121 : la Gaule indépendante.** Aucune source n'a de polygones nommés pour des peuples ou entités gauloises. Seuls Massalia et les comptoirs grecs (Cliopatria, « Greek City-States ») et Rome/la Narbonnaise (AWMC -60, OHM -121) sont couverts. Le seul polygone sur la Gaule est sans nom (historical-basemaps).
2. **1050/1201 → 1648 dans OHM**, soit tout le Moyen Âge central et tardif et le XVIe siècle. Cliopatria est le seul bouche-trou libre (annuel mais grossier), avec historical-basemaps (1100, 1200, 1279, 1300, 1400, 1492, 1500, 1530, 1600, en GPL, précision 1).
3. **Haut Moyen Âge (476–532, 695–768, 788–800) dans OHM** : couvert par Cliopatria.
4. **Corse 843 → 1648** (Pise/Gênes) et **comté de Nice/Savoie avant 1860**. Couverture faible partout : OHM a des trous, Cliopatria aussi pour Nice.
5. **Précision côtière** : Cliopatria et historical-basemaps ne contiennent pas les villes du littoral. Il faudra découper ou caler sur un trait de côte Natural Earth, ce qui reste une opération automatique.
6. **Incertitude non encodée** : Cliopatria ne l'encode pas, OHM non plus de manière structurée. Seul historical-basemaps a `BORDERPRECISION`. Le niveau de fiabilité du Snapshot devra être attribué par source.

## Implications pour le MVP

- Combinaison suggérée : **OHM (CC0, base) + Cliopatria (CC BY 4.0, trous) + Natural Earth (PD, actuel/côtes)**, avec AWMC (ODbL) en option pour Rome. Toutes ces licences permettent la redistribution. La seule obligation dure est l'attribution (Cliopatria, ways CNIG dans OHM, AWMC).
- historical-basemaps n'est à prendre que si l'on accepte la GPL-3.0 sur les fichiers de géométries dérivées. Il n'apporte rien que Cliopatria ne couvre déjà mieux, sauf l'attribut `BORDERPRECISION`.
- La période -500 → -58 sera de toute façon vide de Snapshots gaulois, sauf à créer des données à la main, ce qui est exclu.
