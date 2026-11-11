# Limitation des envois et des lectures

Type: grilling
Status: resolved
Blocked by: 07
Map: [Partage d'un calendrier en lecture seule](../map.md)

## Question

Quels seuils et quel mécanisme pour limiter les envois d'emails et les lectures de partages ?

- **Envois** (`POST /api/partages`, `POST /api/liens`) : seuils par empreinte d'adresse et par IP, sur quelle durée. Sans limite, le formulaire sert à bombarder une boîte, et il épuise le quota de Sweego (100 emails par jour pour tout le service), ce qui bloque le partage jusqu'au lendemain.
- **Lectures** (`GET /api/partages/<id>`) : l'entropie de l'identifiant public (≈ 38 bits) suppose qu'on ne peut pas essayer des identifiants sans limite. Une avalanche de lectures consomme aussi les crédits Netlify, dont l'épuisement met tout le compte en pause.
- **Mécanisme** : les outils sont fixés par [Où héberger l'API et quel service d'email](06-hebergement-api.md). Il y a 2 règles `rateLimit` par IP et par chemin, sur une fenêtre de 180 s au plus : à quels chemins les attribuer ? Et des compteurs dans Blobs : clés, fenêtre, purge par la tâche quotidienne.
- Réponse vue de l'extérieur quand une limite est atteinte (429, message dans le bandeau de partage, voir [À quoi ressemble l'interface de partage pour l'auteur](09-prototype-interface-auteur.md)), sans révéler si une adresse est connue.

Fixé par [Confirmation de l'adresse et récupération du lien de gestion](07-confirmation-recuperation.md) : chaque demande envoie exactement un email (création, ou récupération, que l'adresse soit connue ou non), et aucun autre. Une récupération émet aussi une clé en attente par partage de l'adresse, ce qui écrit dans Blobs.

## Answer

Deux étages de protection : les 2 règles `rateLimit` de Netlify arrêtent les rafales par IP avant toute exécution de fonction, et des compteurs journaliers dans Blobs bornent les envois d'emails.

1. **Règle Netlify n° 1, envois.** `POST /api/partages` et `POST /api/liens` sont servis par **une seule fonction** déclarée avec un tableau `path`, de sorte qu'une seule règle les couvre : **5 requêtes par 180 s et par IP**. Un auteur qui se trompe d'adresse et recommence reste loin du seuil.
2. **Règle Netlify n° 2, lectures.** `/api/partages/*` : **60 requêtes par 60 s et par IP**. Elle couvre aussi `PUT`, `DELETE` et `…/confirmer`, puisque la règle ne cible pas une méthode. Une classe de 30 personnes derrière une même IP reste sous le seuil. Risque d'énumération accepté : avec 1 000 partages actifs, une IP qui lit au maximum pendant un an a environ 0,11 de chance de tomber sur un partage, pour ne gagner que la lecture du calendrier d'un inconnu.
3. **Compteurs journaliers dans Blobs, communs à la création et à la récupération** :
   - **par adresse** (empreinte HMAC) : **3 emails par jour** ;
   - **par IP** (empreinte HMAC) : **10 par jour** ;
   - **global** : **90 par jour**, sous les 100 de Sweego, dont le dépassement n'est pas documenté.
   La fenêtre est le **jour calendaire UTC** (fixe, pas glissante). Le compteur par adresse ne dépend pas de l'existence d'un partage et ne révèle donc rien.
4. **Ordre du comptage.** La fonction lit les trois compteurs. Si l'un est atteint : 429, **sans rien incrémenter ni écrire** (pas de partage en attente, pas de clé en attente). Sinon, elle incrémente les trois compteurs, puis elle écrit et envoie l'email. Pas d'écriture conditionnelle : deux requêtes simultanées peuvent dépasser un seuil d'une unité, ce que la marge de 10 sur le global absorbe. Un échec d'envoi chez Sweego ne décrémente pas.
5. **Clés et conservation.** `limites/<aaaa-mm-jj>/adresse/<empreinte>`, `limites/<aaaa-mm-jj>/ip/<empreinte-ip>`, `limites/<aaaa-mm-jj>/total`. L'IP n'est jamais stockée en clair : son empreinte HMAC utilise le même secret que les adresses, et le préfixe sépare les deux. La tâche quotidienne efface les préfixes des jours passés : une empreinte d'IP vit **au plus environ 48 h**.
6. **Réponse quand une limite est atteinte : 429 explicite, partout**, y compris pour « J'ai déjà un lien ». Annoncer un email qui ne partira pas ferait attendre l'auteur pour rien, et le refus ne révèle pas si l'adresse est connue. Dans le bandeau :
   - 429 de notre fonction (compteur journalier) : « Trop de demandes aujourd'hui. Réessayez demain. » Le message est le même pour les trois compteurs. La réponse porte `Retry-After` jusqu'à minuit UTC ;
   - 429 de la règle Netlify (corps qui n'est pas le nôtre) : « Trop de demandes. Réessayez dans quelques minutes. »
   Sur `/@/<id>`, un 429 affiche « Trop de consultations depuis votre réseau. Réessayez dans une minute. », jamais « n'existe pas ».
7. **Pas de compteur Blobs sur les lectures.** Compter les identifiants inexistants ajouterait une écriture à chaque faute de frappe. La règle n° 2 suffit. Une avalanche de lectures venant de nombreuses IP reste le risque accepté de pause du compte (voir [Où héberger l'API et quel service d'email](06-hebergement-api.md)).

Pas d'ADR : les seuils se changent sans coût, même après l'implémentation.
