// Injecté par serveur.py avant tout autre script de la page.
//
// - Date figée au mardi 10 mars 2026 : "/" affiche mars-août 2026 avec le
//   jour courant surligné, quel que soit le jour de la capture.
// - localStorage vidé, puis rempli si l'URL contient "?annote" : textes,
//   fonds de jour, libellés de mois (dont un vide) et périodes (dont un jour
//   à 4 rails, une 5e « non affichée » et une coupure de mois).
(function () {
	var MAINTENANT = new Date(2026, 2, 10, 12, 0, 0).getTime();
	var D = Date;
	function DateFigee() {
		var a = Array.prototype.slice.call(arguments);
		return new (Function.prototype.bind.apply(D, [null].concat(a.length ? a : [MAINTENANT])))();
	}
	DateFigee.prototype = D.prototype;
	DateFigee.now = function () { return MAINTENANT; };
	DateFigee.UTC = D.UTC;
	DateFigee.parse = D.parse;
	window.Date = DateFigee;

	localStorage.clear();
	if (location.search.indexOf('annote') < 0) { return; }

	var donnees = {
		jourdetails: {
			'12032026': 'Réunion projet',
			'20032026': 'Texte très long qui déborde largement de la case',
			'06042026': 'texte sous un férié',
			'24032026': 'Comité',
			'15102026': 'Formation',
			'03112026': 'Point mensuel'
		},
		jourcouleurs: {
			'10032026': 'jaune',
			'17032026': 'vert',
			'24032026': 'rouge',
			'14032026': 'bleu',
			'01052026': 'violet',
			'03112026': 'orange'
		},
		moislibelles: {
			'042026': 'Avril (congés)',
			'112026': ''
		},
		jourbandes: [
			{ c: 'orange', l: 'Astreinte', d: '20260301', f: '20260308' },
			{ c: 'bleu', l: 'Sprint 1', d: '20260302', f: '20260313' },
			{ c: 'vert', l: 'Audit', d: '20260305', f: '20260306' },
			{ c: 'cyan', l: 'Déplacement', d: '20260306', f: '20260307' },
			{ c: 'rose', l: 'Cinquième', d: '20260306', f: '20260306' },
			{ c: 'violet', l: '', d: '20260310', f: '20260310' },
			{ c: 'rouge', l: 'Congés', d: '20260325', f: '20260408' },
			{ c: 'indigo', l: 'Projet', d: '20261026', f: '20261106' }
		]
	};
	for (var k in donnees) { localStorage.setItem(k, JSON.stringify(donnees[k])); }
})();
