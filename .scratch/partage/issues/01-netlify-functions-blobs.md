# Ce que permettent Netlify Functions et Blobs sur l'offre gratuite

Type: research
Status: resolved
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Sur l'offre gratuite de Netlify, que permettent concrètement Functions et Blobs pour l'API de partage proposée dans `PARTAGE.md` ?

- Ordre d'évaluation entre une fonction à chemin personnalisé (`config.path = "/api/partages/*"`) et la réécriture `/* → /index.html` de `netlify.toml` : la fonction est-elle servie en priorité ?
- Quotas gratuits : invocations, durée d'exécution, bande passante ; stockage, lectures et écritures Blobs. Qu'arrive-t-il au dépassement (coupure ou facturation) ?
- Cohérence des Blobs (forte ou à terme) et ses conséquences pour « créer puis lire », pour l'index `emails/<empreinte>` → liste d'identifiants, et pour les écritures concurrentes.
- Fonctions planifiées (scheduled functions) disponibles sur l'offre gratuite ? Limites ?
- Limitation de débit (rate limiting) : disponible sur l'offre gratuite ? Sinon, quelles alternatives réalistes (compteurs dans Blobs, etc.) ?
- Variables d'environnement secrètes (clé d'API email, secret HMAC) : disponibles et adaptées ?
- Localisation des données Blobs et des fonctions (UE possible ?), et ce que dit le DPA de Netlify.
- Un en-tête `X-Robots-Tag` sur `/@/*` via `netlify.toml` cohabite-t-il avec la réécriture ?

## Answer

- **Routage** : une fonction avec `config.path` passe avant la réécriture `/* → /index.html` (étape Functions avant Redirects, sauf `preferStatic: true`). `/api/partages/*` ne couvre pas `/api/partages`.
- **Quotas** : sur l'offre gratuite à crédits (comptes créés depuis le 4 septembre 2025), il n'y a pas de quota d'invocations. 300 crédits par mois couvrent tout : fonctions à 10 crédits/GB-h, requêtes à 2 crédits/10 k, bande passante à 20 crédits/Go, déploiement en production à 15 crédits. L'offre historique compte 125 k invocations par site et par mois. Les quotas Blobs ne sont documentés nulle part, et Blobs est étiqueté « Beta » à un endroit. Au dépassement, il n'y a jamais de facturation, mais **tout le compte est mis en pause**, site statique compris.
- **Blobs** : cohérence à terme par défaut (mises à jour et suppressions visibles sous 60 s). Les lectures `strong` et les écritures conditionnelles `onlyIfNew` et `onlyIfMatch` sont disponibles. La doc se contredit sur le contrôle de concurrence.
- **Fonctions planifiées** : disponibles sur toutes les offres, avec 30 s au plus par exécution.
- **Limitation de débit** : 2 règles par projet, par IP et par chemin seulement, fenêtre de 180 s au plus. Pas de limite par adresse email : il faudra des compteurs, par exemple dans Blobs.
- **Secrets** : variables d'environnement et Secrets Controller disponibles sur l'offre gratuite, hors `netlify.toml`. Portées non réglables.
- **Localisation** : sur l'offre gratuite, les fonctions tournent aux États-Unis (`cmh`). Les Blobs peuvent aller en `eu-central-1` si chaque appel le précise. Le DPA prévoit des transferts hors UE (DPF, puis SCC à défaut), sans engagement de localisation.
- **`X-Robots-Tag` sur une route réécrite** : non documenté, à tester sur une prévisualisation.

Détails, citations et sources : [../recherches/01-netlify-functions-blobs.md](../recherches/01-netlify-functions-blobs.md).
