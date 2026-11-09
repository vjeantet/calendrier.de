#!/usr/bin/env bash
# Compare deux séries de captures (captures.sh) image par image.
# Pour chaque PNG : nombre de pixels différents (tolérance 2 % par canal)
# et, s'il y en a, une image <nom>.png dans <avant>-vs-<apres>/ où les
# écarts sont marqués en rouge. Les tailles différentes sont signalées.
#
# Usage : outils/captures/compare.sh <avant> <apres>
# Prérequis : ImageMagick (magick).
set -uo pipefail

AVANT=${1:?usage: compare.sh <avant> <apres>}
APRES=${2:?usage: compare.sh <avant> <apres>}
DIFF="${AVANT%/}-vs-$(basename "$APRES")"
mkdir -p "$DIFF"
ecarts=0

for a in "$AVANT"/*.png; do
	nom=$(basename "$a")
	b="$APRES/$nom"
	if [ ! -f "$b" ]; then echo "ABSENT    $nom"; ecarts=1; continue; fi
	ta=$(magick identify -format '%wx%h' "$a"); tb=$(magick identify -format '%wx%h' "$b")
	if [ "$ta" != "$tb" ]; then echo "TAILLE    $nom  $ta -> $tb"; ecarts=1; continue; fi
	n=$(magick compare -metric AE -fuzz 2% "$a" "$b" "$DIFF/$nom" 2>&1 >/dev/null | cut -d' ' -f1)
	if [ "$n" = "0" ]; then
		rm -f "$DIFF/$nom"; echo "IDENTIQUE $nom"
	else
		echo "ÉCART     $nom  $n px"; ecarts=1
	fi
done
for b in "$APRES"/*.png; do
	[ -f "$AVANT/$(basename "$b")" ] || { echo "NOUVEAU   $(basename "$b")"; ecarts=1; }
done
[ $ecarts = 0 ] && rmdir "$DIFF" 2>/dev/null
exit $ecarts
