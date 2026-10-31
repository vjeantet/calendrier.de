var jourdetailList = {} ;

$( document ).ready(function() {
	jourdetailList = storageGetData()
	jourSetCustomization(jourdetailList) ;

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
	jourdetailList[id] = text ;
	storageSetData(jourdetailList) ;
}
	
function storageGetData(){
	var cookie = cookieGet('jourdetails') ;
	if (cookie != null)
	{
		try { return JSON.parse(cookie) ; } catch (e) {}
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
}