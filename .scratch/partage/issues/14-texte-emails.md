# Que disent les trois emails

Type: prototype
Status: open
Blocked by: 13
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Quels sont l'objet, l'expéditeur (nom affiché et adresse) et le corps des trois emails ? Comment y sont présentés le lien public et le lien de gestion ? Les trois emails sont fixés par [Confirmation de l'adresse et récupération du lien de gestion](07-confirmation-recuperation.md) :
- **création** : confirmer le partage ;
- **récupération** : liste de tous les partages de l'adresse, en attente compris, chacun avec une clé neuve ;
- **récupération pour une adresse sans partage** : même réponse côté formulaire, mais un email qui dit qu'aucun partage n'existe.

À trancher :
- texte seul ou texte + HTML ;
- comment distinguer le lien public, à transmettre, du lien de gestion, à garder pour soi ;
- comment dire le délai de 48 h (voir [Durées de confirmation et de conservation](08-durees-conservation.md)) ;
- comment présenter le titre de l'instantané (100 caractères au plus, voir [Règles de validation de l'instantané](11-validation-instantane.md)) dans l'objet ou dans le corps ;
- le lien vers la page « Données personnelles » (voir [Contenu de la page « Données personnelles »](12-page-donnees-personnelles.md)).

Contraintes acquises : aucun suivi des ouvertures ni des clics, pas de réécriture de lien, et un seul email par demande. Le domaine des liens dépend de [Sur quel domaine pointent les liens envoyés par email](13-domaine-liens-emails.md).
