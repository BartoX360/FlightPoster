#!/usr/bin/env python3
"""Assemble une mise en page (*.layout) avec les parties communes en une recette TRMNL complète.

Usage : build.py <fichier.layout> <dossier_sortie>
"""
import pathlib, shutil, sys

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE.parent.parent / 'recipe' / 'src'
parts = {p.stem + p.suffix: p.read_text() for p in (HERE / 'parts').iterdir()}

layout = pathlib.Path(sys.argv[1]).read_text()
sections, cur = {}, None
for line in layout.splitlines(keepends=True):
    if line.startswith('@@'):
        cur = line[2:].strip(); sections[cur] = ''
    elif cur:
        sections[cur] += line

markup = sections['MARKUP'].replace('<!--SKY-->', parts['sky.svg'].rstrip('\n')) \
                           .replace('<!--PLANE_SIDE-->', parts['plane-side.svg'].rstrip('\n'))
shared = f'''<link rel="preconnect" href="https://fonts.googleapis.com">
{sections['FONTS'].strip()}
<style>
  .view:has(> .fp) {{ position: relative; padding: 0; overflow: hidden; }}
{parts['sky.css'].rstrip()}

  /* --- Mise en page --- */
{sections['CSS'].rstrip()}
</style>

{{% template flightposter %}}
<div class="fp fp--{{{{ size }}}}{{% if cf.style == 'color' %}} fp--color{{% else %}} fp--eink{{% endif %}}"
     data-lat="{{{{ cf.lat }}}}" data-lon="{{{{ cf.lon }}}}" data-radius="{{{{ cf.radius_km | default: 25 }}}}"
     data-prefer="{{{{ cf.prefer_airliners | default: 'yes' }}}}" data-lang="{{{{ cf.language | default: 'en' }}}}"
     data-units="{{{{ cf.units | default: 'metric' }}}}" data-ts="{{{{ ts }}}}" data-off="{{{{ off | default: 0 }}}}">
  <script type="application/json" class="fp-data">{{{{ aircraft | json }}}}</script>
  <script type="application/json" class="fp-wx-data">{{{{ weather | json }}}}</script>
{markup.rstrip()}
</div>
{{% endtemplate %}}

<script>
(function () {{
{parts['tables.js'].rstrip()}

{parts['engine.js'].rstrip()}
}})();
</script>
'''
out = pathlib.Path(sys.argv[2]); (out / 'src').mkdir(parents=True, exist_ok=True)
(out / 'src' / 'shared.liquid').write_text(shared)
for f in ['settings.yml', 'full.liquid', 'half_horizontal.liquid', 'half_vertical.liquid', 'quadrant.liquid']:
    shutil.copy(SRC / f, out / 'src' / f)
print(out / 'src' / 'shared.liquid', len(shared), 'octets')
