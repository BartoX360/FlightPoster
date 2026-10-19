# FlightPoster

Plugin TRMNL / LaraPaper qui affiche l'avion qui passe au-dessus de chez soi, avec la météo réelle.
Usage personnel et entre amis.

- [`recipe/`](recipe/) : la recette à installer (code, README d'installation FR/EN, captures, `flightposter.zip`)
- [`design/`](design/) : pistes de redesign explorées (Billet, Hublot, Radar), non retenues
- Scripts de développement (serveur LaraPaper en SSH) :
  - `recipe_render.sh <dossier>` : zippe la recette, l'importe en « FlightPoster (test) » et rapatrie les rendus de test
  - `migrate.php` : applique la recette testée au plugin FlightPoster en place
  - `update_shared.php`, `palette_apply.php` + `palette.json` : mise à jour du markup partagé et de la palette couleur
