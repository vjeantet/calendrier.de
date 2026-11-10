# À quoi ressemble l'interface de partage pour l'auteur

Type: prototype
Status: open
Blocked by: 04, 07
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

À quoi ressemblent, dans l'entête, le bouton « Partager », son popover et les états du partage pour l'auteur : non partagé → lien envoyé (en attente) → actif, avec ou sans modifications non publiées → arrêté ; et « J'ai déjà un lien » ?

Prototype grossier dans le style existant (`popovers.css`), à faire réagir, en tenant compte des décisions sur la mise à jour de l'instantané et sur la confirmation.

À couvrir aussi, depuis [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md) : où atterrit l'auteur après avoir ouvert le lien de gestion (sur `/@/<id>`, ou redirigé vers `/<titre>/<aaaa>/<mm>`) ; le choix « Reprendre le calendrier partagé ici » ou « Garder mes annotations » ; le rappel de ce qui partira sur le bouton « Publier les modifications ».
