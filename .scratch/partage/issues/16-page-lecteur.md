# Comment la page `/@/<id>` affiche l'instantané

Type: grilling
Status: claimed
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Comment la page d'un lecteur charge et affiche l'instantané, en lecture seule, avec le code d'affichage du calendrier local ?

Aujourd'hui `detailsjour.js` et `periodes.js` lisent et écrivent le localStorage directement, de façon synchrone, au `document.ready`. Sur `/@/<id>`, les annotations viennent du serveur (`GET /api/partages/<id>`, asynchrone) et ne doivent ni lire ni écrire le stockage local.

À trancher :
- la forme de l'accès aux annotations (la « source ») : une source locale en écriture, une source instantané en lecture seule, et la façon dont les deux scripts la reçoivent ;
- ce qui est masqué ou désactivé pour le lecteur : saisie des jours (`?annote`), édition et liste des périodes, « Réinitialiser », « Partager » ;
- l'attente du chargement et les erreurs : partage inexistant (la « page commune » de [À quoi ressemble l'interface de partage pour l'auteur](09-prototype-interface-auteur.md)), réseau, 429 ;
- la navigation entre semestres (`/@/<id>/2027/01`) : nouvelle requête ou instantané gardé en mémoire ;
- comment le titre et le semestre de l'instantané fixent l'URL et le `<title>` ;
- la reprise par l'auteur : recopier un instantané dans le calendrier local (voir [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md)) avec la même source.

Skill à appeler en plus de `grilling` et `domain-modeling` : `codebase-design`.
