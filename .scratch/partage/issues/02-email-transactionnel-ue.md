# Quel service d'email transactionnel hébergé dans l'UE

Type: research
Status: open
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Quels services d'email transactionnel hébergés dans l'UE conviennent pour envoyer, depuis une Netlify Function, quelques emails (lien public + lien de gestion) avec un budget nul ?

Comparer au moins Brevo, Scaleway TEM et Mailjet, et tout autre candidat sérieux : offre gratuite (volume, limites, mention publicitaire imposée), hébergement et sous-traitants (UE ?), DPA/RGPD, authentification du domaine `calendrier.vjeantet.fr` (SPF, DKIM, DMARC), API HTTP appelable depuis une fonction Node (sans SMTP), réputation de délivrabilité, réécriture des liens par suivi des clics (à désactiver : elle casserait ou exposerait le fragment `#cle=`), conservation des logs (les adresses y restent-elles en clair, combien de temps ?).
