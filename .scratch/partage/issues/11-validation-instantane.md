# Règles de validation de l'instantané

Type: grilling
Status: resolved
Blocked by: —
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Quelles règles exactes et quels plafonds le serveur applique-t-il à un instantané reçu (création et publication) ?

- Format des clés (`jourdetails` et `jourcouleurs` en `jjmmaaaa`, `moislibelles` en `mmaaaa`), plage d'années acceptée.
- Couleurs prises dans `COULEURS_JOUR`, périodes `{ c, l, d, f }` validées comme `valide()` dans `periodes.js`. Comment partager ces règles entre le navigateur et la fonction sans les dupliquer ?
- Longueur maximale d'un texte de jour, d'un libellé de mois, d'un libellé de période et du titre ; nombre maximal de périodes ; taille totale (de l'ordre de 100 Ko proposé). La fonction accepte jusqu'à 6 Mo et chaque Go servi coûte des crédits.
- Champs inconnus ou valeurs invalides : rejet de tout l'instantané ou nettoyage ?
- Semestre (`debut`) : forme et bornes.

Le format de l'instantané reprend les quatre clés du localStorage telles quelles (voir [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md)). L'hébergement est fixé par [Où héberger l'API et quel service d'email](06-hebergement-api.md).

## Answer

Le serveur est strict, le navigateur prépare. Un navigateur à jour ne se fait jamais rejeter. Un rejet signale un bug ou un onglet resté sur une version précédente du site.

1. **Rejet en bloc.** Le serveur rejette tout l'instantané à la première erreur (400), sans rien nettoyer. Une clé d'annotation absente vaut une clé vide, puisque le stockage local retire les clés vides. Un champ inconnu, à n'importe quel niveau, est rejeté. Le serveur range l'objet validé et resérialisé, pas le corps brut.
2. **Clés et dates.** `jourdetails` et `jourcouleurs` en `jjmmaaaa`, `moislibelles` en `mmaaaa`, `d` et `f` des périodes de `jourbandes` en `aaaammjj`. Format strict, **date réelle** (pas de `31022026`), années `0001` à `9999` sans autre borne : le calendrier sait afficher `/2350/01`. Pour une période : `d ≤ f` et `c` pris dans `COULEURS_JOUR`, ce qui est plus strict que `valide()` dans `periodes.js`. Les valeurs de `jourcouleurs` sont prises dans `COULEURS_JOUR`.
3. **Semestre.** `debut` en `mmaaaa`, comme une clé de `moislibelles` : mois `01` à `12`, mêmes années. Cela évite une quatrième façon d'écrire une date.
4. **Plafonds.** Corps de la requête : **100 000 octets** (UTF-8), contrôlé par le serveur avant `JSON.parse` et par le navigateur avant l'envoi. Titre : **100 caractères**, parce qu'il apparaît dans les emails et dans le bandeau. Aucun autre plafond : ni longueur par texte de jour, de mois ou de période, ni nombre de périodes. La taille totale suffit : trois ans annotés chaque jour, avec une couleur sur chaque jour, font environ 80 Ko.
5. **Caractères.** Les caractères de contrôle (U+0000 à U+001F, U+007F à U+009F) sont refusés dans toutes les chaînes, titre compris. La chaîne vide est acceptée partout : elle a un sens dans `moislibelles` et ne pose aucun problème ailleurs.
6. **Un seul fichier de règles.** `public/static/js/calendrier.de/instantane.js` définit la variable globale `Instantane` et se termine par `module.exports` quand `module` existe. La fonction Netlify le charge par `require` avec un chemin relatif. Il contient `COULEURS_JOUR`, déplacé depuis `detailsjour.js`, qui le lit ensuite là (il est chargé avant dans `index.html`), ainsi que `preparer(cles, titre, debut)` pour le navigateur et `verifier(corps)` pour le serveur, qui renvoie la première erreur ou `null`. Les doubles avec test de concordance et les règles côté serveur seulement sont écartés.
7. **Préparation : le lecteur voit ce que voit l'auteur.** Elle ne touche pas au stockage local, seulement à la copie envoyée.
   - Textes de jour : toute suite d'espaces, y compris l'espace insécable, `\n`, `\t` et les caractères de contrôle, devient une seule espace, puis le texte est rogné aux deux bouts. Un texte vide est retiré.
   - Libellés de mois : même traitement, mais la chaîne vide est gardée.
   - Couleurs de jour : une couleur inconnue est retirée. Elle ne s'affiche déjà pas chez l'auteur (`jourAppliquerCouleur`).
   - Périodes : même chemin que `charger()` (filtre, puis fusion). Une couleur inconnue devient `gris`, comme dans l'affichage de l'auteur. Le libellé est traité comme un texte de jour.
   - Clés hors format ou dates inexistantes : retirées, puisqu'elles ne correspondent à aucune case.
   - Titre : espaces traités de la même façon. Au-delà de 100 caractères, le navigateur refuse de publier (« Titre trop long : 100 caractères au plus ») plutôt que de tronquer.
   - Corps de plus de 100 000 octets : refus de publier (« Calendrier trop volumineux pour être partagé : 112 Ko sur 100 Ko »), sans rien tronquer.
8. **Empreinte sur l'instantané préparé.** L'empreinte des modifications non publiées porte sur les quatre clés **après préparation**. Un clic dans un jour vide, qui enregistre aujourd'hui `" "` (voir la tâche séparée « Ne plus enregistrer les textes de jour vides »), ou une espace ajoutée n'allument donc pas l'indicateur. Cela précise le point 3 de [Comment l'instantané se met à jour](04-mise-a-jour-instantane.md) : la préparation devient la première étape de la sérialisation stable.
9. **Réponse 400.** `{ "erreur": "<chemin> : <raison>" }`, par exemple `donnees.jourcouleurs.31022026 : date inexistante`. Le navigateur affiche « Le calendrier n'a pas pu être publié : le serveur a refusé les données. » et écrit le détail dans la console. L'auteur n'a rien à corriger.

Pas d'ADR : les règles vivent dans un seul fichier et se changent sans migration. Pas de terme nouveau au glossaire : « préparation » désigne une étape d'implémentation, pas une notion du domaine.
