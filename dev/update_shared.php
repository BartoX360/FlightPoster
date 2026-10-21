<?php
$p = App\Models\Plugin::find(10);
$p->update(['render_markup_shared' => file_get_contents('/tmp/shared.liquid')]);
echo "shared updated\n";
