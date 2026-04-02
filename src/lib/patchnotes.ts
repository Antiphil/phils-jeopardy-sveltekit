export type PatchNote = {
	version: string;
	date: string;
	changes: { type: 'new' | 'fix' | 'change'; text: string }[];
};

export const PATCHNOTES: PatchNote[] = [
	{
		version: '0.9',
		date: '02.04.2026',
		changes: [
			{ type: 'new', text: 'Patchnotes-Button auf der Startseite' },
			{ type: 'new', text: 'Versionsnummer im Logo (pulsiert mit dem Logo mit)' },
			{ type: 'new', text: 'GitHub-Icon im Footer verlinkt auf das Repository' },
			{ type: 'new', text: 'Scoreboard immer im Vordergrund — auch während einer Frage sichtbar' },
			{ type: 'new', text: 'Standard-Timer global konfigurierbar in der Game-Config (Standard: 45 Sek.)' },
			{ type: 'change', text: 'Chaos Wheel: Timer wird für das Glücksrad deaktiviert' },
			{ type: 'change', text: 'Game-Config: ausgefüllte Chaos-Wheel-Felder zählen zur Veröffentlichungs-Bereitschaft' },
			{ type: 'change', text: 'Scoreboard: Delta-Badge absolut mittig über der Karte positioniert, beeinflusst Breite nicht mehr' },
			{ type: 'change', text: 'Spielboard-Topbar: Breite passt zum Board, mehr Abstand nach unten' },
			{ type: 'fix', text: 'Timer-Sekunden verschwanden nach dem Speichern (fehlende DB-Spalte)' },
			{ type: 'fix', text: 'Globaler Timer wurde im Spiel ignoriert — eigener Wert wurde nicht übernommen' },
		],
	},
	{
		version: '0.8',
		date: '02.04.2026',
		changes: [
			{ type: 'new', text: 'Chaos Wheel — Glücksrad mit zufälligen Effekten (Doppelte Punkte, Tausch, Aussetzen …)' },
			{ type: 'new', text: 'Hangman-Minigame in der Chaos Category' },
			{ type: 'new', text: 'Wordle-Minigame in der Chaos Category' },
			{ type: 'new', text: 'Scoreboard-Animation: Counter zählt hoch/runter, Delta-Badge fliegt auf' },
			{ type: 'new', text: '3 Runden wählbar (Kurz / Normal / Lang)' },
			{ type: 'change', text: 'Chaos Category: volle Minuspunkte bei falscher Antwort' },
			{ type: 'change', text: 'Chaos Category: neues Design als breite Sektion unter dem Board' },
			{ type: 'change', text: 'Spielboard: Rundenanzeige statt klickbarer Tabs, Wer-dran-ist mittig' },
			{ type: 'fix', text: 'Timer resettet sich nicht mehr beim Tippen im Wordle' },
			{ type: 'fix', text: 'Board 3 Inhalt wird wieder korrekt in der Game-Config angezeigt' },
		],
	},
	{
		version: '0.7',
		date: '01.04.2026',
		changes: [
			{ type: 'new', text: 'Per-Frage Timer in der Chaos Category mit Auto-Timeout' },
			{ type: 'new', text: 'Visuelle Fertig-Indikatoren in der Game-Config (grüner Rand wenn ausgefüllt)' },
			{ type: 'new', text: 'Demo-Spiel spielbar über die Startseite' },
			{ type: 'new', text: 'Lösungsseite auf 1–3 Runden angepasst' },
			{ type: 'fix', text: 'Board 3 wird nach Speichern korrekt geladen (leeres Array Bug)' },
			{ type: 'fix', text: 'boardCount wird korrekt in der Datenbank gespeichert' },
		],
	},
	{
		version: '0.6',
		date: '01.04.2026',
		changes: [
			{ type: 'new', text: 'Hardgecodetes Demo-Spiel mit 3 Boards, Chaos Category (DE+EN)' },
			{ type: 'new', text: 'Demo-Spiel in der Sidebar als Read-Only Vorschau' },
			{ type: 'new', text: 'Alle Fragen in der Game-Config standardmäßig zugeklappt' },
		],
	},
];
