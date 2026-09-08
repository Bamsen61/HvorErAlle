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
* Hvor skal WEB-siden hostes?

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

## Database

App skal bruke Firebase Realtime database  
Database url: ```https://handleliste-3bdaa-default-rtdb.europe-west1.firebasedatabase.app/```  
Databasen har i dag et topp level ```handleliste```  
Nytt topplevel skal hete ```hvoreralle```  

### Felter

* Navn
* Inntil 10 siste latitude, longitude
* Inntil 10 siste timestamp
* accuracy
* klientens plattform

### Eksempel JSON

```
{
  "hvoreralle": {
    "-OOMRWbE31FwYbn6IXZv": {
      "Name": "Morten",
      "BoughtBy": "Morten",
      "Location": [
        "59.95797780022199, 11.052250640577984",
        "59.93117526660158, 10.889987728647107",
        "59.69761660909949, 10.031680831997889",
        "68.90907632436068, 18.58179041721069",
        "50.01488485307661, 19.94409590667744"
      ],
      "Timestamp": [
        "2026-07-04 10:10:42",
        "2026-04-04 11:00:32",
        "2025-12-13 14:23:00",
        "2025-09-12 09:42:00",
        "2025-04-22 06:42:00"
      ],
      "Accuracy": "Fine",
      "Plattform": "Android",
    },
  }
}

```

## Funksjon for brukere

### Første gang

1. Brukeren får en personlig tilpasset lenke på SMS med navnet kodet inn.
1. Gi tilgang til å lese detaljert posisjon hver gang appen brukes.
1. Opprette Passcode som brukes for alle senere login.
1. Appen legges på hjem-skjermen.

### Normal bruk

1. Når appen åpnes, leses nøyaktig posisjon fra telefonen.
1. Posisjonen lagres i en felles database med de ti siste posisjonene pr. navn.
1. Google maps vises der alle brukeres siste posisjon vises.  
   Kartet skal bare dekke det området som inneholder posisjoner.
1. Kartet viser
	* Grønn markør for 0 - 20 minutter
	* Gul markør for 20 - 45 minutter
	* Grønn markør for mer enn 45 minutter


## Funksjon for meg som admin

* Python skript som kan lage innvitasjonslink med brukernavn

## Brukere

Det er 11 brukere i år.

* Id:   4        <br>Tlf: 9088 3528  
* Id:   Frank    <br>Tlf: 9204 5716  
* Id:   Herold   <br>Tlf: 9159 3333  
* Id:   Kroppen  <br>Tlf: 9002 5903  
* Id:   Magne    <br>Tlf: 9118 4261  
* Id:   Martin   <br>Tlf: 7383 4373  
* Id:   Ole Tom  <br>Tlf: 9268 5825  
* Id:   Steinar  <br>Tlf: 9322 9932  
* Id:   Stig     <br>Tlf: 9384 1324  
* Id:   TC       <br>Tlf: 9592 7203  
* Id:   Tedd     <br>Tlf: 9921 7229  
