# Forme de l'identifiant public

Type: grilling
Status: resolved
Blocked by: 03
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Quelle forme exacte prend l'identifiant public : trois noms communs + un nombre de 10 à 99 (proposé), ou une autre forme, à au moins 35 bits environ ?

À trancher avec les résultats de la recherche sur la liste de mots : taille et source de la liste, critères d'exclusion, séparateur, nombre (10–99 ou autre), tolérance à la saisie (majuscules, accents tapés par le lecteur), versionnement de la liste dans le dépôt.

À trancher aussi : la source et sa licence (la licence de Lexique 4 est incohérente sur lexique.org, BY-SA ou BY-NC), le placement de la liste dérivée dans un fichier distinct sous la licence de sa source, et qui fait la relecture humaine des mots connotés (le filtrage automatique n'en attrape presque aucun).

## Answer

1. **Structure.** Trois noms communs puis un nombre de 10 à 99, séparés par des traits d'union, en minuscules : `girafe-tambour-citron-27`. Un même nom n'apparaît pas deux fois. Avec 1 024 à 1 500 noms, cela fait 36,5 à 38 bits. Écartés : un nombre de 100 à 999 (un chiffre de plus à dicter), quatre noms (plus long à retenir), trois noms seuls (30 à 32 bits, sous le plancher de 35). La marge suppose une limitation de débit sur la lecture, qui reste à préciser dans « Limitation des envois ».
2. **Séparateur.** Le trait d'union. Le point se confond à l'oral et ressemble à un nom de domaine ; l'absence de séparateur crée des découpages ambigus (Gfycat).
3. **Source et licence.** Lexique 4.10, seule source qui mesure la prévalence (la part des gens qui connaissent le mot). On retient CC BY-SA 4.0, la licence écrite dans le `README-Lexique.txt` de l'archive ; l'incohérence du lien BY-NC de lexique.org est notée. Si BY-NC se confirme, on se replie sur Lexique 3.83, sans ambiguïté sous BY-SA. Écrire aux auteurs de Lexique est souhaitable, mais rien n'en dépend.
4. **Critères de la liste.** On garde les filtres de la recherche : nom, forme de base au singulier, `a-z` seulement, 4 à 8 lettres, prévalence ≥ 95 %, fréquence ≥ 1 par million, emploi dominant comme nom, sans homophone fréquent, pas deux mots à une lettre près. La relecture écarte en plus :
   - les mots connotés (grossiers, morbides, violents, sexuels, religieux) ;
   - les anglicismes d'orthographe incertaine ;
   - les mots en `oe` (`soeur`, `oeil`) ;
   - l'un des deux mots de chaque paire masculin/féminin ;
   - les variantes de la réforme de 1990.

   Pas de mots accentués, pas d'exigence de préfixe unique. **Taille** : tous les mots qui survivent à la relecture (environ 1 450 à 1 550), sans tronquer, avec un plancher de 1 024. En dessous, on relâche la fréquence avant la prévalence. Pas de filtre sur les combinaisons de mots : un auteur gêné par son identifiant arrête le partage et le recrée, ce qui déclenche un nouveau tirage.
5. **Relecture humaine.** Un agent pré-trie les candidats et marque ceux à écarter probablement ; l'auteur du site tranche. La relecture a lieu pendant l'implémentation.
6. **Emplacement.** Un répertoire indépendant de l'hébergeur, `donnees/noms-communs/`, contient :
   - `noms.txt` : un nom par ligne, sous CC BY-SA 4.0 ;
   - `LICENCE` ;
   - `SOURCE.md` : attribution et citation de Lexique 4.10, filtres, date, règle de relecture.

   Le script d'extraction est versionné à côté, sous Apache 2.0 ; Lexique ne l'est pas. Le `README` signale l'exception de licence. Seule la fonction de tirage embarque la liste, le navigateur n'en a pas besoin.
7. **Évolution de la liste.** Elle se modifie librement (ajouts, retraits) et git suffit à la versionner. Le serveur retrouve un partage par la chaîne exacte de son identifiant : retirer un mot ne touche pas les identifiants déjà attribués.
8. **Réutilisation.** Un identifiant libéré (partage arrêté ou supprimé) peut être tiré de nouveau. Le risque, de l'ordre de 10⁻⁷ par tirage, ne justifie pas de conserver une trace des identifiants supprimés.
9. **Tolérance à la saisie.** La page `/@/` normalise ce que tape le lecteur : minuscules, accents retirés, espace, point et soulignement acceptés à la place du trait d'union. Elle remplace ensuite l'URL par la forme canonique. Aucune correction des fautes de frappe, des pluriels ni des mots proches : elle pourrait ouvrir le partage de quelqu'un d'autre. L'API n'accepte que la forme canonique.

Pas d'ADR : la forme se change pour les nouveaux tirages sans migration, et la licence suit mécaniquement la source.
