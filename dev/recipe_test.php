<?php
use App\Models\{Plugin, Device, DeviceModel, User};
use App\Services\{PluginImportService, ImageGenerationService};
use Illuminate\Http\UploadedFile;
use Carbon\Carbon;

Plugin::where('name', 'FlightPoster (test)')->get()->each->delete();
$file = new UploadedFile('/tmp/flightposter.zip', 'flightposter.zip', 'application/zip', null, true);
$p = Plugin::find(app(PluginImportService::class)->importFromZip($file, User::find(1))->id);
// Lyon : ville de démonstration pour les captures
$base = ['lat' => '45.7640', 'lon' => '4.8357', 'city' => 'Lyon', 'radius_km' => 25, 'prefer_airliners' => 'yes'];
$p->update(['name' => 'FlightPoster (test)', 'configuration' => $base + ['style' => 'eink', 'language' => 'en', 'units' => 'metric']]);
echo "url=", $p->resolveLiquidVariables($p->polling_url), "\n";

$near = ['hex' => '3965a3', 'flight' => 'AFR22   ', 'r' => 'F-HTYB', 't' => 'A359', 'desc' => 'AIRBUS A-350-900', 'category' => 'A5',
  'alt_baro' => 7800, 'alt_geom' => 7835, 'gs' => 283, 'track' => 250, 'baro_rate' => 1600, 'lat' => 45.79, 'lon' => 4.87];
$far = array_merge($near, ['flight' => 'TVF8704 ', 'lat' => 46.35, 'lon' => 4.9, 'hex' => '39d30f', 'r' => 'F-HUYP', 't' => 'B738', 'desc' => 'BOEING 737-800']);
$amx = array_merge($near, ['flight' => 'AMX006  ', 'hex' => '0d0e9c', 'r' => 'XA-ADL', 't' => 'B789', 'desc' => 'BOEING 787-9', 'track' => 80, 'alt_geom' => 36000, 'baro_rate' => 0, 'gs' => 480]);
$nje = array_merge($near, ['flight' => 'NJE278V ', 'hex' => '4951cd', 'r' => 'CS-PHJ', 't' => 'E55P', 'desc' => 'EMBRAER Phenom 300', 'category' => 'A2', 'baro_rate' => -1200]);
$P = fn($ac, $code) => ['IDX_0' => ['aircraft' => $ac], 'IDX_1' => ['current' => ['weather_code' => $code, 'temperature_2m' => 14.2]]];
$cases = [
  // nom, taille, modèle, style, langue, unités, données, heure, minute (UTC)
  ['fr_color_day', 'full', 55, 'color', 'fr', 'metric', $P([$near, $far], 2), 10, 30],
  ['en_eink_day', 'full', 1, 'eink', 'en', 'imperial', $P([$near, $far], 0), 10, 30],
  ['fr_eink_dusk_rain', 'full', 1, 'eink', 'fr', 'metric', $P([$near], 63), 16, 50],
  ['en_x_night_snow', 'full', 14, 'eink', 'en', 'metric', $P([$near], 73), 21, 0],
  ['en_color_storm', 'full', 55, 'color', 'en', 'metric', $P([$near], 95), 10, 30],
  ['fr_eink_empty_fog', 'full', 1, 'eink', 'fr', 'metric', $P([$far], 45), 8, 0],
  ['en_color_empty_night', 'full', 55, 'color', 'en', 'imperial', $P([$far], 0), 21, 0],
  ['en_hh', 'half_horizontal', 1, 'eink', 'en', 'metric', $P([$near], 61), 10, 30],
  ['fr_hv', 'half_vertical', 1, 'eink', 'fr', 'metric', $P([$near], 2), 10, 30],
  ['en_q', 'quadrant', 1, 'eink', 'en', 'imperial', $P([$near], 0), 21, 0],
  ['test_vrs_amx', 'full', 55, 'color', 'fr', 'metric', $P([$amx], 1), 10, 30],
  ['test_noroute_nje', 'full', 1, 'eink', 'en', 'metric', $P([$nje], 1), 10, 30],
];
@mkdir('/tmp/avr'); array_map('unlink', glob('/tmp/avr/*.png'));
foreach ($cases as [$name, $size, $mid, $style, $lang, $units, $payload, $h, $m]) {
  Carbon::setTestNow(Carbon::create(2026, 10, 18, $h, $m, 0, 'UTC'));
  $p->configuration = $base + ['style' => $style, 'language' => $lang, 'units' => $units];
  $p->data_payload = $payload; $p->saveQuietly();
  $model = DeviceModel::find($mid);
  $dev = new Device(['name' => 'test']); $dev->setRelation('deviceModel', $model);
  $html = $p->fresh()->render($size, true, $dev);
  $pal = $mid == 55 ? App\Models\DevicePalette::find(12) : null;
  $id = ImageGenerationService::generateImageFromModel(markup: $html, deviceModel: $model, palette: $pal);
  copy(storage_path("app/public/images/generated/$id.png"), "/tmp/avr/$name.png");
  echo "$name ok\n";
}
Carbon::setTestNow();
$p->updateDataPayload();
echo 'live payload: ', substr(json_encode($p->fresh()->data_payload['IDX_1']['current'] ?? null), 0, 200), "\n";
