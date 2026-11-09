# Partage d'un calendrier (chantier à venir)

Statut : opportunité, non implémentée, non conçue.

## L'idée

Une personne prépare un calendrier puis le partage en lecture seule : quiconque a le lien de partage peut le consulter. Seules les personnes authentifiées par email peuvent enregistrer et partager un calendrier ; la consultation par le lien ne demande pas d'authentification.

## Point de départ (état du code)

- Site 100 % statique sur Netlify, sans serveur ni base de données.
- Les personnalisations sont dans le localStorage du navigateur, sous quatre clés globales : `jourdetails` (textes des jours), `jourcouleurs` (fonds de jour), `moislibelles` (libellés de mois), `jourbandes` (périodes). Voir `detailsjour.js` et `periodes.js`.
- Ces clés ne sont pas rattachées à un calendrier : un navigateur n'a qu'un seul jeu d'annotations, partagé par tous les titres et tous les semestres. La notion de « calendrier » comme objet nommé n'existe pas encore.
- Le titre vit dans l'URL (`/Claire/2026/04`), pas dans le stockage.

## Questions ouvertes

- Qu'est-ce qu'un calendrier partagé : un titre, une période de 6 mois, toutes les annotations de l'auteur ?
- Instantané figé au moment du partage, ou vue qui suit les modifications de l'auteur ?
- Un même auteur peut-il avoir plusieurs calendriers ? Que devient le localStorage actuel (import, coexistence) ?
- Lien de partage : forme, révocation, expiration ?
- Authentification par email : lien magique, code à usage unique, fournisseur tiers ?
- Où stocker les calendriers et les comptes (le site n'a aujourd'hui aucun backend) ?
- Données personnelles : adresses email et contenu des annotations, donc RGPD (base légale, durée de conservation, suppression du compte).
- Le lecteur peut-il imprimer, ou copier le calendrier dans son propre navigateur ?
