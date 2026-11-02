# Pipeline de données en TypeScript/Node, pas en Python

Le cahier des charges citait Python (GeoPandas, Shapely, GDAL) pour le traitement des données. On écrit pourtant tout le pipeline (extraction, build, validation) en TypeScript/Node : un seul langage pour un projet maintenu seul, et un seul jeu de schémas qui valide les données en CI et type l'application. Turf (intersections, surfaces), mapshaper (simplification) et `fetch` (Wikidata JSON) couvrent les besoins ; seul tippecanoe reste un binaire externe, exécuté via Docker. QGIS reste l'outil manuel pour retoucher les géométries.
