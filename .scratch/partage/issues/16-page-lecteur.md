# Comment la page `/@/<id>` affiche l'instantané

Type: grilling
Status: resolved
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Comment la page d'un lecteur charge et affiche l'instantané, en lecture seule, avec le code d'affichage du calendrier local ?

Aujourd'hui `detailsjour.js` et `periodes.js` lisent et écrivent le localStorage directement, de façon synchrone, au `document.ready`. Sur `/@/<id>`, les annotations viennent du serveur (`GET /api/partages/<id>`, asynchrone) et ne doivent ni lire ni écrire le stockage local.

À trancher :
- la forme de l'accès aux annotations (la « source ») : une source locale en écriture, une source instantané en lecture seule, et la façon dont les deux scripts la reçoivent ;
- ce qui est masqué ou désactivé pour le lecteur : saisie des jours (`?annote`), édition et liste des périodes, « Réinitialiser », « Partager » ;
- l'attente du chargement et les erreurs : partage inexistant (la « page commune » de [À quoi ressemble l'interface de partage pour l'auteur](09-prototype-interface-auteur.md)), réseau, 429 ;
- la navigation entre semestres (`/@/<id>/2027/01`) : nouvelle requête ou instantané gardé en mémoire ;
- comment le titre et le semestre de l'instantané fixent l'URL et le `<title>` ;
- la reprise par l'auteur : recopier un instantané dans le calendrier local (voir [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md)) avec la même source.

Skill à appeler en plus de `grilling` et `domain-modeling` : `codebase-design`.

## Answer

Correction de la question : `?annote` n'est pas une fonction du site, c'est le paramètre de `outils/captures/fixture.js` qui remplit le stockage local des captures. Ce qui est éditable, ce sont les `contenteditable` (jours, titre, noms de mois), la palette du clic droit, le pinceau, la sélection de périodes et la liste `#periodes`.

1. **Affichage et édition séparés, pas de « source ».** `detailsjour.js` et `periodes.js` exposent chacun :
   - un **affichage** qui reçoit un objet ordinaire `{ jourdetails, jourcouleurs, moislibelles, jourbandes }` ;
   - une **couche d'édition**, qui écrit dans le stockage local comme aujourd'hui.

   La page locale lit les quatre clés locales, appelle l'affichage, puis branche l'édition. La page `/@/` attend la réponse du serveur, puis appelle seulement l'affichage avec les clés de l'instantané. La lecture seule vient de l'absence de la couche d'édition, sans indicateur `lectureSeule` à consulter partout. L'asynchronisme reste hors des deux scripts.

   `Calendrier.afficher` reçoit le titre et le semestre au lieu de les lire seulement dans l'URL. Les jours fériés gardent le dernier mot, comme aujourd'hui.

   Écartés :
   - un objet « source » à deux adaptateurs (local et instantané) : seule l'écriture différerait, et elle n'est jamais appelée en lecture seule ;
   - des `if (lectureSeule)` dans les gestionnaires existants.
2. **Ce que voit le lecteur.**
   - **Gardés** :
     - les jours fériés, le jour courant surligné et les numéros de semaine ;
     - les flèches de semestre et l'impression ;
     - la **liste des périodes en lecture seule** : pastille, libellé, dates, mention « non affichée ». Sans ✕, sans champ et sans choix de couleur. Un clic sur une bande signale sa ligne. Au doigt, cette liste est le seul endroit où les libellés sont visibles. Elle est masquée quand le semestre n'a aucune période.
   - **Retirés** : les `contenteditable` (titre, jours, noms de mois), la palette, le pinceau, la sélection de périodes, « Réinitialiser » et « Partager ». Le lecteur ordinaire ne voit **aucun bandeau**.
3. **Chargement et erreurs.** L'entête s'affiche tout de suite. Le calendrier est remplacé par « Chargement… ». À la réponse, la grille et les annotations sont rendues en une fois, et la mise à l'échelle de `index.html` est relancée.
   - **404** : la page commune « Ce calendrier n'existe pas ou n'est plus partagé. », sans année, sans flèches et sans bandeau.
   - **429** : « Trop de consultations depuis votre réseau. Réessayez dans une minute. »
   - **Réseau ou 5xx** : « Le calendrier n'a pas pu être chargé. » avec un bouton « Réessayer ». Ce message ne dit jamais « n'existe pas ».
   - **Identifiant mal formé** (pas trois noms et un nombre) : la page commune, **sans appel à l'API**. La saisie est d'abord normalisée (casse, accents, séparateurs, voir [Forme de l'identifiant public](05-forme-identifiant-public.md)) et l'URL corrigée par `replaceState`.
4. **Une requête par chargement, sans cache.** Les flèches mènent à `/@/<id>/aaaa/mm` et rechargent la page. Chaque chargement refait un `GET` avec `Cache-Control: no-store`, pour qu'une publication se voie au rechargement suivant. Écartés :
   - un cache en `sessionStorage` : un lecteur pourrait voir un instantané périmé ;
   - une navigation sans rechargement : elle réécrirait le rendu, qui se fait en une seule fois.
5. **URL, titre et semestre.**
   - **Routes** : `/@/<id>` mène au semestre `debut` de l'instantané, et l'URL reste sans date. `/@/<id>/aaaa` mène à janvier de cette année, `/@/<id>/aaaa/mm` au mois donné. Le titre n'est jamais dans l'URL du lecteur.
   - **Entête** : `#titre` affiche le titre de l'instantané, sans être éditable. `#url` affiche `♥ <origine><chemin courant>`, et c'est cette ligne qui s'imprime.
   - **`<title>`** : « Claire · Calendrier semestriel 2026 » si l'instantané a un titre, sinon « Calendrier semestriel 2026 ».
   - **`noindex`** : l'en-tête `X-Robots-Tag: noindex` sur `/@/*`, dans `netlify.toml`.
6. **Arrivée de l'auteur par le lien de gestion (`/@/<id>#cle=…`).** La page lit le fragment, le retire de l'URL, puis fait le `GET` avec la clé dans `Authorization`. Elle compare l'empreinte de l'instantané reçu à celle des clés locales préparées et applique les règles de [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md) :
   - **calendrier local vide ou identique** : rien ne s'affiche. Le navigateur range `partage`, recopie l'instantané si le calendrier est vide, puis redirige vers `/<titre>/<aaaa>/<mm>` ;
   - **calendrier local différent, ou récupération** : l'instantané s'affiche en lecture seule, comme chez le lecteur, avec le bandeau bleu et ses choix (voir [À quoi ressemble l'interface de partage pour l'auteur](09-prototype-interface-auteur.md)). « Reprendre » recopie les quatre clés de l'objet **déjà reçu**, sans nouvelle requête, par une seule fonction `remplacerAnnotationsLocales(donnees)`. C'est aussi celle qu'utiliserait plus tard « Copier dans mon calendrier ». Le navigateur range ensuite `partage` et redirige ;
   - **clé invalide** : la lecture seule s'affiche avec le bandeau « Ce lien de gestion n'est plus valable ».

   La page de l'auteur arrivant par son lien et celle du lecteur ont le même code d'affichage. Seuls le bandeau et le traitement de la clé s'y ajoutent.

Pas d'ADR : la découpe affichage/édition se défait sans grand coût. Pas de terme nouveau au glossaire.
