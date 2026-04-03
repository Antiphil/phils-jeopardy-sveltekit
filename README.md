<div align="center">
  <img src="src/lib/assets/logo.png" alt="Phil's Jeopardy" width="420" />

  <br/>
  <br/>

  **Play live: [jeopardy.homephil.de](https://www.jeopardy.homephil.de)**

  <br/>

  ![SvelteKit](https://img.shields.io/badge/SvelteKit-2.x-FF3E00?logo=svelte&logoColor=white)
  ![Svelte](https://img.shields.io/badge/Svelte-5_Runes-FF3E00?logo=svelte&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?logo=postgresql&logoColor=white)
  ![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white)
  ![License](https://img.shields.io/badge/license-UNLICENSED-lightgrey)
</div>

---

A self-hosted, fully customizable Jeopardy app for game nights — built with SvelteKit 5, PostgreSQL, and Discord login. Create custom question boards, run live rounds with friends, and spice things up with the Chaos Category mini-games.

---

## Features

### Game
- **Up to 3 rounds** — each with 6 categories and 5 questions (100–2000 pts)
- **Players & Teams** — solo or team mode with avatars and color-coded assignment
- **Live scoreboard** — animated score delta badges and rank tracking
- **Session persistence** — games are saved to the DB and can be resumed (max. 2 per account)
- **Game results** — podium, per-player statistics, and confetti

### Chaos Category
A special category where each question is a different mini-game:

| Type | Description |
|---|---|
| ❓ Free Question | Standard Jeopardy question |
| 🟩 Wordle | Guess the hidden word letter by letter |
| 🪢 Hangman | Classic hangman with a configurable word |
| 🎡 Chaos Wheel | Spin the wheel — random point modifiers |
| 🔍 Spot the Diff | Find the wrong tile in a 10×5 image grid |

### Editor
- **Game config UI** — create, edit, publish, and delete games
- **Multi-language support** — questions in German and English
- **Per-question timer** — optional countdown with custom duration (5–300 s)
- **Image support** — attach images to questions via URL
- **Input validation** — client- and server-side checks for all fields
- **Public games** — admins can publish games for all users

### Tech & Infrastructure
- **Toast notifications** — success, error, info with auto-dismiss
- **Rate limiting** — 1 rating per IP per game per day (in-memory)
- **Custom error pages** — branded 404 / 401 / 403 / 500
- **Docker + Cloudflare Tunnel** — one-command self-hosting on any machine including Raspberry Pi
- **Discord OAuth** — login via Discord (Google prepared)

---

## Tech Stack

| Area | Technology |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (Runes) |
| Language | TypeScript |
| Database | PostgreSQL · Drizzle ORM |
| Auth | Auth.js v1 (Discord OAuth) |
| Styling | Scoped CSS + Tailwind CSS v4 |
| Deployment | Docker · adapter-node |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Discord OAuth App → [Discord Developer Portal](https://discord.com/developers/applications)

### 1. Clone & install

```bash
git clone https://github.com/AntiPhil/phils-jeopardy-sveltekit.git
cd phils-jeopardy-sveltekit
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random secret, min. 32 chars (`openssl rand -base64 32`) |
| `AUTH_DISCORD_ID` | Discord application client ID |
| `AUTH_DISCORD_SECRET` | Discord application client secret |
| `AUTH_URL` | Public URL of the app (e.g. `https://your-domain.com`) |
| `ORIGIN` | Same as `AUTH_URL` — required for CSRF protection |
| `DATABASE_URL` | PostgreSQL connection string |

**Discord OAuth setup:**
1. [Discord Developer Portal](https://discord.com/developers/applications) → *New Application*
2. OAuth2 → copy Client ID & Client Secret into `.env`
3. Add redirect URI:
   - Dev: `http://localhost:5173/auth/callback/discord`
   - Prod: `https://your-domain.com/auth/callback/discord`

### 3. Push database schema

```bash
npm run db:push
```

### 4. Start dev server

```bash
npm run dev
```

---

## Deployment with Docker

The repository includes a production-ready `docker-compose.yml` with the app and PostgreSQL. The database schema is pushed automatically on every container start.

### 1. Fill in `.env`

Copy `.env.example` to `.env` and fill in all values including:
- `POSTGRES_PASSWORD` — password for the DB container
- `DATABASE_URL` — use `db` as the host: `postgresql://jeopardy:password@db:5432/phils_jeopardy`

### 2. Start everything

```bash
docker compose up -d --build
```

The app is now available at `http://<your-server-ip>:3000`.

### Updating

```bash
git pull
docker compose up -d --build
```

---

## Admin Setup

After first login, grant admin rights via SQL:

```sql
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

Admins can publish games so they appear for all users in the game selection screen.

---

## Adding Custom Spot-the-Diff Scenes

Place SVG files in `src/lib/assets/spot-diff/` following this naming convention:

```
SceneName_Original.svg    ← the correct image
SceneName_Fehler_1.svg    ← same image with one deliberate mistake
SceneName_Fehler_2.svg    ← optional second variant
```

The game automatically loads all scenes at build time via `import.meta.glob`.

---

## Project Structure

```
src/
├── lib/
│   ├── assets/
│   │   └── spot-diff/        # SVG scenes for Spot the Diff
│   ├── components/
│   │   ├── admin/            # CategoryEditor, QuestionEditor, GameListItem
│   │   └── comps/            # Navbar, GameSelect, PlayerSetup, QuestionModal,
│   │                         # Scoreboard, SpotTheDiff, Toaster, ...
│   ├── server/
│   │   ├── db.ts             # Drizzle instance
│   │   ├── schema.ts         # DB schema (users, saved_games, game_sessions, game_ratings)
│   │   └── rateLimit.ts      # In-memory rate limiter
│   ├── stores/
│   │   ├── game.ts           # Live game state + session persistence
│   │   ├── savedGames.ts     # API-backed store for saved games
│   │   └── toast.ts          # Toast notification store
│   └── sounds.ts             # Web Audio API (click, correct, wrong, victory)
└── routes/
    ├── api/
    │   ├── games/            # CRUD for saved games
    │   └── sessions/         # CRUD for game sessions
    ├── game/                 # Live game board
    ├── game-config/          # Game editor (authenticated)
    ├── how-to-play/          # Rules & mini-game guide
    ├── winner/               # Results & rating
    ├── sitemap.xml/          # Dynamic sitemap
    └── +error.svelte         # Branded error page
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run check` | TypeScript + Svelte type check |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Drizzle migration files |

---

## License

Private project — all rights reserved.
