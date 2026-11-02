# World History Atlas

Atlas historique interactif mondial : visualiser l'évolution des territoires politiques à travers le temps.

## Language

**Pays actuel**:
État souverain d'aujourd'hui, utilisé uniquement comme point d'entrée géographique (code ISO, frontières modernes). Jamais un acteur historique.
_Avoid_: pays (seul), country

**Entité politique**:
Royaume, empire, république, colonie, cité-État ou autre pouvoir politique ayant existé entre deux dates.
_Avoid_: pays, État, polity (en prose française), civilisation

**Snapshot**:
Géométrie datée d'une Entité politique, accompagnée de sa source et de son niveau de fiabilité.
_Avoid_: carte, frontière, territoire (seul)

**Dirigeant**:
Personne ayant exercé le pouvoir sur une Entité politique pendant une période (règne, mandat).
_Avoid_: chef, souverain (seul)

**Dynastie**:
Lignée familiale de Dirigeants. Pas une Entité politique ; peut régner sur plusieurs Entités politiques successives ou simultanées.
_Avoid_: maison (seul), famille, lignée

**Civilisation**:
Regroupement éditorial déclaré d'Entités politiques, sourcé et présenté comme tel. N'a pas de géométrie propre.
_Avoid_: culture, aire culturelle, peuple

**Relation politique**:
Lien daté entre deux Entités politiques : suzeraineté, union personnelle, occupation, protectorat, colonie. Ne modifie pas leurs Snapshots.
_Avoid_: dépendance, appartenance, possession

**Source**:
Origine documentée d'une donnée (jeu de données, atlas, traité, base de faits), avec sa licence et sa fiabilité par défaut.
_Avoid_: référence, provenance

**Fiabilité**:
Degré de confiance d'un Snapshot : haute, moyenne ou reconstitution approximative.
_Avoid_: précision, exactitude, confiance

**Règne**:
Période pendant laquelle un Dirigeant exerce le pouvoir sur une Entité politique, avec son titre.
_Avoid_: mandat (seul), gouvernement

**Comparaison**:
Mise en regard des territoires d'un acteur (Entité politique, Dynastie, ou Entité et son successeur déclaré) à deux dates, exprimée en gains et pertes.
_Avoid_: diff, évolution

**Composition**:
Répartition d'un territoire (Pays actuel) ou d'une Civilisation entre Entités politiques à une date donnée ; ne parle jamais de gains ni de pertes.
_Avoid_: comparaison (pour un Pays actuel), découpage

**Route**:
Voie (terrestre, fluviale, maritime) valable sur un intervalle de dates, avec sa Source et une certitude par tronçon.
_Avoid_: chemin, axe, réseau (seul)

**Itinéraire**:
Suite ordonnée d'étapes datées (Événements ou points sourcés) décrivant un déplacement : campagne militaire, migration. Toujours marqué sourcé ou déduit.
_Avoid_: trajet, parcours, mouvement
