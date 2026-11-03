# 09: Premier Snapshot affiché

**What to build:** Le visiteur voit le Royaume de France sur la carte, dont la frontière change avec la date.

**Blocked by:** 06 (Dock de frise), 08 (Schémas, build et validation)

**Status:** done

- [x] Royaume de France + 1–2 Snapshots OHM dans `data-src/`, publiés par le build
- [x] Module de requêtes : résolution du Snapshot (couvrant, sinon plus proche, rien hors existence) testée (point de test 2)
- [x] Chargement paresseux + cache mémoire des Snapshots
- [x] La carte met à jour la source sans rechargement quand la date change
- [x] Bandeau « frontière de [date réelle] » quand le Snapshot ne couvre pas l'année
