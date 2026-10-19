#!/bin/sh
# Zippe la recette, l'importe dans LaraPaper comme « FlightPoster (test) » et rapatrie les rendus dans $1
set -e
DIR=$(cd "$(dirname "$0")" && pwd)
(cd "$DIR/recipe/src" && rm -f ../flightposter.zip && zip -q -r ../flightposter.zip .)
scp -q "$DIR/recipe/flightposter.zip" "$DIR/recipe_test.php" root@192.168.1.110:/tmp/
ssh root@192.168.1.110 'docker cp /tmp/flightposter.zip larapaper-app-1:/tmp/ && docker cp /tmp/recipe_test.php larapaper-app-1:/tmp/ && docker exec -u www-data larapaper-app-1 php artisan tinker /tmp/recipe_test.php 2>&1 | grep -E " ok$|Exception|url=|live payload"; rm -rf /tmp/avr && docker cp larapaper-app-1:/tmp/avr /tmp/avr'
mkdir -p "$1"; scp -q 'root@192.168.1.110:/tmp/avr/*' "$1/"
