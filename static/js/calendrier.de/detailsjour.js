var jourdetailList = {} ;
var currentCalendarTitle = '';

$( document ).ready(function() {
	// Récupérer le titre actuel du calendrier
	currentCalendarTitle = $('#titre').text().trim();

	// Charger les données depuis localStorage
	var savedData = storageGetData();
	jourdetailList = savedData.jours || {};

	// Restaurer les notes quotidiennes
	jourSetCustomization(jourdetailList);

	// Restaurer le titre et l'année si sauvegardés
	if (savedData.titre) {
		$('#titre').text(savedData.titre);
		currentCalendarTitle = savedData.titre;
	}
	if (savedData.annee) {
		$('#annee').text(savedData.annee);
	}

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
	}).on('blur keyup paste', '[contenteditable]', function() {
	    var $this = $(this);
	    if ($this.data('before') !== $this.html()) {
	        $this.data('before', $this.html());
	        $this.trigger('change');
	    }

		// Sauvegarder selon le type de champ
		var jour = $this.attr('jour');
		var id = $this.attr('id');

		if (jour) {
			// C'est une note quotidienne
			jourTextChange(jour, $this.text());
		} else if (id === 'titre') {
			// C'est le titre du calendrier
			titreChange($this.text());
		} else if (id === 'annee') {
			// C'est l'année
			anneeChange($this.text());
		}
	});
});
	
	
function jourTextChange(id,text)
{
	jourdetailList[id] = text ;
	saveAllData() ;
}

function titreChange(text)
{
	currentCalendarTitle = text.trim();
	saveAllData();
}

function anneeChange(text)
{
	saveAllData();
}

function saveAllData()
{
	var data = {
		titre: $('#titre').text().trim(),
		annee: $('#annee').text().trim(),
		jours: jourdetailList
	};
	storageSetData(currentCalendarTitle, data);
}

function storageGetData(){
	// Récupérer le titre depuis le DOM (défini par le serveur)
	var titre = $('#titre').text().trim();

	// Vérifier si localStorage est disponible
	if (typeof(Storage) === "undefined") {
		// Fallback sur les cookies si localStorage n'est pas disponible
		var cookie = $.cookie('jourdetails') ;
		if (cookie != null)
		{
			return JSON.parse(cookie) ;
		}
		return { jours: {} } ;
	}

	// Récupérer toutes les données depuis localStorage
	var allData = localStorage.getItem('calendrier_data');
	if (allData) {
		var calendars = JSON.parse(allData);
		// Retourner les données pour ce calendrier spécifique
		if (calendars[titre]) {
			return calendars[titre];
		}
	}

	return { jours: {} } ;
}

function storageSetData(titre, data){
	// Vérifier si localStorage est disponible
	if (typeof(Storage) === "undefined") {
		// Fallback sur les cookies
		$.cookie('jourdetails', JSON.stringify(data), { expires: 365, path: '/' });
		return;
	}

	// Récupérer toutes les données existantes
	var allData = localStorage.getItem('calendrier_data');
	var calendars = allData ? JSON.parse(allData) : {};

	// Mettre à jour les données pour ce calendrier
	calendars[titre] = data;

	// Sauvegarder dans localStorage
	localStorage.setItem('calendrier_data', JSON.stringify(calendars));
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
	jourdetailList = {};
	saveAllData();
}