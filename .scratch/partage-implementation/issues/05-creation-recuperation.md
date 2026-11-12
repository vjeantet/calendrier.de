# 05 : Création et récupération d'un partage

Status: ready-for-agent
Blocked by: 01, 02, 04
Spec: [`PARTAGE.md`](../../../PARTAGE.md), sections « Identifiant public », « Clé de gestion », « Les emails », « API » (routes `POST`, « Création, pas à pas », « Limitation ») et « Variables d'environnement ». Décisions : [Confirmation de l'adresse et récupération](../../partage/issues/07-confirmation-recuperation.md), [Limitation des envois et des lectures](../../partage/issues/10-limitation-envois-lectures.md), [Que disent les trois emails](../../partage/issues/14-texte-emails.md), [Que devient une réponse aux emails](../../partage/issues/15-reponses-emails.md). Gabarits de départ : branche `prototype/emails-partage` (variante B, réordonnée). API de Sweego : [recherche sur l'email transactionnel](../../partage/recherches/02-email-transactionnel-ue.md).

## À construire

La fonction `netlify/functions/envois.mjs`, déclarée avec un tableau `path` pour `POST /api/partages` et `POST /api/liens`, et la règle `rateLimit` n° 1 (5 requêtes par 180 s et par IP).

- **Création** : garde, taille du corps (≤ 100 000 octets) avant `JSON.parse`, validation de l'adresse et `Instantane.verifier`, compteurs journaliers (3 par adresse, 10 par IP, 90 au total, jour UTC, vérifiés puis incrémentés), tirage de l'identifiant et de la clé, écriture de `partages/<id>` (`onlyIfNew`, métadonnées de la section « Stockage ») et de `emails/<empreinte>/<id>`, envoi de l'email de création. Réponse 201 **sans corps**.
- **Récupération** : même ordre, puis une clé en attente par partage de l'adresse (une nouvelle remplace l'ancienne), puis **un** email qui les liste tous, ou l'email « aucun partage » pour une adresse inconnue. Réponse 200 identique dans tous les cas.
- **Tirage** : trois noms distincts de `noms.txt` puis un nombre de 10 à 99, avec un générateur cryptographique et sans biais de modulo ; nouveau tirage si `onlyIfNew` échoue. Clé de 128 bits en base64url.
- **Emails** : les trois gabarits de la section « Les emails », en HTML à styles en ligne et en texte brut ; expéditeur, `Reply-To` vers `CONTACT_EMAIL`, `tracking_open: false`, liens bâtis sur `URL_PUBLIQUE`, dates à l'heure de Paris, titre échappé, coupé à 40 caractères dans l'objet. Envoi par l'API de Sweego avec `SWEEGO_CLE_API`.
- **`EMAIL_SIMULE=1`** : pas d'appel à Sweego, l'email (objet, texte, liens) est écrit dans la console. C'est la seule exception à la règle de journalisation.

## Critères d'acceptation

- [ ] Avec `netlify dev` et `EMAIL_SIMULE=1`, une création renvoie 201 sans corps, écrit les deux blobs avec leurs métadonnées (`empreinteEmail`, `empreinteCle`, `creeLe`, `publieLe` = `creeLe`, pas de `consulteLe`) et affiche l'email ; le lien public de l'email est lisible par `GET /api/partages/<id>` dès que le [ticket 06](06-lecture-publication-arret-confirmation.md) existe.
- [ ] Une récupération pour une adresse qui a deux partages produit un seul email avec deux blocs et pose `cleEnAttente` sur chacun ; pour une adresse inconnue, l'email « aucun partage » ; la réponse HTTP est octet pour octet la même dans les deux cas.
- [ ] Quatrième demande du jour pour une même adresse → 429 `{ "erreur": "limite journalière" }` avec `Retry-After` jusqu'à minuit UTC, sans rien écrire ni envoyer. Une demande refusée (400, 403, 429) n'incrémente aucun compteur.
- [ ] Adresse absente, de plus de 254 caractères ou sans `@` → 400. Instantané invalide → 400 `{ "erreur": "<chemin> : <raison>" }`. Corps de plus de 100 000 octets → 400 sans `JSON.parse`.
- [ ] Échec de Sweego → 502 ; pour une création, le partage et son entrée d'index sont supprimés ; les compteurs restent incrémentés.
- [ ] Tests `node --test` du tirage (forme, trois noms distincts, nombre de 10 à 99, pas de biais de modulo dans le code) et des gabarits (titre échappé, coupe à 40 caractères avec « … », objet sans titre, dates `Europe/Paris` quel que soit le fuseau du processus, chaque lien seul sur sa ligne en texte brut).
- [ ] Aucune trace de l'adresse, de l'IP ni de la clé dans les journaux hors `EMAIL_SIMULE`.

## Hors de ce ticket

- L'appel depuis le navigateur : [ticket 09](09-bandeau-auteur.md).
- La confirmation d'une clé en attente : [ticket 06](06-lecture-publication-arret-confirmation.md).
- Le compte Sweego et ses enregistrements DNS : [ticket 15](15-prerequis-hors-code.md).
