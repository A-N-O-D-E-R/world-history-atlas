Type: research
Status: resolved

## Question

Depuis un site 100 % statique hébergé sur GitHub Pages (sans backend), comment un visiteur peut-il proposer une modification de fichiers JSON/GeoJSON du repo sous forme de PR ou d'issue GitHub ? Évaluer : URL d'issue/PR pré-remplie (limites de taille, pièces jointes), GitHub OAuth device flow depuis le navigateur (CORS ?), token personnel fourni par l'utilisateur, redirection vers l'éditeur web GitHub (fork + edit), GitHub Actions déclenchées par issue (issue → PR automatique). Pour chaque option : faisabilité sans serveur, sécurité, friction utilisateur, taille de fichier max.

## Answer

**Issue pré-remplie (issue form) + workflow GitHub Actions `issues` → PR automatique.** C'est la seule voie sans serveur, sans secret côté client et à faible friction (il suffit d'un compte GitHub).

- URL `issues/new?template=…&title=…&body=…` : la limite pratique est d'environ 6 Ko d'URL (sonde : 414 ou erreur au-delà d'environ 7 Ko). Ça suffit pour un patch d'attributs JSON. Pas de pièce jointe via l'URL et pas de `labels` sans droits, donc le label se met dans le template.
- GeoJSON : le visiteur glisse le fichier dans l'issue (25 Mo max). `.geojson` n'est pas un type accepté, il faut renommer en `.json` ou zipper. Les pièces jointes d'un repo public se lisent sans auth.
- Actions : gratuit sur repo public. Il faut activer « Allow GitHub Actions to create and approve pull requests ». La PR créée par `GITHUB_TOKEN` ne déclenche pas d'autre workflow, donc la validation se fait dans le même job. Body et title sont des entrées non fiables : pas de `${{ }}` dans `run:`. Déclencher sur `labeled` (label du mainteneur) pour filtrer le spam.
- Device flow OAuth : **infaisable** dans le navigateur. `github.com/login/device/code` ne renvoie pas d'en-tête CORS et `OPTIONS` répond 404.
- PAT utilisateur : faisable (CORS `*` sur api.github.com), mais un fine-grained ne peut pas contribuer à un repo public tiers. Il faut un PAT classic `public_repo` : mauvaise sécurité, forte friction. Rejeté.
- Éditeur web GitHub (`/edit/<branch>/<path>` → fork + « Propose changes ») : zéro code, 25 MiB par fichier, mais du JSON brut à éditer. Option secondaire pour les contributeurs avancés.

Détails et sources : [research/03-contribution-site-statique.md](../research/03-contribution-site-statique.md)
