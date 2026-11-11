# Que devient une réponse aux emails

Type: grilling
Status: resolved
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

## Answer

**Fait relevé (DNS, 2026-11-11).** `calendrier.vjeantet.fr` est un CNAME vers `calendrier-vjeantet.netlify.app`. Un CNAME exclut tout autre enregistrement sous le même nom : **aucun MX n'est possible** pour `partage@calendrier.vjeantet.fr`. Sans `Reply-To`, une réponse vise l'A de Netlify (MX implicite), qui ne reçoit pas d'email. Le serveur de l'expéditeur réessaie alors plusieurs jours avant de rejeter. `vjeantet.fr` a des MX chez OVH. L'API de Sweego accepte `"reply-to": {"email": …, "name": …}` (table « Body parameters » de [How to send an email by API](https://learn.sweego.io/docs/sending/how_to_send_email_by_api.md)). Le champ `headers` n'accepte que des en-têtes `X-…`. Sweego n'exige pas de MX sur le domaine d'envoi.

1. **`Reply-To` vers l'alias de contact.** Les trois emails portent un `Reply-To` vers l'alias de contact sur `vjeantet.fr`, le même que celui de [Contenu de la page « Données personnelles »](12-page-donnees-personnelles.md) (par exemple `donnees@vjeantet.fr`). Le nom affiché est « Calendrier semestriel ». L'alias redirige vers la boîte de l'auteur, qui choisit au cas par cas de répondre ou non depuis son adresse personnelle.
2. **Expéditeur inchangé** : `Calendrier semestriel <partage@calendrier.vjeantet.fr>`. Il porte l'alignement DMARC avec la signature DKIM de Sweego. Le remplacer par une adresse sur `vjeantet.fr` obligerait à toucher au SPF/DMARC du domaine racine, où passe la messagerie OVH.
3. **Pieds des emails inchangés** : ils n'invitent pas à répondre (voir [Que disent les trois emails](14-texte-emails.md)).
4. **Page « Données personnelles »** : son tableau gagne une ligne, « Vos messages, réponses aux emails du partage comprises / ma boîte email (OVH, France) / le temps de traiter votre demande ».
5. **Réponses automatiques acceptées.** Les messages d'absence et les réponses de robots arrivent sur l'alias, sans filtre côté serveur. Leur volume est borné par la limite de 90 emails par jour (voir [Limitation des envois et des lectures](10-limitation-envois-lectures.md)). Les rejets partent vers le Return-Path de Sweego, pas vers l'alias.

Écartés :
- **pas de `Reply-To`** : la réponse échoue en silence, puis est rejetée plusieurs jours plus tard ;
- **alias dédié** (`partage@vjeantet.fr`) : une deuxième adresse à créer et à décrire, pour un gain mince ;
- **boîte ou redirection sur `partage@calendrier.vjeantet.fr`** : impossible sans MX, donc sans renoncer au CNAME vers Netlify.

Pas d'ADR : le choix se défait en changeant un champ.
