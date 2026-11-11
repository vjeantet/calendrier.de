# Réécrire `PARTAGE.md` en conception validée

Type: task
Status: claimed
Blocked by: 15, 16
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Réécrire `PARTAGE.md` en place, au statut « conception validée », à partir des décisions de la carte. Le document doit pouvoir être découpé en tickets d'implémentation `ready-for-agent` sans autre décision.

Le document reprend chaque décision sans la contredire, en tenant compte des révisions (plus d'activation). Il liste aussi les scénarios de captures `outils/captures/` à ajouter : page `/@/` (écran et impression), page « Données personnelles », bandeau de partage (formulaire, ligne « Partagé », modifications non publiées, messages de [limitation](10-limitation-envois-lectures.md) et de [validation](11-validation-instantane.md)). Les états du [prototype de l'interface](09-prototype-interface-auteur.md) donnent la liste. Pour la page `/@/`, les états sont ceux de [Comment la page `/@/<id>` affiche l'instantané](16-page-lecteur.md) : chargement, page commune, 429, erreur réseau, liste des périodes en lecture seule.

L'agent rédige ; l'auteur relit et valide. Le ticket est résolu à la validation.

## Comments

**Brouillon rédigé (2026-11-11)**, en attente de la relecture de l'auteur. Le ticket reste `claimed` jusqu'à la validation.

Précisions que la rédaction a dû ajouter pour qu'un agent puisse implémenter sans décider, et qu'aucun ticket ne fixait. À valider ou corriger :

1. **Format des échanges** : instantané `{ titre, debut, donnees }` ; corps de création `{ email, instantane }` ; `verifier` reçoit l'instantané seul (chemins d'erreur relatifs à lui).
2. **Clé** : 128 bits en base64url, empreinte SHA-256 (pas de HMAC) ; en-tête `Authorization: Bearer <clé>`.
3. **Codes de réponse** : 201 sans corps à la création, 401 pour une clé absente ou dans le mauvais état (le 403 reste réservé à `Origin`), 502 si Sweego échoue. `GET` avec clé renvoie aussi `cle`, `publieLe` et `cleExpireLe`. Corps du 429 journalier : `{ "erreur": "limite journalière" }`.
4. **Échec d'envoi à la création** : la fonction supprime le partage qu'elle vient d'écrire, sans décrémenter les compteurs.
5. **Métadonnées** : `empreinteEmail`, `empreinteCle` et `cleEnAttente: { empreinte, emiseLe }` y vont aussi, pour que la tâche quotidienne et les contrôles de clé n'aient pas à télécharger l'instantané. `publieLe = creeLe` à la création (sert à « Publié le » dans la récupération et dans le bandeau).
6. **`consulteLe`** : réécriture du blob en `onlyIfMatch` sur l'etag lu, pour ne pas écraser une publication simultanée ; un échec n'empêche pas le 200.
7. **Adresse** : rognée et mise en minuscules avant le HMAC ; 400 au-delà de 254 caractères ou sans `@`.
8. **Collision d'identifiant** : `onlyIfNew` puis nouveau tirage.
9. **Calendrier sans titre** : objets et intitulés des emails sans titre (« Votre calendrier est partagé », « Sans titre ») ; redirection vers `/<aaaa>/<mm>`.
10. **Fichiers et variables** : fonctions `envois.mjs`, `partage.mjs`, `menage.mjs` ; variables `SECRET_EMPREINTES`, `SWEEGO_CLE_API`, `CONTACT_EMAIL` ; `EMAIL_SIMULE=1` en local seulement (seule exception à la règle de journalisation) ; `package.json` racine pour `@netlify/blobs`.
11. **Repli `noindex`** : si `X-Robots-Tag` ne s'applique pas à la route réécrite, une balise `<meta>` ajoutée par script.
12. **Captures** : `serveur.py` simule l'API, `fixture.js` remplace l'origine canonique et rejoue les gestes indiqués dans l'URL ; aucun état de démonstration dans le code du site.
13. **DNS de Sweego** : aucun enregistrement sur le nom `calendrier.vjeantet.fr` lui-même (CNAME vers Netlify) ; à confirmer au moment de vérifier le domaine.
