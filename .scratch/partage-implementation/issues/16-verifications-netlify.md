# 16 : Vérifier sur une prévisualisation Netlify

Status: ready-for-human
Blocked by: 05, 06, 08, 09, 10, 11
Spec: [`PARTAGE.md`](../../../PARTAGE.md), sections « À vérifier à l'implémentation », « Garde commune » et « Domaine et configuration Netlify ».

## À faire

Les points que `netlify dev` ne prouve pas, à vérifier sur une prévisualisation de déploiement, puis en production :

- [ ] `X-Robots-Tag: noindex` est bien envoyé sur `/@/<id>`, route réécrite vers `index.html`. Sinon, rouvrir le [ticket 08](08-page-lecteur.md) pour le repli `<meta name="robots" content="noindex">` posé par script.
- [ ] `/donnees-personnelles` sert `public/donnees-personnelles.html`. Sinon, l'adresse devient `/donnees-personnelles.html` partout (tickets [05](05-creation-recuperation.md), [08](08-page-lecteur.md), [09](09-bandeau-auteur.md), [11](11-page-donnees-personnelles.md)).
- [ ] `/api/partages/<id>` est servi par la fonction et non par `index.html`.
- [ ] Une écriture depuis la prévisualisation reçoit 403 ; la redirection 301 de `calendrier-vjeantet.netlify.app` ne touche pas les adresses de prévisualisation.
- [ ] Les blobs sont rangés à Francfort (`eu-central-1`).
- [ ] En production, un partage complet : création, email reçu sans lien réécrit, lien public, lien de gestion, publication, récupération, confirmation, arrêt.
