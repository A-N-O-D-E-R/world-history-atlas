# 04 — Traduction IA en BYOK depuis le navigateur

Researched 2026-11-02. Question: [issue 04](../issues/04-traduction-ia-byok.md).

## Méthode

CORS vérifié **empiriquement** (source primaire = la réponse du serveur) : preflight `OPTIONS` + `POST` réel avec une clé bidon et `Origin: https://a-n-o-d-e-r.github.io`, via curl. Un 401 avec `Access-Control-Allow-Origin` = le navigateur lira l'erreur, donc un appel avec une vraie clé passera. Prix tirés des pages de tarifs officielles.

## 1. CORS / appel direct navigateur

| Fournisseur | Endpoint testé | CORS ? | Particularité |
|---|---|---|---|
| Anthropic | `api.anthropic.com/v1/messages` | Oui, **sous condition** | Sans header `anthropic-dangerous-direct-browser-access: true`, le POST ne renvoie **aucun** `Access-Control-Allow-Origin` → bloqué par le navigateur. Avec le header : `ACAO: *`. Headers : `x-api-key`, `anthropic-version`. |
| OpenAI | `api.openai.com/v1/chat/completions`, `/v1/responses` | Oui | Preflight OK (`ACAO` = origin renvoyée ou `*`), `Authorization: Bearer`. Aucun header spécial. |
| Mistral | `api.mistral.ai/v1/chat/completions` | Oui | `ACAO: *`, `Authorization: Bearer`. |
| Google Gemini | `generativelanguage.googleapis.com/v1beta/models/…:generateContent` | Oui | `ACAO` = origin, header `x-goog-api-key`. |
| OpenRouter | `openrouter.ai/api/v1/chat/completions` | Oui | `ACAO: *`. API compatible OpenAI. **OAuth PKCE** prévu pour apps client : l'utilisateur clique, l'app reçoit une clé liée à son compte et ses crédits ([doc PKCE](https://openrouter.ai/docs/use-cases/oauth-pkce)). |
| DeepL | `api-free.deepl.com` et `api.deepl.com` `/v2/translate` | **Non** | Preflight 204 et POST 403 sans aucun `Access-Control-Allow-Origin` → inutilisable sans proxy. La doc dit : « Do not use it in client-side code » ([auth](https://developers.deepl.com/docs/getting-started/auth)). |

SDK : les SDK officiels Anthropic et OpenAI refusent par défaut de tourner dans un navigateur ; on les y autorise avec `dangerouslyAllowBrowser: true`. Pour Anthropic, cette option ajoute justement le header `anthropic-dangerous-direct-browser-access: true` ([anthropic-sdk-typescript `src/client.ts`](https://github.com/anthropics/anthropic-sdk-typescript/blob/main/src/client.ts), [README](https://github.com/anthropics/anthropic-sdk-typescript#requirements) ; [openai-node README](https://github.com/openai/openai-node#requirements)). Un simple `fetch` suffit, pas besoin du SDK.

## 2. Prix (USD / 1M tokens, entrée / sortie, tarif standard)

| Modèle | Entrée | Sortie | ≈ coût / 1000 mots* | Source |
|---|---|---|---|---|
| Claude Haiku 5.5 (`claude-haiku-5-5`, prompt ≤100k) | 0,10 | 0,50 | **~0,001 $** | [pricing Anthropic](https://platform.claude.com/docs/en/about-claude/pricing) |
| Claude Sonnet 5.5 (`claude-sonnet-5-5`) | 2 | 10 | ~0,023 $ | idem |
| OpenAI gpt-5-nano | 0,05 | 0,40 | ~0,001 $ | [pricing OpenAI](https://developers.openai.com/api/docs/pricing) |
| OpenAI gpt-5-mini | 0,25 | 2,00 | ~0,004 $ | idem |
| Mistral Small 4 (`mistral-small-2603`) | 0,15 | 0,60 | ~0,0014 $ | [pricing Mistral](https://docs.mistral.ai/inference/pricing) |
| Mistral Large 4 (`mistral-large-2610`) | 0,70 | 2,10 | ~0,005 $ | idem |
| Gemini 3.1 Flash-Lite (`gemini-3.1-flash-lite`) | 0,25 | 1,50 | ~0,003 $ | [pricing Gemini](https://aistudio.google.com/docs/pricing) |
| OpenRouter | prix du fournisseur sous-jacent, sans majoration | | idem fournisseur | [FAQ](https://openrouter.ai/docs/faq) : « We charge a small fee when purchasing credits. We never mark-up… » (% non affiché dans la doc) |
| DeepL | facturé au caractère | | — | non vérifié (page tarifs non lisible par mes outils) ; de toute façon exclu (pas de CORS) |

\* Estimation : 1000 mots ≈ 1 500 tokens en entrée (prompt compris) + ~2 000 tokens en sortie (les langues non latines prennent plus de tokens). Ordre de grandeur, pas une mesure.

Gratuit : Gemini a un **free tier** utilisable avec une clé AI Studio, mais ces données sont « Used to improve our products » (le tier payant, non) ([pricing Gemini](https://aistudio.google.com/docs/pricing)). OpenRouter a des modèles gratuits limités à 50 requêtes/jour (1000/jour après 10 $ de crédits) ([FAQ](https://openrouter.ai/docs/faq)). Les pages consultées ne mentionnent pas de free tier API chez Mistral.

Conclusion coût : traduire tout un corpus de, mettons, 200 000 mots avec Haiku 5.5 / gpt-5-nano / Mistral Small coûte **de l'ordre de 0,20–0,30 $** à l'utilisateur.

## 3. Qualité (textes historiques, noms propres)

Aucun fournisseur ne publie de benchmark sur ce cas précis : ce qui suit est **un jugement, pas un fait sourcé**.
- Tous ces LLM traduisent correctement des descriptions factuelles courtes. Le vrai risque, ce sont les **noms propres** : exonyme contre endonyme (Cologne/Köln), translittération (arabe, chinois, japonais), et noms inventés ou « corrigés » à tort.
- Bon complément, vérifié : les **libellés multilingues de Wikidata** sont gratuits, sans clé, avec CORS (`wbgetentities&origin=*` renvoie `ACAO: *`), et ils fournissent les noms consacrés (ex. Q12544 → « Empire byzantin », « 東ローマ帝国 »). Recommandation : prendre les noms dans Wikidata quand un QID existe, et utiliser l'IA uniquement pour les descriptions.
- Prompt : traduire uniquement, ne rien ajouter, garder les dates, renvoyer du JSON avec les mêmes clés, et utiliser le nom d'usage dans la langue cible.

## 4. Sécurité de la clé (localStorage) et bonnes pratiques

- Tout script exécuté sur l'origine (XSS, dépendance npm compromise, extension) peut lire `localStorage`. C'est le risque que nomment les SDK : « risks exposing your secret API credentials to attackers ». OpenAI et DeepL recommandent tous deux de ne jamais mettre de clé côté client. Ici la clé appartient à l'utilisateur et lui seul paie, donc le risque est acceptable s'il est **expliqué**.
- Pratiques :
  1. Par défaut, garder la clé en mémoire ou en `sessionStorage`. Ne passer en `localStorage` que si l'utilisateur coche « se souvenir ». Prévoir un bouton « oublier la clé ».
  2. Mettre une CSP stricte (`<meta http-equiv="Content-Security-Policy">` sur GitHub Pages) avec `connect-src` limité aux endpoints des fournisseurs, et sans script tiers ni CDN non épinglé.
  3. Ne jamais mettre la clé dans l'URL, les logs ou les exports, et ne jamais rendre du HTML venu de la réponse du LLM (texte seulement, sinon XSS par injection de prompt).
  4. Conseiller une clé dédiée avec plafond de dépense : limites de projet chez OpenAI et Anthropic, et OpenRouter PKCE, qui donne une clé liée au compte de l'utilisateur.
  5. Mettre les traductions en cache (IndexedDB) pour ne jamais payer deux fois le même texte.

## Sources

- Tests curl CORS (preflight + POST), 2026-11-02, depuis l'origine `https://a-n-o-d-e-r.github.io`
- https://platform.claude.com/docs/en/about-claude/pricing
- https://github.com/anthropics/anthropic-sdk-typescript (README, src/client.ts)
- https://github.com/openai/openai-node (README)
- https://developers.openai.com/api/docs/pricing
- https://docs.mistral.ai/inference/pricing
- https://aistudio.google.com/docs/pricing
- https://openrouter.ai/docs/faq, https://openrouter.ai/docs/use-cases/oauth-pkce
- https://developers.deepl.com/docs/getting-started/auth
- https://www.wikidata.org/w/api.php (test `wbgetentities`)
