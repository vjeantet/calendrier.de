# 09 : Bandeau de partage de l'auteur

Status: ready-for-agent
Blocked by: 02, 05, 06, 08, 17
Spec: [`PARTAGE.md`](../../../PARTAGE.md), sections « Navigateur de l'auteur » (sauf « Arrivée par le lien de gestion ») et « Captures à ajouter ». Décisions : [Comment l'instantané se met à jour](../../partage/issues/04-mise-a-jour-instantane.md), [À quoi ressemble l'interface de partage pour l'auteur](../../partage/issues/09-prototype-interface-auteur.md). Mise en page et textes de départ : branche `prototype/interface-partage`, variante B.

## À construire

Sur la page locale, le bouton « Partager » et le bandeau entre `#entete` et `#calendrier`, avec tous les états du tableau « Le bandeau de partage » : non partagé, formulaire, lien envoyé, « J'ai déjà un lien », partagé, modifications non publiées, arrêter, clé remplacée.

- État local : une clé `partage = { id, cle, empreinte }` et un drapeau de session dans `sessionStorage`.
- Indicateur de modifications non publiées : empreinte des quatre clés préparées (`Instantane`), comparée au chargement et à chaque modification.
- Vérification de session une fois par session et à chaque publication, avec ses trois issues (404, clé `invalide`, sinon `publieLe`).
- Création (`POST /api/partages`), récupération (`POST /api/liens`), publication (`PUT`), arrêt (`DELETE`).
- Tous les messages d'erreur de la section, dont les deux 429 distingués par le corps, et les refus avant envoi (titre > 100 caractères, corps > 100 000 octets).
- Confirmation de « Réinitialiser » complétée quand `partage` existe ; « Réinitialiser » ne touche pas à `partage`.
- Bandeau et bouton présents seulement sur l'origine canonique (constante JS de même valeur que `URL_PUBLIQUE`), masqués à l'impression, exclus de la mise à l'échelle.
- Les **captures** du bandeau. `serveur.py`, qui simule déjà la lecture depuis le [ticket 08](08-page-lecteur.md), répond aussi aux écritures comme l'API (`POST /api/partages`, `POST /api/liens`, `PUT`, `DELETE`, y compris le 429 journalier, le 429 de Netlify et le 400) et aux lectures avec une clé `active` ou `invalide`. `fixture.js` remplace l'origine canonique par l'origine locale, remplit `partage` à la demande, et rejoue les gestes indiqués dans l'URL (clic sur « Partager », saisie d'une adresse, envoi, modification d'un jour).

## Critères d'acceptation

- [ ] Avec `netlify dev` (constante d'origine canonique pointée sur l'origine locale) et `EMAIL_SIMULE=1`, le parcours « Partager → adresse → Recevoir le lien » affiche « Lien envoyé » avec l'adresse masquée (`a•••@exemple.fr`), et l'email apparaît dans la console.
- [ ] Avec `partage` posé à la main dans le stockage local (le [ticket 10](10-arrivee-lien-gestion.md) le posera), la ligne verte « Partagé » s'affiche ; modifier un jour la passe en orange avec le rappel de ce qui partira ; annuler la modification la ramène au vert ; « Publier les modifications » la ramène au vert et met `publieLe` à jour.
- [ ] « Arrêter » confirme dans le bandeau, supprime le partage, garde les annotations et revient à « Partager ».
- [ ] Partage supprimé côté serveur → retour silencieux à « non partagé » à la session suivante ; clé remplacée → message unique avec « Compris », annotations gardées.
- [ ] Chaque message d'erreur de la section s'affiche pour la réponse correspondante (simulée si besoin), sans fenêtre flottante.
- [ ] Sur une autre origine que la canonique, ni bandeau ni bouton « Partager ». À l'impression, ni l'un ni l'autre.
- [ ] Le calendrier garde sa taille avec le bandeau ouvert ; la page défile de la hauteur du bandeau.
- [ ] Sans `partage`, la page locale est inchangée hors du bouton « Partager » : `compare.sh` ne montre d'écart que là.
- [ ] Nouvelles captures sur `/Claire/2026/03` annoté, à 1440 × 900 sauf mention : formulaire (aussi à 1000 × 700), lien envoyé, « J'ai déjà un lien » et sa réponse ; ligne « Partagé », modifications non publiées avec le rappel, confirmation d'« Arrêter », partage arrêté, clé remplacée ; « Réessayez demain », « Réessayez dans quelques minutes » ; refus du serveur (400), titre trop long, calendrier trop volumineux ; impression avec un partage actif.
- [ ] Les autres captures ne changent pas, hors du bouton « Partager » sur la page locale : `compare.sh` contre une série prise avant le ticket ne montre aucun écart sur elles.
- [ ] Deux exécutions successives de `captures.sh` donnent des captures identiques.
- [ ] Aucun identifiant de démonstration ni état simulé n'entre dans `public/` : tout passe par `serveur.py` et `fixture.js`.

## Hors de ce ticket

- La page `/@/<id>#cle=…` et le bandeau bleu : [ticket 10](10-arrivee-lien-gestion.md).
