# 13 : Mettre le README à jour

Status: ready-for-agent
Blocked by: —
Spec: [`PARTAGE.md`](../../../PARTAGE.md), sections « Domaine et configuration Netlify », « Les emails » (forme commune) et « Liste de noms communs ».

## À construire

Le README tient compte du partage :

- `calendrier.vjeantet.fr` remplace partout `calendrier.sodadi.fr` ;
- le risque accepté qu'un abus épuise les crédits mensuels de Netlify et mette tout le compte en pause, site statique compris ;
- la règle « ne jamais créer l'enregistrement DNS `t.calendrier.vjeantet.fr` », qui activerait le suivi des clics chez Sweego ;
- l'exception de licence : `donnees/noms-communs/noms.txt` est sous CC BY-SA 4.0 (dérivé de Lexique), le reste du dépôt et le script d'extraction sous la licence du projet.

## Critères d'acceptation

- [ ] `git grep sodadi` ne trouve plus rien hors de `.scratch/` et de `PARTAGE.md`.
- [ ] Les trois points (pause du compte, `t.calendrier.vjeantet.fr`, exception de licence) sont dans le README, chacun en une ou deux phrases.
- [ ] La section « LICENCE » existante est complétée, pas remplacée.
