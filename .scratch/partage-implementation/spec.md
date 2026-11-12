# Partage d'un calendrier en lecture seule : implémentation

La spécification est [`PARTAGE.md`](../../PARTAGE.md) (statut « conception validée »). Elle n'est pas recopiée ici : chaque ticket renvoie à ses sections, et en cas de doute `PARTAGE.md` puis les tickets de la [carte](../partage/map.md) font foi.

Les tickets 01 à 13 reprennent un à un les lots de la section « Travail à faire » de `PARTAGE.md`, avec le même numéro. Les tickets 14 à 16 sont le travail humain que `PARTAGE.md` range sous « Prérequis hors code » et « À vérifier à l'implémentation ».

| Ticket | Statut de départ | Bloqué par |
|---|---|---|
| [01 : Liste de noms communs](issues/01-liste-noms-communs.md) | ready-for-agent | — |
| [02 : Module `instantane.js`](issues/02-module-instantane.md) | ready-for-agent | — |
| [03 : Séparer affichage et édition des annotations](issues/03-affichage-edition-separes.md) | ready-for-agent | 02 |
| [04 : Fondations de l'API](issues/04-fondations-api.md) | ready-for-agent | — |
| [05 : Création et récupération d'un partage](issues/05-creation-recuperation.md) | ready-for-agent | 01, 02, 04 |
| [06 : Lecture, publication, arrêt et confirmation](issues/06-lecture-publication-arret-confirmation.md) | ready-for-agent | 02, 04 |
| [07 : Tâche quotidienne de ménage](issues/07-tache-quotidienne.md) | ready-for-agent | 04 |
| [08 : Page du lecteur `/@/<id>`](issues/08-page-lecteur.md) | ready-for-agent | 03, 06 |
| [09 : Bandeau de partage de l'auteur](issues/09-bandeau-auteur.md) | ready-for-agent | 02, 05, 06 |
| [10 : Arrivée par le lien de gestion](issues/10-arrivee-lien-gestion.md) | ready-for-agent | 08, 09 |
| [11 : Page « Données personnelles »](issues/11-page-donnees-personnelles.md) | ready-for-agent | — |
| [12 : Captures du partage](issues/12-captures.md) | ready-for-agent | 08, 09, 10, 11 |
| [13 : Mettre le README à jour](issues/13-readme.md) | ready-for-agent | — |
| [14 : Relire la liste de noms communs](issues/14-relecture-liste-noms.md) | ready-for-human | 01 |
| [15 : Prérequis hors code](issues/15-prerequis-hors-code.md) | ready-for-human | — |
| [16 : Vérifier sur une prévisualisation Netlify](issues/16-verifications-netlify.md) | ready-for-human | 05, 06, 08, 09, 10, 11 |

Frontière de départ : 01, 02, 04, 11, 13 (agent) et 15 (humain).

La mise en ligne attend les tickets 01 à 16.
