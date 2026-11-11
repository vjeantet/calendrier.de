# Réécrire `PARTAGE.md` en conception validée

Type: task
Status: open
Blocked by: 15, 16
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Réécrire `PARTAGE.md` en place, au statut « conception validée », à partir des décisions de la carte. Le document doit pouvoir être découpé en tickets d'implémentation `ready-for-agent` sans autre décision.

Le document reprend chaque décision sans la contredire, en tenant compte des révisions (plus d'activation). Il liste aussi les scénarios de captures `outils/captures/` à ajouter : page `/@/` (écran et impression), page « Données personnelles », bandeau de partage (formulaire, ligne « Partagé », modifications non publiées, messages de [limitation](10-limitation-envois-lectures.md) et de [validation](11-validation-instantane.md)). Les états du [prototype de l'interface](09-prototype-interface-auteur.md) donnent la liste. Pour la page `/@/`, les états sont ceux de [Comment la page `/@/<id>` affiche l'instantané](16-page-lecteur.md) : chargement, page commune, 429, erreur réseau, liste des périodes en lecture seule.

L'agent rédige ; l'auteur relit et valide. Le ticket est résolu à la validation.
