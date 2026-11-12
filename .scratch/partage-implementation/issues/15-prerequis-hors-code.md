# 15 : Prérequis hors code

Status: ready-for-human
Blocked by: —
Spec: [`PARTAGE.md`](../../../PARTAGE.md), sections « Prérequis hors code », « Variables d'environnement » et « Les emails » (forme commune).

## À faire

À faire par l'auteur, avant la mise en ligne :

- [ ] Créer l'alias de contact sur `vjeantet.fr` (par exemple `donnees@vjeantet.fr`), redirigé vers sa boîte, et confirmer l'adresse retenue pour le [ticket 11](11-page-donnees-personnelles.md).
- [ ] Ouvrir un compte Sweego (offre gratuite, sans carte) et vérifier le domaine `calendrier.vjeantet.fr` : les deux CNAME de Sweego (Return-Path/SPF et DKIM) et un enregistrement DMARC, aucun sur le nom `calendrier.vjeantet.fr` lui-même. **Ne jamais créer `t.calendrier.vjeantet.fr`.**
- [ ] Poser sur le site Netlify, dans l'interface et jamais dans `netlify.toml` : `URL_PUBLIQUE`, `SECRET_EMPREINTES` (secret aléatoire long), `SWEEGO_CLE_API`, `CONTACT_EMAIL`. Ne jamais y poser `EMAIL_SIMULE`.
- [ ] Supprimer le site `calendrier.sodadi.fr`, sans redirection.
