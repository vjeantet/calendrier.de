# 03 : Séparer affichage et édition des annotations

Status: ready-for-agent
Blocked by: 02
Spec: [`PARTAGE.md`](../../../PARTAGE.md), section « Découpe du code d'affichage ». Décision : [Comment la page `/@/<id>` affiche l'instantané](../../partage/issues/16-page-lecteur.md).

## À construire

Un refactoring sans changement visible, qui prépare la page du lecteur. `detailsjour.js` et `periodes.js` exposent chacun :

- un **affichage**, qui reçoit un objet ordinaire `{ jourdetails, jourcouleurs, moislibelles, jourbandes }` et ne lit pas le stockage local ;
- une **couche d'édition**, qui écrit dans le stockage local comme aujourd'hui.

La page locale lit les quatre clés locales, appelle l'affichage, puis branche l'édition. La lecture seule vient de l'absence de la couche d'édition : pas d'indicateur `lectureSeule`, pas d'objet « source » à deux adaptateurs. L'asynchronisme reste hors des deux scripts.

`Calendrier.afficher` reçoit le titre et le semestre au lieu de les lire seulement dans l'URL ; sans argument, il garde le comportement actuel.

Une fonction `remplacerAnnotationsLocales(donnees)` remplace les quatre clés locales par celles d'un objet, en une seule fois.

## Critères d'acceptation

- [ ] La page locale se comporte comme avant : saisie des jours, palette, pinceau, périodes, libellés de mois, titre, « Réinitialiser ». `outils/captures/compare.sh` ne montre aucun écart.
- [ ] Appeler l'affichage avec un objet, sans brancher l'édition, rend les annotations sans `contenteditable`, sans palette, sans pinceau et sans sélection de périodes, et ne lit ni n'écrit le stockage local. Une page de test ou un script Playwright le montre.
- [ ] Les jours fériés gardent le dernier mot sur les annotations, comme aujourd'hui.
- [ ] `Calendrier.afficher(titre, semestre)` rend le titre et le semestre donnés, quelle que soit l'URL.
- [ ] `remplacerAnnotationsLocales` remplace les quatre clés (une clé vide est retirée, comme le fait déjà le stockage) ; la page rechargée affiche les nouvelles annotations.

## Hors de ce ticket

- La route `/@/` et la liste des périodes en lecture seule : [ticket 08](08-page-lecteur.md).
- L'usage de `remplacerAnnotationsLocales` : [ticket 10](10-arrivee-lien-gestion.md).
