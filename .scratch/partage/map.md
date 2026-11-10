# Partage d'un calendrier en lecture seule

Label: wayfinder:map

## Destination

Une conception du partage **validée**, écrite dans `PARTAGE.md` (réécrit en place, statut « conception validée »), assez précise pour être découpée en tickets d'implémentation `ready-for-agent`. L'implémentation est hors de cette carte.

## Notes

- Domaine : `GLOSSARY.md` (Calendrier, Annotations, Partage, Instantané, Publier, Identifiant public, Lien public, Lien de gestion, Clé de gestion, Auteur, Lecteur). Point de départ : la proposition dans `PARTAGE.md`.
- Skills à appeler pour chaque ticket `grilling` : `grilling` et `domain-modeling`.
- Acquis au cadrage :
  - Le **stockage local reste la source par défaut** du calendrier. Le stockage côté serveur est un complément qui ne sert qu'au partage : il n'est ni une sauvegarde ni une synchronisation.
  - Un backend est nécessaire : l'authentification par email l'impose. La variante « tout dans l'URL » reste écartée.
  - « Authentifié par email » veut dire posséder la boîte : pas de compte ni de mot de passe. Le lien de gestion est la seule preuve.
  - Un navigateur = un calendrier partagé.
  - Budget nul : offres gratuites de Netlify et du service d'email. Dépasser un quota gratuit est un motif d'écarter une option.
  - Expéditeur des emails sur `calendrier.vjeantet.fr`. L'auteur contrôle le DNS de `vjeantet.fr` (SPF/DKIM/DMARC possibles).
- Les recherches sont dans `.scratch/partage/recherches/`.

## Decisions so far

<!-- une ligne par ticket fermé : gist + lien -->

- [Ce que permettent Netlify Functions et Blobs sur l'offre gratuite](issues/01-netlify-functions-blobs.md) : routage `config.path` prioritaire sur `/*` ; tout (fonctions, requêtes, déploiements) puise dans un même quota de crédits et le dépassement met tout le compte en pause ; Blobs à terme par défaut, `strong` et écritures conditionnelles possibles ; planification OK ; limitation de débit par IP/chemin seulement ; fonctions aux États-Unis en gratuit.
- [D'où tirer une liste d'environ 1 024 noms communs français](issues/03-liste-noms-communs.md) : Lexique 4.10 (prévalence) donne ≈ 1 450–1 550 noms après filtres et relecture humaine ; licence CC BY-SA à confirmer (incohérence BY-SA/BY-NC sur lexique.org) ; trois noms + 10–99 ≈ 36,5 à 39,5 bits selon la taille de la liste.
- [Quel service d'email transactionnel hébergé dans l'UE](issues/02-email-transactionnel-ue.md) : réécriture des liens absente chez Scaleway TEM et Lettermint (gratuit), désactivable chez Mailjet, Sweego, Mailgun, non désactivable sur Brevo gratuit ; tout-UE : Scaleway (CB obligatoire, pas de plafond dur), Lettermint (300/mois sans CB), Sweego ; les adresses restent en clair dans les journaux du fournisseur (1 jour à illimité selon le fournisseur).

## Not yet specified

- **Source de données unique** : forme de l'accès aux annotations qui permette à `detailsjour.js` et `periodes.js` d'afficher soit le calendrier local (par défaut, en écriture), soit un instantané chargé du serveur (asynchrone, en lecture seule). Relève peut-être de l'implémentation plutôt que d'un ticket de décision.
- **Validation de l'instantané** : règles exactes et plafonds (longueurs de texte, taille totale, nombre de périodes) ; dépend de l'hébergement et du format retenu.
- **Limitation des envois** : seuils par adresse et par IP, et le mécanisme, qui dépend de ce que l'hébergeur offre.
- **Page « Données personnelles »** : contenu, une fois l'hébergeur, le service d'email et les durées connus.
- **Email** : texte, présentation du lien public et du lien de gestion, expéditeur.
- **Domaine du site et domaine d'envoi** : le README cite `calendrier.sodadi.fr` pour le site, l'expéditeur serait sur `calendrier.vjeantet.fr`. Il faut savoir si les liens envoyés pointent vers le même domaine que l'expéditeur.
- **Captures** : scénarios `outils/captures/` pour une page `/@/` (écran et impression) et pour le popover.

## Out of scope

- « Copier dans mon calendrier » (import d'un instantané chez le lecteur) : fonction remise à plus tard. Le format de l'instantané, qui reprend les quatre clés telles quelles, la permettra sans autre décision.
- Plusieurs calendriers par auteur (calendriers nommés dans un même navigateur) : c'est un autre chantier.
