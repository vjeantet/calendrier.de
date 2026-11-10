# Email transactionnel hébergé dans l'UE : offres gratuites, données, suivi des clics

Recherche pour le ticket [02 — Quel service d'email transactionnel hébergé dans l'UE](../issues/02-email-transactionnel-ue.md).

Toutes les sources ont été consultées le **2026-11-10**. Les citations sont reprises telles quelles, en anglais. Plusieurs sites bloquent les robots. Dans ces cas, la même page a été lue par un autre canal du même éditeur :

- **Scaleway** : www.scaleway.com renvoie 403. La documentation a été lue dans son dépôt source officiel [scaleway/docs-content](https://github.com/scaleway/docs-content) (branche `main`, dossier `pages/transactional-email/`, dernier commit du 2026-11-10). Les liens ci-dessous pointent vers les pages publiées correspondantes. La page de tarifs n'a pas pu être lue : les prix viennent de la documentation.
- **Brevo, Mailjet** : les articles du centre d'aide ont été lus via l'API publique Zendesk de chaque centre d'aide (`/api/v2/help_center/…`). C'est le même contenu que la page HTML. La date « updated » de chaque article est indiquée quand elle est utile.
- **Mailjet** : la référence de l'API vient de la spécification OpenAPI publiée par Mailjet ([openapi-mailjet.yaml](https://dev.mailjet.com/_bundle/openapi/openapi-mailjet.yaml)).

Le contexte vient de `map.md` : budget nul, expéditeur sur `calendrier.vjeantet.fr`, DNS de `vjeantet.fr` maîtrisé. L'email contient le **lien public** et le **lien de gestion** `/@/<identifiant public>#cle=<clé de gestion>` (`PARTAGE.md`).

## Tableau comparatif

| | Scaleway TEM | Brevo | Mailjet | Lettermint | Sweego | Mailgun (région UE) |
|---|---|---|---|---|---|---|
| **Offre gratuite** | 300 emails/mois, puis 0,25 € les 1 000 (facturé) | 300 emails/jour | 6 000/mois et 200/jour | 300 emails/mois | 100 emails/jour | 100 emails/jour |
| **Au-delà du quota** | Facturé en fin de mois. Aucun plafond dur documenté | Au plus 1 000 emails en file d'attente, au-delà ils ne sont pas délivrés | File d'attente de 3 jours au plus, puis abandon | Envoi payant « en option ». Comportement sans carte non documenté | Non documenté | Non documenté |
| **Carte bancaire** | **Obligatoire** (moyen de paiement requis avant toute commande ; pas de carte virtuelle ni prépayée) | Non | Non | Non | Non documenté | Non documenté |
| **Mention publicitaire** | Aucune (contenu « sent as-is ») | « Sent with Brevo » sur l'offre gratuite (portée exacte pour l'API : ambiguë, voir §2) | Logo seulement dans les modèles de l'éditeur Mailjet | Non documentée | Non documentée | Non documentée |
| **Société, hébergement** | Scaleway (FR), région `fr-par` uniquement, aucun sous-traitant dédié | Brevo (FR), OVH (FR) + Google Cloud (Belgique). Sous-traitants américains pour CDN, support et IA | Mailjet SAS (FR), groupe Sinch. Google Cloud Francfort + Belgique. Sous-traitants américains pour le support | Lettermint B.V. (NL), UpCloud (NL) + OVH (DE) | Mindbaz/Sweego (FR), OVH, Scaleway, Alter Way (FR) | Mailgun Technologies, Inc. (**US**), domaine créé en région UE |
| **DPA** | Oui ([contrats](https://www.scaleway.com/en/contracts/)) | Oui, annexe 3 des CGU | Oui (Sinch Email) | Oui, art. 28, s'applique d'office | Oui | Non examiné |
| **API HTTP (sans SMTP)** | `POST https://api.scaleway.com/transactional-email/v1alpha1/regions/fr-par/emails`, en-tête `X-Auth-Token` | `POST https://api.brevo.com/v3/smtp/email`, en-tête `api-key` | `POST https://api.mailjet.com/v3.1/send`, Basic Auth | `POST https://api.lettermint.co/v1/send`, en-tête `x-lettermint-token` | `POST https://api.sweego.io/send`, en-tête `Api-Key` | `https://api.eu.mailgun.net/` |
| **SPF / DKIM / DMARC** | Oui (+ MX exigé pour la vérification ; `include` SPF récursif non supporté) | « Brevo code » + DKIM + DMARC, obligatoire depuis le 01/02/2024 | Oui | DKIM, DMARC, SPF via un CNAME de Return-Path | SPF (`include:spf.swg-srv.net`), DKIM, DMARC | Non examiné |
| **Suivi des clics (réécriture des liens)** | **Jamais** : « does not […] rewrite links, track clicks » | **Toujours actif**, pas de paramètre API pour le couper. Anonymisation possible | Désactivable par message (`TrackClicks: "disabled"`) ou par lien (`rel="notrack"`) | **Désactivé par défaut**, et indisponible sur l'offre gratuite | Désactivé tant qu'on ne l'active pas sur le domaine | Activable par domaine ou par message (`o:tracking-clicks`) |
| **Journaux : adresses et durée** | Expéditeur, destinataire, objet, IP : conservés **tant que le domaine est actif**. Corps supprimé après remise | Adresse du destinataire et liens cliqués dans les journaux : **conservés indéfiniment par défaut**, réglable de 1 à 24 mois. Aperçus non stockés par défaut | Statistiques : 90 jours sur l'offre gratuite. Présence des adresses non détaillée | Contenu, destinataires, métadonnées : **28 jours** | 7 jours sur l'offre gratuite. Les journaux contiennent `email_to` | 1 jour de journaux, 1 jour de messages (offre gratuite) |

« Non documenté » veut dire : absent des pages consultées, pas forcément absent du service.

## 1. Scaleway Transactional Email (TEM)

**Offre gratuite et facturation**
- Offre « Essential » : « 300 free emails (with an additional cost of €0.25 for every 1000 additional emails) » ([Concepts — Essential plan](https://www.scaleway.com/en/docs/transactional-email/concepts/#essential-plan)).
- Facturation au mois : « if you use the free tier of 300 emails per month, and you end up sending 305 emails, you will only be billed for five emails » ([FAQ — Pricing and billing](https://www.scaleway.com/en/docs/transactional-email/faq/)). Les pages lues ne mentionnent aucune coupure au-delà de 300 : le dépassement est facturé.
- Un moyen de paiement est exigé : « Before you can order Scaleway resources, you must add a payment method to your account. […] Virtual and pre-paid credit cards are not accepted. » ([How to add a payment method](https://www.scaleway.com/en/docs/billing/how-to/add-payment-method/)).
- Chaque destinataire compte comme un email. Quota par défaut de 10 000 emails/mois. Limites plus strictes possibles pour un nouveau compte : « New users may face stricter initial limits » ([Capabilities and limits](https://www.scaleway.com/en/docs/transactional-email/reference-content/tem-capabilities-and-limits/)).
- Usage réservé au transactionnel : « You cannot use Transactional Email to send marketing emails » ([FAQ](https://www.scaleway.com/en/docs/transactional-email/faq/)).

**Hébergement, sous-traitants, RGPD.** Source pour ce bloc : [Transactional Email Privacy Policy](https://www.scaleway.com/en/docs/transactional-email/reference-content/data-privacy/) (publiée le 2026-10-19).
- « Transactional Email is only available in the following region: Paris, France (fr-par). Email content, metadata, logs, webhook data, and backups are stored and processed in France. »
- « Transactional Email does not use any dedicated subprocessor to process the content or metadata of your emails. » La liste générale de Scaleway est sur la [subprocessor list](https://www.scaleway.com/en/subprocessorlist/).
- La politique renvoie au DPA général ([contrats](https://www.scaleway.com/en/contracts/)) et aux [Conditions spécifiques TEM](https://www-uploads.scaleway.com/Specific_Conditions_Transactionnal_Email_Services_v042026_3f5487a93c.pdf). Ces deux documents n'ont pas été lus ici.

**Journaux et conservation** (même page)
- Le contenu de l'email est supprimé dès que le serveur destinataire l'accepte, au premier rejet définitif, ou après 36 h d'échecs. Les sauvegardes chiffrées sont conservées 7 jours.
- Pour chaque email sont stockés : « The envelope sender (MAIL FROM) and recipient (RCPT TO) addresses », « The subject », « The IP address that submitted the email ». Ces métadonnées sont conservées « for as long as your Transactional Email domain is active. Scaleway plans to reduce this retention period in 2027 and, eventually, to make it configurable by customers. »
- On peut demander la suppression d'adresses ou de journaux précis par ticket au support.
- **Conséquence** : les adresses des auteurs restent en clair chez Scaleway, sans limite de durée, tant que le domaine est actif.

**Suivi des clics.** « Transactional Email does not add tracking pixels, rewrite links, track clicks, or measure recipient engagement. Your headers and message body are sent as-is » ([Privacy Policy](https://www.scaleway.com/en/docs/transactional-email/reference-content/data-privacy/)).

**Domaine**
- SPF `v=spf1 include:_spf.tem.scaleway.com -all`, DKIM, DMARC, MX ([Authenticate domain](https://www.scaleway.com/en/docs/transactional-email/how-to/authenticate-domain/)).
- Le [Quickstart](https://www.scaleway.com/en/docs/transactional-email/quickstart/) demande SPF, DKIM, MX et DMARC pour vérifier un domaine externe.
- Sans serveur MX, Scaleway propose un MX « blackhole » : « any email sent back to it will be lost with no possibility of recovery ».
- « The recursive SPF `include` directive is not supported » ([Capabilities and limits](https://www.scaleway.com/en/docs/transactional-email/reference-content/tem-capabilities-and-limits/)).

**API.** `POST https://api.scaleway.com/transactional-email/v1alpha1/regions/$REGION/emails`, avec l'en-tête `X-Auth-Token: $SCW_SECRET_KEY` ([Send emails with API](https://www.scaleway.com/en/docs/transactional-email/api-cli/send-emails-with-api/)). On peut limiter la clé IAM à des permissions TEM et à des adresses IP ([FAQ](https://www.scaleway.com/en/docs/transactional-email/faq/)). L'API est en version `v1alpha1`.

**Délivrabilité.** Adresses IP partagées sur l'offre Essential (IP dédiée sur l'offre Scale). Score de réputation interne ([Understanding TEM reputation score](https://www.scaleway.com/en/docs/transactional-email/reference-content/understanding-tem-reputation-score/), non lu en détail). Aucune donnée comparative publiée.

## 2. Brevo

**Offre gratuite**
- « The Free plan includes 300 email sends per day. » Pour le transactionnel : « once you reach your daily limit, up to 1,000 additional emails are held in a retry queue. Emails beyond this queue are not delivered. » Sans limite de durée ([FAQs — What are the limits of the Free plan?](https://help.brevo.com/hc/en-us/articles/208580669), mis à jour le 2026-11-09).
- Pas de carte bancaire. L'envoi commence après validation du compte : « Once we approve your account for sending, you can start sending up to 300 emails per day » ([page de tarifs](https://www.brevo.com/pricing/)).
- Les comptes gratuits inactifs pendant 4 mois sont supprimés, mais « any account with automatic activities (such as automations or transactional emails) is considered active » ([About the deletion of inactive Free plan accounts](https://help.brevo.com/hc/en-us/articles/4410311028626)).

**Mention publicitaire**
- « Emails sent from the Free plan always include the Sent with Brevo sticker » ([Free plan limits](https://help.brevo.com/hc/en-us/articles/208580669)).
- Un autre article dit plus étroitement : « the Brevo logo might be displayed in the footer of your emails: If you have a free plan, the logo will always be displayed in your footer », puis parle des « email campaigns » ([Will my contacts know that I'm using Brevo?](https://help.brevo.com/hc/en-us/articles/209429285)).
- **Ambigu** : les pages ne disent pas clairement si la mention est ajoutée aux emails envoyés par l'API transactionnelle avec un contenu HTML fourni.

**Hébergement, sous-traitants, RGPD**
- « We are using OVH as primary hosting provider in France and Germany only. Data is stored on Google Cloud in Belgium » ([Data storage location](https://help.brevo.com/hc/en-us/articles/360001005510)).
- Le DPA est l'annexe 3 des [conditions d'utilisation](https://www.brevo.com/legal/termsofuse/). Sa liste de sous-traitants (annexe 2) comprend :
  - OVH (hébergement, France) ;
  - Google Cloud (Belgique) ;
  - **Cloudflare** (CDN et WAF, « USA/EU ») ;
  - **Zendesk** (support, « EU/USA ») ;
  - **Omni** (tableaux de bord, société américaine, serveurs UE) ;
  - des fournisseurs d'IA (OpenAI, Google Gemini, Anthropic) ;
  - des entités du groupe, dont Brevo Inc. (USA) et Brevo CRM Solutions (Inde), pour le « Customer experience & Maintenance ».
- Section 9 : « The Services may at times require the Processing of Customer Data outside the EEA ».

**Journaux et conservation**
- « Transactional logs and email previews are stored indefinitely by default. » On peut fixer une conservation de 1 à 24 mois, appliquée aussi aux anciens journaux. Les aperçus HTML ne sont pas stockés par défaut (« Never store previews (selected by default) ») ([Configure a custom retention period](https://help.brevo.com/hc/en-us/articles/4415743225746), mis à jour le 2026-11-03).
- L'export des journaux contient `email: recipient` et `link: any clicked links` ([Manage your transactional logs](https://help.brevo.com/hc/en-us/articles/360021533839)).
- **Non documenté** : si ce réglage de conservation est disponible sur l'offre gratuite.

**Suivi des clics**
- « By default, we track the opens and clicks for each recipient. » Une option « Anonymous email tracking » pour le transactionnel (Settings > Automations > Transactional emails > Tracking) masque l'adresse et les liens cliqués dans les journaux. Les clics restent suivis : « tracked but not linked to specific contacts » ([Can I anonymize the tracking…](https://help.brevo.com/hc/en-us/articles/11643306229906), mis à jour le 2026-11-03).
- La référence de `POST /v3/smtp/email` ne documente aucun paramètre qui coupe le suivi des clics. `removeTrackingPixel` (offre Enterprise) supprime le pixel, mais « Click tracking is unchanged » ([Send a transactional email](https://developers.brevo.com/reference/send-transac-email)).
- Sur le forum officiel, une réponse de juillet 2024 indique que la désactivation est « available as well, upon request and for our Enterprise customers ». Une demande d'octobre 2025 pour une option API, motivée par des liens de réinitialisation de mot de passe, reste sans réponse ([fil 201](https://community.brevo.com/t/no-way-to-disable-by-option-tracking-in-transactional-e-mail/201/28), [fil 6677](https://community.brevo.com/t/feature-request-transactional-email-api-option-to-disable-url-tracking-and-email-content-storage-for-sensitive-emails-e-g-password-resets/6677)). Ce forum est tenu par l'éditeur, mais ce n'est pas de la documentation.
- **Conclusion documentée** : sur l'offre gratuite, les liens des emails transactionnels Brevo sont réécrits, et aucun réglage documenté ne l'empêche.

**Domaine.** Depuis le 1er février 2024, l'authentification du domaine est obligatoire : enregistrement TXT « Brevo code », DKIM (1 TXT ou 2 CNAME) et DMARC ([FAQs — domain authentication](https://help.brevo.com/hc/en-us/articles/17286219877778), [Authenticate your domain](https://help.brevo.com/hc/en-us/articles/12163873383186)).

**API et piège des adresses IP**
- `POST https://api.brevo.com/v3/smtp/email`, avec l'en-tête `api-key` ([référence](https://developers.brevo.com/reference/send-transac-email)).
- Brevo peut bloquer automatiquement les adresses IP inconnues. Si aucune nouvelle IP n'apparaît pendant 30 jours, le blocage s'active et « Blocks all API calls from unknown IP addresses ». Il peut être désactivé ([Authorize and block IP addresses](https://help.brevo.com/hc/en-us/articles/5740111683858)).
- **Non vérifié ici** : si les adresses IP sortantes des Netlify Functions sont stables. Elles tournent par défaut en US East (Ohio), voir la [recherche 01](01-netlify-functions-blobs.md).

## 3. Mailjet

**Offre gratuite**
- Limites : 6 000 emails/mois, 200/jour, 1 000 contacts stockés. Au-delà de 200 par jour, les emails sont mis en file d'attente, « retained for a maximum of 3 days. Any emails that remain unsent after this period are permanently removed » ([Understanding Mailjet Free Plan Limits](https://documentation.mailjet.com/hc/en-us/articles/19154256993051), mis à jour le 2026-10-22).
- Pas de carte bancaire : « there is no credit card required for the free plan at sign up » ([page de tarifs](https://www.mailjet.com/pricing/)).
- **Non documenté** : si un destinataire d'email transactionnel devient un « contact » et compte dans la limite de 1 000.

**Mention publicitaire.** « No Mailjet logo » n'apparaît qu'à partir de l'offre Essential ([tarifs](https://www.mailjet.com/pricing/)). Mais : « The Mailjet logo appears only in templates created with the Email Editor or the Subscription Form Builder » ([Can I remove the Mailjet logo…](https://documentation.mailjet.com/hc/en-us/articles/360043179813), mis à jour le 2026-11-06). Un HTML envoyé directement par l'API n'est donc pas concerné, d'après ce texte.

**Hébergement, sous-traitants, RGPD**
- « your data is hosted on the Google Cloud Platform in Frankfurt (Germany) and Saint-Ghislain (Belgium) » ([Where is my personal data stored?](https://documentation.mailjet.com/hc/en-us/articles/360042712274), mis à jour le 2025-02-03).
- La liste des sous-traitants de Sinch comprend pour Mailjet :
  - Google Cloud France (« Cloud datacenters », UE) ;
  - Atlassian (USA & EU), Zendesk et Stripe ;
  - **Mailgun Technologies, Inc.** (USA), entité du groupe, pour « Mailjet: Support » ;
  - Mailjet SAS (France).
  
  Source : [Sinch — DPA sub-processors](https://sinch.com/legal/data-protection-agreement-sub-processors/).
- La politique de confidentialité, commune au pôle email de Sinch, mentionne Google Cloud, AWS, MacStadium et Rackspace « throughout the United States or Europe, based on where you have selected to deploy our services » ([Privacy policy](https://www.mailjet.com/legal/privacy-policy/)).
- DPA : [mailjet.com/legal/dpa](https://www.mailjet.com/legal/dpa/) (Sinch).

**Journaux et conservation.** « On Free plans, statistics and campaigns are kept for 90 days. » En revanche, « templates and contacts are kept for the lifetime of your account » ([How long are my statistics kept?](https://documentation.mailjet.com/hc/en-us/articles/360042755094), mis à jour le 2026-06-09). **Non documenté** : la durée de conservation des adresses dans l'historique des messages transactionnels.

**Suivi des clics.** Propriété `TrackClicks` de l'API Send v3.1, valeurs `account_default`, `disabled`, `enabled`, `anon`, qui « will overwrite the preferences selected in the Mailjet account ». Équivalent SMTP : en-tête `X-Mailjet-TrackClick` ([OpenAPI Mailjet](https://dev.mailjet.com/_bundle/openapi/openapi-mailjet.yaml)). Lien par lien : `rel="notrack"` ([How to exclude a link from being tracked](https://documentation.mailjet.com/hc/en-us/articles/360042751854)). Le réglage par défaut du compte n'est pas documenté dans les pages lues.

**API.** `POST https://api.mailjet.com/v3.1/send`, authentification HTTP Basic (clé publique et clé privée) ([Send API v3.1](https://dev.mailjet.com/email/guides/send-api-v31/), [OpenAPI](https://dev.mailjet.com/_bundle/openapi/openapi-mailjet.yaml), `securitySchemes.basicAuth`).

## 4. Lettermint (Pays-Bas)

**Offre gratuite**
- « The Free plan includes 300 emails per month with no credit card required ». 1 domaine, 1 utilisateur. Pas de limite journalière (« No limit » dans le tableau) ([tarifs](https://lettermint.co/pricing)).
- Dépassement : « you have the option to send additional emails for a small fee » (même page). **Non documenté** : ce qui se passe sur l'offre gratuite sans carte.
- Aucune mention publicitaire n'est documentée.

**Hébergement, sous-traitants, RGPD**
- « Only UpCloud, OVH Cloud and Postmastery handle the emails you send or receive through Lettermint, all within the EU. » UpCloud est aux Pays-Bas, les sauvegardes OVH en Allemagne, Postmastery (surveillance de délivrabilité) aux Pays-Bas. Préavis de 30 jours avant tout nouveau sous-traitant ([Subprocessors](https://lettermint.co/subprocessors), mis à jour le 2026-10-29).
- Le [DPA](https://lettermint.co/dpa) (art. 28) « applies automatically to every customer » ([tarifs](https://lettermint.co/pricing)).

**Journaux et conservation**
- « Lettermint retains message content, attachments, recipient addresses, message metadata, and message events for twenty-eight (28) days after the message is created ». Les événements d'analyse sont conservés 90 jours au plus. Les sauvegardes sont conservées 14 jours au plus ([DPA](https://lettermint.co/dpa)).
- Journaux applicatifs et de sécurité : « normally kept for no more than 14 days » ([Subprocessors](https://lettermint.co/subprocessors)).

**Suivi des clics**
- Dans le tableau des offres, Open Tracking et Click Tracking sont marqués « - » pour Free ([tarifs](https://lettermint.co/pricing)). La doc confirme : « Email tracking is available on paid plans » ([Routes](https://lettermint.co/docs/platform/projects-and-routes/routes.md)).
- Sur les offres payantes : « Tracking disabled by default - You must explicitly enable tracking per route ». Une fois activé, les liens passent par `t.ltrmnt.com` ([Tracking](https://lettermint.co/docs/platform/emails/tracking/introduction.md)).

**Domaine.** DKIM et DMARC. « SPF is handled automatically via the Return-Path CNAME ». Un sous-domaine est recommandé. La vérification est bloquée tant que la règle `aspf=s` du DMARC n'est pas corrigée ([Domain verification](https://lettermint.co/docs/platform/domains/introduction.md)).

**API.** `POST https://api.lettermint.co/v1/send`, avec l'en-tête `x-lettermint-token`. Un SDK Node.js officiel existe ([Quickstart](https://lettermint.co/docs/quickstart.md)).

## 5. Sweego (France)

**Offre gratuite.** 100 emails par jour « by API & SMTP », domaines illimités, « 7 days log retention » ([tarifs](https://www.sweego.io/pricing)). Ni la carte bancaire ni une éventuelle mention publicitaire ne sont documentées.

**Hébergement, sous-traitants, RGPD.** Le DPA est signé par **Mindbaz** (éditeur de Sweego), avec un préavis de 30 jours avant tout changement de sous-traitant ([DPA](https://www.sweego.io/data-privacy-agreement-dpa)). Les sous-traitants sont tous en France ou aux Pays-Bas ([List of subsequent subcontractors](https://www.sweego.io/list-of-subsequent-subcontractors)) :
- OVH Cloud, Scaleway et Alter Way (hébergement, France) ;
- Hyperline (facturation, France) ;
- Mollie (paiement, Pays-Bas) ;
- CM.com (SMS, Pays-Bas).

**Journaux.** Les journaux d'envoi contiennent `email_from` / `email_to`. Les enregistrements sont purgés à la fin de la durée de conservation de l'offre ([Email Sending logs](https://learn.sweego.io/docs/logs/email/sending)), soit 7 jours sur l'offre gratuite.

**Suivi des clics**
- Il est désactivé tant qu'on n'active pas « Email click-through tracking » sur le domaine, ce qui demande aussi un enregistrement DNS ([Email Tracking](https://learn.sweego.io/docs/tracking/email_tracking)).
- Une fois activé, le lien devient `https://t.<domaine d'envoi>/t/c/?i=<ENCODED_ID>&u=<URL_ENCODED>`. **L'URL d'origine est encodée dans la chaîne de requête** du lien de suivi.

**Domaine.** SPF `include:spf.swg-srv.net`, DKIM, DMARC ([Email sender authentication](https://learn.sweego.io/docs/auth/sender_authentication)).

**API.** `POST https://api.sweego.io/send`, avec l'en-tête `Api-Key` ([How to send an email by API](https://learn.sweego.io/docs/sending/how_to_send_email_by_api)).

## 6. Mailgun (région UE) : société américaine

Mailgun est cité parce que le ticket le mentionne, mais ce n'est pas un fournisseur de l'UE :
- **Offre gratuite** : « 100 emails per day », « 1 custom sending domain », « 1 day log retention », « 1 day of message retention » ([tarifs](https://www.mailgun.com/pricing/)).
- **Société** : Mailgun Technologies, Inc. (USA), adhérente au Data Privacy Framework UE–USA, d'après la [politique de Sinch Email](https://www.mailjet.com/legal/privacy-policy/).
- **Région UE** : elle est choisie à la création du domaine (`https://api.eu.mailgun.net/`) et « message data never leaves the region in which it is processed. Only a limited amount of account data is replicated globally » ([API overview](https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview.md)).
- **Suivi des clics** : activable par domaine, ou par message avec `o:tracking` / `o:tracking-clicks`, et lien par lien avec `disable-tracking=true` ([Tracking Clicks](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/tracking-clicks.md)). La valeur par défaut d'un nouveau domaine n'est pas indiquée dans la page lue.

## 7. Autres candidats non retenus pour l'analyse

- **AhaSend** : 1 000 emails/mois gratuits sans carte, « 1 to 7-day retention » ([tarifs](https://ahasend.com/pricing)). Siège et hébergement non vérifiés.
- **Cyso** (Pays-Bas) : il propose un service transactionnel. Ses tarifs n'ont pas été examinés.

## 8. Suivi des clics et fragment `#cle=`

**Ce que dit HTTP**
- Le fragment n'est pas envoyé au serveur dans une requête normale. Lors d'une redirection : « If the Location value provided in a 3xx (Redirection) response does not have a fragment component, a user agent MUST process the redirection as if the value inherits the fragment component of the URI reference used to generate the target URI » ([RFC 9110 §10.2.2](https://www.rfc-editor.org/rfc/rfc9110#section-10.2.2)).
- La même RFC signale le risque : « this might have the effect of disclosing one site's fragment to another site. If the first site uses personal information in fragments, it ought to ensure that redirects to other sites include a (possibly empty) fragment component » ([§17.11](https://www.rfc-editor.org/rfc/rfc9110#section-17.11)).

**Ce que change la réécriture des liens.** Quand le suivi des clics est actif, le `href` du bouton « Gérer mon calendrier partagé » n'est plus `/@/<id>#cle=<clé>`. Il devient un lien vers le serveur du fournisseur, qui redirige ensuite vers l'URL d'origine. Deux formes sont documentées :
- **URL d'origine dans la requête (Sweego)** : `…/t/c/?i=…&u=<URL_ENCODED>`. Encodé, le `#` devient `%23` et fait partie de la chaîne de requête. La clé de gestion est alors **envoyée au serveur de suivi à chaque clic**, ce que le fragment visait justement à éviter.
- **URL d'origine conservée chez le fournisseur (Brevo, Mailjet, Mailgun, Lettermint)** : leur documentation dit que les liens sont « rewritten » vers leur domaine de suivi, sans décrire le format.
  - Pour Brevo, les journaux exportés contiennent « link: any clicked links » ([Manage your transactional logs](https://help.brevo.com/hc/en-us/articles/360021533839)), et ces journaux sont conservés indéfiniment par défaut.
  - **Non documenté** : si le fragment fait partie de l'URL enregistrée ou affichée dans ces journaux, et si la redirection le restitue (fragment dans `Location`, ou héritage selon la RFC).

**Conséquences possibles d'une réécriture**
1. La clé de gestion se retrouve chez un tiers : dans une table de correspondance, dans les journaux, ou dans les requêtes reçues par le serveur de suivi.
2. Le lien peut ne plus fonctionner, si le fragment est perdu pendant la redirection. Non vérifié, faute de documentation.
3. Le lien de gestion dépend de la disponibilité du domaine de suivi.

**Désactivation, fournisseur par fournisseur (sources dans les sections ci-dessus)**

| Fournisseur | Réécriture sur l'offre gratuite | Moyen documenté de l'éviter |
|---|---|---|
| Scaleway TEM | Jamais | Rien à faire |
| Lettermint | Non (fonction réservée aux offres payantes, désactivée par défaut) | Rien à faire |
| Sweego | Seulement si activée sur le domaine | Ne pas l'activer |
| Mailjet | Selon le réglage du compte (valeur par défaut non documentée) | `TrackClicks: "disabled"` dans chaque message, et/ou `rel="notrack"` sur le lien |
| Mailgun | Si activée sur le domaine ou le message | `o:tracking-clicks: "no"`, et/ou `disable-tracking=true` sur le lien |
| Brevo | Oui, par défaut | Aucun réglage documenté sur l'offre gratuite. Anonymisation seulement |

## Conséquences pour la conception

- **Brevo est le seul candidat où la réécriture du lien de gestion ne peut pas être évitée** par un réglage documenté sur l'offre gratuite. Le fragment `#cle=` passerait par son domaine de suivi, et les liens cliqués figurent dans des journaux conservés indéfiniment par défaut.
- **Scaleway TEM n'a ni réécriture ni sous-traitant dédié, et reste en France**. En contrepartie :
  - il exige un moyen de paiement : le coût reste nul tant que le quota gratuit n'est pas dépassé ;
  - il facture au-delà de 300 emails par mois, sans plafond dur documenté ;
  - il garde l'adresse du destinataire et l'objet tant que le domaine est actif.
  
  La limitation des envois (map, « Not yet specified ») devient alors aussi une protection contre une facture.
- **Lettermint** : 300 emails par mois sans carte, pas de suivi sur l'offre gratuite, données dans l'UE, contenu et adresses supprimés après 28 jours. Comportement au-delà du quota gratuit : non documenté.
- **Mailjet et Sweego ont des quotas plus larges** (200 par jour et 100 par jour), mais le suivi doit rester coupé : explicitement dans chaque appel chez Mailjet, ou en ne l'activant pas chez Sweego. Mailjet passe par des sous-traitants américains pour le support. Sweego ne dépend que d'entreprises françaises ou néerlandaises.
- **Mailgun** est une société américaine, même avec une région UE, ce qui sort de l'énoncé du ticket.
- **Volumes** : chaque partage coûte un email à la création, plus un par demande de renvoi des liens (`POST /api/liens`). Les quotas mensuels (Scaleway, Lettermint : 300) et journaliers (Brevo 300, Mailjet 200, Sweego 100, Mailgun 100) ne protègent pas de la même façon contre un formulaire utilisé pour bombarder des boîtes.
- **Journaux** : quel que soit le fournisseur, l'adresse de l'auteur y est en clair. Le serveur du partage, lui, ne garde qu'une empreinte. La page « Données personnelles » devra donner la durée propre au fournisseur retenu. Les écarts sont grands : 1 jour (Mailgun gratuit), 7 jours (Sweego gratuit), 28 jours (Lettermint), réglable de 1 à 24 mois ou sans limite par défaut (Brevo), aussi longtemps que le domaine est actif (Scaleway).
- **Lien de gestion** : seuls deux fournisseurs écartent la réécriture sans aucun réglage. Scaleway ne réécrit jamais les liens, et Lettermint ne propose pas le suivi sur l'offre gratuite. Chez Mailjet, Sweego et Mailgun, l'absence de réécriture repose sur un réglage, qu'il faut garder dans le code ou dans la configuration du domaine.
- **DNS de `calendrier.vjeantet.fr`** : tous les fournisseurs demandent au moins DKIM et DMARC. Scaleway demande en plus un MX (le « blackhole » convient s'il n'y a pas de boîte de réception) et n'accepte pas d'`include` SPF récursif. Lettermint délègue le SPF à un CNAME de Return-Path.
- **Brevo** : le blocage automatique des adresses IP inconnues peut couper les appels d'une Netlify Function si ses adresses IP sortantes changent. Il se désactive, mais la stabilité de ces adresses n'est pas vérifiée ici.
