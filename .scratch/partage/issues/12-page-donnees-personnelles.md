# Contenu de la page « Données personnelles »

Type: grilling
Status: resolved
Blocked by: 10
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Que dit la page « Données personnelles », et où se trouve-t-elle ?

Ce qu'elle doit couvrir est déjà fixé :
- **Ce qui est conservé et combien de temps** : l'instantané, l'empreinte HMAC de l'adresse, l'empreinte de la clé de gestion et les dates (voir [Où héberger l'API et quel service d'email](06-hebergement-api.md)). Partage en attente : 48 h ; partage actif : jusqu'à son arrêt, ou 12 mois sans publication ni consultation (voir [Durées de confirmation et de conservation](08-durees-conservation.md)). Les compteurs de limitation (voir [Limitation des envois et des lectures](10-limitation-envois-lectures.md)) : empreinte HMAC de l'adresse et de l'IP, jamais l'IP en clair, effacées au plus environ 48 h après.
- **Sous-traitants** : Netlify (fonctions aux États-Unis, où l'adresse passe en mémoire sans être stockée ; Blobs à Francfort ; DPA avec transferts hors UE) et Sweego/Mindbaz (France), qui garde l'adresse en clair 7 jours dans ses journaux.
- **Pas de suivi** des ouvertures ni des clics : l'enregistrement `t.calendrier.vjeantet.fr` n'est jamais créé.
- **Comment tout supprimer** : « Arrêter le partage » efface tout immédiatement.

Reste à trancher : la base légale et sa formulation ; un contact pour exercer ses droits, et lequel ; la mention ou non des journaux propres à Netlify (adresses IP des requêtes), dont la durée de conservation sur l'offre gratuite reste à vérifier ; l'emplacement de la page (route, lien depuis le formulaire du bandeau de partage et le pied de page) ; le niveau de détail (texte court ou inventaire complet).

## Answer

Le ticket fixe le plan et les formulations sensibles. Le texte final de la page s'écrit à l'implémentation.

1. **Périmètre : tout le site.** C'est la seule page de ce genre, elle couvre donc aussi ce qui se passe sans partage :
   - les annotations restent dans le stockage local du navigateur et ne le quittent jamais ;
   - Netlify héberge les pages ;
   - jQuery est chargé depuis `code.jquery.com`, qui voit l'IP du visiteur.

   Rapatrier jQuery dans `public/static/` est hors de cette carte (voir la section « Out of scope »).
2. **Responsable et contact.** Le responsable est Valère Jeantet, à titre personnel. Le contact est un **alias email dédié sur `vjeantet.fr`** (par exemple `donnees@vjeantet.fr`), qui redirige vers la boîte de l'auteur ; il est à créer avant la mise en ligne. La page mentionne le droit de réclamation auprès de la CNIL. Écartés :
   - l'adresse personnelle ;
   - les issues GitHub, qui sont publiques.
3. **Droits en libre-service.** La page présente deux gestes comme l'exercice de ces droits :
   - « J'ai déjà un lien » vaut droit d'accès : la liste des partages de l'adresse arrive par email ;
   - « Arrêter le partage » vaut droit à l'effacement, immédiat.

   Le contact sert au reste.
4. **Deux bases légales, une phrase chacune.**
   - Adresse, empreinte de l'adresse, instantané, empreinte de la clé de gestion et dates : **exécution du service demandé** (art. 6.1.b du RGPD).
   - Compteurs de limitation (empreintes HMAC de l'adresse et de l'IP) : **intérêt légitime à protéger le service contre les abus** (art. 6.1.f).

   Écartée : une seule base, « exécution du service », pour tout. La limitation ne fait pas partie du service demandé.
5. **Forme : courte, organisée en questions**, à la première personne (« je »). Les questions : qui, quelles données, pourquoi, combien de temps, qui d'autre les voit, quels droits. Un seul tableau, « donnée / où / combien de temps », fait l'inventaire :

   | Donnée | Où | Combien de temps |
   |---|---|---|
   | Annotations du calendrier | votre navigateur (stockage local) | jusqu'à « Réinitialiser » ou l'effacement par le navigateur |
   | Instantané (titre, annotations, semestre) | Netlify Blobs, Francfort | jusqu'à l'arrêt du partage, ou 12 mois sans publication ni consultation ; 48 h s'il n'est pas confirmé |
   | Empreinte de l'adresse email (jamais l'adresse en clair) | Netlify Blobs, Francfort | comme le partage |
   | Empreinte de la clé de gestion | Netlify Blobs, Francfort | comme le partage ; 48 h pour une clé en attente |
   | Dates de création, de publication et de consultation (au jour près) | Netlify Blobs, Francfort | comme le partage |
   | Compteurs de limitation (empreintes de l'adresse et de l'IP) | Netlify Blobs, Francfort | 48 h environ, au plus |
   | Adresse email | fonctions Netlify, États-Unis | le temps de la requête, jamais enregistrée |
   | Adresse email en clair | journaux de Sweego (Mindbaz, France) | 7 jours |
   | Adresse IP et requêtes | journaux techniques de Netlify et de `code.jquery.com` | durée fixée par eux (lien vers le DPA de Netlify) |
6. **Formulations sensibles**, à reprendre sur le fond :
   - **Transferts** : « Les fonctions de Netlify s'exécutent aux États-Unis. Votre adresse y transite le temps de la requête, sans y être enregistrée. Netlify encadre ces transferts par le cadre de protection des données UE–États-Unis et par des clauses contractuelles types. »
   - **Suivi** : « Les emails ne comportent aucun suivi des ouvertures ni des clics. » Ce que l'implémentation doit tenir : `t.calendrier.vjeantet.fr` n'est jamais créé, et chaque envoi passe `tracking_open: false` (voir [Où héberger l'API et quel service d'email](06-hebergement-api.md)).
   - **Tiers** : « Un instantané est lisible par toute personne qui a le lien public. Vous êtes responsable de ce que vous y publiez : n'y mettez rien que vous ne montreriez pas, comme une information de santé sur un proche. »
   - **Durées** : la phrase du formulaire de partage (voir [Durées de confirmation et de conservation](08-durees-conservation.md)).
7. **Journaux de Netlify : mentionnés, sans chiffre.** La page leur consacre une ligne du tableau et renvoie au DPA de Netlify (`https://www.netlify.com/pdf/netlify-dpa.pdf`). Faits relevés le 2026-11-11 :
   - Le DPA du 9 juin 2026 compte « les visiteurs des sites hébergés » et leur « adresse IP » parmi les données traitées. Il prévoit des journaux internes gardés 90 jours en ligne et 1 an hors ligne, mais dans une annexe intitulée « Enterprise Services ».
   - Les journaux des fonctions sont gardés au moins 24 h et contiennent ce que le code écrit.
   - La documentation ne dit pas combien de temps le CDN garde les IP sur l'offre gratuite, ni ce que la limitation de débit conserve.

   Écartés :
   - ne rien dire : Netlify voit l'IP de tout visiteur ;
   - écrire 90 jours / 1 an : on ne peut pas garantir que ce chiffre s'applique à l'offre gratuite.

   **Règle de conception qui en découle** : nos fonctions ne journalisent jamais l'adresse email, l'IP ni la clé de gestion, `console.log` compris.
8. **Emplacement.** La page est un fichier statique, `public/donnees-personnelles.html`, sans JavaScript, servi avant la réécriture `/*`, à l'adresse `/donnees-personnelles`. Il faut vérifier à l'implémentation que Netlify sert la page sans l'extension ; sinon, l'adresse est `/donnees-personnelles.html`. La page reprend `calendrier.css` pour la typographie. Effet de bord accepté : un calendrier titré « donnees-personnelles » n'est plus joignable par `/donnees-personnelles`. Écartée : une vue rendue par `index.html`, qui demanderait un nouveau cas dans `analyserChemin`.
9. **Liens vers la page.** La page est liée depuis trois endroits :
   - le formulaire de partage, sous la phrase des durées (déjà dans le prototype) ;
   - les trois emails ;
   - la page `/@/<id>`, à l'écran seulement et masqué à l'impression.

   Pas de pied de page sur le calendrier : la mise à l'échelle et l'impression restent intactes.

Pas d'ADR : le texte et l'emplacement se changent sans coût.
