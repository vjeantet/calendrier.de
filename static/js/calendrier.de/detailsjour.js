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
}