Type: grilling
Status: resolved
Blocked by: 09 (resolved)
## Question

Comment relier un Pays actuel aux Entités politiques ayant contrôlé tout ou partie de son territoire : intersection spatiale calculée au build, relation déclarée dans les données, ou les deux ? Quel seuil de recouvrement, et que faire des entités sans Snapshot (pas de géométrie) ? La méthode de croisement doit être partagée avec le calcul de l'histoire politique des Villes (point ∈ Snapshots, cf. issues/09-modele-donnees.md).

## Answer

- **Méthode** : calcul au build (intersection Snapshot ∩ polygone Natural Earth du Pays actuel) + liste déclarée dans `data-src/` pour ajouter/retirer des Entités. Même mécanique que l'histoire politique des Villes (calcul au build + surcharge).
- **Seuil** : Entité liée si intersection ≥ 1 % de la surface du Pays actuel **ou** ≥ 10 % de celle de l'Entité ; éclats sous la précision de la Source ignorés (comme la Comparaison). Cas limites (Monaco, Andorre, débordements Cliopatria) réglés par la liste déclarée.
- **Entités sans Snapshot** : liées par leur point (capitale ou P625) s'il tombe dans le Pays actuel, mention « sans frontière connue » ; présentes dans listes, frise, Fiche ; marqueur sur la carte, **jamais de polygone**. Sans point ni Snapshot : liées uniquement par la liste déclarée.
- **Sortie** : `index/countries/<ISO>.json` = Entités liées + intervalles de présence sur le territoire (calculés Snapshot par Snapshot). Sert à adapter la frise à la sélection, à la Composition, et à la liste « qui a contrôlé ce territoire ».
- **Pays actuels du MVP** : tous ceux de Natural Earth sélectionnables (nom, ISO, continent, récents) ; seule la France a des données ; les autres affichent « pas encore de données historiques » + lien de contribution.
