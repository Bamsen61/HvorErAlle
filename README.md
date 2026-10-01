# HvorErAlle

Statisk PWA for deling av gruppens siste kjente posisjoner. Appen er tatt ut av bruk. GitHub Pages-publiseringen er avviklet, og deploy-workflowen er fjernet. Kildekoden i `site/` er beholdt for lokal kjøring.

## Lokal kjøring

```powershell
python -m http.server 8080 --directory site
```

Åpne `http://localhost:8080/index.html?Key=9MOvJJGRc7`.

## Kontroll

```powershell
npm test
npm run check
```

Firebase-prosjektet deles med Handleliste. Data, regler og Auth er beholdt uendret ved avviklingen. Ikke deploy regler som del av avviklingen. Regelfilen ligger i `database.rules.json`; eventuell senere regelendring må følge prosjektbeskrivelsen.
