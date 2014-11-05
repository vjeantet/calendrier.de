package calendrier_de

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/vjeantet/eastertime"
)

func init() {
	http.HandleFunc("/", handler)
	http.HandleFunc("/dayoff", handlerDayOff)
}

var fns = template.FuncMap{
	"yearweek": func(t time.Time) string {
		_, x := t.ISOWeek()
		return fmt.Sprintf("%02d", x)
	},
}
var listTmpl = template.Must(template.New("index.html").Funcs(fns).ParseFiles("templates/index.html"))

func handler(w http.ResponseWriter, r *http.Request) {
	tc := make(map[string]interface{})

	year := int(time.Now().Year())
	month := int(time.Now().Month())
	title := ""

	result := strings.Split(r.URL.Path, "/")
	if len(result) == 4 {
		title = result[1]
		year, _ = strconv.Atoi(result[2])
		month, _ = strconv.Atoi(result[3])
	}

	if len(result) == 3 {
		i, err := strconv.Atoi(result[1])
		if err == nil {
			year = i
			month, _ = strconv.Atoi(result[2])
		} else {
			title = result[1]
			year, _ = strconv.Atoi(result[2])
			month = 1
		}
	}

	if len(result) == 2 {
		i, err := strconv.Atoi(result[1])
		if err != nil {
			if result[1] != "" {
				title = result[1]
			}
		} else {
			year = i
			month = 1
		}
	}

	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.Local)

	tc["title"] = title
	if title != "" {
		tc["titleEncoded"] = fmt.Sprint(title, "/")
	} else {
		tc["titleEncoded"] = ""
	}
	tc["startDateTime"] = startDate
	tc["requestPATH"] = r.URL.Path
	tc["previousPageTime"] = time.Date(year, time.Month(month-6), 1, 0, 0, 0, 0, time.Local)
	tc["nextPageTime"] = time.Date(year, time.Month(month+6), 1, 0, 0, 0, 0, time.Local)
	tc["pageEndYear"] = time.Date(year, time.Month(month+5), 1, 0, 0, 0, 0, time.Local).Year()

	log.Println("startDate = ", startDate)

	monthsMap := make(map[time.Month][]time.Time)
	monthMapKeys := []time.Month{}
	for i := 0; i < 6; i++ {
		currentMonthInt := month + i
		if currentMonthInt > 12 {
			if currentMonthInt == 13 {
				year++
			}
			currentMonthInt = currentMonthInt - 12
		}
		currentMonth := time.Month(currentMonthInt)

		days := []time.Time{}

		for j := 1; j < 32; j++ {
			jour := time.Date(year, currentMonth, j, 0, 0, 0, 0, time.Local)
			if jour.Month() != currentMonth {
				break
			}
			days = append(days, jour)
		}
		monthsMap[currentMonth] = days
		monthMapKeys = append(monthMapKeys, currentMonth)
	}

	tc["monthsMapOrder"] = monthMapKeys
	tc["monthsMap"] = monthsMap
	tc["dayLabels"] = map[time.Weekday]string{
		time.Monday:    "L",
		time.Wednesday: "M",
		time.Tuesday:   "M",
		time.Thursday:  "J",
		time.Friday:    "V",
		time.Saturday:  "S",
		time.Sunday:    "D",
	}
	tc["monthLabels"] = map[time.Month]string{
		time.January:   "Janvier",
		time.February:  "Février",
		time.March:     "Mars",
		time.April:     "Avril",
		time.May:       "Mai",
		time.June:      "Juin",
		time.July:      "Juillet",
		time.August:    "Aout",
		time.September: "Septembre",
		time.October:   "Octobre",
		time.November:  "Novembre",
		time.December:  "Decembre",
	}

	// http://tip.golang.org/pkg/text/template/#actions
	listTmpl.Execute(w, tc)

}

func handlerDayOff(w http.ResponseWriter, r *http.Request) {
	year, _ := strconv.Atoi(r.URL.Query()["annee"][0])

	easterTime, _ := eastertime.CatholicByYear(year)
	easterTimeNextYear, _ := eastertime.CatholicByYear(year + 1)
	dates := map[time.Time]string{
		time.Date(year, 1, 1, 0, 0, 0, 0, time.Local):                                    "jour de l'an",
		time.Date(year, 5, 1, 0, 0, 0, 0, time.Local):                                    "F\u00eate du travail",
		time.Date(year, 5, 8, 0, 0, 0, 0, time.Local):                                    "Victoire des alliés",
		time.Date(year, 7, 14, 0, 0, 0, 0, time.Local):                                   "Fête nationale",
		time.Date(year, 8, 15, 0, 0, 0, 0, time.Local):                                   "Assomption",
		time.Date(year, 11, 1, 0, 0, 0, 0, time.Local):                                   "Toussaint",
		time.Date(year, 11, 11, 0, 0, 0, 0, time.Local):                                  "Armistice",
		time.Date(year, 12, 25, 0, 0, 0, 0, time.Local):                                  "Noel",
		time.Date(year, easterTime.Month(), easterTime.Day()+1, 0, 0, 0, 0, time.Local):  "Lundi de Pâques",
		time.Date(year, easterTime.Month(), easterTime.Day()+39, 0, 0, 0, 0, time.Local): "Ascension",
		time.Date(year, easterTime.Month(), easterTime.Day()+50, 0, 0, 0, 0, time.Local): "Pentecôte",

		time.Date(year+1, 1, 1, 0, 0, 0, 0, time.Local):                                                    "jour de l'an",
		time.Date(year+1, 5, 1, 0, 0, 0, 0, time.Local):                                                    "F\u00eate du travail",
		time.Date(year+1, 5, 8, 0, 0, 0, 0, time.Local):                                                    "Victoire des alliés",
		time.Date(year+1, 7, 14, 0, 0, 0, 0, time.Local):                                                   "Fête nationale",
		time.Date(year+1, 8, 15, 0, 0, 0, 0, time.Local):                                                   "Assomption",
		time.Date(year+1, 11, 1, 0, 0, 0, 0, time.Local):                                                   "Toussaint",
		time.Date(year+1, 11, 11, 0, 0, 0, 0, time.Local):                                                  "Armistice",
		time.Date(year+1, 12, 25, 0, 0, 0, 0, time.Local):                                                  "Noel",
		time.Date(year+1, easterTimeNextYear.Month(), easterTimeNextYear.Day()+1, 0, 0, 0, 0, time.Local):  "Lundi de Pâques",
		time.Date(year+1, easterTimeNextYear.Month(), easterTimeNextYear.Day()+39, 0, 0, 0, 0, time.Local): "Ascension",
		time.Date(year+1, easterTimeNextYear.Month(), easterTimeNextYear.Day()+50, 0, 0, 0, 0, time.Local): "Pentecôte",
	}

	fmt.Fprint(w, "var joursferies = {")
	for date, label := range dates {
		fmt.Fprintf(w, "\"%s\":\"%s\",", date.Format("02012006"), label)
	}
	fmt.Fprint(w, "};$( document ).ready(function() { jourSetCustomization(joursferies,true) ;});")
}
