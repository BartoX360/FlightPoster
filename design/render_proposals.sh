#!/bin/sh
# Assemble chaque piste (*.layout), la fait rendre par LaraPaper et rapatrie les PNG dans $1/<piste>/
set -e
DIR=$(cd "$(dirname "$0")" && pwd); OUT=$1; shift
for v in "$@"; do
  B="$OUT/build/$v"; rm -rf "$B"
  python3 -I "$DIR/build.py" "$DIR/$v.layout" "$B" >/dev/null
  (cd "$B/src" && zip -q -r "../$v.zip" .)
  sed -e "s#__ZIP__#/tmp/fpp_$v.zip#g" -e "s#__NAME__#FlightPoster (piste $v)#g" -e "s#__OUT__#/tmp/fpp_$v#g" \
      "$DIR/proposal_test.php" > "$B/test.php"
  scp -q "$B/$v.zip" root@192.168.1.110:/tmp/fpp_$v.zip
  scp -q "$B/test.php" root@192.168.1.110:/tmp/fpp_$v.php
  ssh root@192.168.1.110 "docker cp /tmp/fpp_$v.zip larapaper-app-1:/tmp/ && docker cp /tmp/fpp_$v.php larapaper-app-1:/tmp/ && docker exec -u www-data larapaper-app-1 php artisan tinker /tmp/fpp_$v.php 2>&1 | grep -E ' ok\$|Exception' | tr '\n' ' '; rm -rf /tmp/fpp_$v && docker cp larapaper-app-1:/tmp/fpp_$v /tmp/fpp_$v"
  echo " <- $v"
  mkdir -p "$OUT/$v"; scp -q "root@192.168.1.110:/tmp/fpp_$v/*" "$OUT/$v/"
done
