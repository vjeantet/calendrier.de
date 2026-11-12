# 12 : Captures du partage

Status: wontfix
Blocked by: 08, 09, 10, 11
Spec: [`PARTAGE.md`](../../../PARTAGE.md), section « Captures à ajouter ».

## À construire

L'extension de `outils/captures/` aux nouvelles pages et aux états du partage, sans qu'aucun état de démonstration n'entre dans le code du site :

- `serveur.py` simule l'API : identifiant de démonstration (instantané de la fixture), 404, 429, 500, réponse retenue (« Chargement… »), lectures avec clé `active`, `en-attente` et `invalide` ; écritures qui répondent comme l'API, y compris le 429 journalier, le 429 de Netlify et le 400.
- `fixture.js` remplace l'origine canonique par l'origine locale, remplit `partage` à la demande, et rejoue les gestes indiqués dans l'URL (clic sur « Partager », saisie d'une adresse, envoi, modification d'un jour).
- Les scénarios de la section : page du lecteur (écran et impression), page « Données personnelles » (deux tailles), bandeau de l'auteur (tous les états, messages de limitation et de validation, impression), arrivée par le lien de gestion (quatre cas).

## Critères d'acceptation

- [ ] `outils/captures/captures.sh` produit une capture par scénario de la liste, aux tailles indiquées (1440 × 900 sauf mention).
- [ ] Les captures existantes de la page locale ne changent pas : `compare.sh` contre une série prise avant le ticket ne montre aucun écart sur elles.
- [ ] Deux exécutions successives donnent des captures identiques (`compare.sh`).
- [ ] `git grep` ne trouve aucun identifiant de démonstration ni état simulé dans `public/`.

## Comments

Remplacé : les captures sont rattachées aux tickets qui produisent les écrans. La simulation de la lecture et les captures de `/@/` vont au [ticket 08](08-page-lecteur.md), la simulation des écritures, `fixture.js` et les captures du bandeau au [ticket 09](09-bandeau-auteur.md), la clé en attente et les captures de l'arrivée au [ticket 10](10-arrivee-lien-gestion.md), les captures de la page au [ticket 11](11-page-donnees-personnelles.md). Le numéro reste réservé pour garder la correspondance avec les lots de `PARTAGE.md`.
