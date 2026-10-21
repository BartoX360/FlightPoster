#!/bin/sh
# Zippe la recette, l'importe dans LaraPaper comme « FlightPoster (test) » et rapatrie les rendus dans $1
set -e
DIR=$(cd "$(dirname "$0")" && pwd); ROOT=$(cd "$DIR/.." && pwd)
[ -f "$DIR/.env" ] && . "$DIR/.env"
: "${LARAPAPER_SSH:?définir LARAPAPER_SSH (ex. root@mon-serveur), ou le mettre dans dev/.env}"
(cd "$ROOT/recipe/src" && rm -f ../flightposter.zip && zip -q -r ../flightposter.zip .)
scp -q "$ROOT/recipe/flightposter.zip" "$DIR/recipe_test.php" "$LARAPAPER_SSH":/tmp/
ssh "$LARAPAPER_SSH" 'docker cp /tmp/flightposter.zip larapaper-app-1:/tmp/ && docker cp /tmp/recipe_test.php larapaper-app-1:/tmp/ && docker exec -u www-data larapaper-app-1 php artisan tinker /tmp/recipe_test.php 2>&1 | grep -E " ok$|Exception|url=|live payload"; rm -rf /tmp/avr && docker cp larapaper-app-1:/tmp/avr /tmp/avr'
mkdir -p "$1"; scp -q "$LARAPAPER_SSH":'/tmp/avr/*' "$1/"
