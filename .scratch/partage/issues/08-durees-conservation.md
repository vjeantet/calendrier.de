# Durées de confirmation et de conservation

Type: grilling
Status: resolved
Blocked by: 06
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Quelles durées retenir et comment les appliquer : 48 h pour confirmer un partage en attente, suppression après 12 mois sans publication ni consultation (proposés) ?

Le mécanisme est fixé par [Où héberger l'API et quel service d'email](06-hebergement-api.md) : une fonction planifiée quotidienne, avec les dates dans les métadonnées et `consulteLe` au jour près. Reste à trancher : les durées, le critère « consulté » (le garder ou ne compter que les publications), et l'avertissement ou non de l'auteur avant suppression, qui suppose de garder l'adresse alors qu'on n'en conserve que l'empreinte.

Depuis [Confirmation de l'adresse et récupération du lien de gestion](07-confirmation-recuperation.md) : aucun avertissement avant suppression (un email par demande, aucun autre ; l'adresse n'est pas conservée). Une clé en attente, émise par une récupération, expire au bout du même délai que la confirmation d'un partage en attente : le chiffre retenu ici vaut pour les deux.

## Answer

1. **Délai de confirmation : 48 h**, comptées depuis l'émission de la clé (création du partage, ou récupération pour une clé en attente). Il vaut pour un partage en attente comme pour une clé en attente. `POST …/confirmer` compare lui-même la date d'émission et refuse une clé périmée. La tâche quotidienne ne fait que le ménage : elle supprime les partages en attente expirés (blob et entrée d'index) et les clés en attente périmées. Un auteur qui laisse passer le délai recommence, sans rien perdre, puisque ses annotations restent dans son navigateur. Écarté : 7 jours, qui laisserait plus longtemps sur le serveur un instantané non demandé.
2. **Activité = publication ou lecture.** La dernière activité d'un partage actif est la plus récente des dates `creeLe`, `publieLe` et `consulteLe`. `consulteLe` est mise à jour au jour près par **toute lecture réussie d'un partage actif** : celle d'un lecteur (`GET` sans clé), comme celle de l'auteur (vérification de session avec une clé, même remplacée ou périmée). Un calendrier publié une fois puis consulté toute l'année reste donc en vie, tout comme celui d'un auteur qui l'ouvre sans le republier. Les aperçus de liens des messageries ne chargent que le HTML statique de `/@/<id>` et n'appellent pas l'API : ils ne maintiennent rien en vie. Écartés : les publications seules, et les lectures des lecteurs seules.
3. **Suppression après 12 mois sans activité**, au jour près, par la tâche quotidienne. Elle efface `partages/<id>` et `emails/<empreinte>/<id>` et libère l'identifiant (voir [Forme de l'identifiant public](05-forme-identifiant-public.md)). Écarté : 6 mois, qui ferait perdre le calendrier après un seul semestre sans l'ouvrir.
4. **Information de l'auteur.** Aucun avertissement individuel (voir [Confirmation de l'adresse et récupération du lien de gestion](07-confirmation-recuperation.md)). La règle est dite une fois dans le popover, au moment de partager : « Un partage en attente expire au bout de 48 h. Un partage ni publié ni consulté pendant 12 mois est supprimé. » La page « Données personnelles » la reprend. L'API n'expose pas de date de suppression prévue. L'emplacement de la phrase relève de [À quoi ressemble l'interface de partage pour l'auteur](09-prototype-interface-auteur.md).

Pas d'ADR : ces chiffres se changent sans coût, même après l'implémentation.

## Révision

Révisé par [Que disent les trois emails](14-texte-emails.md#pas-dactivation) :
- **Point 1** : les 48 h ne valent plus que pour la clé en attente d'une récupération. Il n'y a plus de partage en attente. Un partage que personne n'ouvre en 7 jours (pas de `consulteLe`) est supprimé par la tâche quotidienne.
- **Point 4** : la phrase devient « Un partage que personne n'ouvre dans les 7 jours est supprimé, tout comme un partage ni publié ni consulté pendant 12 mois. »

Les points 2 et 3 (activité, 12 mois) restent valables.
