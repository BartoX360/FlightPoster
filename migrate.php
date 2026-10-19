<?php
use App\Models\Plugin;
$src = Plugin::where('name', 'FlightPoster (test)')->firstOrFail();
$dst = Plugin::findOrFail(10);
$dst->fill($src->only(['render_markup', 'render_markup_shared', 'render_markup_half_horizontal', 'render_markup_half_vertical',
  'render_markup_quadrant', 'polling_url', 'polling_verb', 'polling_header', 'data_stale_minutes', 'configuration_template', 'no_bleed', 'markup_language']));
$dst->name = 'FlightPoster';
// Garde les réglages existants (position, rayon…) et n'impose que l'affichage de l'Echo Show
$dst->configuration = array_merge($dst->configuration ?? [], ['style' => 'color', 'language' => 'fr', 'units' => 'metric']);
$dst->save();
$src->delete();
$dst->updateDataPayload();
$d = App\Models\Device::find(2);
$id = App\Services\ImageGenerationService::generateImage($dst->render('full', true, $d), 2, $dst);
copy(storage_path("app/public/images/generated/$id.png"), '/tmp/av_live.png');
echo 'migrated: ', json_encode($dst->fresh()->data_payload['IDX_1']['current'] ?? null), " img $id\n";
