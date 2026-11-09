var jourdetailList = {} ;
var jourCouleurList = {} ;
var moisLibelleList = {} ;

// Palette du clic droit : couleurs système Apple (mode clair). Le cookie
// stocke la clé et non la valeur, pour pouvoir retoucher une teinte sans
// invalider les jours déjà coloriés.
var COULEURS_JOUR = [
	['rouge', '#FF3B30'], ['orange', '#FF9500'], ['jaune', '#FFCC00'],
	['vert', '#34C759'], ['menthe', '#00C7BE'], ['cyan', '#32ADE6'],
	['ciel', '#5AC8FA'], ['bleu', '#007AFF'], ['indigo', '#5856D6'],
	['violet', '#AF52DE'], ['rose', '#FF2D55'], ['brun', '#A2845E'],
	['gris', '#8E8E93']
] ;

$( document ).ready(function() {
	jourdetailList = storageGetData()
	jourSetCustomization(jourdetailList) ;
	jourCouleurList = cookieGetJSON('jourcouleurs') ;
	$.each(jourCouleurList, jourAppliquerCouleur) ;
	paletteInit() ;
	moisLibelleInit() ;

	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd
	} 

	if(mm<10) {
	    mm='0'+mm
	} 

	
	
	$('#j-'+dd+mm+yyyy).addClass("today") ;
	$('#j-'+dd+mm+yyyy).on('click', function(e) {
      $( this ).toggleClass("today today_off"); //you can list several class names 
      e.preventDefault();
    });

	
	$('body').on('focus', '[contenteditable]', function() {
	    var $this = $(this);
	    $this.data('before', $this.html());
		jourTextChange($this.attr('jour'),$this.text()) ;
	}).on('blur keyup paste', '[contenteditable]', function() {
	    var $this = $(this);
	    if ($this.data('before') !== $this.html()) {
	        $this.data('before', $this.html());
	        $this.trigger('change');
	    }
		jourTextChange($this.attr('jour'),$this.text()) ;
	});
});
	
	
function jourTextChange(id,text)
{
	// titre, année, nom de mois : éditables mais sans attribut jour
	if (!id) { return ; }
	jourdetailList[id] = text ;
	storageSetData(jourdetailList) ;
}
	
function storageGetData(){ return cookieGetJSON('jourdetails') ; }

function cookieGetJSON(name){
	var cookie = cookieGet(name) ;
	if (cookie != null)
	{
		try {
			var v = JSON.parse(cookie) ;
			if (v && typeof v === 'object') { return v ; }
		} catch (e) {}
	}
	return {} ;
}

function storageSetData(data){cookieSet('jourdetails', JSON.stringify(data), 365);}

// Lecture/écriture du cookie au format de jquery-cookie 1.3.1 (remplacé) :
// nom et valeur encodés par encodeURIComponent, '+' lu comme espace,
// valeur entre guillemets (RFC 2068) déséchappée. Les annotations déjà
// enregistrées restent donc lisibles.
function cookieGet(name){
	var cookies = document.cookie ? document.cookie.split('; ') : [] ;
	for (var i = 0; i < cookies.length; i++) {
		var parts = cookies[i].split('=') ;
		try {
			if (decodeURIComponent(parts.shift().replace(/\+/g, ' ')) !== name) { continue ; }
			var value = decodeURIComponent(parts.join('=').replace(/\+/g, ' ')) ;
		} catch (e) { continue ; } // cookie tiers mal encodé
		if (value.indexOf('"') === 0) {
			value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\') ;
		}
		return value ;
	}
	return null ;
}

function cookieSet(name, value, days){
	var expires = new Date() ;
	expires.setDate(expires.getDate() + days) ;
	document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) +
		'; expires=' + expires.toUTCString() + '; path=/; SameSite=Lax' ;
}

function jourSetCustomization(jours_list,dayoff)
{
	dayoff = typeof dayoff !== 'undefined' ? dayoff : false;
	$.each(jours_list, function(jour, text) {
		$('span[jour="'+jour+'"]').text(text) ;
		if (dayoff == true)
		{
			$('span[jour="'+jour+'"]').addClass('locked');
			$('#j-'+jour).addClass('ferie');			
		}
	});
}

function jourDeleteCustomization()
{
	$("span[jour]").not('.locked').text('') ;
	storageSetData({})
	$.each(jourCouleurList, function(id) { jourAppliquerCouleur(id, null) ; }) ;
	jourCouleurList = {} ;
	cookieSet('jourcouleurs', '{}', 365) ;
	$('.nom_mois[data-mois]').each(function() { this.textContent = this.dataset.defaut ; }) ;
	moisLibelleList = {} ;
	cookieSet('moislibelles', '{}', 365) ;
}

// Libellés de mois renommés, indexés par "mmaaaa" : un renommage ne vaut
// que pour ce mois-là. Un libellé égal au nom par défaut n'est pas stocké ;
// un libellé vidé l'est (chaîne vide).
function moisLibelleInit()
{
	moisLibelleList = cookieGetJSON('moislibelles') ;
	$('.nom_mois[data-mois]').each(function() {
		this.dataset.defaut = this.textContent ;
		var libelle = moisLibelleList[this.dataset.mois] ;
		if (typeof libelle === 'string') { this.textContent = libelle ; }
	}) ;

	$('#calendrier').on('input blur', '.nom_mois[data-mois]', function() {
		var libelle = this.textContent.trim() ;
		if (libelle === this.dataset.defaut) {
			delete moisLibelleList[this.dataset.mois] ;
		} else {
			moisLibelleList[this.dataset.mois] = libelle ;
		}
		cookieSet('moislibelles', JSON.stringify(moisLibelleList), 365) ;
	}).on('keydown', '.nom_mois[data-mois]', function(e) {
		// une seule ligne : Entrée valide au lieu d'insérer un saut de ligne
		if (e.key === 'Enter') { e.preventDefault() ; this.blur() ; }
	}) ;
}

function couleurHex(nom)
{
	for (var i = 0; i < COULEURS_JOUR.length; i++) {
		if (COULEURS_JOUR[i][0] === nom) { return COULEURS_JOUR[i][1] ; }
	}
	return null ;
}

// nom inconnu ou null : retire la couleur
function jourAppliquerCouleur(id, nom)
{
	var el = document.getElementById('j-' + id) ;
	if (!el) { return ; }
	var hex = couleurHex(nom) ;
	if (hex) {
		el.style.setProperty('--couleur-jour', hex) ;
		el.classList.add('colore') ;
	} else {
		el.style.removeProperty('--couleur-jour') ;
		el.classList.remove('colore') ;
	}
}

function jourChangerCouleur(id, nom)
{
	jourAppliquerCouleur(id, nom) ;
	if (couleurHex(nom)) { jourCouleurList[id] = nom ; } else { delete jourCouleurList[id] ; }
	cookieSet('jourcouleurs', JSON.stringify(jourCouleurList), 365) ;
}

// Popover de choix de couleur, ouvert au clic droit sur un jour.
// Rattaché à <html> et non à <body> : le zoom posé sur <body> (mise à
// l'échelle écran) fausserait le positionnement en coordonnées viewport.
function paletteInit()
{
	var pal = document.createElement('div') ;
	pal.id = 'palette-jour' ;
	pal.setAttribute('role', 'dialog') ;
	pal.setAttribute('aria-label', 'Couleur du jour') ;
	pal.hidden = true ;
	var choix = [['', null]].concat(COULEURS_JOUR) ;
	for (var i = 0; i < choix.length; i++) {
		var b = document.createElement('button') ;
		b.type = 'button' ;
		b.className = 'pastille' + (choix[i][0] ? '' : ' aucune') ;
		b.dataset.couleur = choix[i][0] ;
		b.title = choix[i][0] || 'Aucune couleur' ;
		if (choix[i][1]) { b.style.backgroundColor = choix[i][1] ; }
		pal.appendChild(b) ;
	}
	document.documentElement.appendChild(pal) ;

	var jourCourant = null ;

	function fermer() {
		if (pal.hidden) { return ; }
		pal.hidden = true ;
		jourCourant = null ;
	}

	function ouvrir(jourEl, x) {
		jourCourant = jourEl.id.slice(2) ;
		var actuel = jourCouleurList[jourCourant] || '' ;
		$(pal).children().each(function() {
			this.setAttribute('aria-pressed', this.dataset.couleur === actuel ? 'true' : 'false') ;
		}) ;
		pal.hidden = false ;
		var r = jourEl.getBoundingClientRect() ;
		var vw = document.documentElement.clientWidth ;
		var vh = document.documentElement.clientHeight ;
		var pw = pal.offsetWidth, ph = pal.offsetHeight, fleche = 8, marge = 6 ;
		var left = Math.max(marge, Math.min(x - pw / 2, vw - pw - marge)) ;
		var dessous = r.bottom + fleche + ph + marge <= vh || r.top - fleche - ph < marge ;
		pal.classList.toggle('dessus', !dessous) ;
		pal.style.left = left + 'px' ;
		pal.style.top = (dessous ? r.bottom + fleche : r.top - fleche - ph) + 'px' ;
		// la flèche pointe sur le curseur même quand le popover est recalé
		pal.style.setProperty('--fleche-x', Math.max(14, Math.min(x - left, pw - 14)) + 'px') ;
		var sel = pal.querySelector('[aria-pressed="true"]') ;
		if (sel) { sel.focus({ preventScroll: true }) ; }
	}

	$('#calendrier').on('contextmenu', '.jour', function(e) {
		e.preventDefault() ;
		ouvrir(this, e.clientX) ;
	}) ;

	$(pal).on('click', '.pastille', function() {
		if (jourCourant) { jourChangerCouleur(jourCourant, this.dataset.couleur || null) ; }
		fermer() ;
	}) ;

	$(document).on('mousedown', function(e) {
		if (!pal.contains(e.target)) { fermer() ; }
	}).on('keydown', function(e) {
		if (e.key === 'Escape') { fermer() ; }
	}) ;
	$(window).on('resize scroll blur beforeprint', fermer) ;
}