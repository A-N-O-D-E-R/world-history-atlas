Type: prototype
Status: resolved

## Question

À quoi ressemble et comment se comporte l'interface : carte au centre (style parchemin), panneaux gauche/droit repliables, frise en bas avec pas réglable jour/mois/an, lecture auto, sélection d'époques, années av. J.-C. sans année 0 — sur desktop et mobile (carte plein écran, navigation inférieure, fiches coulissantes) ?

## Assets

- Prototype jetable : [prototypes/ui-layout.prototype.html](../prototypes/ui-layout.prototype.html) — 3 variantes (`?variant=A|B|C`), frise jour/mois/an fonctionnelle, données factices marquées DÉMO.

## Answer

Verdict : **variante D** du prototype (`?variant=D`) = base de l'interface. Les variantes A/B/C restent dans le fichier comme source primaire.

- **Layout** : carte plein écran (B). En haut : marque à gauche, grande barre de recherche centrée (pays, empire, dynastie, ville, année), sélecteur de langue. Grande date au-dessus du dock. Boutons ronds en bas à gauche : Comparer, Monde (désélectionner).
- **Panneaux (repris de A), fermés au démarrage**, ouverts par onglets verticaux collés aux bords :
  - gauche : onglets « Explorer » (recherche + Pays actuels, Empires & royaumes, Dynasties, Civilisations, Lieux sauvegardés) et « Couches » (frontières historiques/modernes, villes, événements, fleuves & reliefs, routes) ; recliquer l'onglet actif ferme ;
  - droite : onglet « Fiche » ; clic sur un territoire l'ouvre.
- **Animations** : panneau glisse + fondu (~350 ms), contenu apparaît décalé, onglet suit le bord du panneau ; animations discrètes au survol (onglets, bandes d'époques).
- **Dock de frise** : ◀ ▶ ▶▶, pas jour/mois/an, vitesse ×0,5–×8, curseur, **barre d'époques en couleur** (Antiquité, Moyen Âge, Temps modernes, Contemporaine), époque courante en plein, clic = saut.
- **Échelle de la frise : zoomable.** La barre d'époques = vue d'ensemble de toute la plage (-3000 → aujourd'hui) ; le curseur couvre l'époque choisie (précision jour/mois conservée à toutes les époques, durées non faussées).
- **Mobile** : carte plein écran, onglets aux bords, panneaux en feuilles coulissantes depuis le bas, dock compact.
- Dates validées dans le prototype : pas d'année 0 (1 av. J.-C. + 1 an = 1 ; 31 déc. 1 av. J.-C. + 1 jour = 1ᵉʳ janv. 1).

Prototype non commité (repo sans commit ni remote) : conservé dans `prototypes/`, à déplacer sur une branche jetable au premier commit.
