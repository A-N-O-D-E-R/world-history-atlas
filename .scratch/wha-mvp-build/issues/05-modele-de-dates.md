# 05: Modèle de dates

**What to build:** Un module partagé (pipeline + app) représente, valide, convertit et formate les Dates conformément à l'ADR 0001.

**Blocked by:** 01 (Init et déploiement)

**Status:** ready-for-agent

- [ ] Date = valeur source + calendrier + précision (jour/mois/année/siècle) + clé de tri grégorien proleptique ; intervalle au plus tôt / au plus tard
- [ ] Conversion julien → grégorien
- [ ] Formatage fr/en : « 500 av. J.-C. », jamais d'année 0 (-1 = 1 av. J.-C.)
- [ ] Pas jour/mois/an : -1 + 1 an = 1 ; 31 déc. -1 + 1 jour = 1er janv. 1
- [ ] Validation : refus de l'année 0 et des valeurs incohérentes avec la précision
- [ ] Tests couvrant av. J.-C., julien, intervalles, bornes
