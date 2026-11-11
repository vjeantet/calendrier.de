# À quoi ressemble l'interface de partage pour l'auteur

Type: prototype
Status: resolved
Blocked by: 04, 07
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

À quoi ressemblent, dans l'entête, le bouton « Partager », son popover et les états du partage pour l'auteur : non partagé → lien envoyé (en attente) → actif, avec ou sans modifications non publiées → arrêté ; et « J'ai déjà un lien » ?

Prototype grossier dans le style existant (`popovers.css`), à faire réagir, en tenant compte des décisions sur la mise à jour de l'instantané et sur la confirmation.

À couvrir aussi, depuis [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md) : où atterrit l'auteur après avoir ouvert le lien de gestion (sur `/@/<id>`, ou redirigé vers `/<titre>/<aaaa>/<mm>`) ; le choix « Reprendre le calendrier partagé ici » ou « Garder mes annotations » ; le rappel de ce qui partira sur le bouton « Publier les modifications ».

À couvrir aussi, depuis [Confirmation de l'adresse et récupération du lien de gestion](07-confirmation-recuperation.md) :
- l'aperçu et le bouton « Activer le partage » à l'ouverture du lien de gestion d'un partage en attente ;
- le bouton « Gérer le partage depuis ce navigateur » à l'ouverture d'un lien de récupération, et son articulation avec le choix « Reprendre / Garder mes annotations » ;
- le message unique d'un navigateur dont la clé a été remplacée, et la page « Ce lien de gestion n'est plus valable » ;
- dans le popover, l'orientation « Vous avez déjà partagé ce calendrier ? J'ai déjà un lien » et la réponse identique de la récupération.

À couvrir aussi, depuis [Durées de confirmation et de conservation](08-durees-conservation.md) : l'emplacement, dans le popover au moment de partager, de la phrase « Un partage en attente expire au bout de 48 h. Un partage ni publié ni consulté pendant 12 mois est supprimé. »

## Answer

Prototype : branche jetable `prototype/interface-partage` (commit `19d15e2`, jamais fusionnée), fichiers `public/static/js/calendrier.de/prototype-partage.js` et `public/static/css/calendrier.de/prototype-partage.css`. Trois variantes ont été comparées : A « Popover », B « Bandeau », C « Fenêtre centrée + ligne d'URL ». Pour le relancer : `outils/captures/serveur.py 8000`, puis `/Claire/2026/03?annote&proto&variant=B&etat=formulaire` (la barre du bas fait défiler variantes et états).

**Variante retenue : B, le bandeau.**

1. **Bandeau sous l'entête, dans la page.** Une barre claire entre `#entete` et `#calendrier`, dans le style des boutons de l'entête. Tous les messages et formulaires du partage s'y affichent en ligne. Aucun popover ni fenêtre ne flotte au-dessus du calendrier.
   - **Non partagé** : pas de bandeau. Un bouton « Partager », à côté de « Réinitialiser » et dans le même style, ouvre le bandeau sur le formulaire.
   - **Partagé** : le bouton « Partager » disparaît. Le bandeau reste visible, réduit à une ligne : point vert, « Partagé », lien public avec « Copier », « publié le <date> », « Arrêter ».
   - **Modifications non publiées** : la même ligne passe en orange (« Partagé · modifications non publiées ») et affiche « Publier les modifications », avec le rappel de ce qui partira sous le bouton.
   - **Pages ouvertes par un lien reçu** (`/@/<id>`) : bandeau bleu au-dessus du calendrier en lecture seule.
   - **Impression** : le bandeau et le bouton sont masqués.
2. **Hauteur.** Le bandeau est exclu de la mise à l'échelle de `index.html`, comme la liste `#periodes`. Le calendrier garde sa taille et la page défile de la hauteur du bandeau (≈ 45 px en ligne, ≈ 170 px avec le formulaire). Le prototype ne le faisait pas : il rétrécissait tout le calendrier.
3. **Formulaire « Partager en lecture seule ».** Il contient :
   - le rappel que toute personne qui a le lien pourra consulter le calendrier, et la mise en garde sur les notes concernant d'autres personnes ;
   - « Sera partagé : « Claire » · à partir de mars 2026 · n jours annotés · n périodes » ;
   - le champ email et le bouton « Recevoir le lien par email ».
   Sous le bouton, en note : « Le lien n'est envoyé que par email… », puis **la phrase des durées** (« Un partage en attente expire au bout de 48 h. Un partage ni publié ni consulté pendant 12 mois est supprimé. ») suivie du lien « Données personnelles ». En pied : « Vous avez déjà partagé ce calendrier ? J'ai déjà un lien ».
4. **Lien envoyé.** Le bandeau affiche « Lien envoyé à a•••@exemple.fr », une invitation à cliquer sur « Gérer mon calendrier partagé » dans l'email, et l'expiration à 48 h. Le navigateur ne retient rien avant l'activation (voir [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md)). Une fois le message fermé, il revient à « Partager ». Partager à nouveau avant d'avoir cliqué dans l'email crée un second partage. C'est accepté.
5. **J'ai déjà un lien.** Le formulaire « Recevoir à nouveau mes liens » contient l'email, « Recevoir mes liens » et « Retour ». La réponse est toujours la même : « Si des calendriers sont partagés avec a•••@exemple.fr, vous allez recevoir un email. »
6. **Arrivée par le lien de gestion.**
   - **Partage en attente** : l'aperçu et le bouton « Activer le partage » s'affichent sur `/@/<id>`, en lecture seule, tel que le lecteur verra la page. Le bandeau donne l'heure d'expiration.
   - **Après le clic** (activation, ou un des choix ci-dessous), l'auteur est **redirigé vers `/<titre>/<aaaa>/<mm>`**, construit avec le titre et le semestre de l'instantané. Il y trouve son calendrier modifiable et le bandeau « Partage activé » avec le lien public à transmettre.
   - **Calendrier local différent** : « Reprendre le calendrier partagé ici » (remplace les annotations de ce navigateur) ou « Garder mes annotations » (elles remplaceront le partage à la prochaine publication ; on arrive alors à l'état « modifications non publiées »).
7. **Lien de récupération, en une seule étape.**
   - **Calendrier local identique ou vide** : un seul bouton, « Gérer le partage depuis ce navigateur ».
   - **Calendrier local différent** : deux boutons, « Gérer ici et reprendre le calendrier partagé » et « Gérer ici et garder mes annotations ».
   Le texte prévient que les navigateurs qui avaient un lien plus ancien perdent le droit de publier, et donne l'heure d'expiration de la clé en attente.
8. **Arrêter.** La confirmation s'affiche dans le bandeau : le lien cesse de marcher, l'instantané est supprimé du serveur, les annotations restent. Après l'arrêt : « Partage arrêté. Le lien … ne mène plus à rien », puis retour à « Partager ».
9. **Messages d'erreur.**
   - **Clé remplacée** : le message unique (« Ce calendrier est maintenant géré depuis un autre lien… ») s'affiche une fois dans le bandeau, avec « Compris ».
   - **Lien de gestion qui n'est plus valable** : bandeau bleu sur `/@/<id>`, avec « Le calendrier reste partagé » et « Demander un nouveau lien », qui ouvre « J'ai déjà un lien ».
   - **Partage inexistant** : la page commune, sans bandeau.

Écartées :
- **A (popover sombre)** : l'état du partage n'est visible que par une pastille sur le bouton.
- **C (fenêtre centrée, lien public dans la ligne `♥` imprimée)** : l'auteur ne voit plus son URL modifiable.

Les textes du prototype servent de base et se reprennent à l'implémentation.

Pas d'ADR : un choix d'interface se défait sans grand coût.

## Révision

Révisé par [Que disent les trois emails](14-texte-emails.md#pas-dactivation) : **un partage est actif dès sa création**.
- **Point 3** : la phrase des durées devient celle du ticket des emails.
- **Point 4** : le bandeau dit que le calendrier est partagé et que les deux liens sont dans l'email. Il ne parle plus de 48 h. Il revient ensuite à « Partager », comme avant.
- **Point 6** : l'état « Partage en attente » (aperçu, « Activer le partage ») disparaît. Le lien de gestion de la création suit les règles d'arrivée de [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md). Le bandeau « Partage activé » ne s'affiche plus.

Les autres points restent valables, dont le point 7 (récupération).
