<?
date_default_timezone_set('Europe/Paris'); 
$nb_mois = 6 ;

//$date_deb = $_SERVER['QUERY_STRING'] ;
//$date_deb = $_SERVER["REQUEST_URI"];
$annee_deb = isset($_GET['y']) ? $_GET['y'] : date('Y')  ;
if (false == is_numeric($annee_deb)) $annee_deb = date('Y') ;

$mois_deb = isset($_GET['m']) ? $_GET['m'] : date('m')  ;
if (false == is_numeric($mois_deb)) $mois_deb = date('m') ;

$annee_fin = date('Y',mktime(0, 0, 0, $mois_deb+$nb_mois-1, 1, $annee_deb) );
$titre_utf8 = isset($_GET['t']) ? $_GET['t'] : '' ;
$titre_safe = htmlentities( utf8_decode($titre_utf8) );
$calendrier_base_url = sprintf('http://calendrier.de/%s',
									($titre_utf8 != '') ? $titre_utf8.'/' : ''
								);
										
$calendrier_url = sprintf('%s%s/%s',
									$calendrier_base_url,
									$annee_deb,
									$mois_deb
);



//phpinfo();

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr" lang="fr">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<meta name="author" content="contact@calendrier.de">
	<meta http-equiv="Content-Language" content="fr">
	<meta name="author" content="Valere JEANTET">
	<meta name="description" content="un calendrier semestriel simple et imprimable.">
	<meta name="keywords" content="calendrier, semestre, imprimable, simple">
	<title>Calendrier <?echo empty($titre_safe) ? $annee_deb.' semestriel' : 'de '.$titre_safe ;?></title>
	<script type="text/javascript">

	  var _gaq = _gaq || [];
	  _gaq.push(['_setAccount', 'UA-79101-11']);
	  _gaq.push(['_setDomainName', 'calendrier.de']);
	  _gaq.push(['_trackPageview']);

	  (function() {
	    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	  })();

	</script>
	<script src="/js/jquery/jquery-1.7.1.min.js"></script>
	<script src="/js/JSON-js/json2.js"></script>
	<script src="/js/jquery-cookie/jquery.cookie.js"></script>
	
	<?php if (($titre_utf8 != null)): ?>
		<script src="/js/calendrier.de/jours.php?t=<?php echo urlencode($titre_utf8)?>"></script>		
	<?php endif;?>
	
	<script src="/js/calendrier.de/joursferies.php?annee=<?php echo $annee_deb?>"></script>
	<script src="/js/calendrier.de/detailsjour.js"></script>

		
	<link rel="stylesheet" type="text/css" media="" href="/css/calendrier.de/default.css">
	<link rel="stylesheet" type="text/css" media="" href="/css/calendrier.de/couleurs.css">
	<link rel="stylesheet" type="text/css" media="print" href="/css/calendrier.de/print.css">
	<?if(strpos($_SERVER["HTTP_USER_AGENT"],'Paparazzi')){?>
		<link rel="stylesheet" type="text/css" media="print" href="/css/calendrier.de/print.css">
	<?}?>
	
	<link rel="stylesheet" type="text/css" media="" href="/css/calendrier.de/weekend.css">

	<link rel="icon" type="image/png" href="/favicon.png"> 
	<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
	<link rel="apple-touch-icon" href="/favicon.png"/>
	
	
</head>

<body>
<span id="forkongithub"><a href="https://github.com/vjeantet/calendrier.de">Fork me on GitHub</a></span>
<span id='entete'>
	<span id='annee' contenteditable="true"><?
	echo ($annee_fin == $annee_deb) ? $annee_deb : $annee_deb.'-'.$annee_fin ;	
	?></span>
	<span class="actions" style="text-align:center;position:absolute;padding-top:10px">
		<a href="<?echo sprintf('%s%s',$calendrier_base_url,date('Y/m',mktime(0,0,0,$mois_deb-6,1,$annee_deb)));?>">[&lt;&lt;]</a>&nbsp;-&nbsp; 
		<a href="<?echo sprintf('%s%s',$calendrier_base_url,date('Y/m',mktime(0,0,0,$mois_deb+6,1,$annee_deb)));?>">[&gt;&gt;]</a>
		
		<a href="Javascript:void();" onclick="jourDeleteCustomization() ;" >reset</a>
	</span>
	<span id="titre" contenteditable="true"><?echo $titre_safe ;?></span>
	<span id='url'>&hearts; <?php echo $calendrier_url ?></span>
	<span id='logo' ><img  src="/logo_r.png" alt="Sodadi"></span>
</span>

<span id='calendrier'>
<?

//$tab_semaines_jours = array('S','M','T','W','T','F','S') ;
$tab_semaines_jours = array('D','L','M','M','J','V','S') ;
//$tab_mois = array('january','february','march','april','may','june','july','august','september','october','november','december') ;
$tab_mois = array('janvier','février','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','décembre') ;




$mois = $mois_deb-1 ;
$annee = $annee_deb ;


//boucle sur les mois

for ($i=0 ;$i<$nb_mois; $i++ )
{ 
	$mois += 1 ;
	$ts_day =  mktime(0, 0, 0, $mois, 1, $annee_deb) ;
	$nombre_jour = date('t',$ts_day) ;
	$annee = date('o',$ts_day) ;
	$nom_mois = ( $mois > 12 ) ? $tab_mois[$mois-13] : $tab_mois[$mois-1];

	$nombre_jour_annee = 365 ;
	if ( date('L',mktime(0, 0, 0, 2, 1, $annee)) ) $nombre_jour_annee = 366  ;
	
	
	echo '<span class="mois">' ;
		echo '<span class="nom_mois">' ;
			echo $nom_mois;
		echo '</span>' ;
		for ( $jour=1;  $jour <= $nombre_jour ; $jour++ )
		{
			$ts_day = mktime(0,0,0,$mois,$jour,$annee_deb) ;
			$num_nom_jour = date('w',$ts_day) ; 
			$nom_jour = $tab_semaines_jours[$num_nom_jour] ; 
			$numero_semaine = date('W',$ts_day) ; 
			$numero_jour_annee = date('z',$ts_day) +1 ; 
			$nombre_jour_annee_restant = $nombre_jour_annee - $numero_jour_annee ;
			
			echo '<span class="jour J_'.$nom_jour.'" id="j-'.date('dmY',$ts_day).'">' ;
				echo '<span class="opt1"></span>' ;
				echo '<span class="numero_jour">' ;
					echo $jour ;
				echo '</span>' ;
	
                                echo '<span class="nom_jour">' ;
                                        echo $nom_jour ;
                                echo '</span>' ;


				echo '<span  class="infos_jour">' ;
					//echo $numero_jour_annee.'-'.$nombre_jour_annee_restant ;
					echo '<span contenteditable="true" jour="'.date('dmY',$ts_day).'">&nbsp;</span>' ;
					if ( $num_nom_jour == 2 )
					{
						echo '<span contenteditable="false" class="numero_semaine">' ;
							echo $numero_semaine ;
						echo '</span>' ;
					}
				echo '</span>' ;

			echo '</span>' ;
		}

		echo '<span class="mois_footer">' ;
		echo '</span>' ;
	echo '</span>' ;
}

?>
</span>

</body>
</html>
