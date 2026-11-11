# Ontwerp Draaivlak

Donker en technisch. Koele, bijna zwarte vlakken, één amber accent uit de huisstijl, koppen in zware hoofdletters en een dun kader met hoekmarkeringen rond het scherm.

## Tokens

```css
--bg:#0B0E12; --panel:#11161C;
--tekst:#DCE2E8; --gedempt:#8D9197;
--accent:#FFBE2E;   /* uit huisstijl #F2A900, lichter */
--actief:#7CC4FF;   /* alleen hover en actieve staat */
--lijn:rgba(220,226,232,.10);
--radius:0; schaduwen: geen
spacing: 4 8 16 24 40 64 104 px, max. breedte 1200 px
```

Contrast: tekst 14,8:1, gedempt 6,1:1, accent 11,7:1 en knoptekst op accent 11,7:1. Er is alleen een donkere stand.

## Fonts (zelf gehost, `site/assets/fonts/`)

- Koppen: Archivo 800, hoofdletters, spatiëring .01em, regelhoogte 0,95
- Tekst: IBM Plex Sans 300 (lopend) en 400 (nadruk), 17 px, regelhoogte 1,6
- Labels: IBM Plex Sans 500, 11 px, hoofdletters, spatiëring .26em, `//` als scheidingsteken
- h1 `clamp(40px, 6.6vw, 92px)`, h2 `clamp(28px, 3.6vw, 48px)`, h3 20 px

## Vormen

- Scherpe hoeken en lijnen van 1 px.
- Kader: 14 px van de rand vanaf 900 px breed, 8 px op mobiel, met hoekmarkeringen in het accent.
- Knoppen: gevuld in het accent met donkere tekst, of omlijnd. Bij hover wordt het accent blauw (`--actief`).
- Foto's: grijs, meer contrast, donkerder, met een amber waas.

## Opbouw per pagina

- **Home:** foto over het hele scherm, met de kop en twee knoppen in een effen kaart linksonder. Daarna:
  - cijferstrook (2 cijfers met bron)
  - diensten (4)
  - werkwijze (5 stappen)
  - uitgelicht project
  - reviews (2, letterlijk)
  - oproep tot offerte
- **Diensten:** vier blokken met uitleg. Prijs op offerte.
- **Werk:** het project in Eindhoven (vraag, aanpak, resultaat).
- **Over:** het verhaal, de werkwijze en het werkgebied.
- **Contact:** het formulier met bedrijfsgegevens en bereikbaarheid.
- **Privacy, bedankt en 404:** alleen tekst.
- **Op elke pagina:** de navigatie bovenaan en een voet met alle bedrijfsgegevens.

## Beweging

- Cijfers tellen in 1,4 s van 0 op tot de waarde die al in de HTML staat. Ze starten als 40% in beeld is.
- Lijnen onder sectiekoppen tekenen zich in 1,1 s.
- Kaarten (diensten, stappen, reviews) verschijnen een voor een, 0,12 s na elkaar: ze komen 10 px omhoog en vervagen in.
- Met reduced motion of zonder JavaScript staat alles direct op zijn plaats en zie je de eindwaarden.
