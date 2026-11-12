# 11 : Page « Données personnelles »

Status: ready-for-agent
Blocked by: —
Spec: [`PARTAGE.md`](../../../PARTAGE.md), section « Page « Données personnelles » ». Décisions : [Contenu de la page « Données personnelles »](../../partage/issues/12-page-donnees-personnelles.md), [Que devient une réponse aux emails](../../partage/issues/15-reponses-emails.md).

## À construire

`public/donnees-personnelles.html` : une page statique, sans JavaScript, qui reprend `calendrier.css` pour la typographie, servie à `/donnees-personnelles`. Le plan, le tableau et les formulations sensibles sont fixés par `PARTAGE.md` ; le texte final s'écrit ici, court, en questions, à la première personne :

- qui (Valère Jeantet, à titre personnel), contact par l'alias email, réclamation auprès de la CNIL ;
- quelles données et où : le tableau « donnée / où / combien de temps » en entier, ligne « vos messages » comprise ;
- pourquoi : les deux bases légales, une phrase chacune ;
- qui d'autre les voit : Netlify (transferts vers les États-Unis), Sweego, `code.jquery.com`, le lien vers le DPA de Netlify ; aucun suivi dans les emails ; responsabilité de l'auteur sur ce qu'il publie ;
- combien de temps : la phrase des durées du formulaire de partage, mot pour mot ;
- quels droits : « J'ai déjà un lien » pour l'accès, « Arrêter le partage » pour l'effacement, le contact pour le reste.

## Critères d'acceptation

- [ ] Sous `netlify dev`, `/donnees-personnelles` sert la page, sans passer par la réécriture vers `index.html`.
- [ ] La page est lisible à 1440 × 900 et à 390 × 844, sans défilement horizontal.
- [ ] Chaque ligne du tableau et chaque formulation à reprendre de `PARTAGE.md` y figure sur le fond.
- [ ] L'adresse de contact n'apparaît qu'à un endroit du fichier ; `donnees@vjeantet.fr` par défaut, à confirmer par l'auteur au [ticket 15](15-prerequis-hors-code.md).
- [ ] Aucun script, aucune ressource tierce chargée par la page.

## Hors de ce ticket

- Les liens vers cette page depuis le formulaire, les emails et `/@/<id>` : tickets [09](09-bandeau-auteur.md), [05](05-creation-recuperation.md), [08](08-page-lecteur.md).
- La vérification de l'adresse sur Netlify : [ticket 16](16-verifications-netlify.md).
