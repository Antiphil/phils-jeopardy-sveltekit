BUGS:
- BUG: Game Config Chaos Category wenn spiel ausgewählt muss ein hinweis eingegeben werden um diese grün zu färben.
- BUG: Game Config englischer tab zeigt deutsche titel an

TODO:
- none gamemaster mode wo alle spieler teilnehmen können 
    - auch ein online mode wo spieler übers internet miteinander spielen können
- game libary user generated
    - public game libary
    - official game from admin trennen
- patchnotes: bekannte bugs ganz oben einfügen
- i18n voll implementieren und alles übersetzen

Hier sind die wichtigsten Punkte für ein Release, nach Priorität:

Kritisch

+error.svelte fehlt — Wenn eine Route oder API einen Fehler wirft, zeigt SvelteKit eine nackte generische Seite. Eine branded Error-Page wäre das Minimum.

Rate Limiting auf /api/games/[id]/rate — Das Rating-Endpoint braucht kein Login. Jeder kann beliebig oft abstimmen, auch Bots. Mindestens eine einfache Begrenzung (z.B. 1 Rating pro IP + GameId).

Wichtig

Sitemap fehlt — robots.txt referenziert https://antiphil.de/sitemap.xml, die nicht existiert. Entweder eine generieren oder den Eintrag entfernen.

OpenGraph / Meta-Tags — Wenn du das Spiel über einen Link teilst, sieht man keine Vorschau. og:title, og:description, og:image auf der Hauptseite würden das deutlich professioneller machen.

Session-Limit-UX — Wenn ein User die 2-Session-Grenze erreicht, bekommt er aktuell nur einen generischen Toast. Ein klarerer Hinweis ("Du hast 2 aktive Spiele — beende eines davon") wäre nutzerfreundlicher.

Nice to have

Mobile-Check — Das Gameboard mit 5 Kategorien × 5 Fragen ist auf kleinen Screens wahrscheinlich schwer bedienbar. Spielen auf dem Tablet/Handy?

Ladeindikator auf der Startseite — Wenn savedGamesStore lädt, sieht man kurz nichts. Ein Skeleton oder Spinner wäre sauber.

Favicon in allen Formaten — Aktuell nur eine .png. Für PWA-ähnliche Nutzung (Homescreen) bräuchte man eine manifest.json + Icons in verschiedenen Größen.

1. Fehlerbehandlung (höchste Priorität)
Aktuell crasht die App still wenn API-Calls fehlschlagen — savedGamesStore hat zwar ein catch { set([]) }, aber das UI zeigt dem User nichts. Toast-Notifications oder Error-States für fehlgeschlagene Saves, fehlende Auth-Session, DB-Fehler wären das Minimum.

2. Ladezustände
Beim Laden von Spielen, Speichern, Veröffentlichen gibt es keine visuellen Indikatoren. Der User klickt "Speichern" und weiß nicht ob es geklappt hat. Loading-Spinner oder optimistische UI-Updates mit Rollback bei Fehler.

3. Input-Validierung
In der Game-Config gibt es kaum Validierung — was passiert wenn ein Spielername leer ist, ein Wordle-Wort Sonderzeichen enthält, ein Timer auf 0 gesetzt wird? Das sollte client- und serverseitig abgesichert sein.

4. API-Absicherung
Die API-Routes haben vermutlich keine Rate-Limiting, keine Größenbeschränkung für Request-Bodies, und prüfen nur ob eine Session existiert aber nicht ob der User wirklich der Owner des Games ist den er bearbeitet. Authorization-Checks auf allen PUT/DELETE-Endpoints.

5. Typen-Konsistenz
ChaosType ist in savedGames.ts und game.ts doppelt definiert — bei jedem neuen Typ muss man beide Stellen anfassen. Eine einzelne src/lib/types.ts als Source of Truth wäre sauberer.

6. Demo-Game-Stabilität
Das Demo-Spiel ist hardgecoded. Wenn sich SavedGame-Typen ändern kann es silent broken sein. Es sollte gegen den aktuellen Typ validiert werden.

7. Mobile / Responsive
Das Gameboard und die Game-Config sind auf kleinen Screens vermutlich nicht benutzbar. Für 1.0 sollte zumindest das Scoreboard und die Spielansicht auf einem Tablet funktionieren (TV-Stick Szenario).

8. Browser-Kompatibilität
crypto.randomUUID() ist nicht überall verfügbar, import.meta.glob ist Vite-spezifisch — das ist okay, aber es sollte getestet sein.

Was ich als konkreten nächsten Schritt empfehlen würde:

Fang mit Fehlerbehandlung + Ladezustände an — das ist das was einem echten Nutzer am meisten auffällt und am meisten Vertrauen kostet wenn es fehlt. Danach die API-Authorization-Checks, weil das ein echtes Sicherheitsproblem ist wenn das Spiel öffentlich läuft.

Was davon willst du angehen?

