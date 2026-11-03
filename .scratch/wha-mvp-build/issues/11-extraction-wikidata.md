# 11: Extraction Wikidata des Entités

**What to build:** Le mainteneur lance un script qui extrait les faits Wikidata d'une liste de QID choisie à la main ; les Entités publiées en héritent.

**Blocked by:** 08 (Schémas, build et validation)

**Status:** done

- [x] Liste curée de QID d'Entités liées au territoire français
- [x] Extraction via JSON `wbgetentities` uniquement (WDQS seulement pour collecter des QID), User-Agent, respect des limites
- [x] Extraits figés et commités dans `data-src/`
- [x] Libellés fr/en, alias, noms d'époque datés, dates d'existence (calendrier + précision conservés, décennie/millénaire → intervalles), capitales, prédécesseurs/successeurs, lien Wikipédia
- [x] Tests : julien → grégorien, -0001 = 1 av. J.-C.

Notes : Wikidata fixe la fin du Royaume de France (Q70972) au 4 sept. 1791 et le début de « France » (Q142) en 843 — données source, à surcharger au besoin (ticket 12). Libellés fr en minuscule chez Wikidata : majuscule initiale ajoutée à l'affichage.
