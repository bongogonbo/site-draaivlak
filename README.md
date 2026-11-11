# Website [bedrijfsnaam]

Deze repository bevat de complete website van [bedrijfsnaam]. De site is statisch: alleen HTML, CSS en een beetje JavaScript, zonder database of build-stap. Elke webhost die bestanden kan serveren, kan hem draaien.

## Indeling

```
site/        de website zelf: dit publiceert de hosting
bron/        intake.json (feiten), ontwerp.md (vormgeving), teksten.md (teksten)
controle/    automatische controles en formuliertest
```

## Wijzigen

Wijzigingen lopen via een pull request. Een merge naar `main` is het akkoord. Daarna zet de hosting de site automatisch live.

## Hosting

Netlify, gekoppeld aan deze repository. De instellingen staan in `netlify.toml`: de map `site` wordt gepubliceerd, zonder build-stap. Netlify zet elke merge naar `main` automatisch live en toont `404.html` vanzelf bij onbekende pagina's. Elke andere host die bestanden kan serveren werkt ook.

## Controles draaien (Node + Playwright, Python)

```
python3 -m http.server 8765 -d site &
node controle/controles.js <screenshotmap>
FORM_URL=http://localhost:8765/contact.html HOOK=<webhook-url> node controle/formulier-test.js
controle/check-formulier.sh
```

## Contactformulier

Het formulier stuurt aanvragen als JSON (`aanvraag.v1`) naar het adres in `data-webhook` in de HTML. Wie de repository overneemt, moet dat adres naar een eigen ontvanger laten wijzen, of afspraken maken over de bestaande.

## Fonts

Zelf gehost in `site/assets/fonts/`. Licenties staan in `LICENSES.txt` in die map.
