# Comment l'instantané se met à jour

Type: grilling
Status: resolved
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

L'instantané d'un partage se met-il à jour à la demande de l'auteur (bouton « Publier les modifications », indicateur de modifications non publiées), comme proposé dans `PARTAGE.md`, ou suit-il automatiquement le calendrier local ?

Ce qui en découle : comment détecter « modifié depuis la dernière publication » (empreinte de l'instantané ? horodatage ?), ce que voit l'auteur quand il réinitialise son calendrier local alors qu'un partage est actif, ce qui se passe si l'auteur modifie son calendrier depuis un navigateur qui n'a pas la clé de gestion.

À trancher aussi : où le navigateur range l'état local du partage (identifiant public, clé de gestion, empreinte de la dernière publication). Les calendriers multiples sont hors périmètre, mais ce rangement ne doit pas les empêcher plus tard : une clé globale unique (`partage`) à rattacher ensuite à un calendrier nommé, ou une forme qui le permet déjà sans migration ?

## Answer

1. **Publication à la demande.** Bouton « Publier les modifications » et indicateur de modifications non publiées. Le suivi automatique est écarté : une note privée serait publiée par surprise, « Réinitialiser » viderait le partage, et chaque frappe puiserait dans le quota de crédits Netlify, dont le dépassement met tout le compte en pause.
2. **Rangement local.** Une seule clé globale `partage = { id, cle, empreinte }`, sur le modèle des quatre clés d'annotations. Le jour où les calendriers auront un nom, elle migrera avec ces quatre clés, sans coût de plus. Anticiper cette forme maintenant reviendrait à deviner un modèle qui n'est pas encore conçu.
3. **Détection des modifications non publiées.** Le navigateur range une empreinte SHA-256 des quatre clés d'annotations (`jourdetails`, `jourcouleurs`, `moislibelles`, `jourbandes`), sérialisées de façon stable, après chaque publication réussie. Il la compare à chaque modification et au chargement de la page. Annuler une modification éteint l'indicateur. L'horodatage est écarté : une modification annulée laisserait l'indicateur allumé. La comparaison avec le serveur est écartée aussi : chaque changement de semestre recharge la page, donc un appel par chargement.
4. **Titre et semestre.** Ils sont lus dans l'URL au moment de publier et n'entrent pas dans l'indicateur. Si l'URL n'a pas de date (`/Claire`), on fige le semestre courant. Le bouton rappelle ce qui partira (« Claire · à partir d'avril 2026 », « sans titre », nombre de jours annotés), parce que publier depuis `/` efface le titre. Le glossaire est corrigé : le titre n'appartient pas au Calendrier, seulement à l'Instantané.
5. **Existence du partage.** Le navigateur la vérifie une fois par session (drapeau dans `sessionStorage`) et à chaque publication. Si le serveur répond que le partage n'existe plus (arrêté ailleurs, supprimé pour inactivité), le navigateur efface `partage` et revient à l'état « jamais partagé ».
6. **Navigateur sans clé de gestion.** Il n'a aucun lien avec le partage : ses modifications restent locales, sans indicateur ni bouton « Publier ». Pour publier depuis ce navigateur, il faut y ouvrir le lien de gestion.
7. **« Réinitialiser » avec un partage actif.** Seules les quatre clés locales sont vidées ; `partage` et l'instantané restent intacts, et l'indicateur s'allume. La confirmation ajoute : « Le calendrier partagé ne change pas tant que vous ne publiez pas. » Publier un calendrier vide est permis ; le rappel du bouton le rend visible.
8. **Ouverture du lien de gestion dans un navigateur.**
   - Calendrier local vide : l'instantané y est chargé, et le navigateur range la clé et l'empreinte.
   - Calendrier local identique à l'instantané : le navigateur range la clé et l'empreinte sans rien demander. C'est le cas courant du navigateur qui a créé le partage. Ce navigateur ne range rien avant la confirmation, puisque la clé et l'identifiant ne partent que dans l'email.
   - Calendrier local différent de l'instantané : le navigateur propose « Reprendre le calendrier partagé ici (remplace vos annotations) » ou « Garder mes annotations (elles remplaceront le partage à la prochaine publication) ».
   - Deux navigateurs avec la clé : la dernière publication l'emporte. Le ticket [Confirmation de l'adresse et récupération du lien de gestion](07-confirmation-recuperation.md) dira si une récupération change de clé.

Pas d'ADR : chacune de ces décisions se défait sans grand coût.
