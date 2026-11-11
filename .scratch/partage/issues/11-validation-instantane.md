# Règles de validation de l'instantané

Type: grilling
Status: open
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Quelles règles exactes et quels plafonds le serveur applique-t-il à un instantané reçu (création et publication) ?

- Format des clés (`jourdetails` et `jourcouleurs` en `jjmmaaaa`, `moislibelles` en `mmaaaa`), plage d'années acceptée.
- Couleurs prises dans `COULEURS_JOUR`, périodes `{ c, l, d, f }` validées comme `valide()` dans `periodes.js`. Comment partager ces règles entre le navigateur et la fonction sans les dupliquer ?
- Longueur maximale d'un texte de jour, d'un libellé de mois, d'un libellé de période et du titre ; nombre maximal de périodes ; taille totale (de l'ordre de 100 Ko proposé). La fonction accepte jusqu'à 6 Mo et chaque Go servi coûte des crédits.
- Champs inconnus ou valeurs invalides : rejet de tout l'instantané ou nettoyage ?
- Semestre (`debut`) : forme et bornes.

Le format de l'instantané reprend les quatre clés du localStorage telles quelles (voir [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md)). L'hébergement est fixé par [Où héberger l'API et quel service d'email](06-hebergement-api.md).
