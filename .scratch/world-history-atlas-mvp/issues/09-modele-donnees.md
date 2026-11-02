Type: grilling
Status: resolved
Blocked by: 01, 05, 06
## Question

Quel est le modèle de données canonique : Entité politique, Snapshot, Dirigeant, Dynastie (avec Dynastie parente), Civilisation (membres multiples, cf. issues/07-civilisation-dynastie.md), Ville, Événement, Date (valeur + précision + calendrier source), Source et fiabilité (3 niveaux + métadonnées de frontière), surcharges locales sourcées, souverainetés superposées et multi-niveaux ? Comment les fichiers sont-ils découpés et référencés, de façon à rester servables tels quels par une future API ? Inclure : mapping des précisions Wikidata 8 (décennie) et 6 (millénaire) vers nos 4 niveaux, et choix unique du pipeline de dates (JSON API = calendrier source, -0001 = 1 av. J.-C. ; WDQS = grégorien, 0000 = 1 av. J.-C.) — cf. issues/06-wikidata-source.md.

## Answer

Termes ajoutés à `GLOSSARY.md` : Relation politique, Source, Fiabilité, Règne. ADR : [docs/adr/0001-modele-de-dates.md](../../../docs/adr/0001-modele-de-dates.md).

- **Date** = valeur telle que dans la Source + calendrier source + précision (jour/mois/année/siècle) + clé de tri grégorien proleptique calculée au build (seule utilisée pour afficher/comparer). Peut être un **intervalle** (au plus tôt / au plus tard, chaque borne avec sa précision) : décennie Wikidata (8) → intervalle d'années, millénaire (6) → intervalle de siècles ; affiché en bande sur la frise. Dates lues **uniquement via JSON Wikidata** (`wbgetentities`), conversion julien→grégorien faite par nous ; WDQS = collecte de QID seulement.
- **Identifiants** : QID Wikidata si existe, sinon `wha:<slug>`. Références entre fichiers toujours par identifiant, jamais par nom.
- **Entité politique** : id, `names` (fr/en, libellés Wikidata), `originalNames` (noms d'époque datés + langue, jamais traduits), type, intervalle d'existence, capitale(s) datées, prédécesseurs/successeurs, Sources.
- **Snapshot** : géométrie d'une Entité valable sur un intervalle [début, fin[ ; Source ; fiabilité héritée de la Source, surchargeable avec note obligatoire. Sans Snapshot couvrant l'année : afficher le plus proche + bandeau « frontière de [date réelle] » ; rien hors existence de l'Entité.
- **Relation politique** : lien daté et typé entre deux Entités (suzeraineté, union personnelle, occupation, protectorat, colonie), ne modifie pas les Snapshots. Carte : couleur propre à chaque Entité par défaut ; Relations dans la Fiche, hachure optionnelle (ex. occupation).
- **Source** : métadonnées une fois par Source (auteur/organisme, date de publication, échelle, méthode, licence, URL, attribution) + fiabilité par défaut (OHM moyenne, Cliopatria approximative). « Haute » réservée à l'actuel (Natural Earth) et aux Snapshots sourcés par un traité.
- **Règne** : Dirigeant + Entité + intervalle + titre (ex. Henri IV : 2 Règnes Navarre/France ; Napoléon : 1804–1814 et 1815). Dynastie portée par le Dirigeant (cf. ticket Civilisation et Dynastie : Dynastie parente ; Civilisation = liste éditoriale d'Entités, multi-appartenance).
- **Événement** : type (bataille, traité, couronnement, révolution, fondation, conquête, indépendance, disparition d'État), Date/intervalle, lieu = Ville (id) ou coordonnées sourcées (jamais inventées), participants (Entités/Dirigeants), Sources ; conséquences territoriales = liens vers Snapshots/Relations qu'il ouvre ou ferme (ex. traité de Turin 1860 → Snapshot France 1860–). Sans lieu sourcé : frise oui, carte non.
- **Ville** : coordonnées sourcées (P625), noms d'époque datés, Dates d'attestation ; histoire politique **calculée au build** (point ∈ Snapshots), corrigeable par surcharge.
- **Fichiers** : `data-src/` = extraits bruts (Wikidata JSON figé, OHM, Cliopatria, Natural Earth) + listes curées (QID retenus, Civilisations) + surcharges ; seul endroit écrit par éditeur/PR. `public/data/` = **généré par le build**, jamais édité à la main, régénéré et validé en CI.
- **Surcharges** : `data-src/overrides/<id>.json` (un fichier par objet) : champ, nouvelle valeur, Source, auteur, date ; ancienne valeur conservée dans l'extrait. Priorité surcharge > liste curée > Wikidata.
- **Publié** : un fichier par objet (`entities/<id>.json`, `snapshots/<id>.geojson`, `rulers/`, `dynasties/`, `civilisations/`, `cities/`, `events/`, `sources/`) ; index légers au démarrage (`index/entities.json` : id, noms, intervalle, emprise, Snapshots + intervalles ; `index/search.json`) ; `index/events/<siècle>.json` chargé avec la frise. Chemins servables tels quels par une future API.
- **Traductions IA** : jamais stockées dans le repo (navigateur uniquement).
