# Confirmation de l'adresse et récupération du lien de gestion

Type: grilling
Status: resolved
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Comment se déroulent la confirmation de l'adresse et la récupération du lien de gestion, et quelles protections faut-il ?

- Les scanners de liens des messageries (Outlook Safe Links, antivirus) ouvrent les liens reçus, parfois en exécutant le JavaScript. Le fragment `#cle=` n'atteint pas le serveur, mais une page qui confirme automatiquement au chargement pourrait être confirmée par un robot. Confirmation automatique ou par un clic explicite ?
- « J'ai déjà un lien » : la réponse doit être identique que l'adresse soit connue ou non (anti-énumération) ; un email doit-il partir même pour une adresse inconnue ?
- Plusieurs partages pour une même adresse (deux navigateurs) : l'email de récupération les liste tous ?
- Repartager depuis un navigateur qui a perdu sa clé : nouveau partage ou récupération ?
- Rotation de la clé de gestion : chaque email de récupération en émet-il une nouvelle ?
- Combien d'emails chaque parcours envoie-t-il ? Les seuils de limitation en découlent, dans [Limitation des envois et des lectures](10-limitation-envois-lectures.md).

## Answer

Point de départ : le serveur ne garde que l'**empreinte** de la clé de gestion et l'empreinte HMAC de l'adresse. Il ne peut donc ni renvoyer une clé existante, ni écrire à une adresse ailleurs qu'au moment où elle est tapée.

1. **Confirmation par un clic explicite.** Ouvrir le lien de gestion d'un partage **en attente** affiche un aperçu de l'instantané et un bouton « Activer le partage ». Rien n'est confirmé au chargement : les passerelles de messagerie (Safe Links, Proofpoint, Mimecast…) ouvrent parfois les liens en exécutant le JavaScript, fragment `#cle=` compris. Un robot ne doit pas pouvoir faire passer de 48 h à 12 mois la conservation d'un partage que la personne n'a pas demandé. Ouvrir le lien de gestion d'un partage **actif** ne change rien côté serveur : le navigateur vérifie la clé puis applique les règles de [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md).
2. **« J'ai déjà un lien » : réponse identique, et un email dans tous les cas.** Le popover répond toujours « Si des calendriers sont partagés avec cette adresse, vous allez recevoir un email ». Pour une adresse sans partage, l'email le dit (« Aucun calendrier partagé n'est rattaché à cette adresse… »). La personne qui s'est trompée d'adresse le sait, et la durée de traitement ne trahit pas si l'adresse est connue. Le coût en quota est le même que pour le formulaire de création, et les deux relèvent de la même limitation.
3. **Clé de gestion : remplacement à l'usage.** Toute récupération émet une clé neuve, rangée comme **clé en attente** (une seule par partage ; une nouvelle récupération la remplace). Jusqu'au clic, elle ne donne aucun droit : ni publier ni arrêter. Le clic « Gérer le partage depuis ce navigateur » en fait la clé du partage et révoque l'ancienne. Une clé en attente expire au bout du délai de confirmation des partages en attente (chiffre tranché dans [Durées de confirmation et de conservation](08-durees-conservation.md)). Le serveur range sa date d'émission, la refuse si elle est périmée au moment du clic, et la tâche quotidienne efface les clés périmées. Conséquences :
   - un tiers qui demande des liens à la place de l'auteur ne peut rien révoquer ;
   - récupérer le lien sert aussi à couper un appareil perdu ;
   - deux navigateurs qui ont ouvert le même email gardent la même clé ; un navigateur qui a ouvert un lien plus ancien perd ses droits.
   Écartés : la clé stockée chiffrée et renvoyée telle quelle (on perdrait « empreinte seulement », et un appareil perdu garderait ses droits) ; le remplacement dès l'envoi (n'importe qui connaissant l'adresse couperait l'auteur à volonté) ; les clés multiples toutes valides (un appareil perdu ne se coupe qu'en arrêtant le partage).
4. **Repartager depuis un navigateur sans clé crée toujours un nouveau partage**, même si l'adresse en a déjà. L'ancien vit jusqu'à son arrêt ou sa suppression pour inactivité. Sous le champ email, le popover oriente : « Vous avez déjà partagé ce calendrier ? J'ai déjà un lien ».
5. **Un seul email de récupération** liste tous les partages de l'adresse, **en attente compris** : titre, date de dernière publication (ou « en attente de confirmation »), lien public et lien de gestion. Pour un partage en attente, la récupération remplace sa clé (le lien de l'email de création cesse de marcher) **sans prolonger** le délai de confirmation, compté depuis la création.
6. **Un email par demande, aucun autre.** Création → 1 email, « J'ai déjà un lien » → 1 email, que l'adresse soit connue ou non. Confirmation, publication, arrêt → 0. Aucun avertissement avant suppression, puisque l'adresse n'est pas conservée.
7. **Navigateur dont la clé a été remplacée.** Il l'apprend à la vérification de session ou à la publication. Il efface `partage`, garde ses annotations, revient à l'état « sans clé » et affiche une fois : « Ce calendrier est maintenant géré depuis un autre lien. Pour le gérer ici, ouvrez le dernier lien de gestion reçu. »
8. **Lien de gestion qui ne vaut plus rien.** Deux cas distincts :
   - partage disparu (arrêté, supprimé, jamais confirmé à temps) : la page commune « Ce calendrier n'existe pas ou n'est plus partagé » ;
   - partage actif mais clé remplacée ou périmée : « Ce lien de gestion n'est plus valable. Le calendrier reste partagé. Demander un nouveau lien → J'ai déjà un lien ».
   Distinguer ne révèle rien : qui a l'URL connaît l'identifiant, et le lien public dit déjà si le partage est actif.
9. **API.**
   - **Lire avec la clé** : `GET /api/partages/<id>` avec la clé dans l'en-tête `Authorization`, jamais dans l'URL. Renvoie l'instantané **même en attente** (pour l'aperçu avant le clic) et l'état de la clé (active, en attente, invalide), sans rien modifier. Sans clé, c'est la lecture du lecteur.
   - **Activer une clé** : `POST /api/partages/<id>/confirmer`, appelé seulement par un clic. La clé en attente devient la clé du partage, l'ancienne est révoquée, et un partage en attente devient actif. Une seule action couvre la confirmation et la récupération.
   - Comparaison en temps constant contre la clé active et la clé en attente.

Pas d'ADR : ces décisions se défont sans grand coût avant l'implémentation.

## Révision

Révisé par [Que disent les trois emails](14-texte-emails.md#pas-dactivation) : **un partage est actif dès sa création**. Ce qui change :
- **Point 1** : il ne vaut plus que pour la clé en attente d'une récupération. Le lien de gestion de la création porte une clé déjà active, et l'ouvrir ne demande aucun clic de confirmation.
- **Point 5** : la liste n'a plus de partages en attente. Un partage jamais ouvert y figure avec sa date de suppression (7 jours après la création).
- **Point 8** : la cause « jamais confirmé à temps » devient « jamais ouvert en 7 jours ».
- **Point 9** : `GET` sans clé renvoie l'instantané dès la création. `POST …/confirmer` sert seulement à activer une clé en attente.

Les points 2, 3, 4, 6 et 7 restent valables.
