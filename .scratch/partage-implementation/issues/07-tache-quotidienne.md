# 07 : Tâche quotidienne de ménage

Status: ready-for-agent
Blocked by: 04
Spec: [`PARTAGE.md`](../../../PARTAGE.md), sections « Durées de vie », « Stockage (Netlify Blobs) » et « Tâche quotidienne ». Décisions : [Durées de confirmation et de conservation](../../partage/issues/08-durees-conservation.md), [Que disent les trois emails](../../partage/issues/14-texte-emails.md).

## À construire

La fonction planifiée `netlify/functions/menage.mjs` (`schedule: "@daily"`), qui en une passe de 30 s au plus :

- supprime les partages sans `consulteLe` dont `creeLe` a plus de 7 jours ;
- supprime les partages dont la plus récente des dates `creeLe`, `publieLe`, `consulteLe` a plus de 12 mois ;
- efface l'entrée `emails/<empreinte>/<id>` de chaque partage supprimé ;
- retire les `cleEnAttente` de plus de 48 h ;
- efface les préfixes `limites/<jour>/` des jours passés.

Elle lit les métadonnées par `getMetadata`, sans télécharger les instantanés. Ce qui n'est pas fini dans le temps imparti reprend le lendemain.

## Critères d'acceptation

- [ ] La décision (garder, supprimer, retirer la clé en attente) est une fonction pure de `(métadonnées, maintenant)`, testée par `node --test` aux bornes : 7 jours, 12 mois au jour près, 48 h.
- [ ] Sur un store local semé de partages aux dates variées, une exécution manuelle sous `netlify dev` laisse exactement les partages attendus, sans entrée d'index orpheline, et sans compteur des jours passés ; les compteurs du jour restent.
- [ ] La fonction s'arrête proprement avant 30 s et une seconde exécution termine le travail.
- [ ] Une ressource déjà supprimée (arrêt simultané) ne fait pas échouer la passe.
- [ ] Aucune trace d'identifiant d'adresse ou d'IP dans les journaux ; un résumé chiffré (nombre de suppressions) est permis.
