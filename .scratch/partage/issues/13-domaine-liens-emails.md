# Sur quel domaine pointent les liens envoyés par email

Type: grilling
Status: claimed
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
