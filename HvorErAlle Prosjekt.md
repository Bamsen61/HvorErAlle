# HvorErAlle – prosjektbeskrivelse og driftsgrunnlag

Sist kontrollert mot produksjonskoden: 2026-09-15.

## Instruksjoner Codex ChatGPT skal følge

* Hvis noe er uklart, spør før endringer gjøres.
* Alle endringer skal gjøres direkte i filene under `D:\GIT\HvorErAlle\`.
* Ikke list lange endringer i chat.
* Hvis noe må testes av brukeren, be om kun én test av gangen og vent på svar.
* Når jeg bruker «Du», «Deg» eller lignende, refererer dette til Codex ChatGPT.
* Handleliste bruker samme Firebase-prosjekt. Endringer må ikke ødelegge data, regler eller innlogging for `handleliste`.

## Status

HvorErAlle er ferdig bygget og publisert som en statisk Progressive Web App (PWA).

* GitHub-repo: `https://github.com/Bamsen61/HvorErAlle`
* Lokal kopi: `D:\GIT\HvorErAlle\`
* Produksjon: `https://bamsen61.github.io/HvorErAlle/`
* Eksempel for Kropp: `https://bamsen61.github.io/HvorErAlle/index.html?Key=9MOvJJGRc7`
* Publisering skjer automatisk med GitHub Actions ved hver push til `main`.
* Nettsiden publiseres fra mappen `site/`.
* Det er ingen build-prosess; applikasjonen består av statisk HTML, CSS og JavaScript.
* Android Chrome er testet. Løsningen er også tilpasset iOS Safari så langt det er praktisk.

## Formål

HvorErAlle brukes når en gruppe er på tur og vil se hverandres siste kjente posisjon på et kart.

Hver deltaker får en personlig URL med en gyldig `Key`. Appen:

1. identifiserer deltakeren fra nøkkelen,
2. logger inn med den felles Firebase-kontoen,
3. henter en nøyaktig posisjon én gang,
4. lagrer posisjonen på deltakerens record,
5. viser alle siste kjente posisjoner og statiske steder på kartet.

Appen og dataene er ment å være midlertidige og kan slettes når turen er over.

## Faktisk oppstarts- og kjøreflyt

1. `site/index.html` validerer `Key` før resten av appen lastes.
2. Gyldig nøkkel lagres som `hva-key` i `localStorage`. Dette gjør at PWA-en kan startes fra hjemmeskjermen uten `Key` i `start_url`.
3. Hvis URL-en inneholder en ugyldig nøkkel, tømmes dokumentet umiddelbart og nettleseren sendes til `about:blank`.
4. Firebase initialiseres som en navngitt app med navnet `hvoreralle`.
5. Den felles Firebase-kontoen logger inn med `LOCAL` persistence.
6. En Realtime Database-listener kobles til `/hvoreralle`.
7. Appen ber om en ny posisjon med høy nøyaktighet.
8. Kartet oppdateres live når Firebase-data endres.
9. Posisjonen hentes på nytt én gang når appen igjen får fokus eller blir synlig etter å ha vært i bakgrunnen.

Posisjonskallet bruker:

* `enableHighAccuracy: true`
* `maximumAge: 0`
* `timeout: 20000`

Hvis brukeren avslår location permission, termineres appen og innholdet fjernes. Andre posisjonsfeil vises som statusmelding, og appen kan prøve igjen neste gang den får fokus.

## URL-nøkler

Det finnes nøyaktig 11 gyldige nøkler. Listen finnes både i den tidlige valideringen i `site/index.html` og som `USERS` i `site/js/core.mjs`.

Disse to listene må alltid oppdateres samtidig.

| Key | userID |
|---|---|
| `J2ZrXMP0wj` | `4` |
| `Tst5rLb7Ae` | Frank |
| `f4XPSqhTJD` | Herold |
| `9MOvJJGRc7` | Kropp |
| `gsvweXC8cB` | Magne |
| `M2tgVaUDrK` | Martin |
| `qhEI1lwqDq` | Ole Tom |
| `rZGKuHEAnw` | Steinar |
| `hOGUL3Ijh5` | Stig |
| `ifP5y9KtfJ` | TC |
| `tjwXHGA8b8` | Tedd |

`userID` for brukeren `4` skal alltid behandles som tekst.

## Firebase og sikkerhet

Firebase-prosjektet deles med Handleliste:

* Firebase project ID: `handleliste-3bdaa`
* Realtime Database: `https://handleliste-3bdaa-default-rtdb.europe-west1.firebasedatabase.app/`
* HvorErAlle-noden: `/hvoreralle`
* Handleliste-noden: `/handleliste`
* HvorErAlle-konto: `morten.steien@getmail.no`

Brukernavn og passord er hardkodet etter uttrykkelig akseptert risikonivå. Verdiene ligger Base64-kodet inne i `authenticate()` i `site/app.js`. Dette skjuler dem bare visuelt og er ikke reell hemmeligholdelse i en offentlig klientapplikasjon. Passord skal ikke gjentas i dokumentasjon eller andre filer.

### Auth-isolering fra Handleliste

Begge appene ligger under samme origin, `bamsen61.github.io`, og bruker samme Firebase-prosjekt. HvorErAlle må derfor bruke den navngitte Firebase-appen `hvoreralle`, ikke `[DEFAULT]`.

Dette hindrer HvorErAlle-kontoen i å overskrive Handlelistes lagrede Auth-session. Koden rydder også opp en eventuell gammel HvorErAlle-session som tidligere ble lagret i `[DEFAULT]`.

Denne isoleringen må bevares ved senere endringer.

### Realtime Database-regler

Gjeldende regler ligger i `database.rules.json`.

* Eksisterende Handleliste-brukere har tilgang via de autoriserte UID-ene på rotnivå.
* HvorErAlle-kontoen har lese- og skrivetilgang under `/hvoreralle` basert på e-postadressen.
* Records under `/hvoreralle` valideres mot tillatte felter og verdier.
* Ukjente felt avvises med `$other: { ".validate": false }`.
* HvorErAlle-kontoen skal ikke gis tilgang til `/handleliste`.

Regelfilen finnes også i `D:\GIT\ShoppingList-NoBackend\database.rules.json`. De to kopiene må holdes synkronisert når Firebase-reglene endres, slik at en senere deploy fra ett repo ikke ødelegger den andre appen.

GitHub Actions publiserer bare nettstedet. Database-regler publiseres separat fra repo-roten:

```powershell
firebase deploy --only database
```

Kontroller alltid både Handleliste og HvorErAlle etter en regelendring.

## Datamodell

Hver record ligger under `/hvoreralle/<Key>`.

| Felt | Type og innhold |
|---|---|
| `userID` | Tekst, maksimalt 60 tegn |
| `Platform` | `Ukjent`, `Android`, `IOS` eller `Static` |
| `Timestamp` | Lokal tid på formatet `YYYY-MM-DD hh:mm:ss` |
| `Location` | `latitude, longitude` |
| `Accuracy` | Valgfritt felt: `Fine` eller `Coarse` |

`Accuracy` settes til `Fine` når nettleseren rapporterer inntil 100 meter, ellers `Coarse`.

Eksempel:

```json
{
  "9MOvJJGRc7": {
    "userID": "Kropp",
    "Platform": "Android",
    "Timestamp": "2026-07-04 10:10:10",
    "Location": "50.052312560225346, 19.917011600564315",
    "Accuracy": "Fine"
  }
}
```

Ugyldige, tomme eller geografisk umulige koordinater forkastes før visning.

## Kart, markører og labels

* Kartet bruker Leaflet 1.9.4, lagret lokalt under `site/vendor/leaflet/`.
* Kartdata hentes fra OpenStreetMaps standard raster tiles:
  `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
* Synlig attribution er alltid med: `© OpenStreetMap contributors`.
* OpenStreetMap-tiles lagres ikke i appens service worker-cache.
* Kartutsnittet beregnes automatisk fra alle gyldige bruker- og stedsposisjoner.

Markørfarger:

* Grønn: 0–20 minutter gammel.
* Gul: mer enn 20 og inntil 45 minutter gammel.
* Rød: mer enn 45 minutter gammel eller ugyldig timestamp.
* Hvit: statisk sted.

Alle markører har en synlig label med `userID`. Labels:

* plasseres automatisk uten overlapp så langt skjermplassen tillater,
* fordeles på begge sider av markørene,
* kobles til markøren med en tynn linje,
* beregnes på nytt ved zoom, panorering og endring av kartstørrelse,
* er klikkbare knapper og bruker samme aktiveringsfunksjon som markøren.

Klikk på markør eller label åpner popup og deretter denne universelle Google Maps-URL-en:

```text
https://www.google.com/maps/search/?api=1&query=<url-encoded latitude,longitude>
```

## Statiske posisjoner

Statiske steder er hardkodet som `STATIC_LOCATIONS` i `site/js/core.mjs`. Firebase-data med samme key vil overstyre den hardkodede verdien ved rendering.

| Key | userID | Location |
|---|---|---|
| `bjDUdO1y15` | Hotell | `50.052312560225346, 19.917011600564315` |
| `livqXKjvUQ` | Butcher Grill | `50.06008256071363, 19.937353473971022` |
| `yJ2R5TxfRA` | Chopin Hall | `50.053139215413964, 19.937353475639696` |
| `4mfykAkXdh` | Saltgruver | `49.98453352281953, 20.054083210160986` |
| `b1sR8OHdGM` | Big Gun | `50.0253557878794, 19.864912375686774` |
| `gTyS7E0bd8` | Flyplass | `50.081347188044134, 19.78594814351061` |

## PWA og cache

PWA-oppsettet består av:

* `site/manifest.webmanifest`
* `site/sw.js`
* ikonene `192x192`, `512x512` og `180x180` for Apple touch
* HTTPS via GitHub Pages
* `display: standalone`
* definert `start_url`, `scope`, `theme_color` og `background_color`

Service worker:

* bruker en eksplisitt cache-versjon, for tiden `hvoreralle-v5`,
* forhåndslagrer app-shell og lokale biblioteker,
* bruker network-first med HTTP-revalidering og 10 sekunders nettverkstimeout for GET-kall innenfor appens scope,
* bruker egen cache som fallback ved nettverksfeil, timeout og HTTP-feil; HTML-fallback gjelder bare navigasjon,
* kaller `skipWaiting()` og `clients.claim()`,
* sletter eldre HvorErAlle-cacher ved aktivering,
* lar OpenStreetMap håndtere tile-caching via vanlig HTTP-cache.

Cache-versjonen i `site/sw.js` skal økes når app-shell-filer endres.

### Robust oppdatering (2026-09-15)

Registrering skjer tidlig i index.html, uavhengig av app.js og window.load, med updateViaCache: none. Ny aktiv worker laster en allerede kontrollert side på nytt én gang. Oppdateringer sjekkes også ved retur til forgrunnen og online-event. Forhåndslagring omgår gammel HTTP-cache. Cache-opprydding er begrenset til hvoreralle- og berører ikke Handlelistes cacher, Auth eller data. GPS-timeout er fortsatt 20 sekunder og utløser ikke cache-sletting.

Eldre installerte versjoner må først motta den nye workeren; endringene kan ikke garantere reparasjon før dette skjer. Den tidligere observerte feilen er ikke bekreftet reprodusert.

### Tidligere cacheproblem på Chrome Android

En eldre installert service worker kan i enkelte tilfeller bli hengende igjen. Symptomene kan være:

* status blir stående på «Henter nøyaktig posisjon …»,
* bare de seks hardkodede stedene vises etter omtrent ett minutt,
* samme URL virker umiddelbart i inkognitomodus.

Løsning: slett nettsteddata for `bamsen61.github.io` i Chrome og åpne appen på nytt. Fordi Handleliste bruker samme origin, blir brukeren samtidig logget ut av Handleliste og må logge inn igjen.

## Filstruktur

| Fil/mappe | Ansvar |
|---|---|
| `site/index.html` | Tidlig key-validering, CSP, HTML og lasting av lokale biblioteker |
| `site/app.js` | Firebase, geolocation, live-data, kart, markører og labels |
| `site/js/core.mjs` | Brukere, statiske steder og testbar kjernelogikk |
| `site/styles.css` | Responsivt utseende, markører, labels og statusmeldinger |
| `site/sw.js` | PWA-cache og offline fallback |
| `site/manifest.webmanifest` | PWA-metadata og ikoner |
| `site/vendor/` | Låste lokale versjoner av Leaflet og Firebase SDK |
| `site/icons/` | Ferdige PWA-ikoner |
| `assets/icon-master.png` | Kildebilde for ikonene |
| `tests/core.test.mjs` | Automatiske tester og regresjonstester |
| `database.rules.json` | Samlede Firebase-regler for Handleliste og HvorErAlle |
| `firebase.json` / `.firebaserc` | Firebase CLI-konfigurasjon |
| `.github/workflows/deploy-pages.yml` | Automatisk GitHub Pages-publisering |

## Lokal kjøring og verifisering

Start lokal webserver fra repo-roten:

```powershell
python -m http.server 8080 --directory site
```

Åpne:

```text
http://localhost:8080/index.html?Key=9MOvJJGRc7
```

Kjør automatiske kontroller:

```powershell
npm test
npm run check
```

Gjeldende testsett kontrollerer blant annet:

* alle 11 invitation keys,
* parsing av posisjon og timestamp,
* fargegrenser for markøralder,
* URL-encoding for Google Maps,
* platform og accuracy,
* kollisjonsfri labelplassering,
* isolert Firebase Auth-app,
* felles aktivering for markør og label.

## Publisering

Workflowen `.github/workflows/deploy-pages.yml` kjører automatisk ved push til `main` og kan også startes manuelt med `workflow_dispatch`.

Normal arbeidsflyt:

```powershell
npm test
npm run check
git diff --check
git add --all
git commit -m "Kort beskrivelse"
git push origin main
```

Etter push:

1. kontroller at `Deploy to GitHub Pages` fullføres med `success`,
2. kontroller at produksjonsfilene er oppdatert,
3. be brukeren utføre høyst én konkret test om gangen dersom manuell mobiltest er nødvendig.

## Sjekkliste for senere endringer

* Bevar tidlig validering og umiddelbar terminering ved ugyldig `Key`.
* Hold key-listene i `index.html` og `core.mjs` identiske.
* Bevar den navngitte Firebase-appen `hvoreralle`.
* Ikke utvid HvorErAlle-kontoens tilgang til `/handleliste`.
* Synkroniser regelfilen med `ShoppingList-NoBackend` ved regelendringer.
* Bevar lokal Leaflet/Firebase SDK og synlig OpenStreetMap-attribution.
* Ikke legg OpenStreetMap-tiles i service worker-cachen.
* Øk service workerens cache-versjon når app-shell endres.
* Legg til eller oppdater regresjonstest ved funksjonsendringer.
* Kjør `npm test`, `npm run check` og `git diff --check` før commit.

## Sensitiv informasjon

Telefonnumre, passord og annen sensitiv kontaktinformasjon skal oppbevares utenfor dette offentlige repoet.
