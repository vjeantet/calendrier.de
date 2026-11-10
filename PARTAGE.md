# Partage d'un calendrier (chantier à venir)

Statut : conception proposée, non validée, non implémentée.

## L'idée

Une personne prépare un calendrier puis le partage en lecture seule : quiconque a le lien de partage peut le consulter. Seules les personnes authentifiées par email peuvent enregistrer et partager un calendrier ; la consultation par le lien ne demande pas d'authentification.

## Scénario visé

1. J'ai personnalisé mon calendrier (textes, couleurs, libellés de mois, périodes, titre).
2. Je clique sur « Partager ».
3. On me demande mon adresse email ; c'est le seul moyen d'obtenir le lien.
4. Je reçois un email avec un lien de la forme `/@/girafe-tambour-citron-27` : des mots du dictionnaire et un nombre, pour qu'il se retienne et se dicte.
5. Je transmets ce lien ; la personne qui l'ouvre voit mon calendrier, sans pouvoir le modifier.

## Point de départ (état du code)

- Site 100 % statique sur Netlify, sans serveur ni base de données.
- Les personnalisations sont dans le localStorage du navigateur, sous quatre clés globales : `jourdetails` (textes des jours), `jourcouleurs` (fonds de jour), `moislibelles` (libellés de mois), `jourbandes` (périodes). Voir `detailsjour.js` et `periodes.js`.
- Ces clés ne sont pas rattachées à un calendrier : un navigateur n'a qu'un seul jeu d'annotations, partagé par tous les titres et tous les semestres. La notion de « calendrier » comme objet nommé n'existe pas encore.
- Le titre vit dans l'URL (`/Claire/2026/04`), pas dans le stockage.
- `detailsjour.js` et `periodes.js` lisent et écrivent le localStorage directement, de façon synchrone, au `document.ready`.
- `analyserChemin` (`calendrier.js`) lirait `/@/girafe-…` comme le titre « @ » suivi d'une année invalide : la route `/@/` est à ajouter. La réécriture `/* → /index.html` de `netlify.toml` la couvre déjà.
- Les textes sont insérés par `.text()` / `textContent`, pas en HTML : un contenu partagé ne peut pas injecter de balises. En revanche les clés servent à construire des sélecteurs (`[data-jour="…"]`) et doivent être validées côté serveur.

## Proposition

### Ce qui est partagé

Un **instantané** de tout ce que le navigateur de l'auteur contient : les quatre clés du localStorage, le titre et le semestre affiché au moment du partage. Le lecteur arrive sur ce semestre et peut naviguer vers les précédents et suivants (`/@/<id>/2027/01`), puisque les annotations ne sont pas limitées à 6 mois.

L'instantané se met à jour à la demande de l'auteur (bouton « Publier les modifications », avec un indicateur quand le calendrier local a changé depuis la dernière publication), pas à chaque frappe : l'auteur garde la main sur ce qui devient visible, et une note personnelle saisie après le partage n'est pas publiée par surprise.

Un navigateur = un calendrier partagé. Repartager depuis le même navigateur met à jour le partage existant. Plusieurs calendriers par auteur supposent de rattacher les annotations à un calendrier nommé ; c'est un autre chantier.

### Identifiant `/@/<id>`

- Trois **noms communs** français tirés d'une liste fermée, puis un nombre de 10 à 99 : `girafe-tambour-citron-27`. Des noms seuls, sans adjectif, évitent les accords (« tambour violette »). Mots en minuscules, sans accent ni homophone gênant, sans mot grossier ou connoté ; liste versionnée dans le dépôt.
- Le lien est le seul verrou de la consultation : il ne doit pas se deviner. Avec 1 024 mots, trois mots et un nombre à deux chiffres donnent environ 9,7 × 10¹⁰ combinaisons (≈ 36 bits). Avec 10 000 calendriers partagés, il faut en moyenne près de 10 millions d'essais pour en trouver un au hasard. Deux mots seulement (≈ 10⁸) seraient trop faibles.
- Tirage côté serveur avec un générateur cryptographique (`crypto.getRandomValues`), nouveau tirage en cas de collision.
- L'identifiant public ne donne aucun droit d'écriture. La modification passe par une **clé de gestion** distincte, aléatoire (128 bits), dont le serveur ne garde que l'empreinte.
- Pages `/@/` non indexées (`<meta name="robots" content="noindex">` et en-tête `X-Robots-Tag`).

### Parcours de l'auteur

1. « Partager » (dans l'entête, à côté de « Réinitialiser ») ouvre un popover : champ email, rappel de ce qui sera partagé (titre, nombre de jours annotés et de périodes), mention sur les données personnelles, bouton « Recevoir le lien ».
2. Le navigateur envoie l'email et l'instantané au serveur. Le serveur valide, crée le partage à l'état « en attente », envoie l'email, et répond « Lien envoyé à v•••@gmail.com ». Le lien n'est jamais affiché à ce stade : c'est ce qui en réserve l'accès au propriétaire de l'adresse.
3. L'email contient :
   - le lien à transmettre, `/@/girafe-tambour-citron-27`, en clair ;
   - un bouton « Gérer mon calendrier partagé », vers `/@/girafe-tambour-citron-27#cle=<clé de gestion>`, signalé comme personnel. La clé est dans le fragment (`#`) : elle n'apparaît ni dans les journaux du serveur ni dans les en-têtes `Referer`.
4. Ouvrir le lien de gestion confirme l'adresse, active le partage, enregistre la clé dans le localStorage de ce navigateur et retire le fragment de l'URL. L'entête affiche alors le lien public avec « Copier », « Publier les modifications » et « Arrêter le partage ».
5. Un partage jamais confirmé est supprimé au bout de 48 h.

Clé perdue (localStorage effacé, autre appareil) : « Partager » → « J'ai déjà un lien » → saisie de l'email → le serveur renvoie les liens de gestion des partages rattachés à cette adresse.

### Parcours du lecteur

`/@/<id>` affiche le calendrier en lecture seule : pas de `contenteditable`, pas de palette ni de sélection de périodes, pas de « Réinitialiser ». Impression possible (`print.css` s'applique tel quel). Le localStorage du lecteur n'est ni lu ni modifié. L'URL de l'entête devient `♥ <origine>/@/<id>`.

Partage inconnu, supprimé ou en attente : même page « Ce calendrier n'existe pas ou n'est plus partagé », sans distinguer les cas.

Plus tard, éventuellement : « Copier dans mon calendrier », qui importe l'instantané dans le localStorage du lecteur après confirmation (il remplace ses propres annotations).

### Serveur

Le site n'a pas de backend ; le partage en impose un, petit. Proposition qui reste chez Netlify, sans base de données à administrer :

- **Netlify Functions** pour une API JSON :
  - `POST /api/partages` : création (email + instantané) ;
  - `GET /api/partages/<id>` : lecture publique de l'instantané ;
  - `POST /api/partages/<id>/confirmer` : activation, avec la clé de gestion ;
  - `PUT /api/partages/<id>` : publication des modifications, avec la clé ;
  - `DELETE /api/partages/<id>` : arrêt du partage, avec la clé ;
  - `POST /api/liens` : renvoi des liens de gestion à une adresse.
- **Netlify Blobs** comme stockage clé-valeur : `partages/<id>` → `{ empreinteEmail, empreinteCle, etat, titre, debut, donnees, creeLe, publieLe, consulteLe }` ; `emails/<empreinteEmail>` → liste d'identifiants.
- Un **service d'envoi d'emails transactionnels** hébergé dans l'UE (Brevo, Scaleway TEM…), appelé par la fonction avec une clé d'API en variable d'environnement Netlify.

À vérifier avant de s'engager : l'ordre d'évaluation entre les fonctions à chemin personnalisé et la réécriture `/* → /index.html`, les quotas de l'offre Netlify utilisée (invocations, stockage Blobs), et la limitation de débit disponible.

Écarté : tout encoder dans l'URL (`/#<données compressées>`), sans serveur. C'est le plus KISS, mais le lien est long, impossible à retenir, et il n'y a ni email, ni mise à jour, ni révocation.

### Règles côté serveur

- Validation stricte de l'instantané : clés `jourdetails` et `jourcouleurs` au format `jjmmaaaa`, `moislibelles` au format `mmaaaa`, couleurs prises dans `COULEURS_JOUR`, périodes `{ c, l, d, f }` comme `valide()` dans `periodes.js`, longueurs de texte bornées, taille totale plafonnée (de l'ordre de 100 Ko).
- Limitation des envois d'emails par adresse et par IP (sans quoi le formulaire sert à bombarder une boîte de messages).
- Comparaison des empreintes de clé en temps constant.

### Données personnelles (RGPD)

- L'adresse email n'est pas conservée en clair : seulement une empreinte (HMAC avec un secret serveur). Pour renvoyer les liens, la personne retape son adresse ; le serveur calcule l'empreinte, retrouve ses partages et écrit à l'adresse saisie.
- Base légale : exécution du service demandé. Une page « Données personnelles » dit ce qui est conservé, combien de temps, chez quels sous-traitants (Netlify, service d'email) et comment tout supprimer.
- Les annotations peuvent contenir des données sur des tiers (« RDV médecin de Paul ») : le popover de partage rappelle que le contenu devient lisible par toute personne ayant le lien.
- Conservation : un partage non publié et non consulté depuis 12 mois est supprimé (tâche planifiée). « Arrêter le partage » supprime immédiatement l'instantané.

### Travail dans le code existant

- `calendrier.js` : route `/@/<id>[/aaaa[/mm]]` dans `analyserChemin`, liens de navigation qui gardent le préfixe `/@/<id>`.
- `detailsjour.js` et `periodes.js` : passer par une source de données unique, au lieu du localStorage en direct, pour pouvoir afficher un instantané chargé du serveur, de façon asynchrone et sans écriture ; mode lecture seule (pas d'édition, de palette ni de sélection).
- Nouveau module de partage : popover email, lien de gestion (`#cle=`), état « modifications non publiées », publication, arrêt.
- `netlify/functions/` et `netlify.toml` : l'API ci-dessus.
- `outils/captures/` : scénarios pour une page `/@/` (écran et impression) et pour le popover.

## Décisions à prendre

- Instantané mis à jour à la demande (proposé) ou suivi automatique des modifications.
- Trois noms + un nombre (proposé), ou une autre forme, en gardant au moins 35 bits environ.
- Netlify Functions + Blobs + email UE (proposé), ou un autre hébergement de l'API.
- Durées : 48 h pour confirmer, 12 mois d'inactivité avant suppression.
- « Copier dans mon calendrier » dans la première version ou plus tard.
