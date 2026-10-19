<?php
// Rendu d'une piste de design : importe __ZIP__ sous le nom « __NAME__ » et écrit les PNG dans __OUT__
use App\Models\{Plugin, Device, DeviceModel, User};
use App\Services\{PluginImportService, ImageGenerationService};
use Illuminate\Http\UploadedFile;
use Carbon\Carbon;

Plugin::where('name', '__NAME__')->get()->each->delete();
$file = new UploadedFile('__ZIP__', 'proposal.zip', 'application/zip', null, true);
$p = Plugin::find(app(PluginImportService::class)->importFromZip($file, User::find(1))->id);
$base = ['lat' => '45.7640', 'lon' => '4.8357', 'city' => 'Lyon', 'radius_km' => 25, 'prefer_airliners' => 'yes'];
$p->update(['name' => '__NAME__']);

$near = ['hex' => '3965a3', 'flight' => 'AFR22   ', 'r' => 'F-HTYB', 't' => 'A359', 'desc' => 'AIRBUS A-350-900', 'category' => 'A5',
  'alt_baro' => 7800, 'alt_geom' => 7835, 'gs' => 283, 'track' => 250, 'baro_rate' => 1600, 'lat' => 45.79, 'lon' => 4.87];
$far = array_merge($near, ['flight' => 'TVF8704 ', 'lat' => 46.35, 'lon' => 4.9, 'hex' => '39d30f', 'r' => 'F-HUYP', 't' => 'B738', 'desc' => 'BOEING 737-800']);
$P = fn($ac, $code) => ['IDX_0' => ['aircraft' => $ac], 'IDX_1' => ['current' => ['weather_code' => $code, 'temperature_2m' => 14.2]]];
$cases = [
  ['1-couleur-jour', 'full', 55, 'color', 'fr', $P([$near, $far], 2), 10, 30],
  ['2-eink-jour-en', 'full', 1, 'eink', 'en', $P([$near, $far], 0), 10, 30],
  ['3-couleur-crepuscule-pluie', 'full', 55, 'color', 'fr', $P([$near], 63), 16, 50],
  ['4-eink-nuit', 'full', 1, 'eink', 'fr', $P([$near], 0), 21, 0],
  ['5-eink-vide-brouillard', 'full', 1, 'eink', 'fr', $P([$far], 45), 8, 0],
];
@mkdir('__OUT__'); array_map('unlink', glob('__OUT__/*.png'));
foreach ($cases as [$name, $size, $mid, $style, $lang, $payload, $h, $m]) {
  Carbon::setTestNow(Carbon::create(2026, 10, 18, $h, $m, 0, 'UTC'));
  $p->configuration = $base + ['style' => $style, 'language' => $lang, 'units' => 'metric'];
  $p->data_payload = $payload; $p->saveQuietly();
  $model = DeviceModel::find($mid);
  $dev = new Device(['name' => 'test']); $dev->setRelation('deviceModel', $model);
  $html = $p->fresh()->render($size, true, $dev);
  $pal = $mid == 55 ? App\Models\DevicePalette::find(12) : null;
  $id = ImageGenerationService::generateImageFromModel(markup: $html, deviceModel: $model, palette: $pal);
  copy(storage_path("app/public/images/generated/$id.png"), "__OUT__/$name.png");
  echo "$name ok\n";
}
Carbon::setTestNow();
$p->delete();
