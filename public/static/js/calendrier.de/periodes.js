// Périodes : bandes de couleur sur plusieurs jours, posées sur le bord droit
// des jours. On sélectionne une période en glissant sur les numéros de jour
// (ou Maj+clic depuis le dernier jour pointé), puis on choisit un libellé et
// une couleur. La liste des périodes du semestre affiché est éditable sous le
// calendrier ; elle n'est pas imprimée.
//
// Stockage : localStorage "jourbandes", tableau de { c, l, d, f } où c est une
// clé de COULEURS_JOUR (detailsjour.js) et d, f les dates incluses au format
// "aaaammjj" (comparables comme chaînes). Pas de cookie : à ~100 octets
// encodés par période, il plafonnerait vers 40 périodes.
//
// Rails : 4 au plus par jour. Chaque période prend le premier rail libre sur
// toute sa durée, dans l'ordre des dates de début. Le calcul porte sur toutes
// les périodes enregistrées, pas seulement le semestre affiché, pour qu'une
// période garde son rail d'un semestre à l'autre ; en revanche l'ajout ou le
// retrait d'une période peut décaler les suivantes. Une période sans rail
// libre reste dans la liste, marquée « non affichée ».
var Periodes = (function () {
	'use strict';

	var CLE = 'jourbandes';
	var RAILS = 4;
	var MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

	var periodes = [];  // { c, l, d, f }
	var rails = [];     // rail de periodes[i], -1 si aucun n'est libre
	var jours = [];     // { el, cle } dans l'ordre d'affichage
	var cal, pop, panneau, liste;
	var surFermeture = null;
	var couleurPrec = 'bleu'; // appliquée par Entrée dans la barre de création

	// sélection en cours
	var sel = null, ancre = null, glisse = false, dernierJour = null;
	// vrai si le clic qui suit le mouseup termine une sélection : il ne doit
	// ni peindre (pinceau) ni basculer la mise en avant du jour courant
	var clicAbsorbe = false;

	// ---------- utilitaires ----------

	function cleJour(el) { // "j-jjmmaaaa" -> "aaaammjj"
		return el.id.slice(6, 10) + el.id.slice(4, 6) + el.id.slice(2, 4);
	}
	function versDate(k) { return new Date(+k.slice(0, 4), +k.slice(4, 6) - 1, +k.slice(6, 8)); }
	function libDate(k) { return +k.slice(6, 8) + ' ' + MOIS_COURT[+k.slice(4, 6) - 1]; }
	function libPeriode(p) { return p.d === p.f ? libDate(p.d) : libDate(p.d) + ' → ' + libDate(p.f); }
	function duree(p) { return Math.round((versDate(p.f) - versDate(p.d)) / 864e5) + 1; }
	function hex(nom) { return couleurHex(nom) || '#8E8E93'; }
	function el(tag, cls, txt) {
		var e = document.createElement(tag);
		if (cls) { e.className = cls; }
		if (txt != null) { e.textContent = txt; }
		return e;
	}
	function bouton(cls, txt) { var b = el('button', cls, txt); b.type = 'button'; return b; }

	// ---------- stockage ----------

	function valide(p) {
		return p && typeof p.c === 'string' && /^\d{8}$/.test(p.d) && /^\d{8}$/.test(p.f) && p.d <= p.f;
	}
	function charger() {
		try {
			var v = JSON.parse(localStorage.getItem(CLE));
			if (Array.isArray(v)) {
				return v.filter(valide).map(function (p) { return { c: p.c, l: String(p.l || ''), d: p.d, f: p.f }; });
			}
		} catch (e) {}
		return [];
	}
	// localStorage indisponible (stockage bloqué, quota) : les périodes
	// restent utilisables jusqu'au rechargement, sans être conservées
	function enregistrer() {
		try {
			if (periodes.length) { localStorage.setItem(CLE, JSON.stringify(periodes)); }
			else { localStorage.removeItem(CLE); }
		} catch (e) {}
	}

	// ---------- rendu ----------

	function placer() {
		var ordre = periodes.map(function (p, i) { return i; }).sort(function (a, b) {
			var x = periodes[a], y = periodes[b];
			return x.d < y.d ? -1 : x.d > y.d ? 1 : x.f > y.f ? -1 : x.f < y.f ? 1 : a - b;
		});
		var occupes = [];
		for (var r = 0; r < RAILS; r++) { occupes.push([]); }
		rails = [];
		ordre.forEach(function (i) {
			var p = periodes[i];
			rails[i] = -1;
			for (var r = 0; r < RAILS; r++) {
				if (!occupes[r].some(function (q) { return q.d <= p.f && q.f >= p.d; })) {
					occupes[r].push(p);
					rails[i] = r;
					return;
				}
			}
		});
	}

	function dessiner() {
		placer();
		$(cal).find('.bande').remove();
		jours.forEach(function (j) {
			periodes.forEach(function (p, i) {
				if (rails[i] < 0 || j.cle < p.d || j.cle > p.f) { return; }
				var b = el('span', 'bande rail-' + rails[i] +
					(j.cle === p.d ? ' debut' : '') + (j.cle === p.f ? ' fin' : ''));
				b.style.backgroundColor = hex(p.c);
				b.dataset.periode = i;
				b.title = (p.l ? p.l + ' · ' : '') + libPeriode(p);
				j.el.appendChild(b);
			});
		});
	}

	// met une période en avant (survol de sa ligne) ; null pour revenir
	function focaliser(i) {
		$(cal).toggleClass('periode-focus', i !== null).find('.bande').each(function () {
			this.classList.toggle('focus', +this.dataset.periode === i);
		});
	}

	function changer() {
		enregistrer();
		dessiner();
		majListe();
	}

	// ---------- popover (création, choix de couleur) ----------

	// Rattaché à <html> comme la palette du clic droit : le zoom posé sur
	// <body> fausserait le positionnement en coordonnées viewport.
	function creerPop() {
		pop = el('div');
		pop.id = 'periode-pop';
		pop.setAttribute('role', 'dialog');
		pop.hidden = true;
		document.documentElement.appendChild(pop);
		// capture : la fermeture passe avant le mousedown qui ouvre une
		// nouvelle sélection
		document.addEventListener('mousedown', function (e) {
			clicAbsorbe = false;
			if (!pop.contains(e.target)) { fermer(); }
		}, true);
		$(document).on('keydown', function (e) { if (e.key === 'Escape') { fermer(); } });
		$(window).on('resize scroll blur beforeprint', fermer);
	}

	function ouvrir(contenu, ancrage, label, quandFerme) {
		fermer();
		pop.innerHTML = '';
		pop.appendChild(contenu);
		pop.setAttribute('aria-label', label);
		pop.hidden = false;
		surFermeture = quandFerme || null;
		var r = ancrage.getBoundingClientRect();
		var vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
		var w = pop.offsetWidth, h = pop.offsetHeight, marge = 6;
		pop.style.left = Math.max(marge, Math.min(r.left, vw - w - marge)) + 'px';
		var top = r.bottom + marge;
		if (top + h > vh - marge) { top = Math.max(marge, r.top - h - marge); }
		pop.style.top = top + 'px';
	}

	function fermer() {
		if (!pop || pop.hidden) { return; }
		pop.hidden = true;
		var f = surFermeture;
		surFermeture = null;
		if (f) { f(); }
	}

	function grille(actuelle, choisir) {
		var g = el('div', 'grille');
		COULEURS_JOUR.forEach(function (c) {
			var b = bouton('pastille');
			b.title = c[0];
			b.style.backgroundColor = c[1];
			b.setAttribute('aria-pressed', c[0] === actuelle ? 'true' : 'false');
			b.addEventListener('click', function () { choisir(c[0]); });
			g.appendChild(b);
		});
		return g;
	}

	// ---------- sélection et création ----------

	function poser(a, b) {
		sel = { d: a < b ? a : b, f: a < b ? b : a };
		jours.forEach(function (j) {
			j.el.classList.toggle('periode-sel', j.cle >= sel.d && j.cle <= sel.f);
		});
	}
	function effacerSel() {
		sel = null;
		$(cal).find('.periode-sel').removeClass('periode-sel');
	}

	function ouvrirBarre(ancrage) {
		var s = sel;
		var box = el('div');
		box.appendChild(el('div', 'titre', libPeriode(s) + ' · ' + duree(s) + ' j'));
		var input = el('input', 'libelle');
		input.type = 'text';
		input.placeholder = 'Libellé (facultatif)';
		input.setAttribute('aria-label', 'Libellé de la période');
		box.appendChild(input);
		// la couleur cochée est celle qu'applique Entrée
		box.appendChild(grille(couleurPrec, creer));
		function creer(c) {
			periodes.push({ c: c, l: input.value.trim(), d: s.d, f: s.f });
			couleurPrec = c;
			fermer();
			changer();
			var i = periodes.length - 1;
			// sans rail libre, rien n'apparaît sur le calendrier : on amène
			// la ligne « non affichée » à l'écran
			signaler(i, rails[i] < 0);
		}
		input.addEventListener('keydown', function (e) {
			if (e.key === 'Enter') { e.preventDefault(); creer(couleurPrec); }
		});
		ouvrir(box, ancrage, 'Nouvelle période', effacerSel);
		input.focus({ preventScroll: true });
	}

	function brancherSelection() {
		$(cal).on('mousedown', '.jour', function (e) {
			if (e.which !== 1 || $(cal).hasClass('pinceau')) { return; }
			var c = cleJour(this);
			if (e.shiftKey && ancre) {
				e.preventDefault();
				poser(ancre, c);
				clicAbsorbe = true;
				ouvrirBarre(this);
				return;
			}
			if (!$(e.target).closest('.numero_jour, .nom_jour').length) { return; }
			e.preventDefault(); // pas de sélection de texte pendant le glisser
			ancre = c;
			dernierJour = this;
			glisse = true;
			poser(c, c);
		}).on('mouseover', '.jour', function () {
			if (!glisse) { return; }
			dernierJour = this;
			poser(ancre, cleJour(this));
		}).on('click', '.bande', function (e) {
			e.stopPropagation();
			signaler(+this.dataset.periode, true);
		});
		$(document).on('mouseup', function () {
			if (!glisse) { return; }
			glisse = false;
			clicAbsorbe = true;
			ouvrirBarre(dernierJour);
		});
		cal.addEventListener('click', function (e) {
			if (clicAbsorbe) { clicAbsorbe = false; e.stopPropagation(); }
		}, true);
	}

	// ---------- liste sous le calendrier ----------

	function creerPanneau() {
		panneau = el('div');
		panneau.id = 'periodes';
		var tete = el('div', 'tete');
		tete.appendChild(el('span', 'titre', 'Périodes'));
		tete.appendChild(el('span', 'aide', 'Glisser sur les numéros de jour, ou Maj+clic, pour ajouter une période.'));
		panneau.appendChild(tete);
		liste = el('ul');
		panneau.appendChild(liste);
		cal.parentNode.insertBefore(panneau, cal.nextSibling);
	}

	function majListe() {
		var debut = jours[0].cle, fin = jours[jours.length - 1].cle;
		var visibles = periodes.map(function (p, i) { return i; }).filter(function (i) {
			return periodes[i].f >= debut && periodes[i].d <= fin;
		}).sort(function (a, b) {
			var x = periodes[a], y = periodes[b];
			return x.d < y.d ? -1 : x.d > y.d ? 1 : a - b;
		});
		liste.innerHTML = '';
		visibles.forEach(function (i) {
			var p = periodes[i];
			var li = el('li');
			li.dataset.periode = i;

			var sw = bouton('couleur');
			sw.style.backgroundColor = hex(p.c);
			sw.title = 'Couleur';
			sw.setAttribute('aria-label', 'Couleur');
			sw.addEventListener('click', function () {
				ouvrir(grille(p.c, function (c) { p.c = c; fermer(); changer(); }), sw, 'Couleur de la période');
			});

			var lib = el('input', 'libelle');
			lib.type = 'text';
			lib.value = p.l;
			lib.placeholder = 'Sans libellé';
			lib.setAttribute('aria-label', 'Libellé');
			lib.addEventListener('input', function () { p.l = lib.value; enregistrer(); });
			lib.addEventListener('change', function () { p.l = lib.value.trim(); enregistrer(); dessiner(); });
			lib.addEventListener('keydown', function (e) { if (e.key === 'Enter') { lib.blur(); } });

			var dates = el('span', 'dates', libPeriode(p));
			if (rails[i] < 0) {
				dates.appendChild(el('span', 'non-affichee', ' · non affichée'));
				dates.title = '4 bandes occupent déjà une partie de ces jours';
			}

			var x = bouton('retirer', '✕');
			x.title = 'Retirer';
			x.setAttribute('aria-label', 'Retirer la période');
			x.addEventListener('click', function () {
				periodes.splice(i, 1);
				focaliser(null);
				changer();
			});

			li.addEventListener('mouseenter', function () { focaliser(i); });
			li.addEventListener('mouseleave', function () { focaliser(null); });
			li.appendChild(sw);
			li.appendChild(lib);
			li.appendChild(dates);
			li.appendChild(x);
			liste.appendChild(li);
		});
	}

	function signaler(i, defiler) {
		var li = liste.querySelector('[data-periode="' + i + '"]');
		if (!li) { return; }
		if (defiler) { li.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
		li.classList.remove('signal');
		void li.offsetWidth; // relance l'animation
		li.classList.add('signal');
	}

	// ---------- API ----------

	function init() {
		cal = document.getElementById('calendrier');
		jours = $(cal).find('.jour').map(function () { return { el: this, cle: cleJour(this) }; }).get();
		if (!jours.length) { return; }
		periodes = charger();
		creerPop();
		creerPanneau();
		brancherSelection();
		dessiner();
		majListe();
	}

	// Réinitialiser : toutes les périodes, tous semestres confondus, comme
	// les annotations en cookie
	function effacer() {
		fermer();
		periodes = [];
		changer();
	}

	return { init: init, effacer: effacer };
})();

$(document).ready(Periodes.init);
