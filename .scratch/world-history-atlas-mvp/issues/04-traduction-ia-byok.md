Type: research
Status: resolved

## Question

Quels fournisseurs d'IA acceptent des appels **directs depuis le navigateur** avec la clé de l'utilisateur (BYOK) : CORS, header requis (ex. Anthropic `anthropic-dangerous-direct-browser-access`), OpenAI, Mistral, Google, DeepL, OpenRouter ? Pour chacun : coût indicatif par 1000 mots, qualité pour des textes historiques et noms propres, risques de sécurité (stockage de clé en localStorage) et bonnes pratiques.

## Answer

BYOK en appel direct depuis le navigateur fonctionne chez Anthropic, OpenAI, Mistral, Google Gemini et OpenRouter (CORS vérifié par curl le 2026-11-02). **DeepL ne fonctionne pas** : il ne renvoie aucun header CORS, il faudrait donc un proxy.
- Anthropic : CORS seulement si on envoie `anthropic-dangerous-direct-browser-access: true`. Les autres n'exigent aucun header spécial.
- OpenRouter : API compatible OpenAI, prix des fournisseurs sans majoration (frais à l'achat de crédits), et **OAuth PKCE** pour obtenir la clé de l'utilisateur en un clic. C'est la meilleure UX BYOK pour un seul code client.
- Coût ≈ 0,001–0,005 $ / 1000 mots avec les petits modèles (Haiku 5.5, gpt-5-nano/mini, Mistral Small 4, Gemini 3.1 Flash-Lite). Sonnet 5.5 coûte ~0,02 $. Gemini a un free tier, mais les données servent à améliorer les produits Google.
- Qualité : ces LLM traduisent bien les descriptions courtes. Le risque, ce sont les noms propres. Pour les noms, prendre les libellés multilingues de Wikidata (gratuit, CORS `*`), et utiliser l'IA uniquement pour les descriptions.
- Sécurité : tout XSS lit `localStorage`. Il faut donc `sessionStorage` par défaut avec un opt-in « se souvenir », une CSP avec `connect-src` limité, la sortie du LLM affichée en texte (jamais en HTML), une clé à plafond de dépense, et un cache des traductions.

Détails et sources : [research/04-traduction-ia-byok.md](../research/04-traduction-ia-byok.md)
