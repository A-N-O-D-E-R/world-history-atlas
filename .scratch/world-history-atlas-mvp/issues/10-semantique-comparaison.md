Type: grilling
Status: resolved
Blocked by: 09 (resolved)
## Question

Que signifie comparer deux dates (ex. « France en 987 vs 1789 ») quand les Entités politiques changent ? Que sont exactement les « gains » et « pertes » (par Entité politique ? par territoire du Pays actuel ?), comment traiter des Snapshots à des dates différentes de celles demandées, et comment afficher l'incertitude dans le résultat ?

## Answer

Termes ajoutés à `GLOSSARY.md` : Comparaison, Composition.

- **Deux opérations distinctes.** *Comparaison* (gains/pertes) pour un acteur : Entité politique, Dynastie (union des Entités gouvernées à A et B), ou Entité → successeur **déclaré** (Wikidata P1366 ou surcharge ; titre « X (A) → Y (B) — successeur »). *Composition* (qui tenait quoi, sans gains/pertes) pour un Pays actuel ou une Civilisation. Comparaison entre Entités sans succession déclarée : refusée avec explication + proposition de Composition du Pays actuel. « France 987 vs 1789 » = Comparaison du Royaume de France.
- **Snapshots résolus** par la règle du modèle de données (couvrant, sinon le plus proche) ; dates réelles des deux Snapshots toujours affichées ; même Snapshot pour A et B → « aucun changement **documenté** entre ces dates ».
- **Incertitude** : surfaces géodésiques (`turf.area`, équivalent aires égales) arrondies avec « ≈ » ; éclats sous la précision de la Source ignorés (ex. Cliopatria ~40 km²/pixel) ; fiabilité du résultat = la plus faible des deux Snapshots ; Sources différentes → avertissement « écarts possiblement dus aux sources ».
- **Affichage** : carte divisée (A gauche / B droite, curseur glissant) ou superposition transparente (gains vert olive, pertes rouge brique hachuré) ; liste : capitale A→B, Règne en cours A→B, Relations politiques changées.
- **Calcul** côté navigateur avec Turf, à la demande, pas de précalcul ; Web Worker si > ~1 s.
