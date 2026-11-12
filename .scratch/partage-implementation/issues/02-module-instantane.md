# 02 : Module `instantane.js`

Status: ready-for-agent
Blocked by: —
Spec: [`PARTAGE.md`](../../../PARTAGE.md), sections « L'instantané », « Modifications non publiées » et « Validation de l'instantané ». Décision : [Règles de validation de l'instantané](../../partage/issues/11-validation-instantane.md).

## À construire

Un seul fichier, `public/static/js/calendrier.de/instantane.js`, chargé par le navigateur et par les fonctions Netlify. Il définit la variable globale `Instantane` et se termine par `module.exports` quand `module` existe. Il contient :

- `COULEURS_JOUR`, déplacé depuis `detailsjour.js` ;
- `preparer(cles, titre, debut)`, qui rend un instantané `{ titre, debut, donnees }` propre, sans toucher à son entrée ;
- `verifier(instantane)`, qui rend la première erreur (`"<chemin> : <raison>"`) ou `null` ;
- la sérialisation stable des quatre clés préparées et leur empreinte SHA-256.

Le filtre puis la fusion des périodes n'existent qu'à un endroit : `charger()` de `periodes.js` et `preparer` passent par le même code.

## Critères d'acceptation

- [ ] `index.html` charge `instantane.js` avant `detailsjour.js`, qui lit `COULEURS_JOUR` là. La page locale ne change pas : `outils/captures/compare.sh` ne montre aucun écart avant / après.
- [ ] `verifier` applique toutes les règles de la section « Validation de l'instantané » : champs inconnus rejetés à tout niveau, clé absente = clé vide, formats stricts `jjmmaaaa` / `mmaaaa` / `aaaammjj`, dates réelles, années `0001` à `9999`, `d ≤ f`, couleurs dans `COULEURS_JOUR`, `debut` valide, titre ≤ 100 caractères, caractères de contrôle refusés, chaîne vide acceptée.
- [ ] `preparer` applique toutes les règles de « Préparation » : espaces réduites et rognées, textes de jour vides retirés, libellés de mois vides gardés, couleurs inconnues retirées, périodes filtrées et fusionnées avec `gris` pour une couleur inconnue, clés hors format ou dates inexistantes retirées.
- [ ] Pour toute entrée, `verifier(preparer(...))` vaut `null` dès que le titre fait 100 caractères au plus. Un test le vérifie sur des entrées variées (espaces exotiques, dates impossibles, couleurs inconnues, périodes inversées).
- [ ] L'empreinte ne dépend pas de l'ordre des clés des objets, et deux jeux d'annotations qui ne diffèrent qu'après préparation (espaces en trop) ont la même empreinte. Elle se calcule de la même façon dans le navigateur et sous Node.
- [ ] Tests avec `node --test`, sans dépendance, lancés par une commande documentée.

## Hors de ce ticket

- L'usage de `preparer` et de l'empreinte par le bandeau ([ticket 09](09-bandeau-auteur.md)) et de `verifier` par les fonctions (tickets [05](05-creation.md) et [06](06-lecture-publication-arret-confirmation.md)).
