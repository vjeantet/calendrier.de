# Durées de confirmation et de conservation

Type: grilling
Status: claimed
Blocked by: 06
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Quelles durées retenir et comment les appliquer : 48 h pour confirmer un partage en attente, suppression après 12 mois sans publication ni consultation (proposés) ?

Le mécanisme est fixé par [Où héberger l'API et quel service d'email](06-hebergement-api.md) : une fonction planifiée quotidienne, avec les dates dans les métadonnées et `consulteLe` au jour près. Reste à trancher : les durées, le critère « consulté » (le garder ou ne compter que les publications), et l'avertissement ou non de l'auteur avant suppression, qui suppose de garder l'adresse alors qu'on n'en conserve que l'empreinte.

Depuis [Confirmation de l'adresse et récupération du lien de gestion](07-confirmation-recuperation.md) : aucun avertissement avant suppression (un email par demande, aucun autre ; l'adresse n'est pas conservée). Une clé en attente, émise par une récupération, expire au bout du même délai que la confirmation d'un partage en attente : le chiffre retenu ici vaut pour les deux.
