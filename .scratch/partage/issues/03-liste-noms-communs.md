# D'où tirer une liste d'environ 1 024 noms communs français

Type: research
Status: resolved
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Quelles sources sous licence libre permettent de constituer une liste fermée d'environ 1 024 noms communs français pour l'identifiant public (`girafe-tambour-citron-27`) ?

- Sources candidates (Lexique 3, listes diceware françaises, listes de fréquence…) : licence, compatibilité avec Apache 2.0, attribution requise.
- Critères de filtrage applicables : fréquence (mots connus), longueur (4 à 8 lettres ?), sans accent ni caractère spécial une fois écrit en minuscules (ou mots dont la forme sans accent reste évidente), pas d'homophones gênants, pas de mots grossiers ou connotés, singulier.
- Combien de noms restent après filtrage, et donc quelle entropie atteignent trois noms + un nombre de 10 à 99 ?
- Ce que font les schémas existants comparables (what3words, EFF wordlists, Magic Wormhole, gfycat…) pour la mémorisation et la dictée, et leurs pièges connus.

## Answer

- Sources libres utilisables : Lexique 4.10 et 3.83 (CC BY-SA 4.0, attribution), lexique Grammalecte 7.7 (MPL 2.0) ; la liste BIP39 française (MIT) ne donne qu'environ 960 noms sans accent ni homophone. Une liste dérivée garde la licence de sa source (fichier à part, à côté du code Apache 2.0).
- Lexique 4.10 est la seule à mesurer la prévalence (part des gens qui connaissent le mot). Noms singuliers, `a-z`, 4-8 lettres, prévalence ≥ 95 %, fréquence ≥ 1/million, sans homophone fréquent : **1 724 noms**. Après relecture manuelle (mots connotés, anglicismes, environ 10-15 % sur un échantillon) : environ 1 450-1 550.
- Les mots grossiers ou morbides ne se filtrent pas automatiquement, et le tri par fréquence de sous-titres favorise des mots abstraits ou violents (`girafe` n'est que 1 387ᵉ).
- Trois noms + `10-99` : 36,5 bits avec 1 024 noms, 37,5 avec 1 296, 39,5 avec 2 048.
- Pièges documentés ailleurs (EFF, BIP39, what3words, Gfycat, Docker) : pluriels, homophones, mots à une lettre près, découpage sans séparateur, combinaisons gênantes.
- Détails, méthode et sources : [../recherches/03-liste-noms-communs.md](../recherches/03-liste-noms-communs.md).
