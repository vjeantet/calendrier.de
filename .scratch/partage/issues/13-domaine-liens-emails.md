# Sur quel domaine pointent les liens envoyés par email

Type: grilling
Status: resolved
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Le site est servi sur `calendrier.sodadi.fr` (README). L'expéditeur des emails serait sur `calendrier.vjeantet.fr`, dont l'auteur contrôle le DNS. Vers quel domaine pointent le lien public, le lien de gestion et le lien vers la page « Données personnelles » ? Et faut-il changer de domaine principal ?

Options à peser :
- Garder `calendrier.sodadi.fr` pour le site et envoyer depuis `calendrier.vjeantet.fr`. Les liens pointent alors vers un domaine différent de l'expéditeur.
- Ajouter `calendrier.vjeantet.fr` au site Netlify, comme domaine principal ou comme alias redirigé.
- Envoyer depuis un domaine sous `sodadi.fr`, si son DNS est accessible.

Point à ne pas manquer : le calendrier vit dans le stockage local de l'**origine** où l'auteur l'a saisi. Changer le domaine principal, ou rediriger l'un vers l'autre, fait disparaître les annotations existantes de la vue des auteurs. Le lien de gestion ouvert sur une autre origine ne trouve pas non plus la clé locale `partage` (voir [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md)).

Contexte : expéditeur et absence de suivi fixés par [Où héberger l'API et quel service d'email](06-hebergement-api.md). La page « Données personnelles » est liée depuis les emails (voir [Contenu de la page « Données personnelles »](12-page-donnees-personnelles.md)).

## Answer

Faits relevés le 2026-11-11 : `calendrier.sodadi.fr` et `calendrier.vjeantet.fr` étaient servis par **deux sites Netlify distincts** (`calendrier-sodadi` et `calendrier-vjeantet`), tous deux déployés depuis `master` de ce dépôt. Chacun formait une origine à part, avec son propre stockage local, ses propres Blobs et ses propres fonctions.

1. **Un seul domaine : `calendrier.vjeantet.fr`.** Il sert le site, l'expéditeur des emails, le lien public, le lien de gestion et le lien vers la page « Données personnelles ». L'auteur supprime le site `calendrier.sodadi.fr`, ce qui est tenu pour fait : pas de redirection depuis `sodadi`, pas d'outil de déménagement des annotations. Le README est à mettre à jour (il cite encore `calendrier.sodadi.fr`). Le ticket [Où héberger l'API et quel service d'email](06-hebergement-api.md) reste juste : un seul site sur le compte.
2. **Le partage n'existe que sur cette origine.** La clé locale `partage` et les annotations vivent dans le stockage local de l'origine. Le lien de gestion doit donc s'ouvrir sur l'origine où le partage a été créé. Sinon, il tombe sur un navigateur « sans clé » (voir [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md)).
3. **Base des liens fixée par la configuration.** Une variable d'environnement Netlify, `URL_PUBLIQUE` (`https://calendrier.vjeantet.fr`), donne la base des trois liens envoyés par email. Elle n'est jamais déduite de l'en-tête `Host` : une prévisualisation ou l'adresse `*.netlify.app` produirait des liens vers une adresse éphémère ou vers une autre origine.
4. **Garde de l'API** (point jugé important par l'auteur) :
   - sans `URL_PUBLIQUE`, toutes les fonctions répondent **404** ;
   - toute écriture (`POST /api/partages`, `POST /api/liens`, confirmation, publication, arrêt) dont l'en-tête `Origin` diffère de `URL_PUBLIQUE` reçoit un **403**, avant tout compteur et tout envoi. Un site tiers ne peut donc pas faire envoyer d'emails par un simple formulaire `POST`, qui ne passe pas par CORS ;
   - **aucun en-tête CORS** n'est émis ;
   - les prévisualisations de déploiement héritent de `URL_PUBLIQUE`, mais leur `Origin` diffère : elles reçoivent le 403. On teste l'API en local avec `netlify dev`, avec une configuration propre et un envoi d'email simulé.
5. **Bandeau masqué hors de l'origine canonique.** La page connaît l'origine canonique par une constante JS, la même valeur que `URL_PUBLIQUE`. Sur toute autre origine (prévisualisations), le bandeau de partage n'apparaît pas, et aucun message ne le remplace.
6. **Redirection de `calendrier-vjeantet.netlify.app`.** Une règle `[[redirects]]` au niveau du domaine dans `netlify.toml` (`from = "https://calendrier-vjeantet.netlify.app/*"`, `to = "https://calendrier.vjeantet.fr/:splat"`, `status = 301`, `force = true`), placée avant la règle `/*`. Il ne reste alors qu'une origine publique. Les prévisualisations ont une autre adresse et ne sont pas touchées.

Écartés :
- garder `sodadi` comme domaine du site et `vjeantet` pour l'expéditeur : la cible est `vjeantet` ;
- envoyer depuis `sodadi.fr`, alors que l'auteur en contrôle aussi le DNS : `sodadi` disparaît ;
- déduire la base des liens de la requête : voir point 3.

Pas d'ADR : rien ici ne coûte cher à défaire.
