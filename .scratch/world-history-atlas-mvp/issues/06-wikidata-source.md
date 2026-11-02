Type: research
Status: resolved

## Question

Wikidata peut-il fournir les faits des Entités politiques, dirigeants, villes et événements liés au territoire du Pays actuel France ? Évaluer : couverture et qualité (propriétés utiles : P31, P571/P576, P36, P35/P6, P1365/P1366, P625, P1448…), modèle de date Wikidata (précision 7/9/10/11, calendarmodel julien/grégorien) et adéquation avec nos précisions jour/mois/année/siècle, extraction au build (SPARQL, limites du endpoint, dumps), licence CC0, gestion des libellés fr/en, et liens vers Wikipédia.

## Answer

Oui pour l'essentiel, mais pas comme source unique. Wikidata fournit les QID, les libellés fr/en (≥98 % des entités politiques échantillonnées), les liens frwiki/enwiki, les dates des dirigeants (`P39` + qualificatifs `P580`/`P582`/`P1365`/`P1366`), les capitales (`P36`), les coordonnées (`P625`) et la succession des entités (`P1365`/`P1366`), le tout sous CC0.
- Lacunes : aucune frontière (seulement des points). Peuples gaulois modélisés comme « groupes ethniques » (124 items, 1 seul daté). `P35`/`P6`/`P1448` rares sur les entités politiques. Rois des Francs : 30/78 seulement ont une date de début. Communes : 2 010/46 187 ont `P571`. Il faut une couche curée (liste de QID + corrections locales).
- Dates : précisions 11/10/9/7 = jour/mois/année/siècle. Les précisions 8 (décennie) et 6 (millénaire) existent aussi et doivent être mappées. Le `calendarmodel` est soit julien (Q1985786), soit grégorien (Q1985727).
- Piège : le JSON garde la date dans son calendrier d'origine (1 av. J.-C. = -0001). WDQS/RDF la convertit en grégorien proleptique XSD (1 av. J.-C. = 0000), ce qui décale les années av. J.-C. d'un an. Il faut choisir un seul pipeline et normaliser.
- Extraction : SPARQL ciblé pour collecter les QID (limites WDQS : 60 s par requête, 60 s de calcul par minute, User-Agent obligatoire, 429), puis `wbgetentities`/EntityData JSON. Le snapshot est commité dans le dépôt. Les dumps (157 Go) sont inutiles pour le MVP.

Détails et sources : [research/06-wikidata-source.md](../research/06-wikidata-source.md)
