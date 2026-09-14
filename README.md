# HvorErAlle

Statisk PWA for deling av gruppens siste kjente posisjoner. Nettstedet publiseres fra `site/` med GitHub Actions.

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

Firebase Realtime Database-reglene ligger i `database.rules.json` og kan deployes med:

```powershell
firebase deploy --only database
```
