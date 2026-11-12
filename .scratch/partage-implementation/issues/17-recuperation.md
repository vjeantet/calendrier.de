# 17 : Récupération des liens de gestion

Status: ready-for-agent
Blocked by: 05
Spec: [`PARTAGE.md`](../../../PARTAGE.md), sections « Clé de gestion », « Les emails » (récupération et adresse sans partage), « API » (route `POST /api/liens`, fin de « Création, pas à pas », « Limitation »). Décisions : [Confirmation de l'adresse et récupération](../../partage/issues/07-confirmation-recuperation.md), [Que disent les trois emails](../../partage/issues/14-texte-emails.md). Gabarits de départ : branche `prototype/emails-partage` (variante B, réordonnée).

## À construire

`POST /api/liens`, ajouté au tableau `path` de la fonction d'envois du [ticket 05](05-creation.md), donc sous la même règle `rateLimit` n° 1 :

- garde, validation de l'adresse, compteurs journaliers communs avec la création ;
- pour chaque partage de l'adresse (trouvé par `list({ prefix: "emails/<empreinte>/" })`), une clé neuve rangée en `cleEnAttente` `{ empreinte, emiseLe }`, qui remplace une clé en attente précédente ;
- **un** email qui liste tous ces partages (un bloc par partage, avec son lien public, son état et son lien de gestion valable 48 h), ou l'email « aucun partage » pour une adresse inconnue ;
- réponse 200 identique dans tous les cas.

Un partage tout juste créé peut manquer quelques secondes dans la liste : c'est accepté.

## Critères d'acceptation

- [ ] Avec `netlify dev` et `EMAIL_SIMULE=1`, une récupération pour une adresse qui a deux partages produit un seul email à deux blocs et pose `cleEnAttente` sur chacun, sans toucher à `empreinteCle`.
- [ ] Pour une adresse inconnue, l'email « aucun partage » ; la réponse HTTP est octet pour octet la même que pour une adresse connue.
- [ ] Une deuxième récupération remplace la clé en attente de la première.
- [ ] Les compteurs sont ceux de la création : trois créations puis une récupération pour la même adresse → 429.
- [ ] Tests `node --test` des deux gabarits : objets au singulier, au pluriel et sans titre, état « Publié le » ou « Jamais ouvert », date d'expiration de la clé à l'heure de Paris, note « personnel » une seule fois, pied commun.
- [ ] Échec de Sweego → 502, les clés en attente posées restent (elles expirent seules).

## Hors de ce ticket

- La confirmation d'une clé en attente : [ticket 06](06-lecture-publication-arret-confirmation.md).
- « J'ai déjà un lien » dans le navigateur : [ticket 09](09-bandeau-auteur.md).
