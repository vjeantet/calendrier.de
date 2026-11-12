# 08 : Page du lecteur `/@/<id>`

Status: ready-for-agent
Blocked by: 03, 06
Spec: [`PARTAGE.md`](../../../PARTAGE.md), sections « Page du lecteur `/@/<id>` » et « Captures à ajouter ». Décision : [Comment la page `/@/<id>` affiche l'instantané](../../partage/issues/16-page-lecteur.md).

## À construire

La page que voit le lecteur, servie par `index.html` :

- routes `/@/<id>`, `/@/<id>/aaaa`, `/@/<id>/aaaa/mm` reconnues par `analyserChemin` ; flèches de semestre vers `/@/<id>/aaaa/mm` ; titre jamais dans l'URL ;
- normalisation de la saisie (minuscules, sans accents ; espace, point et soulignement acceptés pour le trait d'union) puis `replaceState` vers la forme canonique ; identifiant mal formé → page commune sans appel à l'API ;
- « Chargement… » à la place du calendrier, un seul `GET /api/partages/<id>` en `no-store`, puis rendu en une fois par l'affichage du [ticket 03](03-affichage-edition-separes.md) et nouvelle mise à l'échelle ;
- les états 200, 404, 429, réseau ou 5xx (« Réessayer ») du tableau « Chargement et erreurs » ;
- la liste des périodes en lecture seule (pastille, libellé, dates, « non affichée », clic sur une bande qui signale sa ligne ; masquée sans période) ;
- `#titre` non éditable, `#url`, `<title>`, lien « Données personnelles » à l'écran seulement ; ni bandeau, ni « Réinitialiser », ni « Partager » ;
- les **captures** de la page : `outils/captures/serveur.py` simule `GET /api/partages/<id>` sans clé (identifiant de démonstration qui renvoie l'instantané de la fixture, un 404, un 429, un 500, et une réponse retenue pour « Chargement… »). C'est le premier ticket qui simule l'API : la simulation est écrite pour que les tickets [09](09-bandeau-auteur.md) et [10](10-arrivee-lien-gestion.md) l'étendent.

## Critères d'acceptation

- [ ] Avec `netlify dev` et un partage semé, `/@/<id>` montre le semestre `debut` et les annotations ; `/@/<id>/2026/09` montre ce semestre ; les flèches gardent `/@/<id>`.
- [ ] `/@/Girafe.Tambour_Citron 27` devient `/@/girafe-tambour-citron-27` sans rechargement ; `/@/girafe-27` affiche la page commune et aucune requête ne part (vérifié dans l'onglet réseau ou par Playwright).
- [ ] Aucune lecture ni écriture du stockage local du lecteur (Playwright : stockage identique avant et après, même avec des annotations locales présentes).
- [ ] Aucun `contenteditable`, aucune palette, aucun pinceau, aucune sélection de périodes ; la liste des périodes n'a ni ✕, ni champ, ni choix de couleur.
- [ ] 404, 429, erreur réseau et 5xx affichent chacun leur texte ; « Réessayer » relance la requête ; jamais « n'existe pas » pour une erreur réseau.
- [ ] `print.css` imprime le calendrier et la ligne `#url`, sans le lien « Données personnelles ».
- [ ] La page locale (`/`, `/Claire`, `/2014/04`) est inchangée : `compare.sh` ne montre aucun écart.
- [ ] Nouvelles captures, à 1440 × 900 sauf mention : semestre `debut`, autre semestre (`/@/<id>/aaaa/mm`), liste des périodes en lecture seule (1200 × 1500), « Chargement… », page commune (404), identifiant mal formé et saisie normalisée, 429, erreur réseau avec « Réessayer » ; impression du semestre `debut`.
- [ ] Les captures existantes ne changent pas : `compare.sh` contre une série prise avant le ticket ne montre aucun écart sur elles.
- [ ] Deux exécutions successives de `captures.sh` donnent des captures identiques.
- [ ] Aucun identifiant de démonstration ni état simulé n'entre dans `public/` : tout passe par `serveur.py` et `fixture.js`.

## Hors de ce ticket

- L'arrivée de l'auteur par `#cle=` : [ticket 10](10-arrivee-lien-gestion.md).
- Le repli `<meta name="robots">` n'est à écrire que si le [ticket 16](16-verifications-netlify.md) montre que `X-Robots-Tag` ne s'applique pas.
