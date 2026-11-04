# 16: Dirigeants et Règnes

**What to build:** Le visiteur voit le Dirigeant en place à la date dans la Fiche Entité et peut ouvrir sa Fiche.

**Blocked by:** 10 (Fiche Entité minimale), 11 (Extraction Wikidata des Entités)

**Status:** done

- [x] Extraction Wikidata des Dirigeants et Règnes (P39 + qualificatifs), union des postes « roi de France »
- [x] Règne = Dirigeant + Entité + intervalle + titre (plusieurs Règnes possibles)
- [x] Fiche Dirigeant : noms, naissance, décès, Règnes, titre, Sources, lien Wikipédia
- [x] Dirigeant en place à la date dans la Fiche Entité

Notes : 397 Dirigeants publiés (postes curés dans data-src/curated/rulers.json). 71 Règnes ignorés (sans date de début dans Wikidata ou hors existence des Entités) : notamment les Capétiens avant Philippe Auguste ; à compléter par surcharges. Aucun poste trouvé pour le royaume des Francs et l'Empire carolingien.
