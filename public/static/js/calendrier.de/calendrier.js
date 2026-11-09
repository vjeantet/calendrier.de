// Rendu du calendrier semestriel dans le navigateur (remplace l'ancien serveur Go).
//
// Routes reconnues (identiques à la version Go) :
//   /                    mois en cours + 5 suivants
//   /Claire              idem, avec "Claire" en titre
//   /2014                janvier à juin 2014
//   /2014/04             avril à septembre 2014
//   /Claire/2014         janvier à juin 2014, titré
//   /Claire/2014/04      avril à septembre 2014, titré
var Calendrier = (function () {
	var JOURS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']; // indexé par getDay()
	var MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
		'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

	// setFullYear plutôt que new Date(y, ...) : ce dernier lit 0-99 comme 1900-1999.
	// Le mois (0-11) et le jour débordent normalement sur les unités voisines.
	function date(y, m, d) {
		var x = new Date(2000, 0, 1);
		x.setFullYear(y, m, d);
		return x;
	}

	function pad(n, w) {
		var s = String(n);
		while (s.length < w) { s = '0' + s; }
		return s;
	}

	function ddmmyyyy(d) {
		return pad(d.getDate(), 2) + pad(d.getMonth() + 1, 2) + pad(d.getFullYear(), 4);
	}

	function semaineISO(d) {
		var t = new Date(0);
		t.setUTCFullYear(d.getFullYear(), d.getMonth(), d.getDate());
		t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7)); // jeudi de la semaine
		var debut = new Date(0);
		debut.setUTCFullYear(t.getUTCFullYear(), 0, 1);
		return Math.ceil(((t - debut) / 86400000 + 1) / 7);
	}

	// Dimanche de Pâques, calendrier grégorien (algorithme de Meeus/Jones/Butcher).
	function paques(y) {
		var a = y % 19, b = Math.floor(y / 100), c = y % 100;
		var d = Math.floor(b / 4), e = b % 4;
		var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
		var h = (19 * a + b - d - g + 15) % 30;
		var i = Math.floor(c / 4), k = c % 4;
		var l = (32 + 2 * e + 2 * i - h - k) % 7;
		var m = Math.floor((a + 11 * h + 22 * l) / 451);
		var mois = Math.floor((h + l - 7 * m + 114) / 31);
		var jour = ((h + l - 7 * m + 114) % 31) + 1;
		return date(y, mois - 1, jour);
	}

	// Jours fériés de l'année donnée et de la suivante, indexés par "jjmmaaaa".
	function joursFeries(annee) {
		var res = {};
		function add(d, label) { res[ddmmyyyy(d)] = label; }
		for (var y = annee; y <= annee + 1; y++) {
			var p = paques(y);
			add(date(y, 0, 1), "jour de l'an");
			add(date(y, 4, 1), 'Fête du travail');
			add(date(y, 4, 8), 'Victoire des alliés');
			add(date(y, 6, 14), 'Fête nationale');
			add(date(y, 7, 15), 'Assomption');
			add(date(y, 10, 1), 'Toussaint');
			add(date(y, 10, 11), 'Armistice');
			add(date(y, 11, 25), 'Noel');
			add(date(y, p.getMonth(), p.getDate() + 1), 'Lundi de Pâques');
			add(date(y, p.getMonth(), p.getDate() + 39), 'Ascension');
			add(date(y, p.getMonth(), p.getDate() + 50), 'Pentecôte');
		}
		return res;
	}

	function entier(s) {
		return /^[+-]?\d+$/.test(s) ? parseInt(s, 10) : NaN;
	}

	function ou(n, defaut) {
		return isNaN(n) ? defaut : n;
	}

	function decode(s) {
		try { return decodeURIComponent(s); } catch (e) { return s; }
	}

	// Écart volontaire avec la version Go : les "/" finaux sont ignorés et un
	// nombre invalide retombe sur la valeur par défaut au lieu de l'an 0.
	function analyserChemin(chemin, maintenant) {
		var r = { titre: '', annee: maintenant.getFullYear(), mois: maintenant.getMonth() + 1 };
		var p = chemin.replace(/^\/+|\/+$/g, '');
		var s = p === '' ? [] : p.split('/');
		var n = s.length ? entier(s[0]) : NaN;

		if (s.length === 1) {
			if (isNaN(n)) { r.titre = decode(s[0]); } else { r.annee = n; r.mois = 1; }
		} else if (s.length === 2) {
			if (isNaN(n)) {
				r.titre = decode(s[0]);
				r.annee = ou(entier(s[1]), r.annee);
				r.mois = 1;
			} else {
				r.annee = n;
				r.mois = ou(entier(s[1]), 1);
			}
		} else if (s.length === 3) {
			r.titre = decode(s[0]);
			r.annee = ou(entier(s[1]), r.annee);
			r.mois = ou(entier(s[2]), 1);
		}
		return r;
	}

	function construire(chemin, maintenant) {
		var q = analyserChemin(chemin, maintenant);
		var debut = date(q.annee, q.mois - 1, 1);
		var y = debut.getFullYear(), m = debut.getMonth();
		var prefixe = q.titre ? encodeURIComponent(q.titre) + '/' : '';
		function lien(d) {
			return '/' + prefixe + pad(d.getFullYear(), 4) + '/' + pad(d.getMonth() + 1, 2);
		}

		var html = '';
		for (var i = 0; i < 6; i++) {
			var premier = date(y, m + i, 1);
			html += '<span class="mois"><span class="nom_mois" contenteditable="true" data-mois="' + pad(premier.getMonth() + 1, 2) + pad(premier.getFullYear(), 4) + '">' + MOIS[premier.getMonth()] + '</span>';
			for (var d = premier; d.getMonth() === premier.getMonth(); d = date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
				var l = JOURS[d.getDay()], id = ddmmyyyy(d);
				html += '<span class="jour J_' + l + '" id="j-' + id + '">' +
					'<span class="opt1"></span>' +
					'<span class="numero_jour">' + pad(d.getDate(), 2) + '</span>' +
					'<span class="nom_jour">' + l + '</span>' +
					'<span class="infos_jour">' +
					'<span contenteditable="true" jour="' + id + '">&nbsp;</span>' +
					'<span contenteditable="false" class="numero_semaine">' +
					(d.getDay() === 2 ? pad(semaineISO(d), 2) : '') + '</span>' +
					'</span></span>';
			}
			html += '<span class="mois_footer"></span></span>';
		}

		return {
			titre: q.titre,
			anneeDebut: y,
			anneeFin: date(y, m + 5, 1).getFullYear(),
			lienPrecedent: lien(date(y, m - 6, 1)),
			lienSuivant: lien(date(y, m + 6, 1)),
			html: html,
			feries: joursFeries(y)
		};
	}

	// Doit s'exécuter dans le <body>, après #calendrier et après le chargement de
	// detailsjour.js : son handler ready (annotations du cookie) passe avant
	// celui des jours fériés, qui ont le dernier mot comme dans la version Go.
	function afficher() {
		var c = construire(window.location.pathname, new Date());
		var $id = function (id) { return document.getElementById(id); };
		document.title = 'Calendrier semestriel ' + c.anneeDebut;
		$id('annee').textContent = c.anneeDebut + (c.anneeFin !== c.anneeDebut ? '-' + c.anneeFin + ' ' : '');
		$id('titre').textContent = c.titre;
		$id('url').textContent = '♥ ' + window.location.origin + decode(window.location.pathname);
		$id('precedent').href = c.lienPrecedent;
		$id('suivant').href = c.lienSuivant;
		$id('calendrier').innerHTML = c.html;
		$(document).ready(function () { jourSetCustomization(c.feries, true); });
	}

	return {
		afficher: afficher,
		construire: construire,
		analyserChemin: analyserChemin,
		joursFeries: joursFeries,
		semaineISO: semaineISO
	};
})();
