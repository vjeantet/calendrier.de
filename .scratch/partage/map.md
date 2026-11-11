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
- [Comment l'instantané se met à jour](issues/04-mise-a-jour-instantane.md) : publication à la demande ; clé locale unique `partage = { id, cle, empreinte }` ; indicateur par empreinte SHA-256 des quatre clés d'annotations (le titre et le semestre, lus dans l'URL au moment de publier, n'y entrent pas) ; existence vérifiée une fois par session ; « Réinitialiser » ne touche pas au partage ; le lien de gestion ouvert dans un navigateur dont le calendrier diffère propose de reprendre l'instantané.
- [Forme de l'identifiant public](issues/05-forme-identifiant-public.md) : trois noms + `10-99`, traits d'union, minuscules, sans répétition (≈ 38 bits à 1 500 noms) ; liste tirée de Lexique 4.10 sous CC BY-SA 4.0 (repli 3.83), filtres de la recherche + relecture par l'auteur, sans troncature (plancher 1 024) ; fichier à part dans `donnees/noms-communs/`, modifiable librement ; identifiant libéré réutilisable ; saisie normalisée (casse, accents, séparateurs) sans correction approximative.
- [Où héberger l'API et quel service d'email](issues/06-hebergement-api.md) : Netlify Functions + Blobs dans le même site, risque de pause du compte accepté ; email par Sweego (sans carte, journaux 7 jours), suivi rendu impossible en ne créant jamais `t.calendrier.vjeantet.fr` ; Blobs à Francfort en `strong`, index `emails/<empreinte>/<id>`, dates en métadonnées (`consulteLe` au jour près) ; une tâche planifiée quotidienne ; fonctions aux États-Unis, déclarées.
- [Confirmation de l'adresse et récupération du lien de gestion](issues/07-confirmation-recuperation.md) : confirmation par un clic explicite (pas au chargement, à cause des robots de messagerie) ; « J'ai déjà un lien » répond pareil et envoie un email même pour une adresse inconnue ; une récupération émet une clé en attente qui ne remplace l'ancienne qu'au clic et expire avec le délai de confirmation ; un seul email liste tous les partages de l'adresse, en attente compris ; un navigateur sans clé crée toujours un nouveau partage ; un email par demande et aucun autre ; lecture avec clé en `Authorization`, `POST …/confirmer` active une clé.

## Not yet specified

- **Source de données unique** : forme de l'accès aux annotations qui permette à `detailsjour.js` et `periodes.js` d'afficher soit le calendrier local (par défaut, en écriture), soit un instantané chargé du serveur (asynchrone, en lecture seule). Doit aussi permettre de recopier un instantané dans le calendrier local (reprise par l'auteur, voir [Comment l'instantané se met à jour](issues/04-mise-a-jour-instantane.md)). Relève peut-être de l'implémentation plutôt que d'un ticket de décision.
- **Page « Données personnelles »** : contenu, une fois les durées connues. L'hébergeur et le service d'email sont fixés (voir [Où héberger l'API et quel service d'email](issues/06-hebergement-api.md)).
- **Email** : texte, présentation du lien public et du lien de gestion, expéditeur. Trois emails à écrire, fixés par [Confirmation de l'adresse et récupération du lien de gestion](issues/07-confirmation-recuperation.md) : création, récupération (liste de tous les partages de l'adresse, en attente compris) et récupération pour une adresse sans partage.
- **Domaine du site et domaine d'envoi** : le README cite `calendrier.sodadi.fr` pour le site, l'expéditeur serait sur `calendrier.vjeantet.fr`. Il faut savoir si les liens envoyés pointent vers le même domaine que l'expéditeur.
- **Captures** : scénarios `outils/captures/` pour une page `/@/` (écran et impression) et pour le popover.

## Out of scope

- « Copier dans mon calendrier » (import d'un instantané chez le lecteur) : fonction remise à plus tard. Le format de l'instantané, qui reprend les quatre clés telles quelles, la permettra sans autre décision.
- Plusieurs calendriers par auteur (calendriers nommés dans un même navigateur) : c'est un autre chantier.
