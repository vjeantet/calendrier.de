# Limitation des envois et des lectures

Type: grilling
Status: claimed
Blocked by: 07
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Quels seuils et quel mécanisme pour limiter les envois d'emails et les lectures de partages ?

- **Envois** (`POST /api/partages`, `POST /api/liens`) : seuils par empreinte d'adresse et par IP, sur quelle durée. Sans limite, le formulaire sert à bombarder une boîte, et il épuise le quota de Sweego (100 emails par jour pour tout le service), ce qui bloque le partage jusqu'au lendemain.
- **Lectures** (`GET /api/partages/<id>`) : l'entropie de l'identifiant public (≈ 38 bits) suppose qu'on ne peut pas essayer des identifiants sans limite. Une avalanche de lectures consomme aussi les crédits Netlify, dont l'épuisement met tout le compte en pause.
- **Mécanisme** : les outils sont fixés par [Où héberger l'API et quel service d'email](06-hebergement-api.md). Il y a 2 règles `rateLimit` par IP et par chemin, sur une fenêtre de 180 s au plus : à quels chemins les attribuer ? Et des compteurs dans Blobs : clés, fenêtre, purge par la tâche quotidienne.
- Réponse vue de l'extérieur quand une limite est atteinte (429, message dans le bandeau de partage, voir [À quoi ressemble l'interface de partage pour l'auteur](09-prototype-interface-auteur.md)), sans révéler si une adresse est connue.

Fixé par [Confirmation de l'adresse et récupération du lien de gestion](07-confirmation-recuperation.md) : chaque demande envoie exactement un email (création, ou récupération, que l'adresse soit connue ou non), et aucun autre. Une récupération émet aussi une clé en attente par partage de l'adresse, ce qui écrit dans Blobs.
