# Ce que permettent Netlify Functions et Blobs sur l'offre gratuite

Type: research
Status: open
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
