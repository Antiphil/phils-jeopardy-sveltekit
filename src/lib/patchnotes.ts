export type PatchNote = {
	version: string;
	date: string;
	changes: { type: 'new' | 'fix' | 'change'; text: string }[];
};

export const PATCHNOTES: PatchNote[] = [
	{
		version: '0.5.3',
		date: '02.04.2026',
		changes: [
			{ type: 'new', text: 'Input-Validierung: Spielname, Wordle/Hangman-Wortlänge (min. 2 Buchstaben) und Timer — client- und serverseitig abgesichert' },
			{ type: 'new', text: 'Spieler-Setup: Fehlermeldung mit Schüttelanimation wenn kein Spieler eingetragen wurde' },
			{ type: 'new', text: 'Session-Limit-UX: Beim Erreichen des Limits pulsieren die aktiven Spiele amber und scrollen ins Bild' },
			{ type: 'new', text: 'Toast-Benachrichtigungen: Erfolg, Fehler und Info mit Timer-Balken und Klick-zum-Schließen' },
			{ type: 'new', text: 'Rate Limiting: Bewertungen sind auf 1 pro IP und Spiel pro Tag begrenzt' },
			{ type: 'new', text: 'Fehlerseite: Eigene branded Error-Page für 401, 403, 404 und 500' },
			{ type: 'new', text: 'Sitemap: /sitemap.xml mit lastmod, Cache-Headers und allen öffentlichen Seiten' },
		],
	},
	{
		version: '0.5.2',
		date: '02.04.2026',
		changes: [
			{ type: 'new', text: 'Chaos Category: "Finde den Fehler" — 10×5 Bild-Grid, ein Tile enthält einen Fehler' },
			{ type: 'new', text: 'How-to-Play: vollständig überarbeitet — 7 Schritte inkl. Gamemaster-Erklärung und allen Minigame-Typen' },
			{ type: 'change', text: 'Frage-Modal: Points-Badge, Timer und Answerer in einer kompakten Topbar-Zeile zusammengefasst' },
			{ type: 'change', text: 'Frage-Modal: Close-Button in die Topbar integriert' },
			{ type: 'change', text: 'Frage-Modal beim Finde-den-Fehler deutlich breiter (92vw) für bessere Erkennbarkeit' },
			{ type: 'change', text: 'Chaos Category: Typ-Icons auf unberührten Tiles entfernt — nur noch Punktezahl sichtbar' },
			{ type: 'fix', text: 'Finde-den-Fehler: Modal schließt sich nun korrekt nach dem Countdown' },
			{ type: 'fix', text: 'Scoreboard: Delta-Badge wurde bei Positionstausch ohne Punkteänderung erneut angezeigt' },
		],
	},
	{
		version: '0.5.1',
		date: '02.04.2026',
		changes: [
			{ type: 'new', text: 'Patchnotes-Button auf der Startseite' },
			{ type: 'new', text: 'Versionsnummer auf Startseite' },
			{ type: 'new', text: 'Standard-Timer global konfigurierbar in der Game-Config (Standard: 45 Sek.)' },
			{ type: 'change', text: 'Chaos Wheel: Timer wird für das Glücksrad deaktiviert' },
			{ type: 'fix', text: 'Game-Config: Chaoswheel option verhindert nun nicht mehr das veröffentlichen von Spielen.' },
			{ type: 'fix', text: 'Scoreboard: Punkte-Badge optisch gefixed' },
			{ type: 'fix', text: 'Scoreboard visibility fix' },
			{ type: 'fix', text: 'Timer-Sekunden verschwinden nun nicht mehr nach dem speichern' },
			{ type: 'fix', text: 'Globaler Timer wurde im Spiel ignoriert da eigener Wert wurde nicht übernommen wurde.' },
		],
	},
	{
		version: '0.5',
		date: '02.04.2026',
		changes: [
			{ type: 'new', text: 'Chaos Wheel — Glücksrad mit zufälligen Effekten (Doppelte Punkte, Tausch, Aussetzen …)' },
			{ type: 'new', text: 'Hangman-Minigame in der Chaos Category' },
			{ type: 'new', text: 'Wordle-Minigame in der Chaos Category' },
			{ type: 'new', text: 'Scoreboard-Animation: Counter zählt hoch/runter + Punkte-Badge' },
			{ type: 'new', text: '3 Runden wählbar (Kurz / Normal / Lang)' },
			{ type: 'change', text: 'Chaos Category: volle Minuspunkte bei falscher Antwort' },
			{ type: 'change', text: 'Chaos Category: neues Design als breite Sektion unter dem Board' },
			{ type: 'change', text: 'Gameboard: Rework der Topbar mit Rundenanzeige, Aktivem Spieler und Gamemaster Buttons' },
			{ type: 'fix', text: 'Timer resettet sich nicht mehr beim Tippen im Wordle' },
			{ type: 'fix', text: 'Board 3 Inhalt wird wieder korrekt im Game Editor angezeigt' },
		],
	},
	{
		version: '0.4.3',
		date: '01.04.2026',
		changes: [
			{ type: 'new', text: 'Validierungs Indikatoren für Publizierung im Game Editor.' },
			{ type: 'new', text: 'Demo-Spiel vorerst spielbar.' },
			{ type: 'fix', text: 'Lösungsseite auf 1–3 Runden angepasst' },
			{ type: 'fix', text: 'Board 3 wird nach Speichern korrekt geladen' },
			{ type: 'fix', text: 'boardCount wird nun korrekt in der Datenbank gespeichert' },
		],
	},
	{
		version: '0.4.2',
		date: '01.04.2026',
		changes: [
			{ type: 'new', text: 'Hardgecodetes Demo-Spiel mit 3 Boards, Chaos Category (DE+EN)' },
			{ type: 'new', text: 'Demo-Spiel in der Sidebar als Read-Only Vorschau' },
			{ type: 'change', text: 'Alle Fragen im Game Editor standardmäßig zugeklappt' },
		],
	},
];
