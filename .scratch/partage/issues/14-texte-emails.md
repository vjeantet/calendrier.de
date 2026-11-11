# Que disent les trois emails

Type: prototype
Status: resolved
Blocked by: 13
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Quels sont l'objet, l'expéditeur (nom affiché et adresse) et le corps des trois emails ? Comment y sont présentés le lien public et le lien de gestion ? Les trois emails sont fixés par [Confirmation de l'adresse et récupération du lien de gestion](07-confirmation-recuperation.md) :
- **création** : confirmer le partage ;
- **récupération** : liste de tous les partages de l'adresse, en attente compris, chacun avec une clé neuve ;
- **récupération pour une adresse sans partage** : même réponse côté formulaire, mais un email qui dit qu'aucun partage n'existe.

À trancher :
- texte seul ou texte + HTML ;
- comment distinguer le lien public, à transmettre, du lien de gestion, à garder pour soi ;
- comment dire le délai de 48 h (voir [Durées de confirmation et de conservation](08-durees-conservation.md)) ;
- comment présenter le titre de l'instantané (100 caractères au plus, voir [Règles de validation de l'instantané](11-validation-instantane.md)) dans l'objet ou dans le corps ;
- le lien vers la page « Données personnelles » (voir [Contenu de la page « Données personnelles »](12-page-donnees-personnelles.md)).

Contraintes acquises : aucun suivi des ouvertures ni des clics, pas de réécriture de lien, et un seul email par demande. Le domaine des liens dépend de [Sur quel domaine pointent les liens envoyés par email](13-domaine-liens-emails.md).

## Answer

Prototype : branche jetable `prototype/emails-partage` (commit `e8a991c`, jamais fusionnée), fichier `public/prototype-emails.html`. Trois variantes ont été comparées : A « Texte seul », B « Bouton + encadré », C « Un seul lien ». Pour le relancer : `outils/captures/serveur.py 8765`, puis `/prototype-emails.html?variant=B&cas=creation` (la barre du bas fait défiler variantes et cas, et bascule en largeur téléphone). Les textes du prototype précèdent les décisions ci-dessous : c'est ce ticket qui fait foi.

### Pas d'activation

L'auteur l'a tranché en réagissant au prototype : **un partage est actif dès sa création**. L'email de création donne le lien public, qui marche aussitôt, et le lien de gestion pour publier ou arrêter. Le navigateur qui crée le partage ne reçoit toujours ni l'identifiant ni la clé : seul l'email donne les liens, et c'est ce qui prouve qu'on possède la boîte.

1. **Plus d'état « en attente ».** Plus de bouton « Activer le partage », plus d'aperçu avant activation, plus de délai de 48 h pour un partage. La métadonnée `etat` disparaît.
2. **Suppression d'un partage que personne n'ouvre en 7 jours.** « Ouvert » veut dire une lecture réussie qui pose `consulteLe` : un lecteur, ou l'auteur avec sa clé. La tâche quotidienne efface un partage sans `consulteLe` 7 jours après `creeLe`. Ensuite, la règle des 12 mois sans activité s'applique telle quelle. Raison : une adresse tapée par un tiers ne doit pas rester 12 mois sur le serveur. Limite acceptée : un robot de messagerie qui exécute le JavaScript d'un lien compte comme une ouverture.
3. **Lien de gestion de la création.** Sa clé est active dès l'envoi. L'ouvrir range la clé dans le navigateur selon les règles de [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md), sans clic de confirmation.
4. **Récupération inchangée.** La clé neuve reste **en attente** 48 h. Elle ne devient la clé du partage qu'au clic « Gérer le partage depuis ce navigateur » (`POST …/confirmer`), qui révoque l'ancienne. L'email liste tous les partages de l'adresse.
5. **Bandeau après l'envoi.** Il dit que le calendrier est partagé et que le lien public et le lien de gestion sont dans l'email envoyé à a•••@exemple.fr. Une fois le message fermé, il revient à « Partager », comme décidé dans [À quoi ressemble l'interface de partage pour l'auteur](09-prototype-interface-auteur.md). Partager à nouveau crée un second partage : c'est accepté.
6. **Phrase des durées** (formulaire de partage et page « Données personnelles ») : « Un partage que personne n'ouvre dans les 7 jours est supprimé, tout comme un partage ni publié ni consulté pendant 12 mois. »

Écarté : garder l'activation. Elle rendait le lien public inutilisable avant un clic, alors que l'auteur veut le transmettre tout de suite.

### Les trois emails

**Variante retenue : B, HTML + texte, réordonnée : le lien public d'abord.**

1. **Format.** `multipart/alternative` : un HTML à styles en ligne et une version texte brut équivalente. Aucune image, aucun suivi (voir [Où héberger l'API et quel service d'email](06-hebergement-api.md)). Les liens sont écrits en entier, en `https://calendrier.vjeantet.fr/…`, avec pour base `URL_PUBLIQUE` (voir [Sur quel domaine pointent les liens envoyés par email](13-domaine-liens-emails.md)).
2. **Expéditeur** : `Calendrier semestriel <partage@calendrier.vjeantet.fr>`, le nom de la page (`<title>`).
3. **Objets.**
   - création : `« <titre> » : votre calendrier est partagé` ;
   - récupération : `Votre calendrier partagé « <titre> »` pour un partage, `Vos <n> calendriers partagés` pour plusieurs ;
   - adresse sans partage : `Aucun calendrier partagé avec cette adresse`.
   Le titre est coupé à 40 caractères, avec « … ».
4. **Titre de l'instantané.** Il figure dans l'objet (tronqué) et dans le corps, entre guillemets français. Dans le HTML, il est échappé et n'est jamais un lien. **Risque accepté** : un tiers peut écrire à n'importe quelle adresse avec un titre d'hameçonnage (cas « titre piégé » du prototype). Ce qui l'encadre : la limite de 3 envois par adresse et par jour (voir [Limitation des envois et des lectures](10-limitation-envois-lectures.md)), le titre limité à 100 caractères (voir [Règles de validation de l'instantané](11-validation-instantane.md)) et l'expéditeur fixe. Une messagerie en texte brut peut rendre cliquable un `www.…` écrit dans le titre : accepté aussi.
5. **Les deux liens, distingués par leur forme et leur place.**
   - **Lien public** en tête, dans un encadré vert intitulé « À transmettre à vos lecteurs ». L'URL entière est affichée en police à chasse fixe et cliquable, avec la mention « Lecture seule : ce lien ne permet pas de modifier le calendrier ».
   - **Lien de gestion** ensuite, sous l'intertitre « Pour publier vos modifications ou arrêter le partage ». C'est un bouton bleu, « Gérer mon calendrier partagé » (« Gérer ce calendrier » dans la récupération), à ouvrir « dans le navigateur où vous avez préparé le calendrier ». Il est suivi de la note : « Ce bouton est personnel : il permet de publier et d'arrêter le partage. Ne transférez pas cet email. »
   - En texte brut : `À TRANSMETTRE À VOS LECTEURS :` puis le lien public, et plus bas `POUR PUBLIER OU ARRÊTER (personnel, ne le transmettez pas) :` puis le lien de gestion, chacun seul sur sa ligne.
6. **Dates.** Elles sont absolues, à l'heure de Paris, formatées avec le fuseau `Europe/Paris` quel que soit celui de la fonction. Exemple : « vendredi 13 novembre à 17 h 48 (heure de Paris) ».
   - Création : « Si personne n'ouvre ce calendrier d'ici le <date + 7 j>, il sera supprimé. »
   - Récupération, pour chaque partage : son état (« Publié le <date> », ou « Jamais ouvert : il sera supprimé le <date + 7 j> s'il ne l'est pas »), puis « Lien de gestion valable jusqu'au <date + 48 h> ».
7. **Corps de l'email de création.** Un titre, « « <titre> » est partagé en lecture seule ». Ensuite, l'encadré du lien public et la phrase des 7 jours. Puis la section du lien de gestion. Enfin le pied.
8. **Corps de l'email de récupération.** Une phrase d'introduction : « Chaque bouton est un lien de gestion neuf. Il ne remplace l'ancien que lorsque vous cliquez sur « Gérer le partage depuis ce navigateur ». Les navigateurs qui avaient un lien plus ancien perdent alors le droit de publier. » Puis un bloc par partage, séparé par un filet : le titre en entier, son état, l'encadré du lien public, le bouton de gestion et sa date limite. La note « personnel » vient une seule fois, en bas.
9. **Corps de l'email « aucun partage ».** « Aucun calendrier partagé n'est rattaché à cette adresse. » Ensuite, les causes possibles : une autre adresse, un partage arrêté, un partage supprimé après 7 jours sans ouverture ou 12 mois sans activité. Puis « Vos annotations sont toujours dans votre navigateur », et un bouton « Ouvrir mon calendrier » vers la racine du site.
10. **Pieds, en petit et en gris, suivis du lien « Données personnelles »** (`/donnees-personnelles`, voir [Contenu de la page « Données personnelles »](12-page-donnees-personnelles.md)) :
    - création : « Vous recevez cet email parce que cette adresse a été saisie sur calendrier.vjeantet.fr. Vous n'avez rien demandé ? Ignorez-le sans ouvrir ses liens : ce partage sera supprimé le <date + 7 j>. Vous pouvez aussi l'arrêter tout de suite avec « Gérer mon calendrier partagé ». » ;
    - récupération et « aucun partage » : « Vous recevez cet email parce que quelqu'un a demandé, sur calendrier.vjeantet.fr, les liens de cette adresse. Si ce n'est pas vous, ignorez-le : vos liens actuels restent valables. »

Écartées :
- **A (texte seul)** : les deux liens se ressemblent, et la clé longue s'étale en clair.
- **C (un seul lien, jamais le lien public)** : l'auteur doit passer par le site pour obtenir le lien à transmettre. Cela contredit le point 5 de [Confirmation de l'adresse et récupération du lien de gestion](07-confirmation-recuperation.md).

Les formulations se reprennent à l'implémentation ; la structure, l'ordre des liens et les dates sont fixés ici.

Pas d'ADR : le texte se change sans coût. Le retrait de l'activation se défait aussi avant l'implémentation.
