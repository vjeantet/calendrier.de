# 01 : Liste de noms communs

Status: ready-for-agent
Blocked by: —
Spec: [`PARTAGE.md`](../../../PARTAGE.md), section « Liste de noms communs ». Décision : [Forme de l'identifiant public](../../partage/issues/05-forme-identifiant-public.md). Recherche : [liste de noms communs](../../partage/recherches/03-liste-noms-communs.md).

## À construire

La liste de noms communs dont la fonction de création tire les identifiants publics (`girafe-tambour-citron-27`), produite par un script reproductible à partir de Lexique 4.10, avec un pré-tri prêt pour la relecture humaine du [ticket 14](14-relecture-liste-noms.md).

Le script lit la licence dans le `README-Lexique.txt` de l'archive. CC BY-SA 4.0 : on garde Lexique 4.10. BY-NC : repli sur Lexique 3.83, et `SOURCE.md` le dit.

## Critères d'acceptation

- [ ] Un script versionné sous `donnees/noms-communs/`, sous licence Apache 2.0 (en-tête), télécharge l'archive Lexique et produit les fichiers ci-dessous. Deux exécutions donnent le même résultat.
- [ ] Filtres automatiques appliqués : nom, forme de base au singulier, `a-z` seulement, 4 à 8 lettres, prévalence ≥ 95 %, fréquence ≥ 1 par million, emploi dominant comme nom, sans homophone fréquent, pas deux mots à une lettre près.
- [ ] Le pré-tri marque, avec une raison lisible, les candidats que la règle de relecture écarterait : mots connotés (grossiers, morbides, violents, sexuels, religieux), anglicismes d'orthographe incertaine, mots en `oe`, l'un des deux mots de chaque paire masculin/féminin, variantes de la réforme de 1990. Il est versionné à côté de la liste, dans un format facile à relire et à corriger à la main.
- [ ] `donnees/noms-communs/noms.txt` : un nom par ligne, sans doublon, trié, sans les candidats marqués. Au moins 1 024 noms ; en dessous, le script relâche la fréquence avant la prévalence et l'indique.
- [ ] `donnees/noms-communs/LICENCE` (CC BY-SA 4.0) et `donnees/noms-communs/SOURCE.md` : attribution et citation de Lexique, version et licence lues dans l'archive, filtres, date d'extraction, règle de relecture, nombre de noms.

## Hors de ce ticket

- La relecture finale par l'auteur : [ticket 14](14-relecture-liste-noms.md).
- L'exception de licence dans le README : [ticket 13](13-readme.md).
- Le tirage de l'identifiant et `included_files` : tickets [04](04-fondations-api.md) et [05](05-creation.md).

Le téléchargement de Lexique peut demander d'autoriser son hôte dans l'environnement de l'agent.
