# 06 : Lecture, publication, arrêt et confirmation

Status: ready-for-agent
Blocked by: 02, 04
Spec: [`PARTAGE.md`](../../../PARTAGE.md), sections « Clé de gestion », « Durées de vie », « API » (routes `/api/partages/<id>`, « Stockage », « Limitation »). Décisions : [Confirmation de l'adresse et récupération](../../partage/issues/07-confirmation-recuperation.md), [Durées de confirmation et de conservation](../../partage/issues/08-durees-conservation.md).

## À construire

La fonction `netlify/functions/partage.mjs` sur `/api/partages/*`, avec la règle `rateLimit` n° 2 (60 requêtes par 60 s et par IP) :

- `GET /api/partages/<id>` : sans clé, `{ titre, debut, donnees }` ; avec `Authorization: Bearer <clé>`, en plus `cle` (`active`, `en-attente` ou `invalide`), `publieLe`, et `cleExpireLe` pour une clé en attente. Une lecture réussie pose `consulteLe` (jour UTC) au plus une fois par jour, en `onlyIfMatch` sur l'etag lu ; un échec de cette écriture n'empêche pas le 200. `Cache-Control: no-store`.
- `PUT /api/partages/<id>` (clé active) : taille, `Instantane.verifier`, remplacement de l'instantané resérialisé, `publieLe`. Réponse `{ publieLe }`.
- `DELETE /api/partages/<id>` (clé active) : supprime le blob et l'entrée `emails/<empreinte>/<id>`. 204.
- `POST /api/partages/<id>/confirmer` (clé en attente) : la clé en attente devient la clé du partage, l'ancienne est révoquée ; refus au-delà de 48 h, vérifiées au moment de l'appel ; sans effet si la clé est déjà active.

## Critères d'acceptation

- [ ] Avec `netlify dev`, sur un partage semé directement dans le store local (ou créé par le [ticket 05](05-creation-recuperation.md)), chaque route rend les codes du tableau « Routes » : 200, 204, 400, 401, 403, 404, et `Cache-Control: no-store` sur tout `GET`.
- [ ] 401 pour une clé absente, inconnue, périmée ou pas dans l'état requis : `PUT` et `DELETE` refusent une clé en attente, `confirmer` refuse une clé en attente de plus de 48 h.
- [ ] Après `confirmer`, l'ancienne clé lit `cle: "invalide"` et ne peut plus publier ; `confirmer` rejoué avec la nouvelle clé répond 200 sans rien changer.
- [ ] Deux lectures le même jour n'écrivent `consulteLe` qu'une fois ; une publication simultanée à une lecture n'est pas écrasée (test sur l'`onlyIfMatch`).
- [ ] Un identifiant qui n'est pas sous forme canonique répond 404, sans lecture du store.
- [ ] `/api/partages/*` est servi par la fonction et non réécrit vers `index.html`.
- [ ] Aucune trace de la clé dans les journaux.

## Hors de ce ticket

- La page qui lit (`/@/<id>`) : [ticket 08](08-page-lecteur.md). Le bandeau qui publie et arrête : [ticket 09](09-bandeau-auteur.md). L'appel à `confirmer` : [ticket 10](10-arrivee-lien-gestion.md).
