<?php
$colors = json_decode(file_get_contents('/tmp/palette.json'), true);
$pal = App\Models\DevicePalette::find(12);
$pal->update(['name' => 'flightposter-256', 'colors' => $colors, 'description' => 'Couleur 256 (FlightPoster + usage général)']);
echo $pal->id, ' ', count($colors), PHP_EOL;
