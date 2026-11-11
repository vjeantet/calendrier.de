# Où héberger l'API et quel service d'email

Type: grilling
Status: resolved
Blocked by: 01, 02
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Où héberger l'API de partage et quel service d'email retenir : Netlify Functions + Blobs + un service d'email UE (proposé), ou autre chose ?

À trancher avec les recherches sur Netlify et sur l'email transactionnel. Cela fixe le stockage (format des clés, index par empreinte d'email selon la cohérence offerte), les mécanismes de limitation de débit et de tâches planifiées, et les sous-traitants à déclarer.

À établir avec l'auteur en début de session : l'offre Netlify du compte (offre à crédits, 300 crédits/mois, ou ancienne offre gratuite), dont dépend le coût réel. Pèsent aussi : le risque qu'un abus sur l'API mette en pause tout le compte, site statique compris, et le fait que les fonctions tournent aux États-Unis.

Critères issus de la recherche sur l'email : le lien de gestion ne doit pas passer par une réécriture de suivi des clics, un plafond dur évite une facture, et la durée de conservation des adresses en clair dans les journaux du fournisseur contredit l'engagement de ne garder qu'une empreinte.

## Answer

1. **Compte Netlify.** Offre gratuite à crédits (300 crédits par mois), un seul site sur le compte, peu de déploiements.
2. **Hébergement de l'API.** Netlify Functions + Netlify Blobs, **dans le même site** que le calendrier, sans CORS ni second domaine. On accepte le risque qu'un abus épuise les crédits et mette tout le compte en pause, site statique compris : il existe déjà pour les pages statiques, et le README le signale. Écartés :
   - un second compte Netlify pour l'API : CORS, second domaine, et un contournement probable de l'esprit de l'offre gratuite ;
   - un autre hébergeur : nouvelle recherche, sociétés américaines ou carte bancaire.
3. **Service d'email : Sweego** (Mindbaz, France). Il n'exige pas de carte bancaire, ses journaux gardent l'adresse 7 jours, et ses sous-traitants sont en France ou aux Pays-Bas. Quota de 100 emails par jour : le dépasser n'est pas documenté mais ne peut rien coûter sans moyen de paiement. Lettermint, recommandé à l'origine, est écarté au profit de journaux plus courts (7 jours contre 28). Repli : Lettermint. Faits complémentaires : [recherche 02, complément Sweego](../recherches/02-email-transactionnel-ue.md#complément--sweego-offre-gratuite-2026-11-11).
4. **Pas de réécriture du lien de gestion.** Chez Sweego, le suivi des clics et celui des ouvertures exigent un enregistrement DNS `t.calendrier.vjeantet.fr`. Règle : **ne jamais créer cet enregistrement**. Le README et la page « Données personnelles » l'écrivent. Chaque envoi passe aussi `tracking_open: false`. Il n'existe pas de champ par message pour les clics.
5. **Localisation.** Blobs à Francfort : `region: "eu-central-1"` sur **chaque** `getStore`, imposé par un module d'accès unique (un appel qui l'oublie écrirait aux États-Unis sans erreur). Les fonctions tournent aux États-Unis, ce que l'offre gratuite impose. L'adresse y passe en mémoire sans y être stockée. C'est accepté et déclaré.
6. **Index des partages d'une adresse.** Une clé vide par couple, `emails/<empreinte>/<id>`, retrouvée par `list({ prefix })`. Il n'y a pas d'écriture concurrente. Un partage tout juste créé peut manquer quelques secondes dans un renvoi de liens : accepté.
7. **Cohérence.** `strong` pour tout le store : « Arrêter le partage » prend effet immédiatement, et aucune copie n'est mise en cache hors UE.
8. **Dates.** `etat`, `creeLe`, `publieLe` et `consulteLe` vont dans les **métadonnées** du blob, lisibles par `getMetadata` sans télécharger l'instantané. `consulteLe` est au jour près, réécrit au plus une fois par jour et par partage. Le critère « consulté » et les durées restent au ticket [Durées de confirmation et de conservation](08-durees-conservation.md).
9. **Tâches planifiées.** Une seule fonction planifiée quotidienne : partages en attente expirés, partages inactifs, compteurs de limitation périmés. Si les 30 s d'exécution ne suffisent pas, elle reprend le lendemain.
10. **Secrets.** La clé d'API Sweego et le secret HMAC des empreintes sont des variables d'environnement Netlify, jamais dans `netlify.toml`.
11. **Outils de limitation disponibles.** 2 règles `rateLimit` par IP et par chemin, sur une fenêtre de 180 s au plus, plus des compteurs dans Blobs (par empreinte d'adresse, par IP). Les seuils et l'emploi des deux règles relèvent du ticket [Limitation des envois et des lectures](10-limitation-envois-lectures.md).
12. **Sous-traitants à déclarer.** Netlify (fonctions aux États-Unis, Blobs à Francfort, DPA avec transferts hors UE) et Sweego/Mindbaz (France).

## Révision

Révisé par [Que disent les trois emails](14-texte-emails.md#pas-dactivation) :
- **Point 8** : la métadonnée `etat` disparaît, car il n'y a plus de partage en attente.
- **Point 9** : la tâche quotidienne supprime les partages jamais ouverts 7 jours après leur création (au lieu des partages en attente expirés) et les clés en attente périmées.
