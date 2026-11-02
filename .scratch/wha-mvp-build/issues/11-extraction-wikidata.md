# 11: Extraction Wikidata des Entités

**What to build:** Le mainteneur lance un script qui extrait les faits Wikidata d'une liste de QID choisie à la main ; les Entités publiées en héritent.

**Blocked by:** 08 (Schémas, build et validation)

**Status:** ready-for-agent

- [ ] Liste curée de QID d'Entités liées au territoire français
- [ ] Extraction via JSON `wbgetentities` uniquement (WDQS seulement pour collecter des QID), User-Agent, respect des limites
- [ ] Extraits figés et commités dans `data-src/`
- [ ] Libellés fr/en, alias, noms d'époque datés, dates d'existence (calendrier + précision conservés, décennie/millénaire → intervalles), capitales, prédécesseurs/successeurs, lien Wikipédia
- [ ] Tests : julien → grégorien, -0001 = 1 av. J.-C.
