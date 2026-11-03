# 03: Cadre de l'interface D

**What to build:** La carte est entourée du cadre retenu (variante D du prototype) : marque, emplacement de recherche, onglets Explorer / Couches à gauche et Fiche à droite, panneaux fermés au démarrage et animés à l'ouverture.

**Blocked by:** 02 (Fond de carte Natural Earth)

**Status:** done

- [x] Onglets verticaux aux bords ; recliquer l'onglet actif ferme le panneau
- [x] Animations ~350 ms (glissement + fondu, onglet qui suit le bord)
- [x] L'onglet Couches active/désactive réellement les couches du fond (frontières modernes…) : aucun contrôle factice
- [x] Store Zustand pour l'état d'interface

Note : la barre de recherche n'est pas posée (aucun champ factice) ; elle arrive avec le ticket 27. Explorer contient une présentation + lien de contribution en attendant le sélecteur de pays (ticket 23).
