# 40: Traduction IA avec la clé de l'utilisateur

**What to build:** Un visiteur traduit les descriptions dans sa langue avec sa propre clé ; chaque traduction est marquée comme automatique.

**Blocked by:** 11 (Extraction Wikidata des Entités)

**Status:** ready-for-agent

- [ ] Réglages : OpenRouter OAuth PKCE ou clé Anthropic / OpenAI / Mistral / Gemini ; clé en sessionStorage, localStorage si « se souvenir »
- [ ] Traduction des descriptions uniquement (noms : libellés Wikidata), noms d'époque jamais traduits
- [ ] Mention « traduction automatique » + original visible ; réponse rendue en texte
- [ ] Cache IndexedDB ; CSP `connect-src` restreinte aux fournisseurs
