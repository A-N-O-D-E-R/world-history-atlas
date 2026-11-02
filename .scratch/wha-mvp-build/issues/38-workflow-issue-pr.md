# 38: Workflow issue → PR

**What to build:** Quand le mainteneur pose un label sur une issue de correction, une PR est créée et validée automatiquement.

**Blocked by:** 37 (Issue pré-remplie)

**Status:** ready-for-agent

- [ ] GitHub Action déclenchée par le label : lecture du bloc JSON, téléchargement de la pièce jointe, écriture dans `data-src/`, création de la PR
- [ ] Validation dans le même job (une PR créée par `GITHUB_TOKEN` ne déclenche pas d'autre workflow)
- [ ] Titre/corps d'issue jamais interpolés dans une commande
- [ ] Réglage « Allow GitHub Actions to create and approve pull requests » documenté
