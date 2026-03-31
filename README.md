<div align="center">
  <img src="src/lib/assets/logo.png" alt="Phils Jeopardy" width="420" />

  <br/>
  <br/>

  **Live spielen: [antiphil.de](https://www.antiphil.de)**

  <br/>
</div>

Eine selbst gehostete, vollständig anpassbare Jeopardy-App für Spieleabende — gebaut mit SvelteKit, PostgreSQL und Discord-Login.

![SvelteKit](https://img.shields.io/badge/SvelteKit-2.x-FF3E00?logo=svelte&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?logo=postgresql&logoColor=white)
![Auth.js](https://img.shields.io/badge/Auth.js-v1-black)

---

## Features

- **Eigene Spiele erstellen** — 2 Runden mit je 6 Kategorien und bis zu 5 Fragen pro Kategorie, plus optionale Chaos Category
- **Bilder per URL** — Fragen mit Bild anreichern; Bildquelle wird automatisch als klickbares Domain-Label angezeigt
- **Spieler & Teams** — Einzelspieler oder Teammodus mit anpassbaren Farben und Avataren
- **Öffentliche Spiele** — Admins können Spiele für alle Nutzer freigeben
- **Session-Persistenz** — laufende Spiele werden in der Datenbank gespeichert und können fortgesetzt werden (max. 2 aktive Sessions pro Account)
- **Spielauswertung** — Podium, Statistiken, Spieler-Details und Konfetti-Animation
- **Discord OAuth** — Login über Discord, Google-Login vorbereitet
- **Sound-Feedback** — Klick-, Richtig-, Falsch- und Sieges-Sounds via Web Audio API
- **Self-Hosting ready** — Docker-Image und Raspberry Pi Support

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (Runes) |
| Sprache | TypeScript |
| Datenbank | PostgreSQL via Drizzle ORM |
| Auth | Auth.js v1 (Discord OAuth) |
| Styling | Scoped CSS + Tailwind CSS |
| Deployment | Docker / Node.js Adapter |

---

## Voraussetzungen

- Node.js 22+
- PostgreSQL-Datenbank
- Discord OAuth App ([Discord Developer Portal](https://discord.com/developers/applications))

---

## Einrichtung

### 1. Repository klonen

```bash
git clone https://github.com/dein-nutzername/phils-jeopardy.git
cd phils-jeopardy
npm install
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
```

`.env` ausfüllen:

```env
# Auth.js Secret (mind. 32 Zeichen)
# Generieren: openssl rand -base64 32
AUTH_SECRET=HIER_GEHEIMEN_SCHLÜSSEL_EINTRAGEN

# Discord OAuth
AUTH_DISCORD_ID=DISCORD_CLIENT_ID
AUTH_DISCORD_SECRET=DISCORD_CLIENT_SECRET

# Öffentliche URL (in Produktion erforderlich)
AUTH_URL=https://deine-domain.de

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/phils_jeopardy
```

**Discord OAuth einrichten:**
1. [Discord Developer Portal](https://discord.com/developers/applications) → *New Application*
2. OAuth2 → Client ID & Client Secret kopieren
3. Redirect URI hinzufügen:
   - Lokal: `http://localhost:5173/auth/callback/discord`
   - Produktion: `https://deine-domain.de/auth/callback/discord`

### 3. Datenbank einrichten

```bash
npm run db:push
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

---

## Admin-Account

Nach dem ersten Login kann ein Account in der Datenbank als Admin gesetzt werden:

```sql
UPDATE users SET is_admin = true WHERE email = 'deine@email.de';
```

Admins können Spiele öffentlich schalten, sodass sie für alle Nutzer in der Spielauswahl erscheinen.

---

## Deployment mit Docker

### Image bauen und starten

```bash
docker build -t phils-jeopardy .
docker run -p 3000:3000 \
  -e AUTH_SECRET=... \
  -e AUTH_DISCORD_ID=... \
  -e AUTH_DISCORD_SECRET=... \
  -e AUTH_URL=https://deine-domain.de \
  -e DATABASE_URL=postgresql://... \
  phils-jeopardy
```

### Docker Compose (empfohlen)

```yaml
services:
  app:
    image: phils-jeopardy
    ports:
      - "3000:3000"
    environment:
      AUTH_SECRET: ${AUTH_SECRET}
      AUTH_DISCORD_ID: ${AUTH_DISCORD_ID}
      AUTH_DISCORD_SECRET: ${AUTH_DISCORD_SECRET}
      AUTH_URL: ${AUTH_URL}
      DATABASE_URL: ${DATABASE_URL}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: phils_jeopardy
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## Projektstruktur

```
src/
├── lib/
│   ├── components/
│   │   ├── admin/          # CategoryEditor, QuestionEditor
│   │   └── comps/          # Navbar, GameSelect, PlayerSetup, QuestionModal, ...
│   ├── server/
│   │   ├── db.ts           # Drizzle-Instanz
│   │   └── schema.ts       # DB-Schema (users, saved_games, game_sessions)
│   ├── stores/
│   │   ├── game.ts         # Spielzustand + Session-Persistenz
│   │   └── savedGames.ts   # API-backed Store für eigene Spiele
│   └── sounds.ts           # Web Audio API Sounds
├── routes/
│   ├── api/                # REST-Endpunkte (games, sessions)
│   ├── game/               # Spielboard
│   ├── game-config/        # Spielverwaltung (Admin)
│   ├── winner/             # Auswertung & Statistiken
│   └── ...
└── auth.ts                 # Auth.js Konfiguration
```

---

## Lizenz

Privates Projekt — kein öffentliches Licensing.
