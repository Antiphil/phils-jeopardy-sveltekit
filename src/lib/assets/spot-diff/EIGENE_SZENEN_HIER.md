# Spot the Diff – Eigene Szenen hinzufügen

Lege hier SVG-Dateien nach folgendem Namensschema ab:

```
{Name}_Original.svg      ← das fehlerfreie Bild
{Name}_Fehler_1.svg      ← erste Fehler-Variante
{Name}_Fehler_2.svg      ← zweite Fehler-Variante (optional)
{Name}_Fehler_3.svg      ← dritte Fehler-Variante (optional)
```

## Beispiele

```
Fledermaus_Original.svg
Fledermaus_Fehler_1.svg
Fledermaus_Fehler_2.svg

Küche_Original.svg
Küche_Fehler_1.svg

Stadtbild_Original.svg
Stadtbild_Fehler_1.svg
Stadtbild_Fehler_2.svg
```

## Regeln

- Jede Szene braucht **genau eine** `_Original.svg` und **mindestens eine** `_Fehler_*.svg`
- Szenen ohne passende Fehler-Datei werden **ignoriert**
- Das Spiel wählt zufällig eine verfügbare Szene und zufällig eine der Fehler-Varianten
- SVG-Dateien sollten viewBox `0 0 200 200` verwenden (der Rest skaliert automatisch)
- Nach dem Hinzufügen muss die App einmal neu gestartet / gebaut werden (`npm run dev`)

## Derzeit verfügbar

- **Vogel** (`Vogel_Original.svg`, `Vogel_Fehler_1.svg`) — lila Flügel statt orange
