# Que devient une réponse aux emails

Type: grilling
Status: claimed
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Que devient un email qu'un destinataire envoie en réponse à l'un des trois emails ? L'expéditeur est `Calendrier semestriel <partage@calendrier.vjeantet.fr>` (voir [Que disent les trois emails](14-texte-emails.md)), envoyé par Sweego (voir [Où héberger l'API et quel service d'email](06-hebergement-api.md)).

Options à départager :
- **aucune boîte** : la réponse est rejetée, faute de MX pour `calendrier.vjeantet.fr` ou faute de boîte `partage@` ;
- **redirection** : `partage@calendrier.vjeantet.fr` redirige vers l'alias de contact sur `vjeantet.fr` prévu par [Contenu de la page « Données personnelles »](12-page-donnees-personnelles.md) ;
- **en-tête `Reply-To`** vers cet alias, l'expéditeur restant sans boîte.

À trancher aussi : ce que le pied des emails dit de la réponse (rien, « ne répondez pas », ou l'adresse de contact), et si la réponse expose l'adresse personnelle de l'auteur du site.

Acquis : l'auteur contrôle le DNS de `vjeantet.fr` ; budget nul ; aucun suivi.
