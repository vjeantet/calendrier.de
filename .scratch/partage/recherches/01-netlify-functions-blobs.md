# Netlify Functions et Blobs sur l'offre gratuite : ce que permet la doc

Recherche pour le ticket [01 — Ce que permettent Netlify Functions et Blobs sur l'offre gratuite](../issues/01-netlify-functions-blobs.md).

Toutes les sources ont été consultées le **2026-11-10**. Les pages de docs.netlify.com ont été lues dans leur version Markdown (URL + `.md`), qui est la même page que la version HTML. Les citations sont reprises telles quelles, en anglais.

Versions des paquets examinés : `@netlify/blobs` 11.1.9 (publié le 2026-11-09), `@netlify/functions` 6.1.1 (registre npm).

## 0. De quelle offre gratuite s'agit-il ?

Netlify a aujourd'hui deux familles d'offres, et l'offre gratuite n'est pas la même dans les deux :

- **Offre gratuite « à crédits » (Free, credit-based)** : c'est celle de tous les comptes créés depuis le 4 septembre 2025. Elle donne **300 crédits par mois**, avec une limite stricte (« hard limit ») et sans achat de crédits possible. Source : [Credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/) : « Starting on September 4, 2025, all new Netlify accounts will use the new credit-based pricing plans. » et « 300 credits/month with credit hard limit ». La [page de tarifs](https://www.netlify.com/pricing/) affiche « Free $0 forever », « 300 credit limit / month ».
- **Offre gratuite « historique » (Legacy Free / Starter)** : c'est celle des comptes créés avant le 4 septembre 2025 qui ne sont pas passés aux crédits. Source : [Legacy pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-legacy-plans/legacy-pricing-plans/) : « If you've created your Netlify account with a Free, Starter, or Pro plan before September 4, 2025, then your pricing plan is now considered a legacy pricing plan. » Le passage aux crédits est irréversible (« Switching to Credit-based plans is irreversible », page Credit-based pricing plans).

**Non établi ici** : l'offre du compte qui héberge calendrier.de. La doc indique où le voir : « Usage & billing > Billing details », rubrique **Plan** ([Legacy pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-legacy-plans/legacy-pricing-plans/)). La suite décrit d'abord l'offre à crédits, puis l'offre historique quand elle diffère.

## 1. Ordre d'évaluation : fonction à chemin personnalisé ou réécriture `/* → /index.html` ?

**La fonction est servie en priorité.**

- La page [Request chain](https://docs.netlify.com/resources/troubleshooting/request-chain/) décrit l'ordre de traitement d'une requête. Les étapes sont, dans l'ordre : Firewall Traffic Rules, WAF, **Rate Limiting**, Password Protection, Edge Functions, Edge Cache, Edge Functions (après cache), Durable Cache, Image CDN, **Serverless Functions**, **Redirects**, Static files, Server, 404. Les fonctions passent donc avant les règles de redirection et de réécriture.
- À l'étape des fonctions : « If the request matches, there's one last check we'll do before invoking the function. [...] To opt-in to this behavior, you must set `preferStatic: true` in your function configuration. Unless you enable this configuration, any matching function is always invoked. » (même page).
- La même page oppose le serveur aux fonctions, et l'exemple choisi est justement la règle du site : « Unlike serverless functions, your server doesn't take precedence over redirects. A rewrite rule that matches the request applies first, even when it isn't forced, so a catch-all rule such as `/* /index.html 200` sends requests to its destination instead of your server. »
- [Configuration for functions — Routing](https://docs.netlify.com/build/functions/configuration/) : « By default, a function runs for any request to its configured paths regardless of whether static files exist there. » ; « When you set a custom `path`, the function is only available at that path — not at the default `/.netlify/functions/<name>` URL. » ; « `path` supports the web platform `URLPattern` syntax for wildcards and named groups. Named groups are exposed to the function on `context.params`. » Le chemin peut être un tableau (`path: ["/sale/*", "/item/:sku"]`) et `excludedPath` permet des exceptions.
- La réécriture actuelle de `netlify.toml` n'a pas `force` : selon [Rewrites and proxies — Shadowing](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/), elle ne masque pas les fichiers existants. Elle ne s'applique qu'après l'étape des fonctions.

**Point de syntaxe, pas propre à Netlify** : avec `URLPattern`, `"/api/partages/*"` reconnaît `/api/partages/` et `/api/partages/<id>`, mais pas `/api/partages` sans barre finale (le `*` vient après le `/`). Voir [URL Pattern API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API). Il faut donc déclarer `POST /api/partages` comme un chemin à part, par exemple dans un tableau `path`. Le paramètre `method` limite les méthodes HTTP acceptées ([Configuration for functions](https://docs.netlify.com/build/functions/configuration/)).

**Ce que la doc ne dit pas** : rien, pour ce point. Le comportement est documenté explicitement. Un essai sur un déploiement de prévisualisation reste la vérification la plus sûre.

## 2. Quotas gratuits et dépassement

### 2.1 Offre à crédits (Free, 300 crédits/mois)

Barème ([Credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/), [How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/), [page de tarifs](https://www.netlify.com/pricing/)) :

| Poste | Coût | Ce qui est compté |
|---|---|---|
| Functions compute | 10 crédits par GB-heure | « Serverless functions, scheduled functions, background functions » |
| Web requests | 2 crédits pour 10 000 requêtes | « Page views [...] API calls - Requests to your serverless functions [...] Asset requests » |
| Web bandwidth | 20 crédits par GB | « Assets and web content served, Image CDN usage, file downloads, function responses » (page de tarifs) |
| Production deploys | 15 crédits par déploiement | « Publishing your web project live to your production branch » |
| Form submissions | gratuit | — |

- **Invocations** : il n'y a pas de quota d'invocations dans l'offre à crédits. Les fonctions sont facturées au temps × mémoire : « We use this metric on our credit plans, instead of charging per invocation » ([How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)). La mémoire par défaut est de 1 024 Mo et ne se change que sur Pro et Enterprise : « If the total runtime of all function invocations across your team is two hours, you will be billed for two GB-Hour units. » ([Functions usage and billing](https://docs.netlify.com/build/functions/usage-and-billing/)). Le [FAQ](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/) précise : « Function usage will consume credits based on compute costs (GB-hours) [...]. There is no longer a free tier. » Cela veut dire qu'il n'y a plus de franchise propre aux fonctions : tout se paie sur les 300 crédits.
- **Durée d'exécution** ([Configuration for functions — Default values](https://docs.netlify.com/build/functions/configuration/)) : 60 s pour une fonction synchrone, 30 s pour une fonction planifiée, 15 min en arrière-plan. Charge utile de 6 Mo en mode tamponné (« buffered »). Ces valeurs ne sont pas configurables.
- **Ordre de grandeur (calcul personnel, pas une donnée Netlify)** : avec 1 Go et une durée hypothétique de 200 ms par appel, 1 GB-heure correspond à 18 000 appels, soit 10 crédits. Il faut y ajouter 2 crédits par tranche de 10 000 requêtes. **La doc ne dit pas** comment la durée est arrondie par invocation (au ms, à la tranche de 100 ms, etc.). La durée réelle dépendra des appels à Blobs et au service d'email, que la fonction attend.
- **Déploiements** : chaque déploiement en production coûte 15 crédits. 20 déploiements dans un mois consomment donc à eux seuls les 300 crédits. Ce poste existe déjà aujourd'hui, avec ou sans partage.
- **Blobs (stockage, lectures, écritures)** : **la doc des offres à crédits ne cite Blobs parmi aucun poste facturé**. Le tableau « Storage features » de [Credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/) coche « Netlify Blobs (Beta) » pour Free, Personal et Pro, sans limite chiffrée. La [page de tarifs](https://www.netlify.com/pricing/) liste « Store files & images with Blob storage » dans l'offre Free. **Ce qui n'est documenté nulle part** : un quota de stockage, un nombre maximal d'opérations, ou la façon dont un appel Blobs fait depuis une fonction serait compté (il n'est pas dit qu'il compte comme « web request »). Les seules limites documentées sont techniques ([Netlify Blobs — Requirements and limitations](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)) : nom de store ≤ 64 octets, sans `/` ni `:` ; clé ≤ 600 octets, ne commençant pas par `/` ; objet ≤ 5 Go ; métadonnées ≤ 2 Ko.

**Dépassement : coupure, jamais de facturation.**

- « Once your credit balance is completely used up, all of your web projects (sites/apps) are paused and visitors to your web projects will find a `Site not available` page at each of your web project's URLs. » ([How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/))
- « If you're on the free plan, your project has a fixed amount of credits and you can either wait till the start of your next billing cycle or upgrade to a paid plan. » et « Please note that if one site/web project exceeds its limits, all sites/projects on your account will be paused. » ([FAQ](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/))
- « The free plan is always free, with hard monthly limits that cannot be exceeded or incur any costs. » ([page de tarifs](https://www.netlify.com/pricing/), FAQ)
- Alertes par email et dans l'interface à 50 %, 75 %, 90 % et 100 % (FAQ). La page de tarifs dit 50 %, 75 % et 100 %.
- Contractuellement, le [Self-Serve Subscription Agreement](https://www.netlify.com/pdf/self-serve-subscription-agreement.pdf) (mis à jour le 4 novembre 2026) dit en §4.1 : « Customer will not be charged for use on the Free Usage Tier, and Netlify may pause the affected Services if that use exceeds the capacity included in the Free Usage Tier. » Le §5.1 ajoute : Netlify « may change its features, limits, or availability, or discontinue it, at any time » et « may suspend, disable, or remove any site or application on the Free Usage Tier at any time, with or without notice ».

Conséquence directe : la coupure ne touche pas seulement l'API. Elle met **tout le site** en pause (le calendrier lui-même), et tous les autres sites du compte.

### 2.2 Offre gratuite historique (Legacy Free)

[Legacy pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-legacy-plans/legacy-pricing-plans/) (colonne « Free & Starter Legacy plans ») :

- Serverless Functions : « 125k invocations per site/month ». Selon [Functions usage and billing](https://docs.netlify.com/build/functions/usage-and-billing/), « Functions are billed by request count, regardless of runtime. »
- Bandwidth : « 100 GB/month (If Free plan, hard limit) ».
- Background functions : « N/A ». Elles ne servent pas à la proposition.
- **Blobs** : aucune ligne dans le tableau historique. Mêmes trous de documentation que pour l'offre à crédits.

Dépassement ([Billing FAQ for legacy plans — Free tier limits](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-legacy-plans/billing-faq-for-legacy-plans/)) : « when reaching 100% of the limit, new builds will be disabled and **all sites on your account** will be paused. You will need to add a payment method and upgrade to a paid plan to restore the account and your sites. » Différence notable avec l'offre à crédits : **la doc historique ne prévoit pas de reprise automatique au mois suivant**. Elle exige un passage à une offre payante.

## 3. Cohérence des Blobs

**Par défaut, la cohérence est « à terme » (eventual). La cohérence forte (strong) s'active par store ou par lecture.**

[Netlify Blobs — Consistency](https://docs.netlify.com/build/data-and-storage/netlify-blobs/) :

> By default, the Netlify Blobs API uses an eventual consistency model, where data is stored in a single region and cached at the edge for fast access across the globe. When a blob is added, it becomes globally available immediately. Updates and deletions are guaranteed to be propagated to all edge locations within 60 seconds.

> You can configure this behavior and opt-in to strong consistency [...], either for an entire store or for individual read operations.

Exemples de la doc : `getStore({ name, consistency: "strong" })` ou `store.get(key, { consistency: "strong" })`. Le prix annoncé de la cohérence forte est « slower reads ».

D'autres extraits utiles de la même page :

- « Netlify Blobs is a highly-available data store optimized for frequent reads and infrequent writes. »
- « If multiple write calls to the same key are issued, the last write wins. »
- Écritures conditionnelles sur `set` et `setJSON` : `onlyIfNew` (« the write will only succeed if the entry does not exist ») et `onlyIfMatch` (« the write will only succeed if the entry exists and has an ETag matching this value »). Le résultat contient `modified` (booléen) et `etag`. La doc les présente ainsi : « how you can use the `onlyIfMatch` and `onlyIfNew` properties to do atomic, conditional writes ».
- **Contradiction dans la doc** : la section Troubleshooting de la même page dit encore « Last write wins. [...] Netlify Blobs does not include a concurrency control mechanism. To manage the potential for race conditions, you can build an object-locking mechanism into your application. » L'introduction renvoie aussi les besoins de « concurrency control » vers des bases de données tierces. La section `set`, plus précise et plus récente en apparence, documente pourtant des écritures conditionnelles atomiques. **La doc ne dit pas** si ces écritures conditionnelles sont linéarisables quand deux fonctions écrivent en même temps. Le mot « atomic » le laisse entendre, sans garantie détaillée.
- Dans le code de `@netlify/blobs` 11.1.9 (`dist/chunk-SQCJ2S3G.js`, `Client.getFinalRequest`), une lecture `strong` part vers une URL « uncachedEdgeURL » et une lecture `eventual` vers l'URL mise en cache (`edgeURL`). Le README du paquet décrit l'accès par l'API comme « a strong-consistency way of accessing data [...] (since requests will always go to a non-distributed origin) ».
- `list()` n'accepte pas d'option `consistency` par opération : son type `ListOptions` ne l'a pas (`dist/main.d.ts`), seul le store en a une. **La doc ne dit pas** si `list()` est à cohérence forte ou à terme.

Conséquences pour les cas cités dans la question, d'après les seuls extraits ci-dessus :

- **Créer puis lire** : une **création** est « globally available immediately », même en cohérence à terme. **Non documenté** : un `get` qui a renvoyé `null` juste *avant* la création (par exemple en vérifiant une collision d'identifiant) peut-il être mis en cache et masquer l'objet pendant un temps ?
- **Mises à jour et suppressions** : en cohérence à terme, elles peuvent mettre jusqu'à 60 s à être vues. Cela touche le passage *en attente → actif*, la publication des modifications et l'arrêt du partage (un lecteur peut encore voir l'instantané jusqu'à 60 s après la suppression). Les lectures `strong` suppriment ce délai.
- **Index `emails/<empreinte>` → liste d'identifiants** : c'est un objet unique réécrit à chaque ajout ou retrait. Sans précaution, deux écritures concurrentes en perdent une (« last write wins »). Le mécanisme documenté consiste à lire en `strong` pour obtenir l'`etag`, puis à écrire avec `onlyIfMatch: etag` et à recommencer si `modified === false`. Autre forme possible : une clé par couple, comme `emails/<empreinte>/<id>`, lue avec `list({ prefix })`. Les clés peuvent contenir `/`, mais pas les noms de store. Pour cette forme, la cohérence de `list()` n'est pas documentée.
- **Tirage d'identifiant sans collision** : `set(id, ..., { onlyIfNew: true })` puis un nouveau tirage si `modified === false`. C'est exactement le cas d'usage de l'exemple de la doc (« only if key is new »).
- **`consulteLe` mis à jour à chaque lecture publique** : cela fait une écriture par consultation, sur un stockage décrit comme « optimized for frequent reads and infrequent writes ».

Autres faits utiles de la même page :

- Les stores créés avec `getStore` sont partagés entre tous les déploiements : « a branch deploy deleting blobs that your published deploy depends on » est un risque cité. Les stores `getDeployStore` sont supprimés avec les déploiements.
- « You cannot read production data during local development. »
- Chiffrement : « we encrypt your blobs at rest and in transit ».
- Statut : Blobs est marqué **« (Beta) »** dans le tableau des offres à crédits ([Credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)), mais pas sur la page Blobs elle-même. Le [Self-Serve Subscription Agreement](https://www.netlify.com/pdf/self-serve-subscription-agreement.pdf) dit des « Beta Services » que Netlify peut « discontinue Beta Services at any time (including Customer Content stored as part of the Beta Services) ». **Ambigu** : la doc ne dit pas clairement si Blobs relève aujourd'hui de cette clause.

## 4. Fonctions planifiées

**Disponibles sur toutes les offres.** [Scheduled Functions](https://docs.netlify.com/build/functions/scheduled-functions/) dit en en-tête : « This feature is available on all pricing plans. »

- Syntaxe cron, en UTC, avec les extensions `@hourly`, `@daily`, `@weekly`, `@monthly` et `@yearly` (« except for the `@reboot` and `@annually` »). La planification se déclare dans `config.schedule` ou dans `netlify.toml` (`[functions."nom"] schedule = "@daily"`).
- Limites : « Scheduled functions have a 30 second execution limit » ; « only run on their schedule for published deploys » ; « You can't invoke scheduled functions directly with a URL ». On peut les lancer à la main par le bouton « Run now » de l'interface.
- Coût : elles entrent dans « Functions compute » (10 crédits par GB-heure), comme les autres fonctions ([How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)). **Non documenté** pour l'offre historique : une exécution planifiée compte-t-elle comme une invocation dans le quota de 125 k ?
- Pour une purge : `list()` ne renvoie que `key` et `etag` par objet ([Netlify Blobs — list](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)). Lire des dates comme `consulteLe` demande un `getMetadata` ou un `get` par objet, le tout dans la limite de 30 s.

## 5. Limitation de débit

**Disponible sur l'offre gratuite, sous une forme réduite.**

[Rate limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/) :

- « Basic functionality is available on all plans. » Les règles « en code » sont ouvertes à toutes les offres. Les règles « dans l'interface » sont réservées à « Enterprise with HP Edge ».
- Section Availability : **2 règles par projet** pour « Free (Credit-Based or Legacy) / Starter / Personal », 5 pour Pro et Enterprise, 100 pour Enterprise HP Edge.
- Agrégation : seul le mode « **Per domain and IP address** » est ouvert à tous. Le mode « Per domain », qui fixe un plafond global pour tous les visiteurs, est réservé à Enterprise HP Edge. La doc précise que le mode par IP « does not enforce an absolute limit across _all_ visitors ».
- Ciblage : « By path only ». Pas de ciblage par en-tête, par cookie ni par corps de requête. **Impossible donc de limiter par adresse email** avec cette fonctionnalité.
- Fenêtre : `windowSize` vaut 60 s par défaut, avec un maximum de 180 s (« in seconds. Maximum is 180. », commentaire de l'exemple de code). Une limite « N emails par jour » n'est donc pas exprimable.
- Mise en œuvre : `config.rateLimit = { windowLimit, windowSize, aggregateBy: ["ip", "domain"] }` dans la fonction. La règle exige un `path` et ne peut pas être déclarée dans `netlify.toml` pour une fonction. Elle peut l'être pour une règle `[[redirects]]` (`[redirects.rate_limit]`). Action possible : 429 ou réécriture vers une page.
- Délai : « it can take up to 10 seconds before Netlify starts blocking or rewriting that client's requests ».
- La limitation intervient avant les fonctions dans la chaîne de traitement ([Request chain](https://docs.netlify.com/resources/troubleshooting/request-chain/)). **Non documenté** : une requête bloquée (429) compte-t-elle comme « web request » dans les crédits ?

Alternatives réalistes, d'après les primitives documentées :

- **Compteurs dans Blobs**, avec par exemple une clé par adresse (empreinte) ou par IP et par jour. L'incrément sans perte se fait par lecture `strong` puis écriture `onlyIfMatch` (voir §3). La fonction obtient l'IP du client par `context.ip` (« A string containing the client IP address », [Functions API — Context](https://docs.netlify.com/build/functions/api/)). La purge des vieux compteurs reviendrait à une fonction planifiée. La doc ne propose pas d'expiration automatique : « you can create custom expiration logic ».
- **Combiner** une règle `rateLimit` par IP sur les chemins d'envoi d'email (`POST /api/partages`, `POST /api/liens`) et un compteur par empreinte d'adresse dans Blobs. Le plafond est de 2 règles sur l'offre gratuite.
- Les limites propres au service d'email relèvent du ticket 02 et ne sont pas étudiées ici.

## 6. Variables d'environnement secrètes

**Disponibles sur l'offre gratuite et lisibles par les fonctions.**

- [Environment variables and serverless functions](https://docs.netlify.com/build/functions/environment-variables/) : elles servent à « Securely provide sensitive values for your serverless functions, such as API keys and tokens ». On les lit par `process.env.NOM`. Attention : « environment variables declared in a Netlify configuration file (`netlify.toml`) are not available to serverless functions ». Il faut donc les déclarer dans l'interface, la CLI ou l'API.
- **Portées (scopes)** : réservées à Pro et Enterprise (« This feature is available on Pro and Enterprise plans », [Environment variables overview — Scopes](https://docs.netlify.com/build/environment-variables/overview/)). Sur l'offre gratuite, une variable s'applique à toutes les portées (« By default, environment variables apply to all scopes »), c'est-à-dire Builds, Functions, Runtime et Post processing.
- **Valeurs propres à un contexte** (Production, Deploy Previews, Branch deploys, Local development) : la section [Value per deploy context](https://docs.netlify.com/build/environment-variables/overview/) ne porte aucune mention d'offre.
- **Secrets Controller** : la [page de tarifs](https://www.netlify.com/pricing/) coche « Secrets controller » dans les quatre colonnes, Free compris. [Secrets Controller](https://docs.netlify.com/build/environment-variables/secrets-controller/) : « Secret values are write-only » ; « Only code running on Netlify's systems can read the original, unmasked values » ; « Environment variable secrets cannot have the `post processing` scope ». Seule la détection automatique de secrets (« smart detection ») demande Personal ou plus.
- **Ambigu** : la politique des secrets exige que « Secret values must be set to explicit deploy contexts and scopes ». La doc ne dit pas comment cette règle s'applique sur l'offre gratuite, où les portées ne sont pas réglables. Ce comportement est à vérifier dans l'interface.
- Limites : clé ≤ 255 caractères, valeur ≤ 5 000 caractères. La limite AWS de 4 Ko au total ne vaut qu'en « Lambda compatibility mode » ([Environment variables and serverless functions](https://docs.netlify.com/build/functions/environment-variables/)).

Une clé d'API d'email et un secret HMAC tiennent largement dans ces limites. **Non vérifié ici** : quand un changement de valeur atteint les fonctions déjà déployées (immédiatement ou au déploiement suivant). Les pages lues ne le disent pas.

## 7. Localisation des données et DPA

### Fonctions

- Région par défaut : `cmh`, US East (Ohio) ([Configuration for functions — Default values](https://docs.netlify.com/build/functions/configuration/)). Pour les sites plus anciens : « Sites created before October 4, 2023 may have a different default region. Check your current configuration in **Cloud compute > Functions > Region**. »
- **Changer de région demande Pro ou Enterprise** : « This feature is available on all Pro and Enterprise plans » (section Region de la même page). La [page de tarifs](https://www.netlify.com/pricing/) ne coche « Custom deployment options for functions (Increase execution limits, increase memory, or set a custom AWS region) » que pour Pro et Enterprise.
- Régions UE existantes, inaccessibles sur l'offre gratuite : `dub` (Irlande), `fra` (Francfort), `lhr` (Londres). `cdg` (Paris) et `mxp` (Milan) passent par le support.
- **Sur l'offre gratuite, les fonctions s'exécutent donc aux États-Unis** (Ohio pour un site créé après le 4 octobre 2023). L'adresse email en clair, reçue dans la requête et transmise au service d'email, y transite.

### Blobs

- Régions possibles ([Netlify Blobs — Regions](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)) : `ap-southeast-1`, `ap-southeast-2`, **`eu-central-1` (EU, Francfort)**, `us-east-1`, `us-east-2`. La même liste est codée en dur dans `@netlify/blobs` 11.1.9 (`dist/chunk-SQCJ2S3G.js`, `regions`).
- « **Site-wide stores** default to `us-east-2`, regardless of your functions region. » Pour garder les données dans l'UE : « you must pass `region` explicitly on **every** `getStore` call for that store, including reads, writes and deletes. A call that omits it will use `us-east-2` instead and will not see data held elsewhere. » Il faut donc la forme objet : `getStore({ name, region: "eu-central-1" })`.
- **La doc Blobs n'indique aucune restriction d'offre** pour l'option `region`, contrairement à la région des fonctions. **Non vérifié** : qu'elle fonctionne réellement sur l'offre gratuite.
- **Ambigu** : la description de la cohérence à terme dit « data is stored in a single region and cached at the edge for fast access across the globe ». Le stockage peut donc être à Francfort tandis que des copies en cache existent sur des points de présence hors UE. La doc ne détaille pas ce cache. Les lectures `strong` contournent ce cache, d'après le code du client (§3).
- « Changing a region does not move data » : changer de région ne déplace pas les données existantes.

### DPA et sous-traitants

- Le [DPA de Netlify](https://www.netlify.com/pdf/netlify-dpa.pdf) (« Last Updated: June 9, 2026 ») « forms part of the Enterprise Master Subscription Agreement and the Self-Serve Subscription Agreement ». Le [Self-Serve Subscription Agreement](https://www.netlify.com/pdf/self-serve-subscription-agreement.pdf) couvre aussi le « Free Usage Tier ». Son §6.5 dit : « The DPA applies to personal data that Netlify processes on Customer's behalf, including personal data in Customer Content, and is incorporated into this Agreement. » Le DPA s'applique donc a priori aussi aux comptes gratuits. Le §8.2 (garantie limitée) « does not apply to the Free Usage Tier or Beta Services ».
- Transferts hors UE, DPA §14.1 : « the parties anticipate that Netlify (and its Sub-processors) may Process outside of the European Economic Area [...] certain Customer Data ». Base : le Data Privacy Framework UE–États-Unis (« Netlify has certified to participate in and comply with the EU-U.S. DPF », §14.2), avec repli sur les clauses contractuelles types (SCC) si le DPF tombe (§14.2–14.3).
- **Le DPA ne contient aucun engagement sur la localisation des données** : aucune mention de région ni de stockage dans l'UE.
- Sous-traitants, DPA §6.2 : la liste est publiée sur https://www.netlify.com/legal/subprocessors/, qui redirige vers le [Trust Center](https://www.netlify.com/trust-center/?itemUid=e3fae2ca-94a9-416b-b577-5c90e382df57). Les 26 sous-traitants listés ont tous « US » comme localisation (NS1 : « Global, US »), y compris Amazon Web Services (« Hosting, compute, storage, backup ») et les outils de journalisation et de suivi (Axiom, Datadog, Crowdstrike/Humio). **Ambigu** : la liste indique « US » pour AWS alors que la doc Blobs propose `eu-central-1`. Le Trust Center ne précise pas s'il donne le siège du sous-traitant ou le lieu de traitement.
- Autres clauses du DPA : notification d'une violation de données « without undue delay, but in any event within forty-eight (48) hours » (§10.1) ; suppression des données à la fin du contrat (§12.1) ; préavis de 30 jours avant un nouveau sous-traitant, avec droit d'objection (§6.2–6.3) ; droit irlandais (§15.1).

## 8. En-tête `X-Robots-Tag` sur `/@/*` et réécriture

**Non tranché par la doc. À tester.**

- [Custom headers](https://docs.netlify.com/manage/routing/headers/) : la règle `[[headers]] for = "/@/*"` est valide, car « Paths can contain wildcards and placeholders ». Les en-têtes personnalisés « apply only to files Netlify serves from our own backing store ». Ils ne s'appliquent ni au contenu servi par proxy ni aux réponses de fonctions ou d'edge functions : « the function should return any required headers instead ».
- `/@/<id>` est une réécriture vers `/index.html`, un fichier du « backing store ». **La doc ne dit pas** si `for` est comparé au chemin demandé (`/@/girafe-…`) ou au chemin réécrit (`/index.html`). Sur le forum communautaire, un utilisateur a conclu que c'est le chemin réécrit qui compte ([fil du 2 septembre 2022](https://answers.netlify.com/t/setting-custom-headers-on-domain-alias-doesnt-seem-to-work/74702)). Ce n'est pas une source primaire, aucun membre identifié de Netlify ne répond, et le problème réel de ce fil était une faute de frappe.
- Les deux issues possibles ont des conséquences différentes. Si `for` porte sur le chemin demandé, `for = "/@/*"` suffit. Si `for` porte sur le chemin réécrit, la règle `/@/*` ne s'appliquera pas, et une règle sur `/index.html` mettrait `noindex` sur **tout** le site.
- Vérification directe : `curl -I https://<prévisualisation>/@/essai` sur un déploiement de prévisualisation (gratuit selon [Credit-based pricing plans — Non-metered functionality](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)).
- Les réponses de l'API (`/api/partages/*`) sont produites par la fonction. Les règles `[[headers]]` ne s'y appliquent pas. La fonction pose elle-même ses en-têtes.

## Conséquences pour la conception

Constats tirés des faits ci-dessus, sans choix à la place de l'humain :

- **Routage** : `config.path` sur `/api/...` passe avant la réécriture `/* → /index.html`, sans `force` ni changement de `netlify.toml`. `/api/partages` et `/api/partages/*` sont deux motifs distincts.
- **Budget** : l'offre gratuite ne facture jamais. En cas d'épuisement, **tout le compte** est mis en pause, calendrier statique compris : jusqu'au mois suivant avec l'offre à crédits, jusqu'au passage à une offre payante avec l'offre historique selon sa doc. Il faut savoir sur quelle offre est le compte. Sur l'offre à crédits, les fonctions, les requêtes et les déploiements (15 crédits chacun) puisent dans les mêmes 300 crédits. Les quotas Blobs ne sont pas documentés, et Blobs est étiqueté « Beta » à un endroit.
- **Cohérence** : avec les lectures par défaut, une mise à jour ou une suppression peut rester invisible jusqu'à 60 s. Les lectures `strong` et les écritures conditionnelles (`onlyIfNew`, `onlyIfMatch`) sont les outils documentés pour l'index par email, les compteurs et le tirage d'identifiant. La doc se contredit sur la « concurrency control ».
- **Limitation des envois** : l'outil intégré limite par IP et par chemin, avec 2 règles au plus, une fenêtre de 180 s au plus et jusqu'à 10 s de retard. Il ne limite ni par adresse email ni par jour. Ces limites-là demandent des compteurs applicatifs, par exemple dans Blobs.
- **Fonction planifiée** : la purge (48 h, 12 mois) est possible sur l'offre gratuite, dans la limite de 30 s par exécution.
- **Secrets** : les variables d'environnement et Secrets Controller sont disponibles sur l'offre gratuite. Elles se déclarent hors de `netlify.toml`. Les portées ne sont pas réglables sur l'offre gratuite.
- **RGPD** : sur l'offre gratuite, les fonctions tournent aux États-Unis, sans moyen de les déplacer. Les Blobs peuvent être stockés à Francfort si chaque appel le précise, mais le cache de la cohérence à terme est mondial. Le DPA s'applique, prévoit des transferts hors UE (DPF, puis SCC à défaut) et ne prend aucun engagement de localisation. Sa liste de sous-traitants est entièrement « US ». La page « Données personnelles » devra le refléter.
- **`X-Robots-Tag`** : le comportement d'une règle `[[headers]]` sur un chemin réécrit est à mesurer sur une prévisualisation avant de compter dessus.
