# Où héberger l'API et quel service d'email

Type: grilling
Status: open
Blocked by: 01, 02
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Où héberger l'API de partage et quel service d'email retenir : Netlify Functions + Blobs + un service d'email UE (proposé), ou autre chose ?

À trancher avec les recherches sur Netlify et sur l'email transactionnel. Cela fixe le stockage (format des clés, index par empreinte d'email selon la cohérence offerte), les mécanismes de limitation de débit et de tâches planifiées, et les sous-traitants à déclarer.

À établir avec l'auteur en début de session : l'offre Netlify du compte (offre à crédits, 300 crédits/mois, ou ancienne offre gratuite), dont dépend le coût réel. Pèsent aussi : le risque qu'un abus sur l'API mette en pause tout le compte, site statique compris, et le fait que les fonctions tournent aux États-Unis.
