# Comment l'instantané se met à jour

Type: grilling
Status: open
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

L'instantané d'un partage se met-il à jour à la demande de l'auteur (bouton « Publier les modifications », indicateur de modifications non publiées), comme proposé dans `PARTAGE.md`, ou suit-il automatiquement le calendrier local ?

Ce qui en découle : comment détecter « modifié depuis la dernière publication » (empreinte de l'instantané ? horodatage ?), ce que voit l'auteur quand il réinitialise son calendrier local alors qu'un partage est actif, ce qui se passe si l'auteur modifie son calendrier depuis un navigateur qui n'a pas la clé de gestion.

À trancher aussi : où le navigateur range l'état local du partage (identifiant public, clé de gestion, empreinte de la dernière publication). Les calendriers multiples sont hors périmètre, mais ce rangement ne doit pas les empêcher plus tard : une clé globale unique (`partage`) à rattacher ensuite à un calendrier nommé, ou une forme qui le permet déjà sans migration ?
