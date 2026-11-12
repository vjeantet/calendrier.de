# 04 : Fondations de l'API

Status: ready-for-agent
Blocked by: —
Spec: [`PARTAGE.md`](../../../PARTAGE.md), sections « Garde commune », « Empreintes », « Stockage (Netlify Blobs) », « Fonctions et fichiers », « Variables d'environnement » et « Domaine et configuration Netlify ». Décisions : [Où héberger l'API et quel service d'email](../../partage/issues/06-hebergement-api.md), [Sur quel domaine pointent les liens envoyés par email](../../partage/issues/13-domaine-liens-emails.md).

## À construire

Le socle commun aux trois fonctions, sans route métier :

- un `package.json` à la racine qui déclare `@netlify/blobs` ; le site reste sans commande de build ;
- le **module d'accès au store** : seul point d'ouverture de Netlify Blobs, avec `region: "eu-central-1"` et la cohérence `strong` sur chaque appel ;
- la **garde** : 404 sans `URL_PUBLIQUE` ; 403 pour toute écriture (`POST`, `PUT`, `DELETE`) dont l'`Origin` diffère de `URL_PUBLIQUE`, avant tout le reste ; aucun en-tête CORS ;
- les **empreintes** : HMAC-SHA-256 de l'adresse rognée et en minuscules et de l'IP, avec `SECRET_EMPREINTES` ; SHA-256 de la clé de gestion ; comparaison en temps constant ;
- `netlify.toml` : la redirection 301 de `calendrier-vjeantet.netlify.app` vers `calendrier.vjeantet.fr`, placée avant `/*` et forcée ; `X-Robots-Tag: noindex` sur `/@/*` ; `[functions]` avec `included_files` pour `donnees/noms-communs/noms.txt` ;
- la marche à suivre pour lancer l'API en local avec `netlify dev` et une configuration propre (variables locales, `EMAIL_SIMULE=1`), écrite à côté des fonctions.

## Critères d'acceptation

- [ ] Aucun appel à Netlify Blobs ne contourne le module d'accès : une recherche de `getStore` dans le dépôt ne le trouve que là.
- [ ] Tests `node --test` de la garde sur des objets `Request` : sans `URL_PUBLIQUE` → 404 ; `POST`, `PUT`, `DELETE` avec une autre `Origin` ou sans `Origin` → 403 ; `GET` sans `Origin` → laissé passer ; jamais d'en-tête `Access-Control-*`.
- [ ] Tests des empreintes : ` A@Exemple.fr ` et `a@exemple.fr` donnent la même empreinte ; l'adresse et l'IP ne se mélangent pas dans le store (préfixes distincts) ; la comparaison des clés ne dépend pas de la position de la première différence.
- [ ] Le site statique se publie comme avant ; `netlify dev` démarre avec la configuration locale décrite.
- [ ] Aucun module ne journalise l'adresse, l'IP ni la clé.

## Hors de ce ticket

- Les fonctions `envois`, `partage` et `menage` : tickets [05](05-creation-recuperation.md), [06](06-lecture-publication-arret-confirmation.md), [07](07-tache-quotidienne.md).
- L'envoi par Sweego et le commutateur `EMAIL_SIMULE` : [ticket 05](05-creation-recuperation.md), où vit l'envoi.
- La vérification de `X-Robots-Tag` et de la redirection sur Netlify : [ticket 16](16-verifications-netlify.md).
