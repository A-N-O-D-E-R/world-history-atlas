Type: prototype
Status: resolved

## Question

À quoi ressemble et comment se comporte l'éditeur unique (cf. Contribution depuis site statique, Modèle de données) : formulaires d'attributs par type d'objet, saisie des Dates (valeur, calendrier, précision, intervalle), Source obligatoire, download → QGIS → upload de géométrie, flux local (écrit `data-src/`) vs public (issue form pré-remplie < ~6 Ko + pièce jointe), aperçu de la surcharge sur la carte avant envoi ?

## Assets

- Prototype jetable : [prototypes/ui-layout.prototype.html](../prototypes/ui-layout.prototype.html) `?variant=D&editor=A|B|C` — cliquer un territoire → Fiche → « ✎ Proposer une correction ».

## Answer

Verdict : **variante B — fenêtre centrale, assistant en 5 étapes** (A et C restent dans le prototype comme source primaire).

- **Ouverture** : bouton « ✎ Proposer une correction » dans la Fiche → fenêtre modale centrale (fond assombri, fondu). Étapes cliquables : **Champs → Dates → Géométrie → Source → Envoi** ; les contributeurs habitués sautent directement à une étape.
- **Champs** modifiés surlignés (vert olive). Formulaire par type d'objet (prototype : Entité politique — noms fr/en, type, début, fin, capitale).
- **Saisie de Date** : valeur (AAAA, AAAA-MM, AAAA-MM-JJ ; négatif = av. J.-C.), précision (jour/mois/année/siècle), calendrier (grégorien/julien), case « intervalle » → borne « au plus tard » ; refus avec explication : année 0, format incohérent avec la précision, borne manquante ; rappel « saisie dans le calendrier de la source, affichage converti en grégorien ».
- **Géométrie** : télécharger la frontière actuelle (.geojson) → QGIS → importer ; contrôle Polygon/MultiPolygon, taille affichée, aperçu en rouge pointillé sur la carte.
- **Source obligatoire** : titre + licence de la liste blanche (URL, note facultatives) ; envoi impossible sans.
- **Envoi** : bascule Public / Local.
  - *Public* : pseudo GitHub requis ; aperçu de l'issue (bloc JSON de surcharge) ; jauge de longueur d'URL vs ~6 Ko ; si géométrie : consigne « glissez-déposez <fichier>.json dans l'issue » ; bouton « Ouvrir l'issue pré-remplie sur GitHub » (template `correction.yml`, label `correction`).
  - *Local* : aperçu du fichier `data-src/overrides/<id>.json` puis écriture.
  - Liste des erreurs bloquantes affichée au-dessus du bouton.
- **Mobile** : même assistant en plein écran ; l'étape Géométrie affiche « disponible sur ordinateur (QGIS requis) ».
