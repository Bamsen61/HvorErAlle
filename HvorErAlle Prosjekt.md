# Prosjekt for "HvorErAlle"

## Instruksjoner Codex ChatGPT skal følge

* Hvis noe er uklart så spør før endringer gjøres
* Alle endringer skal gjøres direkte i filene på "D:\GIT\HvorErAlle\"
* Ikke list lange endringer i chat
* Hvis noe må testes så be meg gjøre kun en test av gangen og vent på svar.  
  Ikke lag en lang liste med tester.
* Når jeg bruker "Du" eller "Deg" så refererer dette til Codex ChatGPT

## Spørsmål

* Hva trenger du for å konfigurere Firebase databasen?
* Hva trenger du for å konfigurere github-pages?
* Hvilke spesifikasjoner må et bilde ha for å kunne brukes  
  som ikon på hjemme-skjermen til brukernes telefon.

## Kilder

Alle filer ligger i "D:\GIT\HvorErAlle\"  

## Formål

HvorErAlle benyttes når en gruppe er på tur og man vil se hvor alle befinner seg.  
Når appen åpnes, vises et kart med en markør for alle brukere.  

## Beskrivelse

* Det er en Progressive Web App (PWA)
* Den er "engangs". Det er ingen konfigurering eller tilpassning.
* Brukere hardkodes i appen og innviteres med en personlig link.  
  Innlogging etterpå skjer med Passcode fra telefonen.  
  Det er 11 brukere for 2026  
* Statiske lokasjoner hardcodes i appen  

## WEB Frontend

HvorErAlle publisres som en PWA med github-pages.
Når HvorErAlle lagres på Hjem-Skjermen skal den ha et eget ikon.

## Database

App skal bruke Firebase Realtime database  
Database url: ```https://handleliste-3bdaa-default-rtdb.europe-west1.firebasedatabase.app/```  
Databasen har i dag et topp level ```handleliste```  
Nytt topplevel skal hete ```hvoreralle```  

### Felter

* Navn
* Latitude, longitude
* Timestamp
* Accuracy
* Klientens plattform

### Eksempel JSON fra Firebase

```
{
  "hvoreralle": {
    "-OOMRWbE31FwYbn6IXZv": {
      "Name": "Kropp",
      "Location": "59.95797780022199, 11.052250640577984",
      "Timestamp": "2026-07-04 10:10:42",
      "Accuracy": "Fine",
      "Plattform": "Android",
    },
  }
}

```

## Funksjon for brukere

### Første gang

1. Brukeren får en personlig tilpasset lenke på SMS med navnet kodet inn.
2. Gi tilgang til å lese detaljert posisjon. Hver gang appen brukes.
3. Opprette Passcode som brukes for alle senere login.
4. Appen legges på hjem-skjermen.

### Normal bruk

1. Når appen åpnes, leses nøyaktig posisjon fra telefonen.
2. Posisjonen lagres i en felles database med de ti siste posisjonene pr. navn.
3. Google maps vises der alle brukeres siste posisjon vises.  
   Kartet skal bare dekke det området som inneholder posisjoner.
4. Kartet viser personer
	* Grønn markør for 0 - 20 minutter
	* Gul markør for 20 - 45 minutter
	* Grønn markør for mer enn 45 minutter
5. Kartet viser hvit markør statiske steder
	* Hotell
	* Restauranter
	* Aktiviteter
6. Kartet skal være et 'live' Google map så brukerne kan  
   klikke på markører for å få veibeskrivelse og lignende.


## Funksjon for meg som admin

* Python skript som kan lage innvitasjonslink med brukernavn

## Brukere

Det er 11 brukere i år.

* Id:   4        <br>Tlf: 9088 3528  
* Id:   Frank    <br>Tlf: 9204 5716  
* Id:   Herold   <br>Tlf: 9159 3333  
* Id:   Kropp    <br>Tlf: 9002 5903  
* Id:   Magne    <br>Tlf: 9118 4261  
* Id:   Martin   <br>Tlf: 7383 4373  
* Id:   Ole Tom  <br>Tlf: 9268 5825  
* Id:   Steinar  <br>Tlf: 9322 9932  
* Id:   Stig     <br>Tlf: 9384 1324  
* Id:   TC       <br>Tlf: 9592 7203  
* Id:   Tedd     <br>Tlf: 9921 7229  
