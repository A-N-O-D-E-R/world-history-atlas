# 09: Premier Snapshot affiché

**What to build:** Le visiteur voit le Royaume de France sur la carte, dont la frontière change avec la date.

**Blocked by:** 06 (Dock de frise), 08 (Schémas, build et validation)

**Status:** ready-for-agent

- [ ] Royaume de France + 1–2 Snapshots OHM dans `data-src/`, publiés par le build
- [ ] Module de requêtes : résolution du Snapshot (couvrant, sinon plus proche, rien hors existence) testée (point de test 2)
- [ ] Chargement paresseux + cache mémoire des Snapshots
- [ ] La carte met à jour la source sans rechargement quand la date change
- [ ] Bandeau « frontière de [date réelle] » quand le Snapshot ne couvre pas l'année
