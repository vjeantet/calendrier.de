#!/usr/bin/env bash
# Captures de référence du calendrier : écran (PNG) et impression (PDF puis
# PNG par page), sur un jeu de scénarios fixes (voir fixture.js).
#
# Usage : outils/captures/captures.sh <dossier de sortie>
#         puis outils/captures/compare.sh <avant> <apres>
#
# Prérequis (macOS) : Google Chrome, python3, pdftoppm (poppler).
# Réseau : Chrome charge jQuery depuis code.jquery.com.
set -euo pipefail

ICI=$(cd "$(dirname "$0")" && pwd)
SORTIE=${1:?usage: captures.sh <dossier de sortie>}
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
PORT=${PORT:-8765}
BASE="http://127.0.0.1:$PORT"

mkdir -p "$SORTIE"
SORTIE=$(cd "$SORTIE" && pwd)
PROFILS=$(mktemp -d)

python3 "$ICI/serveur.py" "$PORT" &
SERVEUR=$!
trap 'kill $SERVEUR 2>/dev/null; rm -rf "$PROFILS"' EXIT
for _ in $(seq 50); do curl -sf -o /dev/null "$BASE/" && break; sleep 0.1; done

# profil neuf à chaque appel : aucun localStorage ne fuit d'une capture à l'autre
chrome() {
	"$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
		--force-device-scale-factor=1 --virtual-time-budget=5000 \
		--user-data-dir="$(mktemp -d "$PROFILS/p.XXXX")" "$@" 2>/dev/null
}

ecran() { # nom largeur hauteur chemin
	chrome --window-size="$2,$3" --screenshot="$SORTIE/$1.png" "$BASE$4"
	echo "  $1.png"
}

impression() { # nom chemin
	chrome --no-pdf-header-footer --print-to-pdf="$SORTIE/$1.pdf" "$BASE$2"
	rm -f "$SORTIE/$1"-page-*.png
	pdftoppm -r 110 -png "$SORTIE/$1.pdf" "$SORTIE/$1-page"
	echo "  $1.pdf ($(ls "$SORTIE/$1"-page-*.png | wc -l | tr -d ' ') page(s))"
}

echo "Captures dans $SORTIE"
ecran ecran-vide-1440x900        1440  900 "/"
ecran ecran-annote-1440x900      1440  900 "/?annote"
ecran ecran-annote-1920x1080     1920 1080 "/?annote"
ecran ecran-annote-1000x700      1000  700 "/?annote"
ecran ecran-titre-1440x900       1440  900 "/Claire/2026/10?annote"
ecran ecran-liste-1200x1500      1200 1500 "/?annote"
impression impression-vide       "/"
impression impression-annote     "/?annote"
impression impression-titre      "/Claire/2026/10?annote"
