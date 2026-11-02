# 37: Issue pré-remplie

**What to build:** Un visiteur envoie sa correction comme issue GitHub pré-remplie, sans compte développeur ni token.

**Blocked by:** 35 (Éditeur local — attributs)

**Status:** ready-for-agent

- [ ] Issue form `correction` dans le dépôt
- [ ] Mode public : pseudo GitHub, aperçu de l'issue (bloc JSON de surcharge), jauge d'URL ~6 Ko
- [ ] Consigne de glisser le fichier de géométrie renommé `.json` (≤ 25 Mo)
- [ ] Test de bout en bout F : obtenir l'URL d'issue pré-remplie (sans l'ouvrir)
