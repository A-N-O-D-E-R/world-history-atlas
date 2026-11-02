# Dates : valeur source + calendrier + précision, extraites du JSON Wikidata

Chaque Date conserve la valeur telle que donnée par sa Source, son calendrier d'origine (julien, grégorien…) et une précision parmi jour, mois, année, siècle ; une clé de tri en grégorien proleptique est calculée au build et sert à tout affichage et toute comparaison. Le flou (« vers 1150 », décennie, millénaire Wikidata) est représenté par un intervalle au plus tôt / au plus tard, pas par des niveaux de précision supplémentaires. Les dates Wikidata sont lues uniquement via le JSON (`wbgetentities`), jamais via WDQS : le JSON garde le calendrier source avec 1 av. J.-C. = -0001, alors que WDQS convertit en grégorien XSD avec 1 av. J.-C. = 0000, ce qui décalerait d'un an toutes les années av. J.-C. si les deux canaux étaient mélangés. WDQS ne sert qu'à collecter des QID.

## Considered Options

- Tout stocker en grégorien converti : perd le calendrier source, exigé pour la traçabilité.
- Ajouter décennie/millénaire comme précisions : multiplie les cas d'affichage sur la frise ; l'intervalle couvre aussi les dates incertaines non-Wikidata.
- Lire les dates via WDQS : plus simple à requêter, mais conversion opaque et piège de l'année 0.
