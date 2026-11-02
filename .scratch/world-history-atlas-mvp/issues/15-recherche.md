Type: grilling
Status: resolved

## Question

Que couvre la recherche et comment matche-t-elle : quels objets (Pays actuels, Entités, Dynasties, Civilisations, Dirigeants, Villes, Événements, années comme « 987 » ou « -500 »), noms d'époque et libellés fr/en, insensibilité aux accents et à la casse, tolérance aux fautes, classement des résultats, taille de `index/search.json`, bibliothèque côté client ou code maison ?

## Answer

- **Indexé** : Pays actuels (noms fr/en, ISO2/ISO3), Entités politiques, Dynasties, Civilisations, Dirigeants, Villes, Événements ; noms = libellés fr/en + noms d'époque + **alias Wikidata** (CC0) (ex. « Constantinople » → Istanbul). Saisies de dates (« 987 », « -500 », « 500 av. J.-C. », « Xᵉ siècle ») → saut de frise.
- **Villes du MVP** : celles référencées par les données (capitales, lieux d'Événements) + liste curée de villes historiques ; quelques centaines, pas les 46 000 communes ; ajouts via l'éditeur.
- **Matching** : insensible aux accents et à la casse, préfixe (recherche pendant la frappe), 1 faute tolérée pour les mots ≥ 5 lettres. Bibliothèque **MiniSearch** (~7 Ko gzip, sans dépendance) ; index **précalculé au build** (`index/search.json`, chargé via `loadJSON`).
- **Classement** : exact > préfixe > approché ; bonus aux objets existant à la date courante de la frise ; résultats groupés par type, badge de type + dates (« Royaume de France · 987–1792 »).
- **Action au clic** : Pays actuel → zoom + frise adaptée + Composition ; Entité/Dynastie/Civilisation → sélection, saut au début si hors existence ; Dirigeant → fiche + saut au début du Règne ; Ville → centrage + Fiche ; Événement → saut à la date + centrage + Fiche ; date → saut de frise.
