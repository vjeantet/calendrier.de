// PROTOTYPE JETABLE : interface de partage pour l'auteur.
// Ticket : .scratch/partage/issues/09-prototype-interface-auteur.md
//
// Trois variantes (?variant=A|B|C) de l'interface, sur la page existante,
// pour chaque état du partage (?etat=…). Rien n'est appelé côté serveur :
// chaque bouton recharge la page sur l'état suivant. Actif seulement avec
// ?proto dans l'URL. Ne doit jamais arriver sur master.
//
//   outils/captures/serveur.py 8000
//   http://127.0.0.1:8000/Claire/2026/03?annote&proto&variant=A&etat=formulaire
//
// A « Popover »  : tout passe par le bouton « Partager » et son popover sombre.
// B « Bandeau »  : une barre sous l'entête, toujours visible tant que le
//                  calendrier est partagé ; formulaires en ligne, rien ne flotte.
// C « Fenêtre »  : formulaires et arrivées par lien dans une fenêtre centrée ;
//                  une fois partagé, la ligne d'URL de l'entête (imprimée)
//                  devient le lien public et sert de point d'entrée.
(function () {
	var P = new URLSearchParams(location.search);
	if (!P.has('proto')) { return; }

	var VARIANTES = { A: 'Popover', B: 'Bandeau', C: 'Fenêtre + ligne d’URL' };
	var ETATS = [
		['jamais', 'Non partagé'],
		['formulaire', 'Partager : formulaire'],
		['envoye', 'Lien envoyé (en attente)'],
		['deja', 'J’ai déjà un lien : formulaire'],
		['deja-envoye', 'J’ai déjà un lien : réponse'],
		['gestion-attente', 'Lien de gestion, partage en attente (aperçu)'],
		['active', 'Partage activé (après le clic)'],
		['gestion-different', 'Lien de gestion, calendrier local différent'],
		['recuperation', 'Lien de récupération, calendrier local différent'],
		['actif', 'Actif, à jour'],
		['modifie', 'Actif, modifications non publiées'],
		['arreter', 'Arrêter : confirmation'],
		['arrete', 'Arrêté'],
		['cle-remplacee', 'Clé remplacée par un autre navigateur'],
		['lien-invalide', 'Lien de gestion qui n’est plus valable'],
		['inexistant', 'Partage inexistant (page commune)']
	];
	// états affichés sur /@/<id>, en lecture seule (ce que verra le lecteur)
	var PUBLIC = ['gestion-attente', 'gestion-different', 'recuperation', 'lien-invalide', 'inexistant'];
	// états où le navigateur a une clé de gestion valide
	var PARTAGE = ['active', 'actif', 'modifie', 'arreter'];

	var variante = VARIANTES[P.get('variant')] ? P.get('variant') : 'A';
	var etat = P.get('etat') || 'jamais';
	var ID = 'girafe-tambour-citron-27';
	var LIEN = 'calendrier.sodadi.fr/@/' + ID;
	var EMAIL = 'a•••@exemple.fr';
	var DUREES = 'Un partage en attente expire au bout de 48 h. Un partage ni publié ni consulté pendant 12 mois est supprimé.';
	var DONNEES = '<a href="#" class="proto-lien">Données personnelles</a>';

	function aller(e, v) {
		P.set('etat', e);
		if (v) { P.set('variant', v); }
		location.search = P.toString().replace(/=(&|$)/g, '$1');
	}

	// « Claire · à partir de mars 2026 · 6 jours annotés · 8 périodes »
	var resumeFige;
	function resume() {
		if (resumeFige) { return resumeFige; }
		function lire(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
		var jours = {}, k;
		var t = lire('jourdetails', {}), c = lire('jourcouleurs', {});
		for (k in t) { if (t[k].trim()) { jours[k] = 1; } }
		for (k in c) { jours[k] = 1; }
		var n = Object.keys(jours).length, b = lire('jourbandes', []).length;
		var titre = document.getElementById('titre').textContent.trim();
		var mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
		var q = Calendrier.analyserChemin(location.pathname, new Date());
		return resumeFige = (titre ? '« ' + titre + ' »' : 'sans titre') + ' · à partir ' + (/^[ao]/.test(mois[q.mois - 1]) ? 'd’' : 'de ') +
			mois[q.mois - 1] + ' ' + q.annee + ' · ' + n + ' jours annotés · ' + b + ' périodes';
	}

	// Contenu de chaque état, commun aux variantes (seule la mise en page change).
	// actions : [libellé, état suivant, principale ?, détail sous le bouton]
	function contenu(e) {
		switch (e) {
		case 'formulaire': return {
			titre: 'Partager en lecture seule',
			texte: 'Toute personne qui a le lien pourra consulter ce calendrier, sans le modifier. Relisez-le : ce que vous y avez noté sur d’autres personnes sera lisible.',
			resume: 'Sera partagé : ' + resume(),
			email: 'Votre adresse email',
			actions: [['Recevoir le lien par email', 'envoye', 1]],
			notes: ['Le lien n’est envoyé que par email : c’est ce qui prouve que vous êtes l’auteur.', DUREES + ' ' + DONNEES],
			pied: 'Vous avez déjà partagé ce calendrier ? <a href="#" data-e="deja">J’ai déjà un lien</a>'
		};
		case 'envoye': return {
			titre: 'Lien envoyé à ' + EMAIL,
			texte: 'Ouvrez l’email et cliquez sur « Gérer mon calendrier partagé » pour activer le partage. Sans activation, il est supprimé dans 48 h.',
			actions: [['Fermer', 'jamais']],
			pied: 'Ce navigateur ne retient rien du partage avant l’activation.'
		};
		case 'deja': return {
			titre: 'Recevoir à nouveau mes liens',
			texte: 'Vous recevrez par email les liens de tous les calendriers partagés avec cette adresse. Le nouveau lien de gestion remplacera l’ancien dès que vous l’utiliserez.',
			email: 'L’adresse utilisée pour partager',
			actions: [['Recevoir mes liens', 'deja-envoye', 1], ['Retour', 'formulaire']],
			notes: [DONNEES]
		};
		case 'deja-envoye': return {
			titre: 'Demande envoyée',
			texte: 'Si des calendriers sont partagés avec ' + EMAIL + ', vous allez recevoir un email.',
			actions: [['Fermer', 'jamais']]
		};
		case 'gestion-attente': return {
			titre: 'Activer le partage ?',
			texte: 'Voici le calendrier tel que le verront les personnes à qui vous donnerez le lien. Personne ne peut l’ouvrir tant que vous n’avez pas activé le partage.',
			resume: resume(),
			actions: [['Activer le partage', 'active', 1]],
			notes: ['Sans activation, ce partage est supprimé le 12 mars à 14 h.']
		};
		case 'active': return {
			titre: 'Partage activé',
			texte: 'Transmettez ce lien aux personnes qui doivent voir le calendrier :',
			lien: true,
			actions: [['Fermer', 'actif']],
			notes: ['Vos prochaines modifications restent privées jusqu’à ce que vous les publiiez.', 'Gardez l’email : son lien de gestion permet de publier depuis un autre navigateur.']
		};
		case 'gestion-different': return {
			titre: 'Ce navigateur a d’autres annotations',
			texte: 'Le calendrier partagé ci-dessous diffère de celui de ce navigateur. Lequel garder ici ?',
			actions: [
				['Reprendre le calendrier partagé ici', 'active', 1, 'remplace les annotations de ce navigateur'],
				['Garder mes annotations', 'modifie', 0, 'elles remplaceront le partage à la prochaine publication']
			]
		};
		case 'recuperation': return {
			titre: 'Gérer « Claire » depuis ce navigateur ?',
			texte: 'Ce lien vient d’une demande « J’ai déjà un lien ». L’utiliser ici retire le droit de publier aux navigateurs qui avaient un lien plus ancien. Ce navigateur a d’autres annotations que le calendrier partagé.',
			actions: [
				['Gérer ici et reprendre le calendrier partagé', 'active', 1, 'remplace les annotations de ce navigateur'],
				['Gérer ici et garder mes annotations', 'modifie', 0, 'elles remplaceront le partage à la prochaine publication']
			],
			notes: ['Ce lien expire le 12 mars à 14 h.']
		};
		case 'actif': return {
			titre: 'Calendrier partagé',
			lien: true,
			texte: 'À jour : publié le 10 mars 2026.',
			actions: [['Arrêter le partage', 'arreter', 0]]
		};
		case 'modifie': return {
			titre: 'Modifications non publiées',
			lien: true,
			texte: 'Le calendrier partagé date du 10 mars 2026. Vos modifications depuis ne sont visibles que dans ce navigateur.',
			actions: [['Publier les modifications', 'actif', 1, 'Partira : ' + resume()], ['Arrêter le partage', 'arreter', 0]]
		};
		case 'arreter': return {
			titre: 'Arrêter le partage ?',
			texte: 'Le lien ' + ID + ' cessera de marcher tout de suite et le calendrier partagé sera supprimé du serveur. Vos annotations restent dans ce navigateur.',
			actions: [['Arrêter le partage', 'arrete', 2], ['Annuler', 'actif']]
		};
		case 'arrete': return {
			titre: 'Partage arrêté',
			texte: 'Le lien ' + ID + ' ne mène plus à rien. Vous pouvez partager à nouveau : vous obtiendrez un autre lien.',
			actions: [['Fermer', 'jamais']]
		};
		case 'cle-remplacee': return {
			titre: 'Géré depuis un autre lien',
			texte: 'Ce calendrier est maintenant géré depuis un autre lien. Pour le gérer ici, ouvrez le dernier lien de gestion reçu.',
			actions: [['Compris', 'jamais']]
		};
		case 'lien-invalide': return {
			titre: 'Ce lien de gestion n’est plus valable',
			texte: 'Le calendrier reste partagé. Un lien plus récent a été utilisé, ou celui-ci a expiré.',
			actions: [['Demander un nouveau lien', 'deja', 1]]
		};
		}
		return null;
	}

	// ---------- briques HTML ----------

	function esc(s) { return s; } // textes du prototype, pas de saisie
	function html(c, opts) {
		opts = opts || {};
		var h = '<div class="proto-titre">' + esc(c.titre) + '</div>';
		if (c.texte) { h += '<p class="proto-texte">' + c.texte + '</p>'; }
		if (c.lien) {
			h += '<div class="proto-lienpublic"><span>' + LIEN + '</span><button type="button" class="proto-copier">Copier</button></div>';
		}
		if (c.resume && !opts.sansResume) { h += '<p class="proto-resume">' + c.resume + '</p>'; }
		if (c.email) { h += '<input type="email" class="proto-email" placeholder="' + c.email + '">'; }
		h += '<div class="proto-actions">';
		(c.actions || []).forEach(function (a) {
			h += '<div class="proto-action"><button type="button" data-e="' + a[1] + '" class="' +
				(a[2] === 1 ? 'proto-principal' : a[2] === 2 ? 'proto-danger' : 'proto-second') + '">' + a[0] + '</button>' +
				(a[3] ? '<small>' + a[3] + '</small>' : '') + '</div>';
		});
		h += '</div>';
		(c.notes || []).forEach(function (n) { h += '<p class="proto-note">' + n + '</p>'; });
		if (c.pied) { h += '<p class="proto-pied">' + c.pied + '</p>'; }
		return h;
	}

	function brancher(racine) {
		$(racine).on('click', '[data-e]', function (ev) { ev.preventDefault(); aller(this.getAttribute('data-e')); });
		$(racine).on('click', '.proto-copier', function () { this.textContent = 'Copié ✓'; });
		$(racine).on('click', '.proto-lien', function (ev) { ev.preventDefault(); });
	}

	// bouton dans l'entête, à côté de « Réinitialiser »
	function bouton(libelle, pastille, etatSuivant) {
		var b = $('<button type="button" class="reset proto-partager">' +
			'<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>' +
			libelle + (pastille ? '<span class="proto-pastille"></span>' : '') + '</button>');
		b.on('click', function () { aller(etatSuivant); });
		$('.actions').append(b);
		return b[0];
	}

	// /@/<id> : calendrier en lecture seule, comme chez le lecteur
	function pagePublique() {
		document.body.classList.add('proto-lecture');
		$('[contenteditable]').removeAttr('contenteditable');
		$('.reset').remove();
		$('#titre').text('Claire');
		$('#url').text('♥ ' + LIEN);
		history.replaceState(null, '', '/@/' + ID + '?' + P.toString().replace(/=(&|$)/g, '$1'));
		if (etat === 'inexistant') {
			$('#calendrier').html('<div class="proto-inexistant">Ce calendrier n’existe pas ou n’est plus partagé.</div>');
			$('#titre, #annee').text('');
			$('#periodes').remove();
		}
	}

	// ---------- A : popover ----------

	function varianteA() {
		var pub = PUBLIC.indexOf(etat) >= 0, part = PARTAGE.indexOf(etat) >= 0;
		var ancre;
		if (!pub) {
			ancre = bouton(part ? 'Partagé' : 'Partager', etat === 'modifie',
				etat === 'jamais' || etat === 'arrete' || etat === 'cle-remplacee' || etat === 'envoye' || etat === 'deja-envoye' ? 'formulaire' :
				part ? (etat === 'modifie' ? 'modifie' : 'actif') : 'jamais');
		} else {
			ancre = document.querySelector('.actions');
		}
		var c = contenu(etat);
		if (!c) { return; }
		var pop = document.createElement('div');
		pop.id = 'proto-pop';
		pop.innerHTML = html(c);
		document.documentElement.appendChild(pop);
		brancher(pop);
		function placer() {
			var r = ancre.getBoundingClientRect();
			pop.style.left = Math.max(8, r.left) + 'px';
			pop.style.top = (r.bottom + 10) + 'px';
			pop.style.setProperty('--fleche-x', Math.max(14, r.width / 2) + 'px');
		}
		placer();
		window.addEventListener('resize', function () { requestAnimationFrame(placer); });
		window.addEventListener('load', placer);
	}

	// ---------- B : bandeau ----------

	function varianteB() {
		var pub = PUBLIC.indexOf(etat) >= 0, part = PARTAGE.indexOf(etat) >= 0;
		if (!pub && !part) { bouton('Partager', false, 'formulaire'); }
		var c = contenu(etat);
		if (!c && !part) { return; }
		var bar = document.createElement('div');
		bar.id = 'proto-bandeau';
		var classe = etat === 'modifie' ? 'proto-modifie' : part ? 'proto-actif' : pub ? 'proto-public' : '';
		if (classe) { bar.classList.add(classe); }
		if (etat === 'actif' || etat === 'modifie') {
			// version compacte, sur une ligne
			bar.innerHTML = '<span class="proto-point"></span><b>' + (etat === 'modifie' ? 'Partagé · modifications non publiées' : 'Partagé') + '</b>' +
				'<span class="proto-lienpublic"><span>' + LIEN + '</span><button type="button" class="proto-copier">Copier</button></span>' +
				(etat === 'modifie'
					? '<span class="proto-droite"><button type="button" data-e="actif" class="proto-principal" title="Partira : ' + resume() + '">Publier les modifications</button><small>' + resume() + '</small></span>'
					: '<span class="proto-droite proto-muet">publié le 10 mars 2026</span>') +
				'<button type="button" data-e="arreter" class="proto-second proto-arreter">Arrêter</button>';
		} else {
			bar.innerHTML = '<div class="proto-bloc">' + html(c) + '</div>';
		}
		$('#entete').after(bar);
		brancher(bar);
	}

	// ---------- C : fenêtre centrée + ligne d'URL ----------

	function varianteC() {
		var e = etat.replace(/-pop$/, '');
		var pub = PUBLIC.indexOf(e) >= 0, part = PARTAGE.indexOf(e) >= 0;
		if (!pub && !part) { bouton('Partager', false, 'formulaire'); }
		if (part) {
			// la ligne d'URL (imprimée) devient le lien public
			var u = $('#url');
			u.html('♥ ' + LIEN + ' <span class="proto-etiquette ' + (e === 'modifie' ? 'proto-orange' : '') + '">' +
				(e === 'modifie' ? 'modifications non publiées · Publier…' : 'partagé · à jour') + '</span>');
			u.addClass('proto-url-active').attr('title', 'Gérer le partage').on('click', function () { aller(e === 'modifie' ? 'modifie-pop' : 'actif-pop'); });
		}
		var c = contenu(e);
		if (!c) { return; }
		var popUrl = /-pop$/.test(etat) || etat === 'arreter';
		if ((etat === 'actif' || etat === 'modifie') && !popUrl) { return; } // rien d'ouvert : seule la ligne d'URL
		if (popUrl) {
			// petit popover sous la ligne d'URL
			var pop = document.createElement('div');
			pop.id = 'proto-pop';
			pop.className = 'proto-sous-url';
			pop.innerHTML = html(c);
			document.documentElement.appendChild(pop);
			brancher(pop);
			var placer = function () {
				var r = document.getElementById('url').getBoundingClientRect();
				pop.style.left = Math.max(8, r.left) + 'px';
				pop.style.setProperty('--fleche-x', '60px');
				pop.style.top = (r.bottom + 10) + 'px';
			};
			placer();
			window.addEventListener('resize', function () { requestAnimationFrame(placer); });
			window.addEventListener('load', placer);
			return;
		}
		var fond = document.createElement('div');
		fond.id = 'proto-fond';
		fond.innerHTML = '<div id="proto-fenetre" role="dialog">' + html(c) + '</div>';
		document.documentElement.appendChild(fond);
		brancher(fond);
	}

	// ---------- barre de choix (hors maquette) ----------

	function barre() {
		var cles = Object.keys(VARIANTES), i = cles.indexOf(variante);
		var b = document.createElement('div');
		b.id = 'proto-barre';
		var opts = ETATS.map(function (x) {
			var sel = x[0] === etat.replace(/-pop$/, '') ? ' selected' : '';
			return '<option value="' + x[0] + '"' + sel + '>' + x[1] + '</option>';
		}).join('');
		b.innerHTML = '<span class="proto-marque">PROTOTYPE</span>' +
			'<button type="button" data-v="-1" title="Variante précédente (←)">◀</button>' +
			'<b>' + variante + ' (' + VARIANTES[variante] + ')</b>' +
			'<button type="button" data-v="1" title="Variante suivante (→)">▶</button>' +
			'<span class="proto-sep"></span>' +
			'<button type="button" data-s="-1" title="État précédent (↑)">▲</button>' +
			'<select>' + opts + '</select>' +
			'<button type="button" data-s="1" title="État suivant (↓)">▼</button>';
		document.documentElement.appendChild(b);
		function variant(d) { aller(etat.replace(/-pop$/, ''), cles[(i + d + cles.length) % cles.length]); }
		function etape(d) {
			var j = ETATS.findIndex(function (x) { return x[0] === etat.replace(/-pop$/, ''); });
			aller(ETATS[(j + d + ETATS.length) % ETATS.length][0]);
		}
		$(b).on('click', '[data-v]', function () { variant(+this.getAttribute('data-v')); });
		$(b).on('click', '[data-s]', function () { etape(+this.getAttribute('data-s')); });
		$(b).on('change', 'select', function () { aller(this.value); });
		document.addEventListener('keydown', function (ev) {
			var t = ev.target;
			if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) { return; }
			if (ev.key === 'ArrowLeft') { variant(-1); }
			if (ev.key === 'ArrowRight') { variant(1); }
			if (ev.key === 'ArrowUp') { ev.preventDefault(); etape(-1); }
			if (ev.key === 'ArrowDown') { ev.preventDefault(); etape(1); }
		});
	}

	// après detailsjour.js et periodes.js (handlers ready enregistrés avant)
	$(function () {
		document.body.classList.add('proto-' + variante);
		resume(); // avant que /@/<id> ne remplace le chemin
		if (PUBLIC.indexOf(etat) >= 0) { pagePublique(); }
		({ A: varianteA, B: varianteB, C: varianteC })[variante]();
		barre();
		window.dispatchEvent(new Event('resize'));
	});
})();
