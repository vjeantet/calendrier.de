# 09 : Bandeau de partage de l'auteur

Status: ready-for-agent
Blocked by: 02, 05, 06
Spec: [`PARTAGE.md`](../../../PARTAGE.md), section « Navigateur de l'auteur » (sauf « Arrivée par le lien de gestion »). Décisions : [Comment l'instantané se met à jour](../../partage/issues/04-mise-a-jour-instantane.md), [À quoi ressemble l'interface de partage pour l'auteur](../../partage/issues/09-prototype-interface-auteur.md). Mise en page et textes de départ : branche `prototype/interface-partage`, variante B.

## À construire

Sur la page locale, le bouton « Partager » et le bandeau entre `#entete` et `#calendrier`, avec tous les états du tableau « Le bandeau de partage » : non partagé, formulaire, lien envoyé, « J'ai déjà un lien », partagé, modifications non publiées, arrêter, clé remplacée.

- État local : une clé `partage = { id, cle, empreinte }` et un drapeau de session dans `sessionStorage`.
- Indicateur de modifications non publiées : empreinte des quatre clés préparées (`Instantane`), comparée au chargement et à chaque modification.
- Vérification de session une fois par session et à chaque publication, avec ses trois issues (404, clé `invalide`, sinon `publieLe`).
- Création (`POST /api/partages`), récupération (`POST /api/liens`), publication (`PUT`), arrêt (`DELETE`).
- Tous les messages d'erreur de la section, dont les deux 429 distingués par le corps, et les refus avant envoi (titre > 100 caractères, corps > 100 000 octets).
- Confirmation de « Réinitialiser » complétée quand `partage` existe ; « Réinitialiser » ne touche pas à `partage`.
- Bandeau et bouton présents seulement sur l'origine canonique (constante JS de même valeur que `URL_PUBLIQUE`), masqués à l'impression, exclus de la mise à l'échelle.

## Critères d'acceptation

- [ ] Avec `netlify dev` (constante d'origine canonique pointée sur l'origine locale) et `EMAIL_SIMULE=1`, le parcours « Partager → adresse → Recevoir le lien » affiche « Lien envoyé » avec l'adresse masquée (`a•••@exemple.fr`), et l'email apparaît dans la console.
- [ ] Avec `partage` posé à la main dans le stockage local (le [ticket 10](10-arrivee-lien-gestion.md) le posera), la ligne verte « Partagé » s'affiche ; modifier un jour la passe en orange avec le rappel de ce qui partira ; annuler la modification la ramène au vert ; « Publier les modifications » la ramène au vert et met `publieLe` à jour.
- [ ] « Arrêter » confirme dans le bandeau, supprime le partage, garde les annotations et revient à « Partager ».
- [ ] Partage supprimé côté serveur → retour silencieux à « non partagé » à la session suivante ; clé remplacée → message unique avec « Compris », annotations gardées.
- [ ] Chaque message d'erreur de la section s'affiche pour la réponse correspondante (simulée si besoin), sans fenêtre flottante.
- [ ] Sur une autre origine que la canonique, ni bandeau ni bouton « Partager ». À l'impression, ni l'un ni l'autre.
- [ ] Le calendrier garde sa taille avec le bandeau ouvert ; la page défile de la hauteur du bandeau.
- [ ] Sans `partage`, la page locale est inchangée hors du bouton « Partager » : `compare.sh` ne montre d'écart que là.

## Hors de ce ticket

- La page `/@/<id>#cle=…` et le bandeau bleu : [ticket 10](10-arrivee-lien-gestion.md).
- Les captures des états : [ticket 12](12-captures.md).
