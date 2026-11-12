# 10 : Arrivée par le lien de gestion

Status: ready-for-agent
Blocked by: 08, 09
Spec: [`PARTAGE.md`](../../../PARTAGE.md), section « Arrivée par le lien de gestion ». Décisions : [Comment l'instantané se met à jour](../../partage/issues/04-mise-a-jour-instantane.md), [Confirmation de l'adresse et récupération](../../partage/issues/07-confirmation-recuperation.md), [Comment la page `/@/<id>` affiche l'instantané](../../partage/issues/16-page-lecteur.md).

## À construire

Le traitement de `/@/<id>#cle=<clé>` : lecture puis retrait du fragment (`replaceState`), lecture du partage avec la clé, comparaison de l'empreinte de l'instantané reçu à celle des clés locales préparées, puis l'un des six cas de la section :

- clé active et calendrier local vide → recopie, `partage` rangé, redirection ;
- clé active et calendrier identique → `partage` rangé, redirection ;
- clé active et calendrier différent → instantané en lecture seule, bandeau bleu « Reprendre le calendrier partagé ici » / « Garder mes annotations » ;
- clé en attente → bandeau bleu avec avertissement et heure d'expiration ; les choix appellent `POST …/confirmer` en une étape ;
- clé invalide → bandeau bleu « Ce lien de gestion n'est plus valable… » et « Demander un nouveau lien », qui ouvre « J'ai déjà un lien » sur la page locale ;
- partage introuvable → page commune.

« Reprendre » passe par `remplacerAnnotationsLocales` avec l'objet déjà reçu, sans nouvelle requête. Après chaque choix : `partage` rangé avec l'empreinte de l'instantané reçu, puis redirection vers `/<titre>/<aaaa>/<mm>` (ou `/<aaaa>/<mm>` sans titre).

## Critères d'acceptation

- [ ] Après le chargement, l'URL ne contient plus `#cle=` et la clé n'apparaît dans aucune requête autrement que dans `Authorization`.
- [ ] Les six cas sont atteignables sous `netlify dev` et chacun aboutit à l'état décrit : après redirection, le bandeau du [ticket 09](09-bandeau-auteur.md) est vert, sauf après « Garder mes annotations » où il est orange.
- [ ] « Reprendre » ne déclenche qu'une seule requête `GET` en tout.
- [ ] Après confirmation d'une clé en attente, l'ancienne clé lit `invalide` dans un autre navigateur, qui affiche alors le message « clé remplacée ».
- [ ] Une confirmation refusée (clé de plus de 48 h) affiche le cas « clé invalide ».
- [ ] Rien n'est confirmé ni écrit au simple chargement de la page, quel que soit le cas.

## Hors de ce ticket

- Les captures : [ticket 12](12-captures.md).
