# Quel service d'email transactionnel hébergé dans l'UE

Type: research
Status: resolved
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Quels services d'email transactionnel hébergés dans l'UE conviennent pour envoyer, depuis une Netlify Function, quelques emails (lien public + lien de gestion) avec un budget nul ?

Comparer au moins Brevo, Scaleway TEM et Mailjet, et tout autre candidat sérieux : offre gratuite (volume, limites, mention publicitaire imposée), hébergement et sous-traitants (UE ?), DPA/RGPD, authentification du domaine `calendrier.vjeantet.fr` (SPF, DKIM, DMARC), API HTTP appelable depuis une fonction Node (sans SMTP), réputation de délivrabilité, réécriture des liens par suivi des clics (à désactiver : elle casserait ou exposerait le fragment `#cle=`), conservation des logs (les adresses y restent-elles en clair, combien de temps ?).

## Answer

- **Réécriture des liens, donc risque pour `#cle=`** :
  - jamais chez Scaleway TEM ;
  - indisponible sur l'offre gratuite de Lettermint ;
  - désactivable chez Mailjet (`TrackClicks: "disabled"`), Sweego (inactive tant qu'on ne l'active pas) et Mailgun ;
  - **impossible à couper sur l'offre gratuite de Brevo** (anonymisation seulement).
- **Offres gratuites** : Scaleway 300/mois, facturé au-delà, **carte bancaire obligatoire** ; Lettermint 300/mois sans carte ; Brevo 300/jour (mention « Sent with Brevo ») ; Mailjet 200/jour et 6 000/mois ; Sweego 100/jour ; Mailgun 100/jour.
- **Hébergement** : Scaleway (France, aucun sous-traitant dédié), Lettermint (Pays-Bas et Allemagne) et Sweego (France) restent dans l'UE. Brevo et Mailjet hébergent dans l'UE mais ont des sous-traitants américains (CDN, support, IA). Mailgun est une société américaine, même en région UE.
- **Adresses en clair dans les journaux** : Scaleway, tant que le domaine est actif ; Brevo, indéfiniment par défaut (réglable de 1 à 24 mois) ; Lettermint, 28 jours ; Sweego, 7 jours ; Mailgun, 1 jour.
- Tous proposent une API HTTP et DKIM/DMARC. Scaleway exige aussi un MX (un « blackhole » est possible).
- Détail, sources et conséquences : [recherche 02](../recherches/02-email-transactionnel-ue.md).
