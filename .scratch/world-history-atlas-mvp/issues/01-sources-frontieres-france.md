Type: research
Status: resolved

## Question

Quels jeux de données de frontières historiques **redistribuables** (CC0, CC-BY, ODbL, domaine public, GPL) couvrent le territoire du Pays actuel France de ~-500 à aujourd'hui ? Candidats : OpenHistoricalMap, historical-basemaps (aourednik), CShapes, Wikidata geoshapes, Natural Earth, atlas nationaux numérisés. Pour chacun : couverture temporelle et spatiale, nombre et dates des Snapshots utilisables, licence exacte et obligations (attribution, share-alike, effet sur le repo), précision/échelle, méthode de reconstruction, format. Identifier les trous de couverture.

## Answer

Combinaison retenue : **OpenHistoricalMap (CC0) en base + Cliopatria/Seshat (CC BY 4.0) pour combler les trous + Natural Earth (domaine public) pour l'actuel et les côtes**. AWMC (ODbL) est optionnel pour Rome.
- OHM : environ 120 relations `admin_level=2` datées au jour près par ville. Très riche de 1648 à aujourd'hui, et de -58 à 1050 avec des trous. **Rien de 1050/1201 à 1648.** Certains ways membres sont en CC BY 4.0 (CNIG), d'où une attribution obligatoire et un filtrage sur le tag `license`.
- Cliopatria v0.2.1 : de -500 à 2024 quasi continu, mais grossier (raster d'environ 40 km² par pixel, 288 sommets pour la France). Contient des anomalies (occupations codées comme possessions). Filtrer sur `Type=POLITY`.
- historical-basemaps : 44 fichiers de -500 à 2010, sous **GPL-3.0** (copyleft sur les géométries dérivées), précision « monde/continent ». La Gaule y est un polygone sans nom. Optionnel.
- Exclus ou marginaux : CShapes (**CC BY-NC-SA**, NC interdit) ; Wikidata geoshapes (aucune géométrie pour les États français historiques) ; atlas nationaux (contours actuels seulement).
- Trous restants : **Gaule indépendante de -500 à -58** (aucune entité gauloise nommée nulle part), Corse de 843 à 1648, Nice/Savoie avant 1860, côtes imprécises. L'incertitude des frontières n'est encodée nulle part de façon fiable.

Détails, mesures et sources : [research/01-sources-frontieres-france.md](../research/01-sources-frontieres-france.md)
