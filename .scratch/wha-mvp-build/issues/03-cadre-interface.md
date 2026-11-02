# 03: Cadre de l'interface D

**What to build:** La carte est entourée du cadre retenu (variante D du prototype) : marque, emplacement de recherche, onglets Explorer / Couches à gauche et Fiche à droite, panneaux fermés au démarrage et animés à l'ouverture.

**Blocked by:** 02 (Fond de carte Natural Earth)

**Status:** ready-for-agent

- [ ] Onglets verticaux aux bords ; recliquer l'onglet actif ferme le panneau
- [ ] Animations ~350 ms (glissement + fondu, onglet qui suit le bord)
- [ ] L'onglet Couches active/désactive réellement les couches du fond (frontières modernes…) : aucun contrôle factice
- [ ] Store Zustand pour l'état d'interface
