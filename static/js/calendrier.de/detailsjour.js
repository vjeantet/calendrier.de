var jourdetailList = {} ;
var jourcolorList = {} ;
var selectedColor = '#FFFF00'; // Couleur par défaut (jaune)

$( document ).ready(function() {
	jourdetailList = storageGetData()
	jourcolorList = storageGetColorData()
	jourSetCustomization(jourdetailList) ;
	jourSetColors(jourcolorList) ;

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

	// Gestion du clic droit pour afficher le color picker
	$('.jour').on('contextmenu', function(e) {
		e.preventDefault();
		showColorPicker(e.pageX, e.pageY);
		return false;
	});

	// Gestion du double-clic pour appliquer/retirer la couleur
	$('.jour').on('dblclick', function(e) {
		var jourId = $(this).attr('id');
		if (jourId) {
			jourId = jourId.replace('j-', '');
			toggleJourColor(jourId, $(this));
		}
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
	jourdetailList[id] = text ;
	storageSetData(jourdetailList) ;
}
	
function storageGetData(){
	var cookie = $.cookie('jourdetails') ;
	if (cookie != null)
	{
		return JSON.parse($.cookie('jourdetails')) ;	
	}
	return {} ;
}

function storageSetData(data){$.cookie('jourdetails', JSON.stringify(data), { expires: 365, path: '/' });}

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
	// Reset des couleurs
	$('.jour').css('background-color', '');
	jourcolorList = {};
	storageSetColorData({})
}

// Fonctions pour la gestion des couleurs
function storageGetColorData(){
	var cookie = $.cookie('jourcolors') ;
	if (cookie != null)
	{
		return JSON.parse($.cookie('jourcolors')) ;
	}
	return {} ;
}

function storageSetColorData(data){
	$.cookie('jourcolors', JSON.stringify(data), { expires: 365, path: '/' });
}

function jourSetColors(jours_list)
{
	$.each(jours_list, function(jour, color) {
		$('#j-'+jour).css('background-color', color);
	});
}

function toggleJourColor(jourId, jourElement)
{
	if (jourcolorList[jourId]) {
		// La case a déjà une couleur, on la retire
		delete jourcolorList[jourId];
		jourElement.css('background-color', '');
	} else {
		// On applique la couleur sélectionnée
		jourcolorList[jourId] = selectedColor;
		jourElement.css('background-color', selectedColor);
	}
	storageSetColorData(jourcolorList);
}

function showColorPicker(x, y)
{
	// Supprime le color picker existant s'il y en a un
	$('#colorPickerPopup').remove();

	// Couleurs prédéfinies
	var colors = [
		'#FFFF00', '#FFD700', '#FFA500', '#FF6347', '#FF69B4',
		'#FF0000', '#DC143C', '#8B0000', '#FF1493', '#C71585',
		'#9370DB', '#8A2BE2', '#4B0082', '#0000FF', '#4169E1',
		'#00BFFF', '#00CED1', '#20B2AA', '#00FF00', '#32CD32',
		'#90EE90', '#98FB98', '#ADFF2F', '#7FFF00', '#7CFC00',
		'#FFE4B5', '#FFDAB9', '#EEE8AA', '#F0E68C', '#BDB76B',
		'#D3D3D3', '#C0C0C0', '#A9A9A9', '#808080', '#FFFFFF'
	];

	// Crée le popup du color picker
	var popup = $('<div id="colorPickerPopup"></div>');
	popup.css({
		'position': 'absolute',
		'left': x + 'px',
		'top': y + 'px',
		'background-color': 'white',
		'border': '2px solid #333',
		'padding': '10px',
		'border-radius': '5px',
		'box-shadow': '0 2px 10px rgba(0,0,0,0.3)',
		'z-index': 10000
	});

	// Titre
	var title = $('<div style="font-weight: bold; margin-bottom: 10px; text-align: center;">Choisir une couleur</div>');
	popup.append(title);

	// Grille de couleurs
	var grid = $('<div style="display: grid; grid-template-columns: repeat(7, 30px); gap: 5px;"></div>');

	colors.forEach(function(color) {
		var colorBox = $('<div></div>');
		colorBox.css({
			'width': '30px',
			'height': '30px',
			'background-color': color,
			'border': selectedColor === color ? '3px solid black' : '1px solid #999',
			'cursor': 'pointer',
			'border-radius': '3px'
		});

		colorBox.on('click', function() {
			selectedColor = color;
			$('#colorPickerPopup').remove();
		});

		grid.append(colorBox);
	});

	popup.append(grid);

	// Ajoute un color picker HTML5 pour les couleurs personnalisées
	var customColorContainer = $('<div style="margin-top: 10px; text-align: center;"></div>');
	var customColorLabel = $('<div style="font-size: 12px; margin-bottom: 5px;">Couleur personnalisée:</div>');
	var customColorInput = $('<input type="color" value="' + selectedColor + '" style="width: 100%; height: 30px; cursor: pointer;">');

	customColorInput.on('change', function() {
		selectedColor = $(this).val();
		$('#colorPickerPopup').remove();
	});

	customColorContainer.append(customColorLabel);
	customColorContainer.append(customColorInput);
	popup.append(customColorContainer);

	$('body').append(popup);

	// Ferme le popup en cliquant ailleurs
	$(document).one('click', function(e) {
		if (!$(e.target).closest('#colorPickerPopup').length) {
			$('#colorPickerPopup').remove();
		}
	});

	// Empêche la propagation du clic sur le popup
	popup.on('click', function(e) {
		e.stopPropagation();
	});
}