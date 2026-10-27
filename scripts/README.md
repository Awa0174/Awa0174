# So entsteht das Profil

Alle Grafiken im Profil-README sind SVGs, die diese Skripte erzeugen – ohne Build-Werkzeuge, nur mit Node.js.
Farben, Rahmen und harte Schatten stammen aus dem Farbschema „Fensterlicht“ meiner
[Website](https://awa0174.github.io/).

```
build.mjs           Banner, Tippzeile, Schaltflächen, Projektkarten, Stack, Kontakt
stats.mjs           Kennzahlen und Sprachen über die GitHub-API → assets/stats.svg
measure-fonts.mjs   misst einmalig die Zeichenbreiten → lib/metrics.json
lib/svg.mjs         Farbschemata, Textbreiten, Panels, Icons
lib/icons.json      Icon-Pfade aus Simple Icons (CC0)
media/              Signaturbild und Screenshots, werden als data-URI eingebettet
```

## Neu erzeugen

```bash
node scripts/build.mjs
GITHUB_TOKEN=… node scripts/stats.mjs
```

Die Action `.github/workflows/stats.yml` macht beides täglich und committet nur, wenn sich etwas geändert hat.

## Warum so

- **Hell und dunkel in einer Datei:** Jedes SVG trägt beide Farbschemata als CSS-Variablen und wechselt per
  `prefers-color-scheme`. Dadurch bleibt jede Grafik ein einfaches `<img>`, das sich verlinken lässt –
  ein `<picture>` innerhalb eines Links zerlegt GitHub beim Rendern.
- **Feste Textbreiten:** SVGs in einem `<img>` können keine Webfonts laden. Jeder Text bekommt deshalb ein
  `textLength` aus den gemessenen Breiten von Segoe UI; auf macOS oder Linux läuft er mit der Ersatzschrift
  genauso breit und nichts verrutscht.
- **Bilder eingebettet:** Externe Bilder lädt ein SVG in einem `<img>` nicht, daher stecken Signaturbild und
  Screenshots als data-URI darin.
- **Partikel mit Seed:** Die Partikel im Banner kommen aus einem festen Seed – jeder Build ergibt dasselbe Bild.

## Pflege

- **Projekt ändern oder ergänzen:** Eintrag im Objekt `cards` in `build.mjs` anpassen, Screenshot nach `media/`.
- **Stack:** Liste `stack` in `build.mjs`. Neue Icons aus [Simple Icons](https://simpleicons.org/) in
  `lib/icons.json` übernehmen (Feld `d` des Pfads).
- **Schrift neu messen:** `PLAYWRIGHT_FROM=<package.json eines Projekts mit Playwright> node scripts/measure-fonts.mjs`
