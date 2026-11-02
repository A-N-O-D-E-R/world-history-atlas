Status: ready-for-agent

# Spec — World History Atlas, MVP (pilote France)

Carte de décision : [map.md](map.md) — chaque décision ci-dessous renvoie à son ticket pour le détail. Vocabulaire : `GLOSSARY.md`. ADR : `docs/adr/0001-modele-de-dates.md`, `docs/adr/0002-pipeline-typescript.md`.

## Problem Statement

Un passionné d'histoire, un étudiant ou un enseignant veut comprendre comment le territoire de la France actuelle a été contrôlé, découpé et recomposé au fil des siècles — Gaule romaine, royaumes francs, Royaume de France, Empire, Républiques — sans connaître la géographie historique à l'avance. Les atlas existants sont soit statiques (images), soit centrés sur un seul pays avec des données sous licence restrictive (ex. Jiangshan Map / CHGIS non commercial), soit ne disent jamais d'où viennent leurs frontières ni à quel point elles sont fiables. Il n'existe pas d'outil libre, gratuit, interactif, qui laisse naviguer dans le temps au jour près, distingue clairement une Entité politique d'un Pays actuel, et montre honnêtement les trous et incertitudes des données.

## Solution

Une application web 100 % statique (GitHub Pages) : une carte du monde style parchemin, une frise de -3000 à aujourd'hui en bas de l'écran, et un moteur unique piloté par les données. Pour le MVP, seul le territoire de la France actuelle est peuplé de données historiques (frontières OpenHistoricalMap/Cliopatria, faits Wikidata, routes Itiner-e/AWMC), mais tout Pays actuel est sélectionnable et le moteur n'a aucun code spécifique à la France : ajouter un pays = ajouter des données.

L'utilisateur choisit une date (pas jour/mois/an, lecture automatique), sélectionne un Pays actuel, une Entité politique, une Dynastie ou une Civilisation, ouvre des Fiches (Entité, Dirigeant, Ville, Événement) avec Sources et Fiabilité, compare deux dates, cherche n'importe quel nom (y compris ancien), et propose des corrections qui deviennent des PR GitHub validées en CI. Chaque frontière affiche sa Source, sa date réelle et sa Fiabilité ; aucune donnée n'est inventée ; les trous sont affichés comme tels.

## User Stories

### Carte et navigation

1. En tant que visiteur, je veux voir une carte du monde plein écran au style parchemin dès l'ouverture, afin d'entrer immédiatement dans l'atlas.
2. En tant que visiteur, je veux zoomer et me déplacer de façon fluide, afin d'explorer une région en détail.
3. En tant que visiteur, je veux voir les territoires des Entités politiques existant à la date affichée, chacune avec sa couleur, afin de lire la géographie politique de l'époque.
4. En tant que visiteur, je veux qu'un survol mette un territoire en évidence, afin de savoir ce que je vais sélectionner.
5. En tant que visiteur, je veux cliquer sur un territoire pour ouvrir sa Fiche, afin d'en savoir plus.
6. En tant que visiteur, je veux un bouton « Monde » qui efface toute sélection, afin de revenir à la vue d'ensemble.
7. En tant que visiteur, je veux afficher ou masquer des couches (frontières historiques, frontières modernes, villes, événements, fleuves et reliefs, routes), afin d'alléger ou d'enrichir la carte.
8. En tant que visiteur, je veux superposer les frontières modernes aux frontières historiques, afin de me repérer.
9. En tant que visiteur, je veux voir les capitales et les Villes de l'époque sous forme de marqueurs, afin de situer les centres de pouvoir.
10. En tant que visiteur, je veux voir les fleuves, mers et reliefs nommés, afin de comprendre le terrain.
11. En tant que visiteur, je veux que la carte ne se recharge pas entièrement quand la date change, afin que l'expérience reste fluide.
12. En tant que visiteur, je veux qu'une Entité politique sans frontière connue apparaisse comme un marqueur avec la mention « sans frontière connue », afin de ne jamais confondre un point avec un territoire.
13. En tant que visiteur, je veux voir les Relations politiques (ex. occupation) matérialisées par une hachure optionnelle, afin de distinguer contrôle effectif et souveraineté.

### Frise chronologique

14. En tant que visiteur, je veux une frise fixée en bas de l'écran couvrant -3000 à aujourd'hui, afin de naviguer dans le temps.
15. En tant que visiteur, je veux voir la date courante en grand au-dessus de la frise, afin de savoir toujours où j'en suis.
16. En tant que visiteur, je veux choisir le pas de la frise (jour, mois, an), afin d'avancer à la granularité qui m'intéresse.
17. En tant que visiteur, je veux des boutons précédent / suivant, afin d'avancer d'un pas.
18. En tant que visiteur, je veux une lecture automatique avec vitesse réglable (×0,5 à ×8), afin de voir l'histoire défiler.
19. En tant que visiteur, je veux une barre d'époques colorées (Antiquité, Moyen Âge, Temps modernes, Époque contemporaine) cliquable, afin de sauter rapidement à une grande période.
20. En tant que visiteur, je veux que le curseur couvre l'époque choisie (échelle zoomable), afin de garder une précision jour/mois même pour l'époque moderne.
21. En tant que visiteur, je veux que les dates avant notre ère s'affichent « 500 av. J.-C. » et qu'il n'existe jamais d'année 0, afin que la chronologie soit exacte.
22. En tant que visiteur, je veux que les événements apparaissent comme repères sur la frise, afin de repérer les moments clés.
23. En tant que visiteur, je veux qu'une date imprécise (ex. « vers 1150 ») apparaisse comme une bande et non un point, afin de voir l'incertitude.
24. En tant que visiteur, je veux que la frise s'adapte à la période de présence des Entités quand je sélectionne un Pays actuel, afin de ne pas parcourir des siècles vides.

### Pays actuels

25. En tant que visiteur, je veux sélectionner n'importe quel Pays actuel du monde, afin de partir d'un territoire que je connais.
26. En tant que visiteur, je veux chercher un Pays actuel par nom ou code ISO, afin de le trouver vite.
27. En tant que visiteur, je veux parcourir les Pays actuels par continent, afin d'explorer sans savoir quoi chercher.
28. En tant que visiteur, je veux retrouver la liste des pays récemment consultés, afin d'y revenir facilement.
29. En tant que visiteur, je veux qu'en sélectionnant un Pays actuel la carte zoome dessus, afin de cadrer le territoire.
30. En tant que visiteur, je veux voir la liste des Entités politiques ayant contrôlé tout ou partie du territoire, avec leurs périodes de présence, afin de comprendre qui s'y est succédé.
31. En tant que visiteur, je veux que la France ne soit jamais présentée comme existant dans l'Antiquité, afin de ne pas être induit en erreur.
32. En tant que visiteur, je veux qu'un Pays actuel sans données affiche « pas encore de données historiques » avec un lien pour contribuer, afin de savoir que ce n'est pas un bug.

### Entités, Dynasties, Civilisations

33. En tant que visiteur, je veux un explorateur d'Entités politiques (empires, royaumes, républiques…) indépendant des Pays actuels, afin de suivre une Entité pour elle-même.
34. En tant que visiteur, je veux qu'une Entité ait plusieurs Snapshots à différentes dates, afin de voir son territoire évoluer.
35. En tant que visiteur, je veux que sélectionner une Entité hors de sa période d'existence fasse sauter la frise à son début, afin de toujours voir quelque chose.
36. En tant que visiteur, je veux afficher plusieurs Entités simultanément, afin de voir leurs rapports.
37. En tant que visiteur, je veux sélectionner une Dynastie et voir s'allumer les Entités que ses membres gouvernent à la date affichée, afin de suivre son pouvoir.
38. En tant que visiteur, je veux que sélectionner « Capétiens » inclue ses branches (Valois, Bourbons…), afin de suivre toute la lignée ; et que sélectionner « Valois » n'affiche que les Valois.
39. En tant que visiteur, je veux voir sur la frise les Règnes des membres d'une Dynastie en bandes, avec une coupure quand elle ne règne nulle part, afin de lire sa continuité.
40. En tant que visiteur, je veux que les unions personnelles (ex. France et Navarre en 1589) allument toutes les Entités concernées, afin de voir l'étendue réelle du pouvoir.
41. En tant que visiteur, je veux sélectionner une Civilisation et voir s'allumer ses Entités membres existant à la date affichée, afin de suivre un ensemble culturel.
42. En tant que visiteur, je veux qu'une Civilisation soit clairement présentée comme « regroupement éditorial », afin de ne pas la prendre pour un État.

### Fiches

43. En tant que visiteur, je veux une Fiche d'Entité politique (nom, noms d'époque, type, dates, capitale, Dirigeant à la date affichée, Relations politiques, Sources, Fiabilité), afin de tout savoir d'un coup d'œil.
44. En tant que visiteur, je veux voir le Snapshot affiché avec sa date réelle et un bandeau quand il ne couvre pas exactement l'année demandée, afin de ne pas croire à une frontière exacte.
45. En tant que visiteur, je veux voir la Fiabilité d'une frontière (haute, moyenne, reconstitution approximative) et pouvoir consulter sa Source, afin de juger sa crédibilité.
46. En tant que visiteur, je veux une Fiche de Dirigeant (noms, naissance, décès, Règnes, titre, Dynastie, capitale, événements, Sources, lien Wikipédia), afin de connaître le personnage.
47. En tant que visiteur, je veux cliquer sur un Dirigeant pour afficher le territoire de son Règne, afin de relier personne et territoire.
48. En tant que visiteur, je veux une Fiche de Ville (noms d'époque datés, nom actuel, coordonnées, Entités auxquelles elle a appartenu au fil du temps, Sources), afin de retracer son histoire.
49. En tant que visiteur, je veux une Fiche d'Événement (type, date, lieu, participants, conséquences territoriales liées, Sources), afin de comprendre un moment clé.
50. En tant que visiteur, je veux que les conséquences territoriales d'un Événement soient des liens vers les Snapshots ou Relations concernés, afin de voir concrètement ce qui a changé.
51. En tant que visiteur, je veux un lien Wikipédia sur chaque fiche quand il existe, afin d'approfondir.
52. En tant que visiteur, je veux que les noms d'époque (*Lutetia*, *Constantinopolis*) restent dans leur forme originale, afin de respecter les sources.
53. En tant que visiteur, je veux une page « Sources & licences » listant toutes les Sources et leurs attributions, afin de savoir d'où vient chaque donnée.

### Comparaison et Composition

54. En tant que visiteur, je veux comparer une Entité politique à deux dates et voir ses gains et pertes, afin de mesurer son expansion ou son déclin.
55. En tant que visiteur, je veux comparer une Entité à son successeur déclaré (ex. Royaume de France 1789 → République française 1800), afin de suivre une transition.
56. En tant que visiteur, je veux qu'une comparaison entre Entités sans lien de succession soit refusée avec une explication et une proposition de Composition, afin de ne pas comparer l'incomparable.
57. En tant que visiteur, je veux comparer une Dynastie à deux dates, afin de voir l'évolution de son pouvoir territorial.
58. En tant que visiteur, je veux voir la Composition d'un Pays actuel ou d'une Civilisation à deux dates (qui tenait quoi), afin de comprendre le découpage sans parler de gains ni de pertes.
59. En tant que visiteur, je veux une carte divisée avec curseur glissant entre A et B, afin de comparer visuellement.
60. En tant que visiteur, je veux une superposition transparente avec gains et pertes colorés, afin de voir précisément les différences.
61. En tant que visiteur, je veux voir les dates réelles des deux Snapshots utilisés, et « aucun changement documenté » s'ils sont identiques, afin de ne pas surinterpréter.
62. En tant que visiteur, je veux voir les surfaces gagnées / perdues arrondies (≈), la Fiabilité du résultat et un avertissement si les Sources diffèrent, afin de mesurer l'incertitude.
63. En tant que visiteur, je veux voir les changements de capitale, de Règne et de Relations politiques entre A et B, afin d'avoir le contexte politique.

### Mouvements

64. En tant que visiteur, je veux une couche de Routes antiques avec leur certitude par tronçon, afin de voir le réseau romain.
65. En tant que visiteur, je veux que les tronçons non datés soient signalés « datation inconnue » et marqués approximatifs, afin de ne pas les croire datés.
66. En tant que visiteur, je veux voir les batailles apparaître sur la carte pendant la lecture de la frise, afin de suivre les conflits dans le temps.
67. En tant que visiteur, je veux afficher l'Itinéraire schématique d'une campagne (batailles reliées dans l'ordre), clairement marqué « déduit », afin de visualiser un mouvement sans prendre le tracé pour une source.
68. En tant que visiteur, je veux que les couches migrations et routes commerciales médiévales/modernes indiquent « aucune donnée libre disponible — contribuer », afin de comprendre leur vide.

### Recherche

69. En tant que visiteur, je veux une grande barre de recherche en haut de la carte, afin de trouver n'importe quoi.
70. En tant que visiteur, je veux chercher Pays actuels, Entités, Dynasties, Civilisations, Dirigeants, Villes et Événements, afin d'avoir un seul point d'entrée.
71. En tant que visiteur, je veux qu'un nom ancien ou un alias trouve l'objet (« Constantinople », « Lutèce »), afin de ne pas devoir connaître le nom actuel.
72. En tant que visiteur, je veux une recherche insensible aux accents et à la casse, tolérante à une faute, et qui répond pendant la frappe, afin de trouver vite.
73. En tant que visiteur, je veux taper une date (« 987 », « -500 », « 500 av. J.-C. », « Xᵉ siècle ») pour y sauter, afin de naviguer dans le temps au clavier.
74. En tant que visiteur, je veux des résultats groupés par type avec badge et dates, et un bonus aux objets existant à la date affichée, afin de choisir le bon.
75. En tant que visiteur, je veux que cliquer un résultat fasse l'action naturelle pour son type (zoom, saut de frise, ouverture de Fiche), afin d'arriver directement au contenu.

### Interface, langues, mobile

76. En tant que visiteur, je veux des panneaux Explorer, Couches et Fiche ouverts par des onglets aux bords, fermés au démarrage, afin que la carte reste au centre.
77. En tant que visiteur, je veux des animations discrètes à l'ouverture des panneaux, afin d'une expérience soignée.
78. En tant que visiteur francophone ou anglophone, je veux l'interface en français ou en anglais, afin de la comprendre.
79. En tant que visiteur d'une autre langue, je veux traduire les contenus historiques par IA avec ma propre clé, afin de lire dans ma langue sans que le projet paie.
80. En tant que visiteur, je veux que toute traduction automatique soit marquée comme telle, avec l'original visible, afin de ne pas la prendre pour une source.
81. En tant que visiteur, je veux que ma clé d'IA reste en session par défaut et ne soit mémorisée que si je le demande, afin de protéger ma clé.
82. En tant que visiteur, je veux me connecter à OpenRouter en un clic ou coller une clé Anthropic/OpenAI/Mistral/Gemini, afin d'utiliser le fournisseur de mon choix.
83. En tant que visiteur, je veux que les traductions déjà faites soient mises en cache dans mon navigateur, afin de ne pas payer deux fois.
84. En tant que visiteur sur mobile, je veux une carte plein écran avec onglets aux bords et panneaux coulissant depuis le bas, afin d'utiliser l'atlas sur téléphone.
85. En tant que visiteur, je veux sauvegarder des lieux (Entité, Ville, Événement + date), afin de les retrouver plus tard.
86. En tant que visiteur au clavier ou avec lecteur d'écran, je veux des contrôles accessibles (labels, focus, contrastes), afin d'utiliser l'atlas.

### Contribution

87. En tant que visiteur, je veux un bouton « Proposer une correction » sur chaque Fiche, afin de signaler une erreur là où je la vois.
88. En tant que contributeur, je veux un assistant en fenêtre centrale (Champs, Dates, Géométrie, Source, Envoi) aux étapes cliquables, afin de ne rien oublier tout en allant vite.
89. En tant que contributeur, je veux saisir une Date avec sa précision, son calendrier et éventuellement un intervalle, afin de respecter la source.
90. En tant que contributeur, je veux être empêché de saisir l'année 0 ou une valeur incohérente avec la précision, avec une explication, afin d'éviter les erreurs.
91. En tant que contributeur, je veux être obligé d'indiquer une Source avec une licence autorisée, afin que chaque donnée reste traçable et redistribuable.
92. En tant que contributeur, je veux télécharger une frontière, la modifier dans QGIS et la réimporter, avec un aperçu sur la carte, afin de corriger une géométrie.
93. En tant que contributeur public, je veux ouvrir une issue GitHub pré-remplie avec ma correction, une jauge de longueur et la consigne de joindre mon fichier de géométrie, afin de contribuer sans compte développeur ni token.
94. En tant que contributeur sur mobile, je veux corriger les attributs et la Source, la géométrie étant indiquée « disponible sur ordinateur », afin de contribuer depuis mon téléphone.
95. En tant que mainteneur, je veux qu'en posant un label sur une issue de correction une PR soit créée automatiquement, afin de traiter les contributions sans copier-coller.
96. En tant que mainteneur, je veux que chaque PR soit validée en CI avec un rapport en commentaire (erreurs bloquantes, avertissements), afin de merger en confiance.
97. En tant que mainteneur, je veux ajouter ou corriger des données en local via le même éditeur, qui écrit directement les fichiers de surcharge, afin de travailler vite.
98. En tant que mainteneur, je veux qu'une correction d'un fait Wikidata soit une surcharge sourcée qui conserve l'ancienne valeur, avec un lien « corriger aussi sur Wikidata », afin de garder la traçabilité.
99. En tant que mainteneur, je veux qu'aucune contribution ne soit publiée sans ma validation, afin de garder la qualité.

### Données et extension

100. En tant que mainteneur, je veux lancer manuellement un script d'extraction (Wikidata, OHM, Cliopatria, Itiner-e, AWMC, Natural Earth) qui écrit des extraits commités, afin que le build soit reproductible et hors réseau.
101. En tant que mainteneur, je veux que le build transforme les données sources en fichiers publiés et index sans aucune édition manuelle, afin d'éviter les incohérences.
102. En tant que mainteneur, je veux ajouter un nouveau pays ou une nouvelle Entité uniquement en ajoutant des données, sans toucher au code, afin que le moteur soit universel.
103. En tant que mainteneur, je veux que chaque push sur la branche principale reconstruise et déploie le site sur GitHub Pages, afin de publier sans effort.
104. En tant que contributeur, je veux une documentation expliquant comment ajouter un pays, une Entité et importer des frontières, afin de pouvoir contribuer.

## Implementation Decisions

### Architecture générale

- Application **100 % statique** sur GitHub Pages : React, TypeScript, Vite, MapLibre GL JS, Zustand, i18next, Turf. Aucun backend ; les chemins de données publiés doivent pouvoir être servis tels quels plus tard par une API (backend futur hors périmètre).
- **Pipeline de données en TypeScript/Node** (ADR 0002) : Turf, mapshaper, fetch Wikidata JSON ; tippecanoe (binaire, via Docker) pour le fond. Un seul jeu de schémas sert à valider les données et à typer l'application.
- Modules :
  - **Modèle de dates** (partagé pipeline + app) : analyse, validation, conversion julien → grégorien, clé de tri, formatage (av. J.-C., pas d'année 0, précisions), pas jour/mois/an.
  - **Schémas de données** (partagés) : types et validation de tous les objets publiés et sources.
  - **Pipeline** : extraction (manuelle), build (CI, hors réseau), validation, génération des index, attributions.
  - **Module de requêtes** (app, sans dépendance à la carte ni à React) : chargement paresseux + cache mémoire des fichiers publiés ; résolution du Snapshot à une date ; territoires de Dynastie/Civilisation ; Comparaison ; Composition ; recherche ; liens Pays actuel → Entités.
  - **Moteur cartographique** : encapsule MapLibre (sources/couches, mise à jour à la date sans rechargement, sélection, surlignage, cadrage, couches visibles).
  - **Interface** : layout, frise, panneaux, Fiches, Comparaison, recherche, éditeur, réglages (langue, clé IA), store Zustand.
  - **Traduction IA** (navigateur uniquement).
  - **CI/CD** : workflows GitHub Actions.

### Modèle de dates (ADR 0001)

- Une Date = valeur telle que dans la Source + calendrier source + précision (jour, mois, année, siècle) + clé de tri grégorien proleptique calculée au build (seule utilisée pour afficher/comparer).
- Le flou = **intervalle** (au plus tôt / au plus tard, chaque borne avec sa précision) ; décennie Wikidata → intervalle d'années, millénaire → intervalle de siècles. Affiché en bande sur la frise.
- Dates Wikidata lues **uniquement via le JSON** (`wbgetentities`), conversion julien → grégorien faite par nous ; WDQS sert uniquement à collecter des QID.
- Convention interne d'année historique : -1 = 1 av. J.-C., 1 = 1 apr. J.-C., pas d'année 0. Le prototype a validé qu'un pas d'un an depuis -1 donne 1, et qu'un pas d'un jour depuis le 31 déc. -1 donne le 1er janv. 1 (implémentation prototype : année astronomique en interne, conversion à l'affichage).
- Forme de type issue de la discussion / du prototype :

```ts
type Precision = 'day' | 'month' | 'year' | 'century';
type Calendar = 'gregorian' | 'julian';
interface DatePoint { value: string; calendar: Calendar; precision: Precision; sortKey: number } // sortKey calculée au build
type HistDate = DatePoint | { earliest: DatePoint; latest: DatePoint };
```

### Modèle de données

- **Identifiants** : QID Wikidata si existant, sinon `wha:<slug>`. Références entre fichiers toujours par identifiant.
- **Entité politique** : identifiant, `names` (libellés fr/en Wikidata), `originalNames` (noms d'époque datés + langue, jamais traduits), alias, type, intervalle d'existence, capitale(s) datées, prédécesseurs / successeurs, Sources.
- **Snapshot** : géométrie d'une Entité valable sur un intervalle [début, fin[ ; Source ; Fiabilité héritée de la Source, surchargeable avec note obligatoire. Résolution : Snapshot couvrant l'année, sinon le plus proche avec bandeau « frontière de [date réelle] » ; rien hors existence de l'Entité.
- **Relation politique** : lien daté et typé entre deux Entités (suzeraineté, union personnelle, occupation, protectorat, colonie) ; ne modifie pas les Snapshots.
- **Source** : métadonnées une fois par Source (auteur/organisme, date de publication, échelle, méthode, licence, URL, attribution) + Fiabilité par défaut (OHM : moyenne ; Cliopatria : approximative). « Haute » réservée à l'actuel (Natural Earth) et aux Snapshots sourcés par un traité.
- **Dirigeant** + **Règne** (Dirigeant, Entité, intervalle, titre ; plusieurs Règnes possibles). **Dynastie** portée par le Dirigeant, avec Dynastie parente ; territoire = Entités gouvernées par ses membres (branches incluses) à la date.
- **Civilisation** : liste éditoriale sourcée d'Entités ; multi-appartenance ; pas de géométrie.
- **Ville** : coordonnées sourcées, noms d'époque datés, Dates d'attestation ; histoire politique **calculée au build** (point ∈ Snapshots), corrigeable par surcharge. Villes du MVP : référencées (capitales, lieux d'Événements) + liste curée (quelques centaines).
- **Événement** : type, Date/intervalle, lieu (Ville ou coordonnées sourcées), participants, Sources ; conséquences = liens vers Snapshots/Relations ouverts ou fermés. Sans lieu sourcé : frise oui, carte non.
- **Route** : ligne + intervalle + Source + certitude par tronçon. Itiner-e : certain → moyenne ; conjecturé / hypothétique → approximative (hypothétique en pointillé) ; non daté → affiché sur toute la période du jeu, « datation inconnue », approximative.
- **Itinéraire** : étapes datées ordonnées, marqué *sourcé* ou *déduit* (campagnes déduites des batailles P361).
- **Lien Pays actuel → Entités** : calculé au build (intersection ≥ 1 % de la surface du pays ou ≥ 10 % de l'Entité, éclats sous la précision de la Source ignorés) + liste déclarée d'ajouts/retraits ; Entités sans Snapshot liées par leur point. Sortie par pays : Entités liées + intervalles de présence.

### Fichiers et pipeline

- Deux zones : **données sources** (extraits bruts commités, listes curées : QID retenus, Civilisations, Villes ; surcharges un fichier par objet) — seul endroit écrit par l'éditeur et les PR ; **données publiées** générées par le build, jamais éditées.
- Priorité : surcharge > liste curée > Wikidata. Une surcharge = champ, nouvelle valeur, Source, auteur, date ; l'ancienne valeur reste dans l'extrait.
- Publié : un fichier par objet (entités, snapshots GeoJSON, dirigeants, dynasties, civilisations, villes, événements, sources, routes, itinéraires) ; index légers au démarrage (entités : id, noms, intervalle, emprise, Snapshots + intervalles) ; index par pays ; index des événements par siècle chargé avec la frise ; index de recherche précalculé.
- Géométries : fond Natural Earth en un **PMTiles** z0–7 ; Snapshots en **GeoJSON** simplifié (mapshaper), chargés à la demande ; bascule en PMTiles si un Snapshot dépasse 1 Mo gzip.
- Extraction : OHM avec filtrage et attribution du tag `license` (segments CC BY CNIG gardés et attribués) ; Cliopatria filtré `Type=POLITY` ; Wikidata JSON figé.
- Validation CI : erreurs bloquantes (JSON/GeoJSON invalide, polygone invalide, identifiant dupliqué, référence inexistante, intervalle incohérent, date sans calendrier/précision, Source sans licence, licence hors liste blanche CC0 / CC BY / ODbL / domaine public / GPL, Snapshot sans Source) ; avertissements (libellé fr/en manquant, pas de lien Wikipédia, Snapshot > 1 Mo gzip, Entité sans Snapshot ni point).
- Page « Sources & licences » générée + attribution compacte MapLibre.
- Pas de service worker au MVP ; cache navigateur + mémoire.

### Interface (prototype, variante D)

- Carte plein écran ; en haut : marque, grande barre de recherche centrale, langue ; grande date au-dessus du dock ; boutons ronds Comparer et Monde.
- Panneaux fermés au démarrage, ouverts par onglets verticaux aux bords : gauche « Explorer » (recherche, Pays actuels, Empires & royaumes, Dynasties, Civilisations, Lieux sauvegardés) et « Couches » ; droite « Fiche » (ouverte au clic d'un territoire). Animations ~350 ms (glissement + fondu, contenu décalé, onglet qui suit le bord).
- Dock de frise : précédent/suivant, lecture, pas jour/mois/an, vitesse ×0,5–×8, curseur, barre d'époques colorées (Antiquité, Moyen Âge, Temps modernes, Contemporaine) ; échelle zoomable (la barre = vue d'ensemble, le curseur = époque choisie).
- Mobile : carte plein écran, onglets aux bords, panneaux en feuilles depuis le bas, dock compact.

### Comparaison, Composition

- Comparaison (gains/pertes) pour un acteur : Entité, Dynastie, ou Entité → successeur déclaré. Composition (sans gains/pertes) pour Pays actuel et Civilisation. Calcul dans le navigateur avec Turf (surfaces géodésiques), Web Worker si > ~1 s. Fiabilité du résultat = la plus faible des deux Snapshots ; avertissement si Sources différentes. Deux modes : carte divisée, superposition.

### Recherche

- MiniSearch, index précalculé au build. Objets : Pays actuels (noms, ISO2/ISO3), Entités, Dynasties, Civilisations, Dirigeants, Villes, Événements ; noms fr/en, d'époque, alias Wikidata ; saisies de date reconnues. Insensible accents/casse, préfixe, 1 faute pour mots ≥ 5 lettres. Classement exact > préfixe > approché, bonus à la date courante ; groupé par type. Action au clic par type.

### Éditeur et contribution

- Assistant en fenêtre centrale, 5 étapes cliquables (Champs, Dates, Géométrie, Source, Envoi) ; champs modifiés surlignés ; validation des dates (pas d'année 0, cohérence précision) ; Source obligatoire (titre + licence de la liste blanche) ; géométrie : téléchargement → QGIS → import contrôlé (Polygon/MultiPolygon) + aperçu.
- Mode public : pseudo GitHub, issue pré-remplie (issue form `correction`, bloc JSON de surcharge), jauge d'URL ~6 Ko, consigne de glisser le fichier de géométrie (renommé `.json`, ≤ 25 Mo) dans l'issue. Mode local : écriture du fichier de surcharge.
- Workflow GitHub Actions : label posé par le mainteneur sur l'issue → téléchargement de la pièce jointe → création de la PR → validation dans le même job (une PR créée par `GITHUB_TOKEN` ne déclenche pas d'autre workflow). Titre/corps d'issue = entrées non fiables, jamais interpolés dans une commande. Réglage « Allow GitHub Actions to create and approve pull requests » à activer.
- Lien « éditer sur GitHub » en option pour contributeurs avancés.
- Mobile : même assistant plein écran, étape Géométrie « disponible sur ordinateur ».

### Langues et traduction IA

- UI fr + en via dictionnaires i18next faits main ; architecture prête pour d'autres langues (RTL non requis au MVP).
- Traduction IA des **descriptions** uniquement (noms : libellés Wikidata), BYOK navigateur : OpenRouter (OAuth PKCE), Anthropic (header `anthropic-dangerous-direct-browser-access`), OpenAI, Mistral, Gemini ; pas DeepL. Clé en `sessionStorage` par défaut, `localStorage` si « se souvenir » ; CSP `connect-src` restreinte aux fournisseurs ; réponses rendues en texte, jamais en HTML ; cache des traductions dans IndexedDB ; marquage « traduction automatique » + original visible ; jamais stockées dans le repo.

### Livraison en trois étapes (une seule spec)

1. Carte, frise, France (Entités, Snapshots, Dirigeants, Villes, Événements), Fiches, Sources & Fiabilité, Pays actuels, fr/en, mobile.
2. Comparaison / Composition, recherche, éditeur et corrections (local + public + workflow), modes Dynastie / Civilisation, lieux sauvegardés, traduction IA.
3. Routes antiques, batailles animées + Itinéraires déduits, couches migrations/commerce vides, fleuves et reliefs nommés.

## Testing Decisions

- **Bon test** : vérifie un comportement observable depuis l'extérieur d'un point de test (entrées → sorties), jamais la structure interne. Données d'exemple petites, écrites à la main, couvrant les cas limites (av. J.-C., julien, intervalles, Snapshot manquant, succession, union personnelle).
- **Point de test 1 — pipeline** : `data-src/` d'exemple → données publiées + rapport de validation. Couvre extraction des dates Wikidata (julien → grégorien, -0001 = 1 av. J.-C.), surcharges et priorité, lien Pays actuel → Entités (seuils), histoire politique des Villes, index (entités, pays, événements par siècle, recherche), toutes les règles d'erreur et d'avertissement, attributions générées.
- **Point de test 2 — module de requêtes** : données publiées d'exemple → réponses métier, sans navigateur ni carte. Couvre résolution du Snapshot (couvrant / plus proche / hors existence), territoires de Dynastie (branches, unions personnelles, coupures) et Civilisation, Comparaison (gains/pertes, succession déclarée, refus, même Snapshot, éclats ignorés, fiabilité minimale), Composition, recherche (accents, alias, fautes, dates saisies, classement, bonus de date). Le **modèle de dates** partagé est testé ici et réutilisé par le pipeline (pas d'année 0, pas jour/mois/an, formatage, intervalles, conversion julien).
- **Point de test 3 — parcours navigateur** (Playwright, application construite sur les données d'exemple) : A) sélectionner France → 987 → carte historique → Fiche Dirigeant ; B) sélectionner Empire romain → 117 → Snapshot disponible affiché ; C) Comparer le Royaume de France en 987 et 1789 ; D) chercher « Constantinople » → localisation et noms ; E) aller en -500 et vérifier qu'aucune année 0 n'apparaît ; F) éditeur : proposer une correction et obtenir l'URL d'issue pré-remplie (sans l'ouvrir). Un passage en viewport mobile pour A.
- Pas de tests unitaires des composants React ni du rendu MapLibre : couverts par les points 2 et 3.
- Prior art : aucun (repo vide). Le prototype `prototypes/ui-layout.prototype.html` a servi de vérification manuelle de la logique de dates et des parcours d'interface ; il n'est pas réutilisé comme code.

## Out of Scope

- Backend (Spring Boot / PostGIS / Node) et base de données : full static ; seul le contrat de chemins publiés est préparé.
- Pays pilotes autres que la France (Rome, Chine, Égypte, Anatolie) : effort suivant, pour prouver l'universalité.
- Digitalisation manuelle de frontières et dessin de polygones dans le navigateur.
- Interface dans d'autres langues que fr/en (contenus couverts par la traduction IA) ; mise en page RTL.
- Données de migrations et de routes commerciales médiévales/modernes (couches livrées vides).
- Service worker / mode hors ligne.
- Interpolation de frontières entre deux Snapshots.

## Further Notes

- Sources validées : OpenHistoricalMap (CC0, attribution CC BY pour segments CNIG), Cliopatria v0.2.1 (CC BY 4.0), Natural Earth (domaine public), Wikidata (CC0), Itiner-e (CC BY 4.0), AWMC (ODbL). Exclues : CShapes (NC), CHGIS/Hartwell (NC) ; historical-basemaps (GPL-3.0) sans apport.
- Trous connus à afficher, pas à combler : Gaule indépendante -500 → -58, OHM vide 1050/1201 → 1648 (Cliopatria grossier seul), Corse 843 → 1648, Nice/Savoie avant 1860, côtes imprécises (Cliopatria). Anomalies Cliopatria (occupations codées comme possessions) : corrigées par Relations politiques / surcharges.
- Contraintes GitHub Pages : site ≤ 1 Go, fichier ≤ 100 MiB, gzip seulement, `max-age=600` fixe, requêtes Range OK (PMTiles). Projet estimé < 40 Mo.
- Limites WDQS : 60 s/requête, User-Agent obligatoire ; extraction ciblée + snapshot commité.
- Le repo n'a encore ni commit ni remote : le premier ticket d'implémentation doit initialiser le projet et le dépôt GitHub public.
- Détail de chaque décision : tickets de la carte `map.md` et notes `research/`.
