var jourdetailList = {} ;

$( document ).ready(function() {
	jourdetailList = storageGetData()
	jourSetCustomization(jourdetailList) ;
	
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
			$('#j-'+jour).addClass('ferie');			
		}
	});
}

function jourDeleteCustomization()
{
	$('span[jour]').text('') ;
	storageSetData({})
}