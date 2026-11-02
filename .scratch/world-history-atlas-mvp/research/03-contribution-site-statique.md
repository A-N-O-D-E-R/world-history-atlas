# 03 — Contribution depuis un site statique (GitHub Pages) vers PR/issue

Question : depuis un site 100 % statique sans backend, comment un visiteur propose-t-il une modification JSON/GeoJSON qui devient une PR ou une issue ? Recherche du 2026-11-02, sources primaires (GitHub Docs) + sondes `curl` faites le même jour.

## TL;DR

**Recommandé : issue pré-remplie (issue form) + workflow GitHub Actions `issues` qui transforme l'issue en PR.** C'est la seule option à la fois sans serveur, sans secret côté client et à friction faible (il faut juste un compte GitHub). Le bouton « éditer sur GitHub » (fork + PR automatique) peut s'ajouter en option pour les contributeurs avancés. Le device flow OAuth est **impossible depuis un navigateur** (pas de CORS). Le token personnel fourni par l'utilisateur marche techniquement, mais seulement avec un PAT *classic* `public_repo` : risqué et lourd à demander.

## Faits établis

### URL d'issue pré-remplie
- Paramètres supportés : `title`, `body`, `labels`, `milestone`, `assignees`, `projects`, `template`. Les champs d'un issue form passent aussi en query params. [Creating an issue — from a URL query](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue)
- `labels`, `assignees`, etc. exigent la permission correspondante, donc un visiteur ne peut **pas** poser de label via l'URL. Le label doit venir du template (`labels:` dans le YAML de l'issue form). (même source)
- Une URL trop longue renvoie **414 URI Too Long** (même source). La doc ne donne pas de chiffre. **Sonde (2026-11-02, non connecté)** sur `github.com/octocat/Hello-World/issues/new?body=…` : 6 500 caractères → 302 OK, 7 500 → 500, 8 000 → connexion coupée, ≥ 9 000 → 414. **Limite pratique : environ 6 Ko d'URL encodée.** Le JSON encodé en URL gonfle beaucoup (`"`, `{`, `:` → `%XX`). Ça suffit pour un patch d'attributs, pas pour un GeoJSON.
- Pas de pièce jointe possible via l'URL. Le visiteur doit glisser-déposer le fichier lui-même dans le formulaire de l'issue.

### Pièces jointes d'issue
- Limites : 10 Mo pour les images, **25 Mo pour les autres fichiers**. Types supportés : `.json`, `.jsonc`, `.txt`, `.zip`, `.gz`… **`.geojson` ne figure pas dans la liste** : il faut demander de renommer en `.json` ou de zipper. [Attaching files](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files)
- « For public repositories, uploaded files can be accessed without authentication » : un workflow Actions peut donc télécharger la pièce jointe sans token. (même source)

### GitHub OAuth device flow depuis le navigateur
- Le device flow n'a pas besoin de `client_secret`, mais il faut l'activer dans les réglages de l'app. Endpoints : `POST https://github.com/login/device/code` et `POST https://github.com/login/oauth/access_token`. [Authorizing OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- La doc indique : « CORS pre-flight requests (OPTIONS) are not supported at this time. » (même source)
- **Sonde (2026-11-02)** : `POST /login/device/code` avec `Origin:` → 200, mais **aucun en-tête `Access-Control-Allow-Origin`**. `OPTIONS` → 404. Un navigateur bloque la lecture de la réponse. **Infaisable sans proxy** (un Cloudflare Worker gratuit le permettrait, mais ce serait un backend).
- Le flow web classique exige le `client_secret` : impossible en statique.

### Token personnel fourni par l'utilisateur
- L'API REST accepte le CORS depuis toute origine (`Access-Control-Allow-Origin: *`). [Using CORS](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests). Confirmé par sonde sur `api.github.com`. Fork + commit + PR sont donc faisables en JS pur.
- **Mais** les PAT fine-grained ne savent pas contribuer à un repo public dont l'utilisateur n'est pas membre (« major gaps »). Seul un **PAT classic** avec scope `public_repo`/`repo` peut écrire, et il couvre *tous* les repos publics de l'utilisateur. [Managing personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- L'endpoint contents exige le scope `repo` pour les tokens classic. Lecture complète jusqu'à 1 Mo, au-delà seulement en raw (jusqu'à 100 Mo). [REST contents](https://docs.github.com/en/rest/repos/contents)
- Sécurité : coller un token à large portée dans un site tiers, c'est exactement ce que la doc déconseille (« Treat your access tokens like passwords »). Friction élevée.

### Redirection vers l'éditeur web GitHub (fork + edit)
- Un utilisateur sans droit d'écriture qui clique sur « edit » obtient « Fork this repository », puis « Propose changes », puis une PR. [Editing files](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files)
- Le lien profond `https://github.com/<owner>/<repo>/edit/<branch>/<path>` ouvre directement l'éditeur (pattern d'URL GitHub, la doc ne le décrit pas explicitement). L'upload passe par `/upload/<branch>/<path>`.
- Upload navigateur : 25 MiB par fichier, 100 fichiers max. GitHub bloque au-delà de 100 MiB. [Adding a file](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository), [Large files](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
- Zéro code et zéro secret. Mais le visiteur édite du JSON brut à la main, sans l'UI de l'atlas, ce qui fait beaucoup de friction pour un non-dev.

### GitHub Actions : issue → PR automatique
- `on: issues: types: [opened, edited, labeled]`. Le workflow doit exister sur la branche par défaut et tourne dans son contexte. [Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- Gratuit : « GitHub Actions usage is free for standard GitHub-hosted runners in public repositories ». [Billing](https://docs.github.com/en/actions/concepts/billing-and-usage)
- Il faut activer **« Allow GitHub Actions to create and approve pull requests »** (désactivé par défaut sur un repo perso). [Actions settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)
- Piège : « events triggered by the `GITHUB_TOKEN` will not create a new workflow run » (sauf `workflow_dispatch`/`repository_dispatch`). La PR créée par le bot **ne déclenche pas** la CI `pull_request`. Il faut donc valider dans le même workflow, ou relancer à la main. [Triggering a workflow](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- Sécurité : `github.event.issue.title/body` sont des entrées non fiables. Ne jamais les interpoler `${{ }}` dans un `run:`, passer par des variables d'environnement. [Script injections](https://docs.github.com/en/actions/concepts/security/script-injections)
- Anti-spam : déclencher sur `labeled` avec un label posé par le mainteneur (seul quelqu'un ayant le droit triage peut labelliser). Le mainteneur garde ainsi la main avant toute PR.

## Comparatif

| Option | Sans serveur | Sécurité | Friction visiteur | Taille max |
|---|---|---|---|---|
| URL d'issue pré-remplie (body seul) | Oui | Bonne (aucun secret) | Faible (compte GitHub, 1 clic) | ~6 Ko d'URL (sonde) |
| + pièce jointe glissée dans l'issue | Oui | Bonne | Moyenne (télécharger le fichier depuis l'atlas puis le déposer ; renommer `.geojson` → `.json`) | 25 Mo |
| OAuth device flow navigateur | **Non** (pas de CORS sur `github.com/login/*`) | — | — | — |
| PAT saisi par l'utilisateur | Oui | **Mauvaise** (PAT classic `public_repo` obligatoire) | Élevée | Contents API ~100 Mo (blob API au-delà de 1 Mo conseillée) |
| Éditeur web GitHub (edit/upload → fork + PR) | Oui | Bonne | Élevée pour non-dev (JSON brut) | 25 MiB par fichier |
| Actions issue → PR | Oui (gratuit, repo public) | Bonne si entrées assainies et déclenchement par label | Nulle de plus (côté mainteneur) | Celle de l'issue : 25 Mo de pièce jointe |

## Recommandation

1. L'atlas génère le diff (patch JSON d'attributs) ou le fichier GeoJSON côté client.
2. Petit patch : ouvrir `issues/new?template=correction.yml&title=…&body=…`, avec le patch dans le body si < ~6 Ko.
3. Gros fichier : l'atlas déclenche le téléchargement de `xxx.json` et ouvre l'issue form, qui demande de glisser le fichier.
4. Le workflow `issues: labeled` (label `accepted` posé par le mainteneur) parse le body, télécharge la pièce jointe, valide (schéma, taille), commit sur une branche et ouvre la PR avec `GITHUB_TOKEN`. La validation tourne dans ce même job, puisque la PR du bot ne relance pas la CI.
5. En option, un lien « éditer sur GitHub » vers `/edit/main/<path>` pour les contributeurs à l'aise.

## Non vérifié / à confirmer en implémentation
- Seuil exact du 414 : mesuré en anonyme, le seuil connecté peut différer légèrement. Garder une marge sous 6 Ko.
- Taille max du body d'une issue : non documentée. La valeur couramment rapportée est 65 536 caractères, non vérifiée ici.
- Liens profonds `/edit/` et `/upload/` : pattern d'URL stable mais pas spécifié dans la doc.
