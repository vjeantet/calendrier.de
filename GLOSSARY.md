# calendrier.de

Un calendrier semestriel à personnaliser et imprimer dans le navigateur, que son auteur peut partager en lecture seule par un lien.

## Language

### Calendrier et personnalisation

**Calendrier** :
Les annotations que contient le navigateur d'un auteur. Il n'est pas nommé et chaque navigateur n'en a qu'un. Le titre n'en fait pas partie : il se choisit à l'affichage et n'est figé que dans un instantané.
_Avoid_ : agenda, document

**Annotations** :
Les textes de jour, les couleurs de jour, les libellés de mois et les périodes qu'un auteur a saisis dans son calendrier.
_Avoid_ : personnalisations, données, notes

**Semestre** :
Les six mois consécutifs affichés à partir d'un mois donné.

### Partage

**Auteur** :
La personne qui prépare un calendrier et le partage.
_Avoid_ : propriétaire, utilisateur

**Lecteur** :
La personne qui consulte un partage par son lien public, sans pouvoir le modifier.
_Avoid_ : visiteur, invité

**Partage** :
Le calendrier publié côté serveur. Il est désigné par son identifiant public et il est soit *en attente* (adresse non confirmée), soit *actif*.
_Avoid_ : calendrier partagé (pour l'objet), publication

**Instantané** :
La copie du titre, des annotations et du semestre affiché, envoyée par l'auteur et figée jusqu'à la prochaine publication.
_Avoid_ : copie, sauvegarde, export

**Publier** :
Remplacer l'instantané d'un partage actif par l'état actuel du calendrier de l'auteur.
_Avoid_ : synchroniser, enregistrer

**Identifiant public** :
Les mots et le nombre qui désignent un partage, comme `girafe-tambour-citron-27`.
_Avoid_ : slug, code

**Modifications non publiées** :
L'écart entre les annotations du calendrier de l'auteur et celles de l'instantané de son partage. Le titre et le semestre affiché n'en font pas partie.
_Avoid_ : brouillon, changements en attente

**Lien public** :
L'adresse `/@/<identifiant public>` qu'un auteur transmet aux lecteurs.
_Avoid_ : lien de partage (ambigu)

**Lien de gestion** :
L'adresse personnelle, envoyée par email à l'auteur, qui porte la clé de gestion et donne le droit de publier ou d'arrêter le partage.
_Avoid_ : lien d'administration, lien magique

**Clé de gestion** :
Le secret qui prouve qu'on est l'auteur d'un partage.
_Avoid_ : jeton, mot de passe, token
