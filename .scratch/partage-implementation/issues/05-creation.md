# 05 : Création d'un partage

Status: ready-for-agent
Blocked by: 01, 02, 04
Spec: [`PARTAGE.md`](../../../PARTAGE.md), sections « Identifiant public », « Clé de gestion », « Les emails » (forme commune et création), « API » (route `POST /api/partages`, « Création, pas à pas », « Limitation ») et « Variables d'environnement ». Décisions : [Limitation des envois et des lectures](../../partage/issues/10-limitation-envois-lectures.md), [Que disent les trois emails](../../partage/issues/14-texte-emails.md), [Que devient une réponse aux emails](../../partage/issues/15-reponses-emails.md). Gabarit de départ : branche `prototype/emails-partage` (variante B, réordonnée). API de Sweego : [recherche sur l'email transactionnel](../../partage/recherches/02-email-transactionnel-ue.md).

## À construire

La fonction `netlify/functions/envois.mjs`, déclarée avec un tableau `path` (ici `/api/partages` seulement ; le [ticket 17](17-recuperation.md) y ajoute `/api/liens`), en `POST`, avec la règle `rateLimit` n° 1 (5 requêtes par 180 s et par IP).

- **Création** : garde, taille du corps (≤ 100 000 octets) avant `JSON.parse`, validation de l'adresse et `Instantane.verifier`, compteurs journaliers, tirage de l'identifiant et de la clé, écriture de `partages/<id>` (`onlyIfNew`, métadonnées de la section « Stockage ») et de `emails/<empreinte>/<id>`, envoi de l'email de création. Réponse 201 **sans corps**.
- **Compteurs journaliers**, écrits pour servir aussi à la récupération : 3 par adresse, 10 par IP, 90 au total, jour UTC, vérifiés avant, incrémentés seulement pour une demande acceptée.
- **Tirage** : trois noms distincts de `noms.txt` puis un nombre de 10 à 99, avec un générateur cryptographique et sans biais de modulo ; nouveau tirage si `onlyIfNew` échoue. Clé de 128 bits en base64url.
- **Envoi d'un email**, écrit pour servir aux trois emails : `multipart/alternative` HTML à styles en ligne + texte brut, expéditeur, `Reply-To` vers `CONTACT_EMAIL`, `tracking_open: false`, liens bâtis sur `URL_PUBLIQUE`, dates à l'heure de Paris. Envoi par l'API de Sweego avec `SWEEGO_CLE_API`.
- **Gabarit de l'email de création** : objet avec le titre coupé à 40 caractères, titre échappé dans le corps, encadré du lien public, date de suppression faute d'ouverture, bouton « Gérer mon calendrier partagé », pied et lien « Données personnelles ».
- **`EMAIL_SIMULE=1`** : pas d'appel à Sweego, l'email (objet, texte, liens) est écrit dans la console. C'est la seule exception à la règle de journalisation.

## Critères d'acceptation

- [ ] Avec `netlify dev` et `EMAIL_SIMULE=1`, une création renvoie 201 sans corps, écrit les deux blobs avec leurs métadonnées (`empreinteEmail`, `empreinteCle`, `creeLe`, `publieLe` = `creeLe`, pas de `consulteLe`) et affiche l'email.
- [ ] Quatrième création du jour pour une même adresse → 429 `{ "erreur": "limite journalière" }` avec `Retry-After` jusqu'à minuit UTC, sans rien écrire ni envoyer. Une demande refusée (400, 403, 429) n'incrémente aucun compteur.
- [ ] Adresse absente, de plus de 254 caractères ou sans `@` → 400. Instantané invalide → 400 `{ "erreur": "<chemin> : <raison>" }`. Corps de plus de 100 000 octets → 400 sans `JSON.parse`.
- [ ] Échec de Sweego → 502 ; le partage et son entrée d'index sont supprimés ; les compteurs restent incrémentés.
- [ ] Tests `node --test` du tirage (forme, trois noms distincts, nombre de 10 à 99, pas de biais de modulo dans le code) et du gabarit (titre échappé, coupe à 40 caractères avec « … », objet sans titre, dates `Europe/Paris` quel que soit le fuseau du processus, chaque lien seul sur sa ligne en texte brut).
- [ ] Aucune trace de l'adresse, de l'IP ni de la clé dans les journaux hors `EMAIL_SIMULE`.

## Hors de ce ticket

- La récupération (`POST /api/liens`) et ses deux emails : [ticket 17](17-recuperation.md).
- L'appel depuis le navigateur : [ticket 09](09-bandeau-auteur.md).
- Le compte Sweego et ses enregistrements DNS : [ticket 15](15-prerequis-hors-code.md).
