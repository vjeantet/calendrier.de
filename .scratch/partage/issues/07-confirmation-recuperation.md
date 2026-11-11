# Confirmation de l'adresse et récupération du lien de gestion

Type: grilling
Status: open
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Comment se déroulent la confirmation de l'adresse et la récupération du lien de gestion, et quelles protections faut-il ?

- Les scanners de liens des messageries (Outlook Safe Links, antivirus) ouvrent les liens reçus, parfois en exécutant le JavaScript. Le fragment `#cle=` n'atteint pas le serveur, mais une page qui confirme automatiquement au chargement pourrait être confirmée par un robot. Confirmation automatique ou par un clic explicite ?
- « J'ai déjà un lien » : la réponse doit être identique que l'adresse soit connue ou non (anti-énumération) ; un email doit-il partir même pour une adresse inconnue ?
- Plusieurs partages pour une même adresse (deux navigateurs) : l'email de récupération les liste tous ?
- Repartager depuis un navigateur qui a perdu sa clé : nouveau partage ou récupération ?
- Rotation de la clé de gestion : chaque email de récupération en émet-il une nouvelle ?
- Combien d'emails chaque parcours envoie-t-il ? Les seuils de limitation en découlent, dans [Limitation des envois et des lectures](10-limitation-envois-lectures.md).
