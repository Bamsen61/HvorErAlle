# Prosjekt for "HvorErAlle"

## Instruksjoner Codex ChatGPT skal følge

* Hvis noe er uklart så spør før endringer gjøres
* Alle endringer skal gjøres direkte i filene på "D:\GIT\HvorErAlle\"
* Ikke list lange endringer i chat
* Hvis noe må testes så be meg gjøre kun en test av gangen og vent på svar.  
  Ikke lag en lang liste med tester.
* Når jeg bruker "Du" eller "Deg" så refererer dette til Codex ChatGPT

## Sikkerhet

Hardkodet bruker og passord skal brukes.  
Jeg er klar over risikoen med dette. Men det er den grad av sikkerhet som prosjektet trenger.  
Hvis mulig så prøv å skjule hardkodingen noe i applikasjonen. Ikke legg det som variable helt i toppen. 🙂  

Hvis URLen kalles med en ugyldig key, skal den straks avbryte og unloade.  
Gyldige keys for login er de 11 som er listet i "## Brukere"

## Kilder

GitHub repo er: https://github.com/Bamsen61/HvorErAlle
Alle filer ligger i lokal kopi av GitHub repo "D:\GIT\HvorErAlle\"  

## Formål

HvorErAlle benyttes når en gruppe er på tur og man vil se hvor alle befinner seg.  
Når appen åpnes, vises et kart med en markør for alle brukere.  

## Beskrivelse

* GitHub repository for appen er: "https://github.com/Bamsen61/HvorErAlle"
* Lokal kopi av GitHub repo er: "D:\GIT\HvorErAlle\"
* Det er en Progressive Web App (PWA)
* Appen skal støtte Android Chrome og hvis praktisk mulig iOS Safari.
* Appen er "engangs". Det er ingen konfigurering eller tilpassning.
* Brukerne er lagt inn i basen med en Key som nøkkel til recorden
* Innlogging etterpå skjer med en felles hardkodet bruker og passord i HTML filen.  
* De 11 brukerne for 2026 skilles med Key i URLen. Hver bruker får tilsendt egen URL med sin key..
* Statiske lokasjoner hardcodes i appen  
* userId er definert i tabellen "## Brukere". Merk at "4" er en userId som teksten "4"  
* Kartets område beregnes fra bruker- og statiske posisjoner.
* Ugyldige eller tomme posisjoner forkastes.
* Klikk på en markør åpner Google Maps på den posisjonen via en universell Google Maps URL.
* Det er ingen funksjon for å fjerne posisjoner. Appen og databasen vil bli slettet når turen er over.

## WEB Frontend

HvorErAlle publisres som en PWA med github-pages.  
Når HvorErAlle lagres på Hjem-Skjermen skal den ha et eget ikon.  

* PWA-en må ha `manifest.webmanifest`, service worker, HTTPS, `start_url`, `display`, `theme_color`, `background_color` og ikoner.
* Appen deployes med GitHub Actions med adresse "https://bamsen61.github.io/HvorErAlle/index.html?Key=9MOvJJGRc7"  
  "Key" er forskjellig for hver bruker.  

## Kart

* Det interaktive kartet i appen skal lages med Leaflet og kartdata fra OpenStreetMap.
* OpenStreetMaps standard raster tiles skal lastes fra `https://tile.openstreetmap.org/{z}/{x}/{y}.png` over HTTPS.
* Leaflet-versjonen skal låses til en konkret, testet versjon. Leaflet JavaScript og CSS kan lagres lokalt i repoet slik at appen ikke er avhengig av en CDN.
* Kartet krever ingen Google Maps API key eller Google Cloud billing account.
* Synlig attribution skal alltid vises på kartet: `© OpenStreetMap contributors`, med lenke til `https://www.openstreetmap.org/copyright`.
* Service worker skal ikke forhåndslaste eller lage egen offline-cache av OpenStreetMap tiles. Nettleserens vanlige HTTP-cache skal brukes slik at OpenStreetMaps cache-regler respekteres.
* Det skal ikke implementeres bulk download, tile scraping eller offline-nedlasting av kartområder.
* Tile URL skal defineres ett sted i JavaScript slik at kartleverandør enkelt kan byttes senere.
* Markører, farger, popup og automatisk kartutsnitt skal håndteres av Leaflet.
* Klikk på en markør skal åpne følgende universelle Google Maps URL i ny fane eller Google Maps-appen hvis den er installert:
  `https://www.google.com/maps/search/?api=1&query=<latitude>%2C<longitude>`
* Latitude og longitude skal URL-encodes før Google Maps URL-en åpnes.
* Google Maps URLs krever ikke API key eller billing account.

## Lage ikon

Lage icon filer 192x192 og 512x512 PNG  
Lage 180x180 `apple-touch-icon`.  

Ikonet skal vise en stilisert hest som bakgrun og et stilisert fly som fyller ikonet i forgrunn.

## Database

Felles bruker for tilgang til databasen skal være:  
* Userid: morten.steien@getmail.no
* Passord: pTkAcyX8d9

App skal bruke Firebase Realtime database  
* Database url: ```https://handleliste-3bdaa-default-rtdb.europe-west1.firebasedatabase.app/```  
* Topplevel er ```hvoreralle```  
* Samme Firebase-prosjekt som `handleliste-3bdaa` skal brukes.  

Databasekonfigurasjon for eksisterende app finnes her: "D:\GIT\ShoppingList-NoBackend"

NB!! Ingen endringer må gjøres som ødelegger eller endre funksjonen til data under "handleliste"

Opprett Firebase Authentication og Realtime Database Security Rules.  
Ny felles bruker kan lese og skrive til alle records og felter under "hvoreralle"..

### Felter

| Feltnavn  | Beskrivelse                                   |  
|-----------|-----------------------------------------------|  
| Key       | Index i databasen og ID i innvitasjonsmail    |  
| userID    | Brukerens navn. Se liste i "## Brukere"       |  
| Location  | Lagres på samme format som Google Maps bruker |  
| Timestamp | Lagres på formatet YYYY-MM-DD hh:mm:ss        |  
| Platform  | En av: Ukjent, Android, IOS, Static           |  

Statiske lokasjoner har Platform = Static  
Brukere som ikke har logget inn første gang har Platform = Ukjent

### Eksempel JSON fra Firebase

Location skal følge formatet til Google Maps
Accuracy viser "Fine" eller "Coarse" etter hva brukeren har tillatt.

```
{
  "9MOvJJGRc7": {
    "userID": "Kropp",
    "Platform": "Android",
    "Timestamp": "2026-07-04 10:10:10"
    "Location": "59.95797780022199, 11.052250640577984",
  }
}
```

## Funksjon for brukere

### Første gang

1. Brukeren får en personlig tilpasset lenke på SMS med navnet kodet inn.  
2. Gi tilgang til å lese detaljert posisjon. Hver gang appen brukes.  
3. Appen legges på hjem-skjermen.  
4. Hvis brukeren avslår location permission termineres appen.  

### Normal bruk

1. Når appen åpnes, leses nøyaktig posisjon fra telefonen.  
   Posisjonen leses bare en gang, hver gang applikasjonen får fokus.  
2. Posisjonen lagres i en felles database med siste posisjon pr. navn.  
3. Et interaktivt Leaflet-kart med OpenStreetMap som kartbakgrunn viser alle brukernes siste posisjon.  
   Kartet skal bare dekke det området som inneholder posisjoner.
4. Kartet viser personer
	* Grønn markør for 0 - 20 minutter
	* Gul markør for 20 - 45 minutter
	* Rød markør for mer enn 45 minutter
5. Kartet viser hvit markør for statiske steder
	* Hotell
	* Restauranter
	* Aktiviteter
6. Kartet skal oppdateres live fra Firebase. Når brukeren klikker på en markør, åpnes Google Maps på den valgte posisjonen slik at brukeren kan få veibeskrivelse og lignende.

## Brukere

Det er 11 brukere i år.  
Brukerne er allerede definert i databasen.  

| Key        | userID  | Platform | Timestamp           | Location                               |  
|------------|---------|----------|---------------------|----------------------------------------|  
| J2ZrXMP0wj | 4       | Ukjent   | 2026-07-04 10:10:10 | 50.052312560225346, 19.917011600564315 |  
| Tst5rLb7Ae | Frank   | Ukjent   | 2026-07-04 10:10:10 | 50.052312560225346, 19.917011600564315 |  
| f4XPSqhTJD | Herold  | Ukjent   | 2026-07-04 10:10:10 | 50.052312560225346, 19.917011600564315 |  
| 9MOvJJGRc7 | Kropp   | Android  | 2026-07-04 10:10:10 | 50.052312560225346, 19.917011600564315 |  
| gsvweXC8cB | Magne   | Ukjent   | 2026-07-04 10:10:10 | 50.052312560225346, 19.917011600564315 |  
| M2tgVaUDrK | Martin  | Ukjent   | 2026-07-04 10:10:10 | 50.052312560225346, 19.917011600564315 |  
| qhEI1lwqDq | Ole Tom | Ukjent   | 2026-07-04 10:10:10 | 50.052312560225346, 19.917011600564315 |  
| rZGKuHEAnw | Steinar | Ukjent   | 2026-07-04 10:10:10 | 50.052312560225346, 19.917011600564315 |  
| hOGUL3Ijh5 | Stig    | Ukjent   | 2026-07-04 10:10:10 | 50.052312560225346, 19.917011600564315 |  
| ifP5y9KtfJ | TC      | Ukjent   | 2026-07-04 10:10:10 | 50.052312560225346, 19.917011600564315 |  
| tjwXHGA8b8 | Tedd    | Ukjent   | 2026-07-04 10:10:10 | 50.052312560225346, 19.917011600564315 |  

## Statiske posisjoner

Det er 6 statiske lokasjoner i år.  
Lokasjonene er allerede definert i databasen.  

| Key        | userID        | Platform | Timestamp           | Location                               |  
|------------|---------------|----------|---------------------|----------------------------------------|  
| bjDUdO1y15 | Hotell        | Static   | 2026-07-04 10:10:10 | 50.052312560225346, 19.917011600564315 |  
| livqXKjvUQ | Butcher Grill | Static   | 2026-07-04 10:10:10 | 50.06008256071363, 19.937353473971022  |  
| yJ2R5TxfRA | Chopin Hall   | Static   | 2026-07-04 10:10:10 | 50.053139215413964, 19.937353475639696 |  
| 4mfykAkXdh | Saltgruver    | Static   | 2026-07-04 10:10:10 | 49.98453352281953, 20.054083210160986  |  
| b1sR8OHdGM | Big Gun       | Static   | 2026-07-04 10:10:10 | 50.0253557878794, 19.864912375686774   |  
| gTyS7E0bd8 | Flyplass      | Static   | 2026-07-04 10:10:10 | 50.081347188044134, 19.78594814351061  |  

## Telefonliste

| userID  | Telefon   |  
|---------|-----------|  
| 4       | 9088 3528 |  
| Frank   | 9204 5716 |  
| Herold  | 9159 3333 |  
| Kropp   | 9002 5903 |  
| Magne   | 9118 4261 |  
| Martin  | 7383 4373 |  
| Ole Tom | 9268 5825 |  
| Steinar | 9322 9932 |  
| Stig    | 9384 1324 |  
| TC      | 9592 7203 |  
| Tedd    | 9921 7229 |  
