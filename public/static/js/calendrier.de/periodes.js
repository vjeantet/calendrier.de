// Périodes : bandes de couleur sur plusieurs jours, posées sur le bord droit
// des jours. On sélectionne une période en glissant sur les numéros de jour
// (ou Maj+clic depuis le dernier jour pointé), puis on choisit un libellé et
// une couleur. Tant que la barre de création est ouverte, toucher ou cliquer
// un autre jour étend la sélection : c'est le geste des écrans tactiles, où
// glisser fait défiler la page. La liste des périodes du semestre affiché
// est éditable sous le calendrier ; elle n'est pas imprimée.
//
// La barre propose aussi le fond des jours sélectionnés (même réglage que la
// palette du clic droit, absente au doigt).
//
// Fusion : une période qui touche ou chevauche une autre de même couleur et
// de même libellé ne fait plus qu'une avec elle (création jour par jour).
//
// Stockage : localStorage "jourbandes", tableau de { c, l, d, f } où c est une
// clé de COULEURS_JOUR (detailsjour.js) et d, f les dates incluses au format
// "aaaammjj" (comparables comme chaînes).
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
	var ancragePop = null, popACote = false, surFermeture = null;
	var barre = null; // { titre } tant que la barre de création est ouverte
	var couleurPrec = 'bleu'; // appliquée par Entrée dans la barre de création
	// dernier pointeur utilisé : au doigt, on ne donne pas le focus au
	// libellé (le clavier masquerait les jours à toucher pour étendre)
	var tactile = false;

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
	function lendemain(k) {
		var x = versDate(k);
		x.setDate(x.getDate() + 1);
		var m = x.getMonth() + 1, j = x.getDate();
		return x.getFullYear() + (m < 10 ? '0' : '') + m + (j < 10 ? '0' : '') + j;
	}
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
				return fusionner(v.filter(valide).map(function (p) {
					return { c: p.c, l: String(p.l || '').trim(), d: p.d, f: p.f };
				}));
			}
		} catch (e) {}
		return [];
	}

	// Regroupe les périodes de même couleur et même libellé qui se touchent
	// ou se chevauchent. Trié par date de début : une période ne peut alors
	// prolonger que la dernière de son groupe.
	function fusionner(liste) {
		var res = [];
		liste.slice().sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; }).forEach(function (p) {
			for (var i = res.length - 1; i >= 0; i--) {
				var q = res[i];
				if (q.c === p.c && q.l === p.l && p.d <= lendemain(q.f)) {
					if (p.f > q.f) { q.f = p.f; }
					return;
				}
			}
			res.push({ c: p.c, l: p.l, d: p.d, f: p.f });
		});
		return res;
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
		document.addEventListener('pointerdown', function (e) {
			tactile = e.pointerType === 'touch' || e.pointerType === 'pen';
		}, true);
		// capture : la fermeture passe avant le mousedown qui ouvre une
		// nouvelle sélection. Barre de création ouverte : un clic gauche sur
		// un jour l'étend (mousedown du calendrier) au lieu de la fermer.
		document.addEventListener('mousedown', function (e) {
			clicAbsorbe = false;
			if (pop.contains(e.target)) { return; }
			if (barre && e.button === 0 && $(e.target).closest('#calendrier .jour').length) { return; }
			fermer();
		}, true);
		$(document).on('keydown', function (e) { if (e.key === 'Escape') { fermer(); } });
		// défilement et redimensionnement (clavier virtuel compris) déplacent
		// le popover au lieu de le fermer : au doigt, on fait souvent défiler
		// pour atteindre le dernier jour
		$(window).on('resize scroll', placerPop).on('blur beforeprint', fermer);
	}

	// aCote : à droite (ou à gauche) du jour plutôt que dessous, pour ne pas
	// masquer les jours suivants de la colonne, ceux qu'on touche pour étendre
	function ouvrir(contenu, ancrage, label, quandFerme, aCote) {
		fermer();
		pop.innerHTML = '';
		pop.appendChild(contenu);
		pop.setAttribute('aria-label', label);
		pop.hidden = false;
		ancragePop = ancrage;
		popACote = !!aCote;
		surFermeture = quandFerme || null;
		placerPop();
	}

	function placerPop() {
		if (pop.hidden) { return; }
		var r = ancragePop.getBoundingClientRect();
		var vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
		var w = pop.offsetWidth, h = pop.offsetHeight, marge = 6, left, top;
		if (popACote) {
			left = r.right + marge;
			if (left + w > vw - marge) { left = r.left - w - marge; }
			left = Math.max(marge, left);
			top = Math.max(marge, Math.min(r.top, vh - h - marge));
		} else {
			left = Math.max(marge, Math.min(r.left, vw - w - marge));
			top = r.bottom + marge;
			if (top + h > vh - marge) { top = Math.max(marge, r.top - h - marge); }
		}
		pop.style.left = left + 'px';
		pop.style.top = top + 'px';
	}

	function fermer() {
		if (!pop || pop.hidden) { return; }
		pop.hidden = true;
		barre = null;
		var f = surFermeture;
		surFermeture = null;
		if (f) { f(); }
	}

	// aucune : ajoute en tête une pastille « Aucune couleur » (valeur null)
	function grille(actuelle, choisir, aucune) {
		var g = el('div', 'grille');
		(aucune ? [[null, null]] : []).concat(COULEURS_JOUR).forEach(function (c) {
			var b = bouton(c[0] ? 'pastille' : 'pastille aucune');
			b.title = c[0] || 'Aucune couleur';
			b.dataset.couleur = c[0] || '';
			if (c[1]) { b.style.backgroundColor = c[1]; }
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

	function titreSel() { return libPeriode(sel) + ' · ' + duree(sel) + ' j'; }

	function ouvrirBarre(ancrage) {
		var box = el('div');
		var titre = el('div', 'titre', titreSel());
		box.appendChild(titre);
		box.appendChild(el('div', 'aide', 'Touchez ou cliquez un autre jour pour étendre.'));
		var input = el('input', 'libelle');
		input.type = 'text';
		input.placeholder = 'Libellé (facultatif)';
		input.setAttribute('aria-label', 'Libellé de la période');
		box.appendChild(el('div', 'section', 'Bande'));
		box.appendChild(input);
		// la couleur cochée est celle qu'applique Entrée
		var bandes = grille(couleurPrec, creer);
		bandes.classList.add('bandes');
		box.appendChild(bandes);
		var titreFond = el('div', 'section');
		box.appendChild(titreFond);
		var fond = grille(undefined, colorierFond, true);
		box.appendChild(fond);
		function creer(c) {
			var s = sel, l = input.value.trim();
			periodes = fusionner(periodes.concat([{ c: c, l: l, d: s.d, f: s.f }]));
			couleurPrec = c;
			fermer();
			changer();
			var i = periodes.findIndex(function (p) { return p.c === c && p.l === l && p.d <= s.d && p.f >= s.f; });
			// sans rail libre, rien n'apparaît sur le calendrier : on amène
			// la ligne « non affichée » à l'écran
			signaler(i, rails[i] < 0);
		}
		input.addEventListener('keydown', function (e) {
			if (e.key === 'Enter') { e.preventDefault(); creer(couleurPrec); }
		});
		ouvrir(box, ancrage, 'Nouvelle période', effacerSel, true);
		barre = { titre: titre, titreFond: titreFond, fond: fond };
		majFond();
		if (!tactile) { input.focus({ preventScroll: true }); }
	}

	function joursSel() {
		return jours.filter(function (j) { return j.cle >= sel.d && j.cle <= sel.f; });
	}

	// fond des jours sélectionnés, via detailsjour.js (localStorage jourcouleurs)
	function colorierFond(nom) {
		joursSel().forEach(function (j) { jourChangerCouleur(j.el.id.slice(2), nom); });
		fermer();
	}

	// coche la couleur de fond commune à tous les jours sélectionnés, s'il y en a une
	function majFond() {
		var js = joursSel();
		barre.titreFond.textContent = js.length > 1 ? 'Fond des ' + js.length + ' jours' : 'Fond du jour';
		var communs = js.map(function (j) { return jourCouleurList[j.el.id.slice(2)] || ''; });
		var commun = communs.every(function (c) { return c === communs[0]; }) ? communs[0] : null;
		$(barre.fond).children().each(function () {
			this.setAttribute('aria-pressed', this.dataset.couleur === commun ? 'true' : 'false');
		});
	}

	// barre ouverte : le jour pointé devient l'autre bout de la sélection
	function etendre(jourEl) {
		poser(ancre, cleJour(jourEl));
		barre.titre.textContent = titreSel();
		majFond();
	}

	function brancherSelection() {
		$(cal).on('mousedown', '.jour', function (e) {
			if (e.which !== 1 || $(cal).hasClass('pinceau')) { return; }
			var c = cleJour(this);
			if (barre) {
				e.preventDefault(); // garde le focus du libellé, pas d'édition du jour
				clicAbsorbe = true;
				etendre(this);
				return;
			}
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
		tete.appendChild(el('span', 'aide', 'Glisser sur les numéros de jour, ou toucher le premier puis le dernier jour, pour ajouter une période.'));
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
	// les annotations
	function effacer() {
		fermer();
		periodes = [];
		changer();
	}

	return { init: init, effacer: effacer };
})();

$(document).ready(Periodes.init);
