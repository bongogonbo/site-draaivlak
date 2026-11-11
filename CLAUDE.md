# Voor Claude

- Deze repository is één klantsite. Het proces staat in de projectinstructies ("website workflow").
- Werk nooit direct op `main`. Gebruik de tak `bouw` voor de eerste oplevering en `wijziging-<wat>` voor aanpassingen. Lever op via een pull request. Een merge is het akkoord van de eigenaren.
- `site/assets/js/formulier.js` is de vaste bouwsteen en wordt niet aangepast. `controle/check-formulier.sh` moet slagen.
- Draai voor elke pull request `controle/controles.js`, de formuliertest en `check-formulier.sh` (zie README). Herstel wat faalt en draai opnieuw.
- Interne zaken (rapport, kosten, onderzoek) horen in het Claude-project, niet hier. Deze repository wordt aan de klant overgedragen.
- Commit geen screenshots, `node_modules` of testoutput.
