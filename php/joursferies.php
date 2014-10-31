<?php
header("Content-type: application/x-javascript");
date_default_timezone_set('Europe/Paris'); 
function getHolidays($year = null)
{
  if ($year === null || $year < 1970 || $year > 2037)
  {
    $year = intval(date('Y'));
  }
 
  $easterDate  = easter_date($year);
  $easterDay   = date('j', $easterDate);
  $easterMonth = date('n', $easterDate);
  $easterYear   = date('Y', $easterDate);
 
  $holidays = array(
    // Dates fixes
    date('dmY',mktime(0, 0, 0, 1,  1,  $year)) => 'jour de l\'an', 
    date('dmY',mktime(0, 0, 0, 5,  1,  $year)) => 'Fête du travail',
    date('dmY',mktime(0, 0, 0, 5,  8,  $year)) => 'Victoire des alliés',
    date('dmY',mktime(0, 0, 0, 7,  14, $year)) => 'Fête nationale',
    date('dmY',mktime(0, 0, 0, 8,  15, $year)) => 'Assomption',
    date('dmY',mktime(0, 0, 0, 11, 1,  $year)) => 'Toussaint',
    date('dmY',mktime(0, 0, 0, 11, 11, $year)) => 'Armistice',
    date('dmY',mktime(0, 0, 0, 12, 25, $year)) => 'Noel',

    date('dmY',mktime(0, 0, 0, $easterMonth, $easterDay + 1,  $easterYear)) => 'Lundi de Pâques',
    date('dmY',mktime(0, 0, 0, $easterMonth, $easterDay + 39, $easterYear)) => 'Ascension',
    date('dmY',mktime(0, 0, 0, $easterMonth, $easterDay + 50, $easterYear)) => 'Pentecôte',
  );
 
//  sort($holidays);
 
  return $holidays;
}

$annee = $_GET['annee'] ;

$jours = getHolidays($annee) ;
$jours = $jours + getHolidays($annee+1) ;



echo "var joursferies = ".json_encode($jours) .';';

?>
$( document ).ready(function() {
	jourSetCustomization(joursferies,true) ;
});