# À quoi ressemble l'interface de partage pour l'auteur

Type: prototype
Status: claimed
Blocked by: 04, 07
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

À quoi ressemblent, dans l'entête, le bouton « Partager », son popover et les états du partage pour l'auteur : non partagé → lien envoyé (en attente) → actif, avec ou sans modifications non publiées → arrêté ; et « J'ai déjà un lien » ?

Prototype grossier dans le style existant (`popovers.css`), à faire réagir, en tenant compte des décisions sur la mise à jour de l'instantané et sur la confirmation.

À couvrir aussi, depuis [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md) : où atterrit l'auteur après avoir ouvert le lien de gestion (sur `/@/<id>`, ou redirigé vers `/<titre>/<aaaa>/<mm>`) ; le choix « Reprendre le calendrier partagé ici » ou « Garder mes annotations » ; le rappel de ce qui partira sur le bouton « Publier les modifications ».

À couvrir aussi, depuis [Confirmation de l'adresse et récupération du lien de gestion](07-confirmation-recuperation.md) :
- l'aperçu et le bouton « Activer le partage » à l'ouverture du lien de gestion d'un partage en attente ;
- le bouton « Gérer le partage depuis ce navigateur » à l'ouverture d'un lien de récupération, et son articulation avec le choix « Reprendre / Garder mes annotations » ;
- le message unique d'un navigateur dont la clé a été remplacée, et la page « Ce lien de gestion n'est plus valable » ;
- dans le popover, l'orientation « Vous avez déjà partagé ce calendrier ? J'ai déjà un lien » et la réponse identique de la récupération.

À couvrir aussi, depuis [Durées de confirmation et de conservation](08-durees-conservation.md) : l'emplacement, dans le popover au moment de partager, de la phrase « Un partage en attente expire au bout de 48 h. Un partage ni publié ni consulté pendant 12 mois est supprimé. »
