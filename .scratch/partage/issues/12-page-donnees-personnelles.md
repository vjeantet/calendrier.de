# Contenu de la page « Données personnelles »

Type: grilling
Status: open
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
