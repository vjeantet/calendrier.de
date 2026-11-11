# Partage d'un calendrier en lecture seule

Statut : **conception validée** le 2026-11-11, non implémentée.

Ce document rassemble les décisions de la carte [Partage d'un calendrier en lecture seule](.scratch/partage/map.md). Chaque section renvoie au ticket qui porte la décision et ses raisons ; en cas de doute, le ticket fait foi. Le vocabulaire est celui de [`GLOSSARY.md`](GLOSSARY.md).

## L'idée

Un auteur prépare son calendrier dans son navigateur, puis le partage en lecture seule. Il tape son adresse email et reçoit deux liens : le **lien public**, à transmettre aux lecteurs, et le **lien de gestion**, personnel, qui permet de publier ses modifications ou d'arrêter le partage. Le lecteur ouvre le lien public et voit le calendrier, sans pouvoir le modifier et sans rien avoir à saisir.

1. J'ai annoté mon calendrier (textes, couleurs, libellés de mois, périodes) et choisi un titre.
2. Je clique sur « Partager », je tape mon adresse et je clique sur « Recevoir le lien par email ».
3. Je reçois un email avec le lien public `https://calendrier.vjeantet.fr/@/girafe-tambour-citron-27`, qui marche aussitôt, et le bouton « Gérer mon calendrier partagé ».
4. J'ouvre « Gérer mon calendrier partagé » dans mon navigateur. Le bandeau sous l'entête affiche alors « Partagé », le lien public, « Copier » et « Arrêter ».
5. Quand je modifie mon calendrier, le bandeau passe en orange et propose « Publier les modifications ».

## Principes acquis

- Le **stockage local reste la source** du calendrier. Le serveur ne sert qu'au partage : ce n'est ni une sauvegarde ni une synchronisation.
- Un navigateur = un calendrier = au plus un partage géré.
- « Authentifié par email » veut dire posséder la boîte : pas de compte ni de mot de passe. Le lien de gestion est la seule preuve. Le navigateur qui crée un partage ne reçoit **ni l'identifiant public ni la clé** : seul l'email les donne.
- Budget nul : offres gratuites de Netlify et de Sweego.
- Un seul domaine : `calendrier.vjeantet.fr` (site, API, expéditeur, liens des emails).
- La variante « tout dans l'URL », sans serveur, est écartée : ni email, ni mise à jour, ni arrêt possible.

## Le partage

### L'instantané

Un instantané est l'objet `{ titre, debut, donnees }` :

- `titre` : le titre lu dans l'URL au moment de publier, éventuellement vide ;
- `debut` : le premier mois du semestre affiché, en `mmaaaa`. Si l'URL n'a pas de date (`/Claire`), c'est le semestre courant ;
- `donnees` : les quatre clés d'annotations, telles que le stockage local les range : `{ jourdetails, jourcouleurs, moislibelles, jourbandes }`.

Le lecteur arrive sur le semestre `debut` et peut naviguer vers les autres, puisque les annotations ne sont pas limitées à six mois. Voir [Comment l'instantané se met à jour](.scratch/partage/issues/04-mise-a-jour-instantane.md).

### Identifiant public

Trois noms communs distincts puis un nombre de 10 à 99, en minuscules, séparés par des traits d'union : `girafe-tambour-citron-27`. Avec environ 1 500 noms, cela fait environ 38 bits.

- Tirage par la fonction de création, avec un générateur cryptographique et sans biais de modulo. En cas de collision, l'écriture conditionnelle (`onlyIfNew`) échoue et la fonction tire à nouveau.
- Un identifiant libéré (partage arrêté ou supprimé) peut être tiré de nouveau.
- L'API n'accepte que la forme canonique. La page `/@/` normalise ce que tape le lecteur (voir [Page du lecteur](#page-du-lecteur-id)).

La liste de noms est décrite dans [Liste de noms communs](#liste-de-noms-communs). Voir [Forme de l'identifiant public](.scratch/partage/issues/05-forme-identifiant-public.md).

### Clé de gestion

- 128 bits aléatoires, encodés en base64url. Le serveur ne garde que leur empreinte SHA-256 et compare les empreintes en temps constant.
- La clé voyage dans le fragment du lien de gestion (`/@/<id>#cle=<clé>`) : elle n'apparaît ni dans les journaux ni dans `Referer`. Vers l'API, elle passe dans l'en-tête `Authorization: Bearer <clé>`, jamais dans l'URL.
- Un partage a **une seule clé active**. La clé émise à la création est active dès l'envoi.
- Une **récupération** émet une clé neuve par partage de l'adresse, rangée comme **clé en attente** (une seule par partage ; une nouvelle récupération la remplace). Elle ne donne aucun droit. Elle ne devient la clé du partage que lorsque l'auteur la **confirme** par un clic explicite ; l'ancienne est alors révoquée. Une clé en attente expire au bout de **48 h**.

Conséquences : un tiers qui demande des liens à la place de l'auteur ne peut rien révoquer ; récupérer ses liens sert aussi à couper un appareil perdu ; un navigateur qui a gardé un lien plus ancien perd ses droits. Rien n'est confirmé au chargement d'une page : les passerelles de messagerie ouvrent les liens, parfois en exécutant le JavaScript. Voir [Confirmation de l'adresse et récupération du lien de gestion](.scratch/partage/issues/07-confirmation-recuperation.md).

### Durées de vie

- Un partage est **lisible dès sa création**. Il n'y a pas d'état « en attente ».
- Un partage que personne n'**ouvre** dans les **7 jours** suivant sa création est supprimé. Ouvrir veut dire une lecture réussie de l'API, qui pose `consulteLe` : un lecteur, ou l'auteur avec sa clé. Un robot de messagerie qui exécute le JavaScript compte comme une ouverture : c'est accepté.
- Ensuite, un partage est supprimé après **12 mois sans activité**, au jour près. L'activité est la plus récente des dates `creeLe`, `publieLe` et `consulteLe`. `consulteLe` est posée par toute lecture réussie : celle d'un lecteur comme celle de l'auteur (vérification de session avec une clé, même remplacée).
- « Arrêter le partage » supprime tout immédiatement.
- Aucun avertissement avant suppression : l'adresse n'est pas conservée. La règle est dite une fois, sous le formulaire de partage et sur la page « Données personnelles » : « Un partage que personne n'ouvre dans les 7 jours est supprimé, tout comme un partage ni publié ni consulté pendant 12 mois. »

Voir [Durées de confirmation et de conservation](.scratch/partage/issues/08-durees-conservation.md) et [Que disent les trois emails](.scratch/partage/issues/14-texte-emails.md#pas-dactivation).

## Navigateur de l'auteur

### État local

Une seule clé globale du stockage local, `partage = { id, cle, empreinte }`, sur le modèle des quatre clés d'annotations. Elle n'existe que dans un navigateur qui a ouvert un lien de gestion. Le jour où les calendriers auront un nom, elle migrera avec les quatre clés.

Un drapeau dans `sessionStorage` note que l'existence du partage a été vérifiée pendant la session.

### Modifications non publiées

- `empreinte` est l'empreinte SHA-256 des quatre clés d'annotations **après préparation** (voir [Validation de l'instantané](#validation-de-linstantané)), sérialisées de façon stable. Le navigateur la range après chaque publication réussie.
- Il la compare à chaque modification et au chargement de la page. Annuler une modification éteint l'indicateur. Le titre et le semestre n'entrent pas dans l'empreinte.

### Vérification de session

Une fois par session (drapeau absent), et à chaque publication, le navigateur qui a `partage` lit le partage avec sa clé :

- partage introuvable (404) : il efface `partage` et revient à l'état « non partagé » ;
- clé `invalide` (remplacée par une récupération confirmée ailleurs) : il efface `partage`, garde ses annotations, revient à l'état « non partagé » et affiche une fois, dans le bandeau, « Ce calendrier est maintenant géré depuis un autre lien. Pour le gérer ici, ouvrez le dernier lien de gestion reçu. » avec « Compris » ;
- sinon, il garde `publieLe` pour l'afficher.

### Le bandeau de partage

Une barre claire entre `#entete` et `#calendrier`, dans le style des boutons de l'entête. Tous les messages et formulaires du partage s'y affichent en ligne ; rien ne flotte au-dessus du calendrier. Le bandeau est **exclu de la mise à l'échelle** de `index.html`, comme la liste `#periodes` : le calendrier garde sa taille et la page défile de la hauteur du bandeau. Le bandeau et le bouton « Partager » sont **masqués à l'impression**.

Le bandeau et le bouton « Partager » n'apparaissent que sur l'**origine canonique**, connue de la page par une constante JS de même valeur que `URL_PUBLIQUE` (voir [Domaine](#domaine-et-configuration-netlify)). Sur une autre origine (prévisualisation), rien ne les remplace.

Le prototype de la branche `prototype/interface-partage` (variante B) donne la mise en page et les textes de départ. Voir [À quoi ressemble l'interface de partage pour l'auteur](.scratch/partage/issues/09-prototype-interface-auteur.md).

| État | Ce qu'affiche le bandeau |
|---|---|
| **Non partagé** | Pas de bandeau. Un bouton « Partager », à côté de « Réinitialiser » et dans le même style. |
| **Formulaire** | Titre « Partager en lecture seule ». Rappel que toute personne qui a le lien pourra consulter le calendrier, et mise en garde sur les notes concernant d'autres personnes. « Sera partagé : « Claire » · à partir de mars 2026 · n jours annotés · n périodes ». Champ email, bouton « Recevoir le lien par email ». Sous le bouton, en note : « Le lien n'est envoyé que par email… », la phrase des durées, puis le lien « Données personnelles ». En pied : « Vous avez déjà partagé ce calendrier ? J'ai déjà un lien ». |
| **Lien envoyé** | Le calendrier est partagé ; le lien public et le lien de gestion sont dans l'email envoyé à `a•••@exemple.fr`. Une fois le message fermé, retour à « Partager ». Partager à nouveau crée un second partage : c'est accepté. |
| **J'ai déjà un lien** | Formulaire « Recevoir à nouveau mes liens » : email, « Recevoir mes liens », « Retour ». La réponse est toujours : « Si des calendriers sont partagés avec a•••@exemple.fr, vous allez recevoir un email. » |
| **Partagé** | Une ligne : point vert, « Partagé », lien public avec « Copier », « publié le <date> », « Arrêter ». Le bouton « Partager » disparaît. |
| **Modifications non publiées** | La même ligne en orange : « Partagé · modifications non publiées » et « Publier les modifications », avec sous le bouton le rappel de ce qui partira (« Claire · à partir d'avril 2026 · n jours annotés », ou « sans titre »). |
| **Arrêter** | Confirmation dans le bandeau : le lien cesse de marcher, l'instantané est supprimé du serveur, les annotations restent. Puis « Partage arrêté. Le lien … ne mène plus à rien », et retour à « Partager ». |
| **Clé remplacée** | Le message unique de la vérification de session, avec « Compris ». |

L'adresse est masquée par le navigateur : première lettre, `•••`, puis `@domaine`.

Messages d'erreur du bandeau :

- 429 de nos fonctions (compteur journalier) : « Trop de demandes aujourd'hui. Réessayez demain. »
- 429 de la règle Netlify (corps qui n'est pas le nôtre) : « Trop de demandes. Réessayez dans quelques minutes. »
- 400 : « Le calendrier n'a pas pu être publié : le serveur a refusé les données. » Le détail va dans la console.
- Titre de plus de 100 caractères, vérifié avant l'envoi : « Titre trop long : 100 caractères au plus ».
- Corps de plus de 100 000 octets, vérifié avant l'envoi : « Calendrier trop volumineux pour être partagé : 112 Ko sur 100 Ko ».
- Échec d'envoi de l'email (502) : « L'email n'a pas pu être envoyé. Réessayez plus tard. »

### Publier

« Publier les modifications » prépare l'instantané à partir de l'URL courante et des quatre clés locales, puis l'envoie par `PUT`. En cas de succès, le navigateur range la nouvelle empreinte et `publieLe`. Un 404 ou une clé refusée suivent les règles de la vérification de session. Publier un calendrier vide est permis : le rappel sous le bouton le rend visible.

### Réinitialiser avec un partage

« Réinitialiser » ne vide que les quatre clés d'annotations. `partage` et l'instantané restent intacts, et l'indicateur s'allume. Quand `partage` existe, la confirmation ajoute : « Le calendrier partagé ne change pas tant que vous ne publiez pas. »

### Navigateur sans clé

Un navigateur sans `partage` n'a aucun lien avec un partage : ses modifications restent locales, sans indicateur. « Partager » y crée **toujours un nouveau partage**, même si l'adresse en a déjà ; l'ancien vit jusqu'à son arrêt ou sa suppression. Pour gérer un partage existant depuis ce navigateur, il faut y ouvrir son lien de gestion, ou passer par « J'ai déjà un lien ».

### Arrivée par le lien de gestion

La page `/@/<id>#cle=<clé>` lit le fragment, le retire de l'URL (`replaceState`), puis lit le partage avec la clé. Elle compare l'empreinte de l'instantané reçu (après préparation) à celle des clés locales préparées.

- **Clé active, calendrier local vide** : rien ne s'affiche. Le navigateur recopie l'instantané dans le stockage local, range `partage`, puis redirige vers `/<titre>/<aaaa>/<mm>`, construit avec le titre et le semestre de l'instantané (`/<aaaa>/<mm>` sans titre).
- **Clé active, calendrier local identique** : rien ne s'affiche. Le navigateur range `partage` et redirige. C'est le cas courant du navigateur qui a créé le partage.
- **Clé active, calendrier local différent** : l'instantané s'affiche en lecture seule, comme chez le lecteur, avec un bandeau bleu et deux choix :
  - « Reprendre le calendrier partagé ici » : remplace les annotations de ce navigateur ;
  - « Garder mes annotations » : elles remplaceront le partage à la prochaine publication. On arrive à l'état « modifications non publiées ».
- **Clé en attente (récupération)** : l'instantané s'affiche en lecture seule avec le bandeau bleu. Il prévient que les navigateurs qui avaient un lien plus ancien perdent le droit de publier, et donne l'heure d'expiration de la clé. Les choix confirment la clé (`POST …/confirmer`) en une seule étape :
  - calendrier local vide ou identique : « Gérer le partage depuis ce navigateur » ;
  - calendrier local différent : « Gérer ici et reprendre le calendrier partagé » ou « Gérer ici et garder mes annotations ».
- **Clé invalide (remplacée ou périmée)** : l'instantané s'affiche en lecture seule avec le bandeau bleu : « Ce lien de gestion n'est plus valable. Le calendrier reste partagé. » et « Demander un nouveau lien », qui ouvre « J'ai déjà un lien » sur la page locale.
- **Partage introuvable** : la page commune (voir [Page du lecteur](#page-du-lecteur-id)), sans bandeau.

« Reprendre » recopie les quatre clés de l'objet **déjà reçu**, sans nouvelle requête, par une seule fonction `remplacerAnnotationsLocales(donnees)`. Après chaque choix, le navigateur range `partage` (avec l'empreinte de l'instantané reçu) et redirige vers `/<titre>/<aaaa>/<mm>`. Deux navigateurs qui ont la même clé publient tous les deux : la dernière publication l'emporte.

Le lien de gestion doit s'ouvrir sur l'origine canonique, où vivent les annotations et `partage`. Voir [Comment la page `/@/<id>` affiche l'instantané](.scratch/partage/issues/16-page-lecteur.md).

## Page du lecteur `/@/<id>`

### Routes

- `/@/<id>` : le semestre `debut` de l'instantané. L'URL reste sans date.
- `/@/<id>/aaaa` : janvier de cette année. `/@/<id>/aaaa/mm` : le mois donné.
- Les flèches de semestre mènent à `/@/<id>/aaaa/mm` et rechargent la page. Le titre n'est jamais dans l'URL du lecteur.
- **Normalisation** : la page passe la saisie en minuscules, retire les accents, et accepte l'espace, le point et le soulignement à la place du trait d'union. Elle remplace ensuite l'URL par la forme canonique (`replaceState`). Aucune correction des fautes de frappe, des pluriels ni des mots proches.
- **Identifiant mal formé** (pas trois noms puis un nombre de 10 à 99) : la page commune, **sans appel à l'API**.

### Ce que voit le lecteur

- **Gardés** : jours fériés, jour courant surligné, numéros de semaine, flèches de semestre, impression (`print.css` tel quel), et la **liste des périodes en lecture seule** : pastille, libellé, dates, mention « non affichée », sans ✕, sans champ et sans choix de couleur. Un clic sur une bande signale sa ligne. La liste est masquée quand le semestre n'a aucune période.
- **Retirés** : les `contenteditable` (titre, jours, noms de mois), la palette du clic droit, le pinceau, la sélection de périodes, « Réinitialiser » et « Partager ». Le lecteur ne voit **aucun bandeau**.
- Le stockage local du lecteur n'est ni lu ni modifié.
- `#titre` affiche le titre de l'instantané, non éditable. `#url` affiche `♥ <origine><chemin courant>` ; c'est cette ligne qui s'imprime.
- `<title>` : « Claire · Calendrier semestriel 2026 » si l'instantané a un titre, sinon « Calendrier semestriel 2026 ».
- Un lien « Données personnelles », à l'écran seulement, masqué à l'impression.

### Chargement et erreurs

L'entête s'affiche tout de suite ; le calendrier est remplacé par « Chargement… ». Chaque chargement fait un seul `GET /api/partages/<id>`, avec `Cache-Control: no-store`, sans cache en `sessionStorage` : une publication se voit au rechargement suivant. À la réponse, la grille et les annotations sont rendues en une fois, puis la mise à l'échelle de `index.html` est relancée.

| Réponse | Affichage |
|---|---|
| 200 | Le calendrier en lecture seule. |
| 404, ou identifiant mal formé | La page commune : « Ce calendrier n'existe pas ou n'est plus partagé. », sans année, sans flèches et sans bandeau. Partage inconnu, arrêté ou supprimé ne se distinguent pas. |
| 429 | « Trop de consultations depuis votre réseau. Réessayez dans une minute. » |
| Réseau ou 5xx | « Le calendrier n'a pas pu être chargé. » avec un bouton « Réessayer ». Jamais « n'existe pas ». |

### Découpe du code d'affichage

`detailsjour.js` et `periodes.js` exposent chacun :

- un **affichage**, qui reçoit un objet ordinaire `{ jourdetails, jourcouleurs, moislibelles, jourbandes }` ;
- une **couche d'édition**, qui écrit dans le stockage local comme aujourd'hui.

La page locale lit les quatre clés locales, appelle l'affichage, puis branche l'édition. La page `/@/` attend la réponse du serveur et appelle seulement l'affichage. La lecture seule vient de l'absence de la couche d'édition : pas d'indicateur `lectureSeule`, pas d'objet « source » à deux adaptateurs. L'asynchronisme reste hors des deux scripts. `Calendrier.afficher` reçoit le titre et le semestre au lieu de les lire seulement dans l'URL. Les jours fériés gardent le dernier mot, comme aujourd'hui.

La page du lecteur et celle de l'auteur arrivant par son lien de gestion partagent ce code d'affichage ; seuls le bandeau et le traitement de la clé s'y ajoutent.

## Les emails

Trois emails, un par demande, et aucun autre : création → 1 email ; « J'ai déjà un lien » → 1 email, que l'adresse soit connue ou non ; publication, confirmation, arrêt → 0. Voir [Que disent les trois emails](.scratch/partage/issues/14-texte-emails.md) et le prototype de la branche `prototype/emails-partage` (variante B, réordonnée).

### Forme commune

- `multipart/alternative` : un HTML à styles en ligne et une version texte brut équivalente. Aucune image.
- **Aucun suivi** : chaque envoi passe `tracking_open: false`, et l'enregistrement DNS `t.calendrier.vjeantet.fr`, qui active le suivi des clics chez Sweego, n'est **jamais créé**. Les liens ne sont donc jamais réécrits.
- Expéditeur : `Calendrier semestriel <partage@calendrier.vjeantet.fr>`.
- `Reply-To` : « Calendrier semestriel » `<alias de contact sur vjeantet.fr>` (par exemple `donnees@vjeantet.fr`). `calendrier.vjeantet.fr` est un CNAME vers Netlify et ne peut pas avoir de MX. Voir [Que devient une réponse aux emails](.scratch/partage/issues/15-reponses-emails.md).
- Liens écrits en entier, avec pour base `URL_PUBLIQUE`.
- Dates absolues, formatées avec le fuseau `Europe/Paris` quel que soit celui de la fonction : « vendredi 13 novembre à 17 h 48 (heure de Paris) ».
- Le titre de l'instantané figure dans l'objet (coupé à 40 caractères, avec « … ») et dans le corps, entre guillemets français. Dans le HTML, il est échappé et n'est jamais un lien. Le risque d'un titre d'hameçonnage envoyé à une adresse quelconque est accepté : 3 envois par adresse et par jour, 100 caractères, expéditeur fixe.
- **Lien public** en tête, dans un encadré vert « À transmettre à vos lecteurs » : URL entière, en police à chasse fixe, cliquable, avec « Lecture seule : ce lien ne permet pas de modifier le calendrier ».
- **Lien de gestion** ensuite, sous l'intertitre « Pour publier vos modifications ou arrêter le partage » : un bouton bleu, à ouvrir « dans le navigateur où vous avez préparé le calendrier », suivi de la note « Ce bouton est personnel : il permet de publier et d'arrêter le partage. Ne transférez pas cet email. »
- En texte brut : `À TRANSMETTRE À VOS LECTEURS :` puis le lien public ; plus bas `POUR PUBLIER OU ARRÊTER (personnel, ne le transmettez pas) :` puis le lien de gestion ; chaque lien seul sur sa ligne.
- Pied en petit et en gris, suivi du lien « Données personnelles » (`/donnees-personnelles`). Il n'invite pas à répondre.

### Création

- Objet : `« <titre> » : votre calendrier est partagé` ; sans titre, `Votre calendrier est partagé`.
- Corps : « « <titre> » est partagé en lecture seule » (sans titre : « Votre calendrier est partagé en lecture seule »), l'encadré du lien public, « Si personne n'ouvre ce calendrier d'ici le <création + 7 j>, il sera supprimé. », puis le bouton « Gérer mon calendrier partagé ».
- Pied : « Vous recevez cet email parce que cette adresse a été saisie sur calendrier.vjeantet.fr. Vous n'avez rien demandé ? Ignorez-le sans ouvrir ses liens : ce partage sera supprimé le <création + 7 j>. Vous pouvez aussi l'arrêter tout de suite avec « Gérer mon calendrier partagé ». »

### Récupération

- Objet : `Votre calendrier partagé « <titre> »` pour un partage (sans titre : `Votre calendrier partagé`), `Vos <n> calendriers partagés` pour plusieurs.
- Introduction : « Chaque bouton est un lien de gestion neuf. Il ne remplace l'ancien que lorsque vous cliquez sur « Gérer le partage depuis ce navigateur ». Les navigateurs qui avaient un lien plus ancien perdent alors le droit de publier. »
- Un bloc par partage, séparé par un filet : titre en entier (ou « Sans titre »), état (« Publié le <date> », ou « Jamais ouvert : il sera supprimé le <création + 7 j> s'il ne l'est pas »), encadré du lien public, bouton « Gérer ce calendrier », « Lien de gestion valable jusqu'au <émission + 48 h> ».
- La note « personnel » une seule fois, en bas.

### Adresse sans partage

- Objet : `Aucun calendrier partagé avec cette adresse`.
- Corps : « Aucun calendrier partagé n'est rattaché à cette adresse. » Les causes possibles : une autre adresse, un partage arrêté, un partage supprimé après 7 jours sans ouverture ou 12 mois sans activité. Puis « Vos annotations sont toujours dans votre navigateur », et un bouton « Ouvrir mon calendrier » vers la racine du site.

Pied de la récupération et de l'email « aucun partage » : « Vous recevez cet email parce que quelqu'un a demandé, sur calendrier.vjeantet.fr, les liens de cette adresse. Si ce n'est pas vous, ignorez-le : vos liens actuels restent valables. »

## API

Netlify Functions dans le même site que le calendrier : pas de CORS, pas de second domaine. Voir [Où héberger l'API et quel service d'email](.scratch/partage/issues/06-hebergement-api.md).

### Garde commune

Voir [Sur quel domaine pointent les liens envoyés par email](.scratch/partage/issues/13-domaine-liens-emails.md).

- Sans la variable `URL_PUBLIQUE`, toutes les fonctions répondent **404**.
- Toute écriture (`POST`, `PUT`, `DELETE`) dont l'en-tête `Origin` diffère de `URL_PUBLIQUE` reçoit **403**, avant tout compteur et tout envoi. Les prévisualisations reçoivent donc le 403.
- **Aucun en-tête CORS** n'est émis.
- Les fonctions ne journalisent **jamais** l'adresse email, l'IP ni la clé de gestion, `console.log` compris.

### Routes

| Route | Clé | Effet | Réponses |
|---|---|---|---|
| `POST /api/partages` | — | Crée un partage et envoie l'email de création. Corps : `{ email, instantane }`. | 201 sans corps (ni identifiant ni clé), 400, 403, 429, 502 |
| `POST /api/liens` | — | Récupération : émet une clé en attente pour chaque partage de l'adresse et envoie un email, même pour une adresse inconnue. Corps : `{ email }`. | 200 identique dans tous les cas, 400, 403, 429, 502 |
| `GET /api/partages/<id>` | facultative | Sans clé : `{ titre, debut, donnees }`. Avec clé : en plus `cle` (`active`, `en-attente` ou `invalide`), `publieLe`, et `cleExpireLe` pour une clé en attente. Ne modifie rien, sauf `consulteLe`. | 200, 404, 429 |
| `PUT /api/partages/<id>` | active | Publie : remplace l'instantané, pose `publieLe`. Corps : l'instantané. | 200 `{ publieLe }`, 400, 401, 403, 404 |
| `DELETE /api/partages/<id>` | active | Arrête : supprime le blob et l'entrée d'index. | 204, 401, 403, 404 |
| `POST /api/partages/<id>/confirmer` | en attente | Confirme : la clé en attente devient la clé du partage, l'ancienne est révoquée. Refusée si elle a plus de 48 h, vérifiées au moment du clic. Sans effet si la clé est déjà active. | 200, 401, 403, 404 |

- 401 : clé absente, inconnue, périmée, ou pas dans l'état requis.
- 400 : `{ "erreur": "<chemin> : <raison>" }`, par exemple `donnees.jourcouleurs.31022026 : date inexistante`. Adresse email absente, de plus de 254 caractères ou sans `@` : 400 aussi.
- 429 de nos fonctions : `{ "erreur": "limite journalière" }` avec `Retry-After` jusqu'à minuit UTC. Le navigateur reconnaît ce corps pour choisir son message.
- 502 : l'appel à Sweego a échoué. Pour une création, la fonction supprime le partage qu'elle vient d'écrire (personne n'en a les liens). Les compteurs ne sont pas décrémentés.
- Toute réponse de `GET` porte `Cache-Control: no-store`.

### Création, pas à pas

1. Garde, puis taille du corps (≤ 100 000 octets) avant `JSON.parse`, puis validation de l'adresse et de l'instantané (`Instantane.verifier`).
2. Lecture des trois compteurs journaliers. Si l'un est atteint : 429, sans rien écrire.
3. Incrément des trois compteurs.
4. Tirage de l'identifiant et de la clé ; écriture de `partages/<id>` (`onlyIfNew`) et de `emails/<empreinte>/<id>`.
5. Envoi de l'email de création.

La récupération suit le même ordre : garde, validation, compteurs, puis une clé en attente par partage de l'adresse (trouvés par `list({ prefix: "emails/<empreinte>/" })`), puis l'email. Un partage tout juste créé peut manquer quelques secondes dans cette liste : c'est accepté.

### Empreintes

- Adresse : HMAC-SHA-256 de l'adresse rognée et mise en minuscules, avec le secret `SECRET_EMPREINTES`. L'adresse en clair n'est jamais stockée : pour la récupération, la personne la retape, et le serveur écrit à l'adresse saisie.
- IP : HMAC-SHA-256 avec le même secret ; le préfixe de la clé Blobs sépare les deux.
- Clé de gestion : SHA-256.

### Stockage (Netlify Blobs)

- Un **module d'accès unique** ouvre le store avec `region: "eu-central-1"` (Francfort) et la cohérence `strong` sur **chaque** appel. Un appel qui oublierait la région écrirait aux États-Unis sans erreur.
- `partages/<id>` : l'instantané validé et resérialisé, jamais le corps brut. **Métadonnées**, lisibles par `getMetadata` sans télécharger l'instantané :
  - `empreinteEmail`, `empreinteCle` ;
  - `cleEnAttente` : `{ empreinte, emiseLe }`, absente hors récupération ;
  - `creeLe`, `publieLe` (égale à `creeLe` à la création), `consulteLe` (jour UTC, absente tant que personne n'a ouvert le partage).
- `emails/<empreinteEmail>/<id>` : vide, l'index des partages d'une adresse.
- `limites/<aaaa-mm-jj>/adresse/<empreinte>`, `limites/<aaaa-mm-jj>/ip/<empreinte-ip>`, `limites/<aaaa-mm-jj>/total` : les compteurs.
- `consulteLe` est réécrite au plus une fois par jour et par partage : la lecture réécrit le blob avec ses nouvelles métadonnées en `onlyIfMatch` sur l'etag lu, pour ne pas écraser une publication simultanée. Un échec de cette écriture n'empêche pas la réponse 200.

### Validation de l'instantané

Le serveur est strict, le navigateur prépare : un navigateur à jour ne se fait jamais rejeter. Voir [Règles de validation de l'instantané](.scratch/partage/issues/11-validation-instantane.md).

**Un seul fichier**, `public/static/js/calendrier.de/instantane.js`. Il définit la variable globale `Instantane` et se termine par `module.exports` quand `module` existe ; la fonction le charge par `require` avec un chemin relatif. Il contient :

- `COULEURS_JOUR`, déplacé depuis `detailsjour.js`, qui le lit ensuite là (`instantane.js` est chargé avant dans `index.html`) ;
- `preparer(cles, titre, debut)`, pour le navigateur ;
- `verifier(instantane)`, pour le serveur, qui renvoie la première erreur ou `null` ;
- la sérialisation stable et l'empreinte des quatre clés préparées, pour le navigateur.

**Règles de `verifier`** (rejet en bloc à la première erreur, 400, sans rien nettoyer) :

- Une clé d'annotation absente vaut une clé vide. Un champ inconnu, à n'importe quel niveau, est rejeté.
- `jourdetails` et `jourcouleurs` en `jjmmaaaa`, `moislibelles` en `mmaaaa`, `d` et `f` des périodes de `jourbandes` en `aaaammjj`. Format strict, **date réelle**, années `0001` à `9999`.
- Périodes `{ c, l, d, f }` : `d ≤ f`, `c` pris dans `COULEURS_JOUR`. Valeurs de `jourcouleurs` prises dans `COULEURS_JOUR`.
- `debut` en `mmaaaa`, mois `01` à `12`, mêmes années.
- Titre : 100 caractères au plus. Aucun autre plafond que les 100 000 octets du corps.
- Caractères de contrôle (U+0000 à U+001F, U+007F à U+009F) refusés dans toutes les chaînes, titre compris. La chaîne vide est acceptée partout.

**Préparation** (`preparer`), qui ne touche qu'à la copie envoyée, jamais au stockage local :

- Textes de jour : toute suite d'espaces (espace insécable, `\n`, `\t` et caractères de contrôle compris) devient une seule espace, puis le texte est rogné. Un texte vide est retiré.
- Libellés de mois : même traitement, mais la chaîne vide est gardée.
- Couleurs de jour inconnues : retirées.
- Périodes : même chemin que `charger()` dans `periodes.js` (filtre, puis fusion). Une couleur inconnue devient `gris`. Le libellé est traité comme un texte de jour.
- Clés hors format ou dates inexistantes : retirées.
- Titre : espaces traités de la même façon. Au-delà de 100 caractères, le navigateur refuse de publier plutôt que de tronquer. Au-delà de 100 000 octets pour le corps, de même.

### Limitation

Deux étages. Voir [Limitation des envois et des lectures](.scratch/partage/issues/10-limitation-envois-lectures.md).

1. **Règles `rateLimit` de Netlify**, par IP, avant toute exécution :
   - n° 1 : `POST /api/partages` et `POST /api/liens`, servis par **une seule fonction** déclarée avec un tableau `path` : **5 requêtes par 180 s** ;
   - n° 2 : `/api/partages/*` (lecture, publication, arrêt, confirmation) : **60 requêtes par 60 s**. Ce motif ne couvre pas `/api/partages`, donc les deux règles ne se chevauchent pas.
2. **Compteurs journaliers dans Blobs**, communs à la création et à la récupération, sur le jour calendaire UTC : **3** par adresse, **10** par IP, **90** au total (sous les 100 emails par jour de Sweego). Vérifiés avant, incrémentés seulement pour une demande acceptée, sans écriture conditionnelle : deux requêtes simultanées peuvent dépasser un seuil d'une unité.

Pas de compteur sur les lectures. Avec 1 000 partages actifs, une IP qui lit au maximum pendant un an a environ 0,11 de chance de tomber sur un partage : c'est accepté.

### Tâche quotidienne

Une seule fonction planifiée, une fois par jour (30 s au plus par exécution ; ce qui n'est pas fini reprend le lendemain) :

- supprime les partages sans `consulteLe` dont `creeLe` a plus de 7 jours ;
- supprime les partages dont la dernière activité (`creeLe`, `publieLe`, `consulteLe`) a plus de 12 mois ;
- pour chaque suppression, efface aussi l'entrée `emails/<empreinte>/<id>` ;
- retire les clés en attente de plus de 48 h ;
- efface les préfixes `limites/<jour>/` des jours passés : une empreinte d'IP vit au plus environ 48 h.

### Fonctions et fichiers

- `netlify/functions/envois.mjs` : `POST /api/partages` et `POST /api/liens`, règle n° 1.
- `netlify/functions/partage.mjs` : `/api/partages/*`, règle n° 2.
- `netlify/functions/menage.mjs` : la tâche quotidienne (`schedule: "@daily"`).
- Modules partagés à côté : accès au store, garde, empreintes, tirage de l'identifiant, envoi par Sweego et gabarits des emails.
- La liste `donnees/noms-communs/noms.txt` est embarquée par `included_files` dans `netlify.toml`. Seule la fonction d'envois l'utilise ; le navigateur n'en a pas besoin.
- Un `package.json` à la racine déclare `@netlify/blobs`. Le site reste sans commande de build.

### Variables d'environnement

Dans l'interface de Netlify, jamais dans `netlify.toml` :

- `URL_PUBLIQUE` : `https://calendrier.vjeantet.fr` ;
- `SECRET_EMPREINTES` : le secret HMAC des adresses et des IP ;
- `SWEEGO_CLE_API` : la clé d'API de Sweego ;
- `CONTACT_EMAIL` : l'alias de contact, pour le `Reply-To`.

On teste l'API en local avec `netlify dev` et une configuration propre. Avec `EMAIL_SIMULE=1`, jamais posée sur Netlify, la fonction n'appelle pas Sweego et écrit l'email dans la console : c'est la seule exception à la règle de journalisation, et elle ne vaut qu'en local.

## Domaine et configuration Netlify

- Un seul site Netlify, `calendrier-vjeantet`, servi sur `calendrier.vjeantet.fr`. Le site `calendrier.sodadi.fr` est supprimé par l'auteur, sans redirection ni déménagement des annotations.
- `netlify.toml` gagne :
  - une règle `[[redirects]]` de domaine, placée avant `/*` : `from = "https://calendrier-vjeantet.netlify.app/*"`, `to = "https://calendrier.vjeantet.fr/:splat"`, `status = 301`, `force = true`. Les prévisualisations ne sont pas touchées ;
  - un en-tête `X-Robots-Tag: noindex` sur `/@/*` (`[[headers]]`) ;
  - `[functions]` avec `included_files` pour la liste de noms.
- Une fonction à chemin personnalisé passe avant la réécriture `/* → /index.html` : `/api/*` n'est pas rendu par `index.html`.
- Le risque qu'un abus épuise les 300 crédits mensuels et mette tout le compte en pause, site statique compris, est accepté. Le README le signale.

## Page « Données personnelles »

Voir [Contenu de la page « Données personnelles »](.scratch/partage/issues/12-page-donnees-personnelles.md). Le ticket fixe le plan et les formulations sensibles ; le texte final s'écrit à l'implémentation.

- **Fichier statique** `public/donnees-personnelles.html`, sans JavaScript, qui reprend `calendrier.css` pour la typographie, servi à `/donnees-personnelles`. Un calendrier titré « donnees-personnelles » n'est plus joignable par cette adresse : c'est accepté.
- **Liée** depuis le formulaire de partage (sous la phrase des durées), les trois emails et la page `/@/<id>` (écran seulement). Pas de pied de page sur le calendrier.
- **Périmètre** : tout le site, partage ou non.
- **Forme** : courte, organisée en questions (qui, quelles données, pourquoi, combien de temps, qui d'autre les voit, quels droits), à la première personne.
- **Responsable** : Valère Jeantet, à titre personnel. **Contact** : l'alias email sur `vjeantet.fr`, qui redirige vers sa boîte. Droit de réclamation auprès de la CNIL.
- **Droits en libre-service** : « J'ai déjà un lien » vaut droit d'accès ; « Arrêter le partage » vaut droit à l'effacement, immédiat. Le contact sert au reste.
- **Bases légales**, une phrase chacune : exécution du service demandé (art. 6.1.b) pour l'adresse, son empreinte, l'instantané, l'empreinte de la clé et les dates ; intérêt légitime à protéger le service contre les abus (art. 6.1.f) pour les compteurs de limitation.
- **Tableau** :

  | Donnée | Où | Combien de temps |
  |---|---|---|
  | Annotations du calendrier | votre navigateur (stockage local) | jusqu'à « Réinitialiser » ou l'effacement par le navigateur |
  | Instantané (titre, annotations, semestre) | Netlify Blobs, Francfort | jusqu'à l'arrêt du partage, ou 12 mois sans publication ni consultation ; 7 jours si personne ne l'ouvre |
  | Empreinte de l'adresse email (jamais l'adresse en clair) | Netlify Blobs, Francfort | comme le partage |
  | Empreinte de la clé de gestion | Netlify Blobs, Francfort | comme le partage ; 48 h pour une clé en attente |
  | Dates de création, de publication et de consultation (au jour près) | Netlify Blobs, Francfort | comme le partage |
  | Compteurs de limitation (empreintes de l'adresse et de l'IP) | Netlify Blobs, Francfort | 48 h environ, au plus |
  | Adresse email | fonctions Netlify, États-Unis | le temps de la requête, jamais enregistrée |
  | Adresse email en clair | journaux de Sweego (Mindbaz, France) | 7 jours |
  | Adresse IP et requêtes | journaux techniques de Netlify et de `code.jquery.com` | durée fixée par eux (lien vers le DPA de Netlify) |
  | Vos messages, réponses aux emails du partage comprises | ma boîte email (OVH, France) | le temps de traiter votre demande |

- **Formulations à reprendre sur le fond** :
  - transferts : « Les fonctions de Netlify s'exécutent aux États-Unis. Votre adresse y transite le temps de la requête, sans y être enregistrée. Netlify encadre ces transferts par le cadre de protection des données UE–États-Unis et par des clauses contractuelles types. » ;
  - suivi : « Les emails ne comportent aucun suivi des ouvertures ni des clics. » ;
  - tiers : « Un instantané est lisible par toute personne qui a le lien public. Vous êtes responsable de ce que vous y publiez : n'y mettez rien que vous ne montreriez pas, comme une information de santé sur un proche. » ;
  - durées : la phrase du formulaire de partage.
- **Journaux de Netlify** : mentionnés sans chiffre, avec un lien vers le DPA (`https://www.netlify.com/pdf/netlify-dpa.pdf`).

## Liste de noms communs

Voir [Forme de l'identifiant public](.scratch/partage/issues/05-forme-identifiant-public.md) et [la recherche sur la liste](.scratch/partage/recherches/03-liste-noms-communs.md).

- **Source** : Lexique 4.10, sous CC BY-SA 4.0 (licence du `README-Lexique.txt` de l'archive). Si BY-NC se confirme, repli sur Lexique 3.83.
- **Filtres automatiques** : nom, forme de base au singulier, `a-z` seulement, 4 à 8 lettres, prévalence ≥ 95 %, fréquence ≥ 1 par million, emploi dominant comme nom, sans homophone fréquent, pas deux mots à une lettre près.
- **Relecture** : un agent pré-trie et marque les candidats à écarter ; l'auteur tranche. Sont écartés les mots connotés (grossiers, morbides, violents, sexuels, religieux), les anglicismes d'orthographe incertaine, les mots en `oe`, l'un des deux mots de chaque paire masculin/féminin et les variantes de la réforme de 1990.
- **Taille** : tous les mots qui survivent (environ 1 450 à 1 550), sans tronquer, avec un plancher de 1 024. En dessous, on relâche la fréquence avant la prévalence.
- **Fichiers** : `donnees/noms-communs/noms.txt` (un nom par ligne, CC BY-SA 4.0), `LICENCE`, `SOURCE.md` (attribution, citation, filtres, date, règle de relecture). Le script d'extraction, versionné à côté, est sous Apache 2.0 ; Lexique ne l'est pas. Le README signale l'exception de licence.
- La liste se modifie librement : retirer un mot ne touche pas les identifiants attribués, que le serveur retrouve par leur chaîne exacte.

## Travail à faire

Lots indépendants autant que possible, dans un ordre qui permet de les livrer un par un. Chacun a vocation à devenir un ticket `ready-for-agent`, sauf mention contraire.

| Lot | Contenu | Dépend de |
|---|---|---|
| 1. Liste de noms | Script d'extraction depuis Lexique 4.10, pré-tri, fichiers de `donnees/noms-communs/`, exception de licence dans le README. La relecture finale est `ready-for-human`. | — |
| 2. `instantane.js` | `COULEURS_JOUR` déplacé, `preparer`, `verifier`, sérialisation stable et empreinte ; tests avec `node --test`, sans dépendance. | — |
| 3. Affichage et édition séparés | Découpe de `detailsjour.js` et `periodes.js`, `Calendrier.afficher(titre, semestre)`, `remplacerAnnotationsLocales`. Les captures existantes ne doivent pas changer (`compare.sh`). | 2 |
| 4. Fondations de l'API | `package.json`, module d'accès au store, garde (`URL_PUBLIQUE`, `Origin`), empreintes, `netlify.toml` (redirection de domaine, `X-Robots-Tag`, `included_files`), `EMAIL_SIMULE`. | — |
| 5. Création et récupération | Fonction d'envois : tirage de l'identifiant, compteurs, emails (gabarits HTML et texte, Sweego, `Reply-To`), règle n° 1. | 1, 2, 4 |
| 6. Lecture, publication, arrêt, confirmation | Fonction `partage`, `consulteLe`, règle n° 2. | 2, 4 |
| 7. Tâche quotidienne | Fonction `menage`. | 4 |
| 8. Page du lecteur | Route `/@/<id>[/aaaa[/mm]]` dans `analyserChemin`, normalisation, chargement et erreurs, liste des périodes en lecture seule, `<title>`, lien « Données personnelles ». | 3, 6 |
| 9. Bandeau de l'auteur | Bouton « Partager », formulaire, lien envoyé, « J'ai déjà un lien », ligne « Partagé », modifications non publiées, publier, arrêter, vérification de session, clé remplacée, confirmation de « Réinitialiser », masquage hors origine canonique et à l'impression, exclusion de la mise à l'échelle. | 2, 5, 6 |
| 10. Arrivée par le lien de gestion | Lecture et retrait du fragment, comparaison des empreintes, bandeau bleu et ses choix, confirmation d'une clé en attente, redirection. | 8, 9 |
| 11. Page « Données personnelles » | `public/donnees-personnelles.html`. | — |
| 12. Captures | Voir ci-dessous. | 8, 9, 10, 11 |
| 13. README | `calendrier.vjeantet.fr` au lieu de `calendrier.sodadi.fr`, risque de pause du compte, règle « ne jamais créer `t.calendrier.vjeantet.fr` », exception de licence de la liste. | — |

### Captures à ajouter

`outils/captures/` ne connaît aujourd'hui que la page locale. Pour les nouvelles captures :

- `serveur.py` simule l'API : un identifiant de démonstration qui renvoie l'instantané de la fixture, un qui renvoie 404, un 429, un 500, un dont la réponse est retenue (état « Chargement… »), et des réponses avec clé `active`, `en-attente` et `invalide`. Les écritures répondent comme l'API, y compris le 429 journalier, le 429 de Netlify et le 400.
- `fixture.js` remplace l'origine canonique par l'origine locale, pour que le bandeau s'affiche ; remplit `partage` à la demande ; et rejoue les gestes indiqués dans l'URL (clic sur « Partager », saisie d'une adresse, envoi, modification d'un jour) pour atteindre chaque état du bandeau. Aucun état de démonstration n'entre dans le code du site.

Scénarios, à 1440 × 900 sauf mention contraire :

- **Page du lecteur `/@/`** :
  - écran : semestre `debut`, autre semestre (`/@/<id>/aaaa/mm`), liste des périodes en lecture seule (1200 × 1500), « Chargement… », page commune (404), identifiant mal formé et saisie normalisée, 429, erreur réseau avec « Réessayer » ;
  - impression : semestre `debut`.
- **Page « Données personnelles »** : écran à 1440 × 900 et à 390 × 844.
- **Bandeau de l'auteur** (sur `/Claire/2026/03` annoté) :
  - formulaire (aussi à 1000 × 700, pour la hauteur), lien envoyé, « J'ai déjà un lien » et sa réponse ;
  - ligne « Partagé », modifications non publiées avec le rappel, confirmation d'« Arrêter », partage arrêté, clé remplacée ;
  - messages de limitation : « Réessayez demain », « Réessayez dans quelques minutes » ;
  - messages de validation : refus du serveur (400), titre trop long, calendrier trop volumineux ;
  - impression avec un partage actif : le bandeau et le bouton ne s'impriment pas.
- **Arrivée par le lien de gestion** : calendrier local différent (« Reprendre / Garder »), récupération avec calendrier identique (un bouton) et différent (deux boutons), lien de gestion qui n'est plus valable.

## Prérequis hors code

À faire par l'auteur, avant la mise en ligne :

- Créer l'alias de contact sur `vjeantet.fr` (par exemple `donnees@vjeantet.fr`), redirigé vers sa boîte.
- Ouvrir un compte Sweego (offre gratuite, sans carte) et vérifier le domaine `calendrier.vjeantet.fr` : les deux CNAME demandés par Sweego (Return-Path/SPF et DKIM) et un enregistrement DMARC. Aucun ne doit porter sur le nom `calendrier.vjeantet.fr` lui-même, qui est un CNAME vers Netlify. **Ne jamais créer `t.calendrier.vjeantet.fr`.**
- Poser les variables d'environnement sur le site Netlify.
- Supprimer le site `calendrier.sodadi.fr`.
- Relire la liste de noms communs (lot 1).

## À vérifier à l'implémentation

- `X-Robots-Tag` sur `/@/*`, une route réécrite vers `index.html` : non documenté, à tester sur une prévisualisation. S'il ne s'applique pas, la page `/@/` ajoute `<meta name="robots" content="noindex">` par script.
- Netlify sert-il `public/donnees-personnelles.html` à `/donnees-personnelles` ? Sinon, l'adresse devient `/donnees-personnelles.html` partout.
- La licence de Lexique 4.10 (BY-SA ou BY-NC) : écrire aux auteurs est souhaitable, rien n'en dépend.

## Hors périmètre

- « Copier dans mon calendrier » (import d'un instantané chez le lecteur) : remis à plus tard. Le format de l'instantané le permettra sans autre décision, et `remplacerAnnotationsLocales` existera déjà.
- Plusieurs calendriers par auteur : un autre chantier. La clé `partage` migrera avec les quatre clés d'annotations.
- Rapatrier jQuery dans `public/static/` : cela touche tout le site. La page « Données personnelles » déclare `code.jquery.com` en attendant.
