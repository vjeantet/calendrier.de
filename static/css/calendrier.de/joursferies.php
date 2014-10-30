<?
header("Content-type: text/css");
date_default_timezone_set('Europe/Paris'); 
function getHolidays($year = null)
{
  if ($year === null)
  {
    $year = intval(date('Y'));
  }
 
  $easterDate  = easter_date($year);
  $easterDay   = date('j', $easterDate);
  $easterMonth = date('n', $easterDate);
  $easterYear   = date('Y', $easterDate);
 
  $holidays = array(
    // Dates fixes
    mktime(0, 0, 0, 1,  1,  $year) => 'jour de l\'an', 
    mktime(0, 0, 0, 5,  1,  $year) => 'Fête du travail',
    mktime(0, 0, 0, 5,  8,  $year) => 'Victoire des alliés',
    mktime(0, 0, 0, 7,  14, $year) => 'Fête nationale',
    mktime(0, 0, 0, 8,  15, $year) => 'Assomption',
    mktime(0, 0, 0, 11, 1,  $year) => 'Toussaint',
    mktime(0, 0, 0, 11, 11, $year) => 'Armistice',
    mktime(0, 0, 0, 12, 25, $year) => 'Noel',
 
    // Dates variables
    mktime(0, 0, 0, $easterMonth, $easterDay + 1,  $easterYear) => 'Lundi de Paques',
    mktime(0, 0, 0, $easterMonth, $easterDay + 39, $easterYear) => 'Ascension',
    mktime(0, 0, 0, $easterMonth, $easterDay + 50, $easterYear) => 'Pentecôte',
  );
 
//  sort($holidays);
 
  return $holidays;
}

$annee = $_GET['annee'] ;

$jours = getHolidays($annee) ;
$jours = $jours + getHolidays($annee+1) ;



foreach($jours as $jour => $libelle)
{
	echo '#j-'.date('dmY',$jour).'{background-color:#EAEAEA;color:#2960ae;}'."\n" ; 
	echo '#j-'.date('dmY',$jour).' .numero_jour{color:#2960ae;}'."\n" ; 
	echo '#j-'.date('dmY',$jour).' .infos_jour:before{content: "'.$libelle.'";}{color:white;background-color:#89BCEE;}'."\n" ; 
}

?>

.J_S .numero_jour{color:#2960ae;}
/*	
#j-2512<?php echo $annee_deb?>, #j-2512<?php echo $annee_deb?> .nom_jour,#j-2512<?php echo $annee_deb?> .numero_jour{color:white;background-color:#89BCEE;}
#j-2512<?php echo $annee_deb?> .infos_jour span{content: "Noel";}
*/
