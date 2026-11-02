# World History Atlas — MVP

Label: wayfinder:map

## Destination

Spec MVP de World History Atlas (`spec.md` dans ce dossier) prête pour `/to-tickets` : carte monde + frise + France pilote, full static, toutes fonctionnalités livrées en 3 étapes ordonnées.

## Notes

- Domaine : atlas historique. Vocabulaire dans `GLOSSARY.md` (Pays actuel, Entité politique, Snapshot). Skills : `grilling` + `domain-modeling` pour tout ticket HITL.
- Planning only : produire des décisions, pas de code.
- Cahier des charges + master prompt d'origine : fournis par l'utilisateur dans la session de charting (2026-11-02) ; base de référence, pas contrat.
- Contraintes actées au charting :
  - Front figé : React, TypeScript, Vite, MapLibre GL JS, Zustand, i18next, Turf. Full static, hébergé sur GitHub Pages.
  - Données redistribuables uniquement (CC0, CC-BY, ODbL, domaine public, GPL OK). CHGIS/Hartwell exclus. Imports uniquement, pas de digitalisation manuelle.
  - Fond de carte : Natural Earth auto-hébergé, style parchemin, sans clé API.
  - Frise : -3000 à aujourd'hui, pas réglable jour/mois/an. Chaque date porte une précision (jour, mois, année, siècle). Calendrier source conservé (julien, grégorien…), affichage toujours en grégorien. Pas d'année 0 (-1 = 1 av. J.-C.).
  - Pilote : France seule ; snapshots dès ~-500, trous affichés comme « données indisponibles ».
  - Périmètre MVP = tous les critères du cahier des charges + routes commerciales, migrations, batailles animées, World/Civilization/Dynasty modes, lieux sauvegardés, fleuves/montagnes nommés. Livré en 3 étapes : (1) carte, frise, France, fiches, sources/fiabilité ; (2) comparaison, recherche, éditeur/corrections, modes, lieux sauvegardés ; (3) routes, migrations, batailles animées, relief nommé.
  - UI fr + en (i18n faite main). Contenus historiques traduisibles par IA avec la clé de l'utilisateur (BYOK, navigateur), marqués « traduction automatique », original visible, noms historiques originaux jamais traduits.
  - Textes : faits structurés Wikidata + lien Wikipédia ; aucun texte IA présenté comme fait.
  - Éditeur unique : local (écrit fichiers) + public (propose PR/issue GitHub pré-remplie, validée en CI, mergée par le mainteneur). Édite attributs ; géométries via download → QGIS → upload joint à la PR. Pas de dessin dans le navigateur.
  - Corrections de faits Wikidata : surcharge locale avec sa propre source, ancienne valeur traçable, lien « corriger aussi sur Wikidata » (défaut, réversible).

## Decisions so far

<!-- one line per closed ticket -->

- [Contribution depuis site statique](issues/03-contribution-site-statique.md): issue form pré-remplie + label mainteneur → GitHub Actions crée la PR ; GeoJSON glissé en pièce jointe (.json/.zip, ≤25 Mo) ; OAuth device flow impossible (pas de CORS), PAT écarté.
- [Traduction IA BYOK](issues/04-traduction-ia-byok.md): appel navigateur OK chez Anthropic (header dédié), OpenAI, Mistral, Gemini, OpenRouter (OAuth PKCE = meilleur BYOK) ; DeepL impossible ; ~0,001–0,005 $/1000 mots ; noms via libellés Wikidata, IA pour descriptions ; clé en sessionStorage + CSP.
- [Sources mouvements](issues/02-sources-mouvements.md): routes antiques OK (Itiner-e CC BY, AWMC ODbL, ORBIS MIT) ; batailles = points datés Wikidata (578 en France) ; aucun tracé de campagne, migration ni flux commercial redistribuable sans digitalisation.
- [Wikidata comme source](issues/06-wikidata-source.md): bon socle CC0 (QID, libellés fr/en, liens Wikipédia, dates jul./grég.) mais couverture inégale et zéro géométrie ; partir de QID curés + surcharges locales ; extraire via wbgetentities (JSON, calendrier source) et figer un snapshot dans le repo.
- [Sources frontières France](issues/01-sources-frontieres-france.md): OpenHistoricalMap (CC0, fin 1648→, quelques segments CC BY à filtrer) + Cliopatria (CC BY 4.0, -500→2024 continu mais grossier) + Natural Earth ; CShapes exclu (NC), historical-basemaps (GPL) sans apport ; trous : Gaule -500→-58, 1201→1648 chez OHM, Corse/Nice/Savoie ; fiabilité attribuée par source.
- [Format géométries](issues/05-format-geometries.md): fond Natural Earth en un PMTiles (tippecanoe, 7–16 Mo selon zoom max) ; Snapshots en GeoJSON simplifié (mapshaper) chargés à la demande, ~30–100 Ko chacun ; GitHub Pages OK (Range 206, gzip seul, projet < 40 Mo).
- [Civilisation et Dynastie](issues/07-civilisation-dynastie.md): Dynastie = lignée de Dirigeants (branches via Dynastie parente), territoire = Entités gouvernées à la date ; Civilisation = regroupement éditorial sourcé d'Entités, multi-appartenance ; World = vue par défaut, pas un mode.
- [Maquette de l'interface](issues/08-prototype-ui.md): variante D = carte plein écran + recherche centrale + dock de frise à époques colorées (échelle zoomable par époque) + panneaux Explorer/Couches/Fiche à onglets, fermés au démarrage, animés ; mobile en feuilles coulissantes.
- [Modèle de données](issues/09-modele-donnees.md): Date = valeur source + calendrier + précision + clé de tri grégorienne, intervalles pour le flou, extraction JSON Wikidata seule (ADR 0001) ; Snapshot sur intervalle ; Relations politiques typées ; Règne ; fiabilité par Source ; data-src/ (seul écrit) → build → public/data/ un fichier par objet + index.
- [Sémantique de la comparaison](issues/10-semantique-comparaison.md): Comparaison (gains/pertes) pour Entité, Dynastie ou succession déclarée ; Composition (qui tenait quoi) pour Pays actuel et Civilisation ; dates réelles des Snapshots affichées, fiabilité = la plus faible, éclats sous la précision ignorés ; Turf côté navigateur.
- [Lien Pays actuel → Entités](issues/11-pays-actuel-entites.md): intersection au build (≥ 1 % du pays ou ≥ 10 % de l'Entité) + liste déclarée ajout/retrait ; Entités sans Snapshot liées par leur point (marqueur, « sans frontière connue ») ; index/countries/<ISO>.json avec intervalles de présence ; tous pays NE sélectionnables, France seule avec données.
- [Mouvements sans données](issues/12-mouvements-sans-donnees.md): Routes antiques (Itiner-e + AWMC), batailles Wikidata animées + itinéraire schématique « déduit » ; migrations/commerce = couche vide + contribution ; Route et Itinéraire (sourcé/déduit) ; certitude Itiner-e → Fiabilité, non datés = approximatifs sur la période du jeu.
- [Pipeline d'import et de validation](issues/13-pipeline-import-validation.md): tout en TypeScript/Node + tippecanoe Docker (ADR 0002) ; extraction manuelle commitée, build/validation CI hors réseau ; erreurs bloquantes vs avertissements ; page Sources & licences générée ; fond z0–7 ; Actions PR → rapport, main → Pages.
- [UX de l'éditeur](issues/14-ux-editeur.md): fenêtre centrale, assistant 5 étapes cliquables (Champs, Dates, Géométrie, Source, Envoi) ; saisie de Date avec précision/calendrier/intervalle et refus de l'an 0 ; Source obligatoire ; public = issue pré-remplie + jauge 6 Ko, local = fichier override ; mobile plein écran sans géométrie.
- [Recherche](issues/15-recherche.md): tous types d'objets + dates saisies ; noms fr/en, d'époque et alias Wikidata ; Villes = référencées + liste curée (centaines) ; MiniSearch, index précalculé au build ; exact > préfixe > approché, bonus à la date courante ; action au clic par type.

## Not yet specified

- Rien : tous les tickets sont résolus. Carte complète (2026-11-02) — prochaine étape : rédiger `spec.md` avec `/to-spec` à partir des Decisions so far.

## Out of scope

- Backend Spring Boot / PostGIS : full static suffit ; contrat de données doit rester servable tel quel par une future API.
- Autres pays pilotes (Rome, Chine, Égypte, Anatolie) : effort suivant, pour prouver l'universalité.
- Digitalisation manuelle de frontières et dessin de polygones dans le navigateur.
- UI dans d'autres langues que fr/en (contenus couverts par la traduction IA).
