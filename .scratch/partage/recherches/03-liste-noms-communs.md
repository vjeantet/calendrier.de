# D'où tirer une liste d'environ 1 024 noms communs français

Recherche pour le ticket [03 — liste de noms communs](../issues/03-liste-noms-communs.md). Sources consultées le **2026-11-10** (toutes les dates de consultation ci-dessous sont celles-là). Aucune liste n'est versionnée dans le dépôt : les fichiers ont été téléchargés et filtrés hors du dépôt, uniquement pour estimer des effectifs.

## En bref

- **Trois sources libres** permettent d'obtenir plus de 1 024 noms après filtrage automatique : Lexique 4.1 et Lexique 3.83 (CC BY-SA 4.0), le lexique Grammalecte 7.7 (MPL 2.0). La liste BIP39 française (MIT) ne suffit pas seule : environ 960 noms sans accent ni homophone, avant tout seuil de fréquence.
- Avec Lexique 4.1 (fréquence + **prévalence**, c'est-à-dire la part des gens qui connaissent le mot), les filtres du ticket laissent **1 724 noms** ; une relecture manuelle d'un échantillon en écarterait de l'ordre de 10 à 15 % (mots connotés, anglicismes), soit environ 1 450 à 1 550 noms.
- **Entropie** de l'identifiant public `nom-nom-nom-NN` (NN de 10 à 99) : 36,5 bits avec 1 024 noms, 37,5 bits avec 1 296, 39,5 bits avec 2 048.
- Le choix de la source est surtout une **question de licence** : une liste dérivée de Lexique doit rester sous CC BY-SA 4.0 ; une liste dérivée de Grammalecte reste sous MPL 2.0. Ni l'une ni l'autre ne devient Apache 2.0, mais toutes deux peuvent cohabiter dans le dépôt comme fichier sous sa propre licence.

## 1. Sources et licences

| Source | Contenu utile | Licence (source primaire) | Attribution | Remarques |
|---|---|---|---|---|
| **Lexique 4.10** (New, Pallier, Schalchli, Bourgin, Gimenes, 2026) | 190 000 formes ; catégorie, lemme, nombre, phonologie, fréquence sur 316 M mots de sous-titres, **prévalence** (% de participants qui connaissent le lemme) | README de l'archive : « CC BY SA40.0 » ([Lexique4.1.zip](https://www.lexique.org/databases/Lexique410/Lexique4.1.zip), fichier `README-Lexique.txt`). La page d'accueil [lexique.org](https://www.lexique.org/) écrit « Creative Commons Attribution – Partage dans les mêmes conditions 4.0 » mais le lien pointe vers `by-nc/4.0` : **incohérence** à lever (le texte et le README disent BY-SA). | Oui, et citation de l'article (Behavior Research Methods 58(5), 140) | Version la plus récente ; la seule à fournir la prévalence. Définition de la prévalence : manuel `Lexique4.pdf` de l'archive (données 2010-2014 du site « Combien de mots connaissez-vous ? »). |
| **Lexique 3.83** | 142 694 formes ; fréquences films (sous-titres) et livres, phonologie | CC BY-SA 4.0 : [README-Lexique.md d'openlexicon](https://github.com/chrplr/openlexicon/blob/master/datasets-info/Lexique383/README-Lexique.md) ; fichier : [Lexique383.tsv](http://www.lexique.org/databases/Lexique383/Lexique383.tsv) | Oui | Base historique, utilisée par les listes diceware françaises récentes. |
| **Lexique Grammalecte 7.7** (Dicollecte, 2025) | Formes fléchies avec lemme, étiquettes (`nom mas sg`…), « indice de fréquence » 0-9 calculé sur Google 1-grams, Wikipédia, Wikisource, littérature | **MPL 2.0** : en-tête du fichier et `README_lexique.txt` de [lexique-grammalecte-fr-v7.7.zip](https://grammalecte.net/dic/lexique-grammalecte-fr-v7.7.zip), lien depuis [grammalecte.net](https://grammalecte.net/) | Notice MPL conservée | Fréquence écrite (pas orale) ; pas de phonologie fiable (champ « Metaphone2 » approximatif). |
| **BIP39, liste française** (2 048 mots) | Liste déjà triée pour la mémorisation (règles ci-dessous) | **MIT** : [bip-0039.mediawiki](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) (« License: MIT », section Copyright) ; liste : [french.txt](https://github.com/bitcoin/bips/blob/master/bip-0039/french.txt) | Notice MIT | Noms, adjectifs et verbes mélangés ; accents `é`/`è` admis. |
| **diceware-fr-alt** (Arthur Pons, 2018) | Liste diceware construite depuis Lexique 3 (4-9 lettres, sans accent, fréquents, sans homophone, sans vulgarité retirée à la main) | **MIT** : [LICENSE](https://github.com/ArthurPons/diceware-fr-alt/blob/master/LICENSE), [README](https://github.com/ArthurPons/diceware-fr-alt/blob/master/README.md) | Notice MIT | Dérivée d'une base CC BY-SA mais publiée sous MIT : la chaîne de licences n'est pas claire. Forkée par `numerique-gouv/diceware-fr-alt`. Noms, verbes et adjectifs mélangés. |
| **mbelivo/diceware-wordlists-fr** | Listes 1 296 / 4 096 / 7 776 mots générées depuis Lexique, sans homophones | **Aucun fichier de licence trouvé** à la racine ([README](https://github.com/mbelivo/diceware-wordlists-fr/blob/master/README.md)) | — | Inutilisable en l'état faute de licence. |
| **chmduquesne/diceware-fr** | Liste diceware 5 dés (C.-M. Duquesne) | CC BY 3.0 selon le [README](https://github.com/chmduquesne/diceware-fr/blob/master/README.md) | Oui | Le README de diceware-fr-alt lui reproche mots obscurs, symboles, homophones. |
| **Wiktionnaire** (listes de fréquence) | Listes de fréquence en pages wiki | CC BY-SA (pied de page de [Wiktionnaire:Listes de fréquence](https://fr.wiktionary.org/wiki/Wiktionnaire:Listes_de_fr%C3%A9quence)) | Oui | Sans catégorie grammaticale ni phonologie exploitables directement. |
| **FrequencyWords** (Hermit Dave, OpenSubtitles) | Fréquences brutes sur sous-titres | « CC-by-sa-4.0 for content » ([README](https://github.com/hermitdave/FrequencyWords/blob/master/README.md)) | Oui | Formes brutes, sans lemme ni catégorie. |

### Compatibilité avec Apache 2.0

- **CC BY-SA 4.0** : le partage d'une œuvre adaptée impose une licence aux mêmes éléments (« Attribution and ShareAlike ») ([legalcode, §3(b)](https://creativecommons.org/licenses/by-sa/4.0/legalcode.txt)). Pour une base de données, extraire « une partie substantielle » du contenu et la partager déclenche les conditions de §3(a) (attribution), et la base qui la reçoit est une œuvre adaptée, « mais pas ses éléments individuels » (§4(b) et (c)). Conséquence pratique : une liste tirée de Lexique se publie sous CC BY-SA 4.0, avec attribution, comme fichier distinct ; le reste du dépôt reste sous Apache 2.0. Repère (politique de l'ASF, qui ne s'impose pas à ce dépôt) : l'ASF n'accepte le CC BY-SA que pour des médias non modifiés, pas dans le code source ([apache.org/legal/resolved.html](https://www.apache.org/legal/resolved.html), « Unmodified media under the Creative Commons Attribution-Share Alike license »).
- **MPL 2.0** : un fichier obtenu par « suppression » dans un fichier couvert est une Modification (§1.10) et reste sous MPL ; on peut le combiner dans un « Larger Work » sous d'autres termes (§3.3) ([texte MPL 2.0](https://www.mozilla.org/media/MPL/2.0/index.txt)). L'ASF range la MPL en catégorie B (inclusion sous conditions) ([resolved.html](https://www.apache.org/legal/resolved.html)).
- **MIT** (BIP39, diceware-fr-alt) et **CC BY** : catégorie A pour l'ASF, compatibles avec Apache 2.0 moyennant la notice ([resolved.html](https://www.apache.org/legal/resolved.html)).
- Ce qui précède décrit les textes des licences ; ce n'est pas un avis juridique.

## 2. Filtres et effectifs

### Méthode

Fichiers téléchargés hors du dépôt, lus par un script Python (`python3 -I`) écrit à part. Filtres appliqués dans l'ordre sur **Lexique 4.10** (`Lexique4.1.tsv`, 189 863 lignes) :

1. `5_Cgram = NOM`, `1_Mot = 4_Lemme` (forme de base), `8_Nombre` singulier ou vide (invariable).
2. Lettres `a-z` seulement : ni accent, ni trait d'union, ni apostrophe, ni espace.
3. Longueur 4 à 8 lettres.
4. Prévalence (`33_Preval`) ≥ 95 %.
5. Fréquence du mot comme nom (`10_FreqMot`) ≥ 1 par million.
6. Le nom est l'emploi dominant de la forme (≥ 50 % de `11_FreqOrtho`), pour écarter « porte » verbe, « mince » interjection, etc.
7. Homophones : aucune autre forme de **même transcription phonétique** (`2_Phono`) et d'orthographe différente avec une fréquence ≥ 1 par million. Ne comptent pas comme homophones les flexions du même mot (pluriel en `-s`/`-x`, formes `-nt`, `-es`, `-ent`, formes dont le lemme est le nom lui-même).
8. (Optionnel) Sélection gloutonne par fréquence décroissante : pas deux mots à une lettre près (distance d'édition 1), puis préfixe de 4 lettres unique.

Les mots grossiers ou connotés ne se filtrent pas automatiquement : la liste française de [LDNOOBW](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/blob/master/fr) (CC BY 4.0, 91 entrées) n'en attrape que 7 sur la liste finale. La part à écarter à la main est estimée sur un échantillon aléatoire de 200 mots relus.

### Effectifs Lexique 4.10

| Étape | Noms restants |
|---|---:|
| Noms, forme de base, singulier ou invariable | 42 471 |
| Lettres `a-z` seulement | 28 268 |
| 4 à 8 lettres | 16 199 |
| Prévalence ≥ 95 % | 3 379 |
| Fréquence ≥ 1 / million | 2 177 |
| Emploi dominant comme nom | 1 927 |
| **Sans homophone fréquent** | **1 724** |
| (info) sans homophone même rare (≥ 0,1 / million) | 1 607 |
| + pas deux mots à une lettre près (glouton) | 1 499 |
| + préfixe de 4 lettres unique (glouton) | 1 225 |

Sensibilité aux seuils (étapes 1-3, 6, 7 fixes) :

| Prévalence \ fréquence | ≥ 0,5 | ≥ 1 | ≥ 2 | ≥ 5 |
|---|---:|---:|---:|---:|
| ≥ 90 % | 2 653 | 2 141 | 1 640 | 1 050 |
| ≥ 95 % | 2 065 | 1 724 | 1 364 | 894 |
| ≥ 98 % | 1 479 | 1 271 | 1 024 | 686 |

Longueur (prévalence ≥ 95 %, fréquence ≥ 1) : 4-7 lettres → 1 342 ; 4-8 → 1 724 ; 5-8 → 1 612 ; 4-9 → 2 054. Le passage de 3 à 4 lettres minimum ne change presque rien (1 725 contre 1 724).

Observations sur la liste de 1 724 :

- Classés par fréquence, le 1 024ᵉ nom est à 3,8 occurrences par million. Les 1 024 premiers font 6,3 lettres en moyenne ; 782 ont une prévalence de 100 %.
- L'exemple de `PARTAGE.md` tient dedans, mais pas dans un « top 1 024 » purement fréquentiel : `citron` est 688ᵉ, `tambour` 1 035ᵉ, `girafe` 1 387ᵉ (1,9 / million). Les mots imagés et concrets ne sont pas les plus fréquents dans les sous-titres ; les plus fréquents sont souvent abstraits (`chose`, `besoin`, `accord`, `raison`).
- Les sous-titres font remonter beaucoup de mots connotés : `putain`, `meurtre`, `crime`, `victime`, `drogue`, `cancer`, `suicide`, `cadavre`… Sur l'échantillon de 200 relu, environ 9 % seraient à écarter comme grossiers, morbides ou violents (`noyade`, `massacre`, `tuerie`, `cyanure`, `famine`, `sexe`, `fesse`, `merdier`…) et environ 5 % comme anglicismes d'orthographe incertaine à la dictée (`showbiz`, `glamour`, `cookie`, `reggae`, `scoop`…). Estimation : **1 450 à 1 550 noms** après relecture.
- Lexique écrit `œ` en `oe` : `soeur`, `oeil`, `noeud` passent le filtre `a-z`.
- Homophones masculin/féminin non détectés par la règle 7 (même lemme) : 8 cas, par exemple `inconnu`/`inconnue`, `rival`/`rivale`, `futur`/`future`.
- Variantes orthographiques de la réforme de 1990 non filtrées (`oignon`/`ognon` est dans la liste) ; BIP39 en fait une règle (n° 15 ci-dessous).

### Variante « accents tolérés »

Si l'on accepte des mots accentués dont la forme sans accent n'est la graphie d'aucun autre mot de Lexique : **+372 noms** (`probleme`, `frere`, `hopital`, `cafe`, `fenetre`…), 115 autres étant ambigus une fois désaccentués (`cote` pour `côte`/`coté`, `peche`, `crepe`…). L'identifiant public afficherait alors `fenetre`, que le lecteur peut taper `fenêtre`.

### Autres sources, mêmes filtres (sans prévalence, qu'elles n'ont pas)

| Source | Noms `a-z`, 4-8 lettres, base | + fréquence | + sans homophone fréquent |
|---|---:|---:|---:|
| Lexique 3.83 | 11 386 | 3 072 (≥ 1/million en films **et** en livres) | 2 669 |
| Grammalecte 7.7 | 15 713 | 3 932 (indice ≥ 6) ; 1 340 (indice ≥ 7) | 3 258 (indice ≥ 6, phonétique de Lexique 3.83) |
| BIP39 français | 1 090 noms `a-z` reconnus par Lexique 4 sur 2 048 mots | — | 956 (emploi dominant nom) ; 674 avec prévalence ≥ 95 % |

Sans prévalence, la fréquence seule laisse passer plus de mots rares ou techniques ; Lexique 4 est la seule des trois à mesurer directement « mot connu ». Grammalecte mesure une fréquence écrite (Google Books, Wikipédia), plus éloignée de la langue parlée.

## 3. Entropie

Espace des identifiants publics = N³ × (nombre de valeurs du nombre). Colonne « essais » : nombre moyen d'essais au hasard pour tomber sur **un** partage quelconque parmi 10 000 (espace ÷ 10 000), comme dans `PARTAGE.md`.

| N noms | 3 noms + 10-99 | essais (10 000 partages) | 3 noms + 100-999 | 4 noms, sans nombre | 3 noms seuls |
|---:|---:|---:|---:|---:|---:|
| 512 | 33,5 bits | 1,2 × 10⁶ | 36,8 bits | 36,0 bits | 27,0 bits |
| 1 024 | **36,5 bits** | 9,7 × 10⁶ | 39,8 bits | 40,0 bits | 30,0 bits |
| 1 296 | 37,5 bits | 2,0 × 10⁷ | 40,8 bits | 41,4 bits | 31,0 bits |
| 1 500 | 38,1 bits | 3,0 × 10⁷ | 41,5 bits | 42,2 bits | 31,7 bits |
| 2 048 | 39,5 bits | 7,7 × 10⁷ | 42,8 bits | 44,0 bits | 33,0 bits |

- Interdire la répétition d'un même nom dans un identifiant ne coûte rien de mesurable (1 024 × 1 023 × 1 022 × 90 : 36,5 bits).
- Chaque doublement de N ajoute 3 bits (trois noms) ; passer de 2 à 3 chiffres ajoute 3,3 bits ; un quatrième nom ajoute log₂ N.
- La taille de liste n'a pas besoin d'être une puissance de 2 : le tirage serveur peut tirer uniformément dans N quelconque.

## 4. Schémas comparables

**EFF wordlists (2016)** ([article](https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases), contenus du site sous CC BY 4.0 selon [eff.org/copyright](https://www.eff.org/copyright)) : construites à partir des données de reconnaissance de mots de l'université de Gand, en privilégiant les mots **les plus reconnus puis les plus concrets** ; 3 à 9 lettres ; retrait manuel et par listes des mots grossiers, insultants ou « émotionnellement chargés » ; retrait des mots difficiles à épeler et des homophones ; aucun mot préfixe d'un autre. Deux listes courtes de 1 296 mots (10,3 bits/mot) ; la seconde a un préfixe unique de 3 lettres et une distance d'édition ≥ 3 entre mots, au prix d'une moindre efficacité (1,4 bit par caractère). L'article reconnaît que la mémorabilité relative des listes n'est pas démontrée.

**BIP39 français** ([règles](https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md#french)) : mots simples et courants ; 5 à 8 lettres ; mot reconnaissable à ses 4 premières lettres (`é`/`è` assimilés à `e`) ; pas de pluriel, pas de féminin d'adjectif ; pas d'homophones d'orthographe différente (`verre`/`vert`) sauf sens nettement dominant ; pas de mots à une lettre près ; pas de `ô â ç ê œ…` ni de finales `é`, `ée`, `è`, `et`, `ai`, `ait` ; pas de gentilés ; pas de conflit avec l'orthographe de 1990 ; pas de mot gênant « dans un très, très large sens » ni religieux.

**what3words** : trois mots pour un carré de 3 m. L'entreprise dit éloigner géographiquement les combinaisons proches (`table.chair.lamp` en Australie, `tables.chair.lamp` au Minnesota) ([support what3words](https://support.what3words.com/en/articles/1520322)). Critiques : sur la liste anglaise de 40 000 mots, 7 697 existent aussi au pluriel, 40 % des mots peuvent être confondus par un « s » entendu ou tapé de travers, et l'auteur estime à 1 sur 27 la confusion d'une adresse dictée ; homophones restants (`incite`/`insight`) ([cybergibbons, 29/04/2021](https://cybergibbons.com/security-2/why-what3words-is-not-suitable-for-safety-critical-applications/)). Une analyse de l'algorithme conclut qu'il « crée beaucoup de paires d'adresses confondables », parfois proches ([Rudy Arthur, arXiv:2308.16025, 2023](https://arxiv.org/abs/2308.16025)). La liste n'est pas publique.

**Magic Wormhole** : code `7-crossover-clockwork`, 16 bits par défaut, suffisants parce qu'un échange PAKE ne laisse qu'**un essai par code** et qu'un échec se voit ; complétion par tabulation des mots à la saisie ([documentation](https://magic-wormhole.readthedocs.io/en/latest/welcome.html)). Liste : la PGP Word List, deux listes (paire/impaire) alternées « pour détecter les mots perdus » ([_wordlist.py](https://github.com/magic-wormhole/magic-wormhole/blob/master/src/wormhole/_wordlist.py)). Le modèle de menace diffère : un identifiant public se devine hors de tout échange, sans limite d'essais autre que celle du serveur.

**Gfycat** (fermé le 1er septembre 2023) : identifiants « adjectif adjectif animal » collés sans séparateur, d'abord en `CamelCase` puis en minuscules par endroits. Sans séparateur, des découpages se chevauchent : `grim+yearly`/`grimy+early`, `first+handsome`/`firsthand+some` ([Archive Team, Gfycat](https://wiki.archiveteam.org/index.php/Gfycat)).

**Noms de conteneurs Docker** (`adjectif_nom`) : le générateur relance un tirage pour une seule combinaison jugée gênante, `boring_wozniak` (« Steve Wozniak is not boring ») ([names-generator.go, moby v26.1.4](https://github.com/moby/moby/blob/v26.1.4/pkg/namesgenerator/names-generator.go)). Illustration : des mots neutres isolément peuvent former une combinaison gênante.

## 5. Conséquences pour la conception

- 1 024 noms est atteignable avec Lexique 4.10 sous des filtres stricts (prévalence ≥ 95 %, fréquence ≥ 1/million, `a-z`, 4-8 lettres, sans homophone), avec une marge d'environ 40 à 50 % avant relecture manuelle ; 2 048 ne l'est pas sans relâcher la prévalence, la fréquence ou les accents.
- La relecture manuelle reste indispensable (aucun filtre automatique ne capte le connoté) et doit couvrir quelques centaines de mots de plus que la taille visée.
- Le tri par fréquence de sous-titres favorise des mots abstraits ou violents ; choisir les 1 024 « meilleurs » demande un autre critère (prévalence, caractère concret, relecture) que la fréquence seule.
- La licence suit la source : CC BY-SA 4.0 (Lexique) ou MPL 2.0 (Grammalecte) pour le fichier de liste, avec attribution ; MIT seulement si l'on part de BIP39, qui ne fournit pas assez de noms seul.
- À 1 024 noms + `10-99`, l'identifiant public fait 36,5 bits ; les leviers pour en gagner sont la taille de liste (+3 bits par doublement), un nombre à 3 chiffres (+3,3 bits) ou un quatrième nom.
- Les pièges documentés ailleurs (pluriels, homophones, mots à une lettre près, découpage sans séparateur, combinaisons gênantes) sont ceux du ticket 05 : séparateur, tolérance à la saisie (accents, majuscules, `s` final), distance minimale entre mots.

## Limites de cette estimation

- Les effectifs dépendent de seuils arbitraires ; le tableau de sensibilité donne l'ordre de grandeur.
- La détection d'homophones repose sur la transcription phonétique de Lexique et sur une heuristique pour les flexions ; elle n'attrape ni les quasi-homophones ni les confusions masculin/féminin.
- La part de mots à écarter à la main vient d'un seul échantillon de 200 mots relu par l'agent : c'est un ordre de grandeur, pas une mesure.
