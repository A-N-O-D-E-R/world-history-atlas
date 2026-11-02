# 08: Schémas, build et validation

**What to build:** Le mainteneur dispose d'un build qui transforme `data-src/` en `public/data/` et d'une validation qui bloque les erreurs, avec rapport sur chaque PR.

**Blocked by:** 05 (Modèle de dates)

**Status:** ready-for-agent

- [ ] Schémas partagés (sources + publiés) pour Entité politique, Snapshot, Source
- [ ] Build hors réseau `data-src/` → `public/data/` (un fichier par objet + index des entités)
- [ ] Erreurs bloquantes : JSON/GeoJSON invalide, polygone invalide, identifiant dupliqué, référence inexistante, intervalle incohérent, date sans calendrier/précision, Source sans licence, licence hors liste blanche, Snapshot sans Source
- [ ] Avertissements : libellé fr/en manquant, pas de lien Wikipédia, Snapshot > 1 Mo gzip, Entité sans Snapshot ni point
- [ ] Workflow PR : build + validation + rapport en commentaire
- [ ] Tests du pipeline sur données d'exemple (point de test 1)
