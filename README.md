<div align="center">
  <img src="src/lib/assets/logo.png" alt="Phils Jeopardy" width="420" />

  <br/>
  <br/>

  **Play live: [antiphil.de](https://www.antiphil.de)**

  <br/>
</div>

A self-hosted, fully customizable Jeopardy app for game nights — built with SvelteKit, PostgreSQL, and Discord login.

![SvelteKit](https://img.shields.io/badge/SvelteKit-2.x-FF3E00?logo=svelte&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?logo=postgresql&logoColor=white)
![Auth.js](https://img.shields.io/badge/Auth.js-v1-black)

---

## Features

- **Create custom games** — 2 rounds with 6 categories each and up to 5 questions per category, plus an optional Chaos Category
- **Images via URL** — enrich questions with images; the image source is automatically displayed as a clickable domain label
- **Players & Teams** — solo player or team mode with customizable colors and avatars
- **Public games** — admins can make games available to all users
- **Session persistence** — ongoing games are saved to the database and can be resumed (max. 2 active sessions per account)
- **Game results** — podium, statistics, player details, and confetti animation
- **Discord OAuth** — login via Discord, Google login prepared
- **Sound feedback** — click, correct, wrong, and victory sounds via Web Audio API
- **Self-hosting ready** — Docker image and Raspberry Pi support

---

## Tech Stack

| Area | Technology |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (Runes) |
| Language | TypeScript |
| Database | PostgreSQL via Drizzle ORM |
| Auth | Auth.js v1 (Discord OAuth) |
| Styling | Scoped CSS + Tailwind CSS |
| Deployment | Docker / Node.js Adapter |

---

## Prerequisites

- Node.js 22+
- PostgreSQL database
- Discord OAuth App ([Discord Developer Portal](https://discord.com/developers/applications))

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/phils-jeopardy.git
cd phils-jeopardy
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Auth.js Secret (at least 32 characters)
# Generate: openssl rand -base64 32
AUTH_SECRET=ENTER_YOUR_SECRET_KEY_HERE

# Discord OAuth
AUTH_DISCORD_ID=DISCORD_CLIENT_ID
AUTH_DISCORD_SECRET=DISCORD_CLIENT_SECRET

# Public URL (required in production)
AUTH_URL=https://your-domain.com

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/phils_jeopardy
```

**Set up Discord OAuth:**
1. [Discord Developer Portal](https://discord.com/developers/applications) → *New Application*
2. OAuth2 → copy Client ID & Client Secret
3. Add Redirect URI:
   - Local: `http://localhost:5173/auth/callback/discord`
   - Production: `https://your-domain.com/auth/callback/discord`

### 3. Set up the database

```bash
npm run db:push
```

### 4. Start the development server

```bash
npm run dev
```

---

## Admin Account

After the first login, an account can be set as admin in the database:

```sql
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

Admins can make games public so they appear for all users in the game selection.

---

## Deployment with Docker

### Build and run the image

```bash
docker build -t phils-jeopardy .
docker run -p 3000:3000 \
  -e AUTH_SECRET=... \
  -e AUTH_DISCORD_ID=... \
  -e AUTH_DISCORD_SECRET=... \
  -e AUTH_URL=https://your-domain.com \
  -e DATABASE_URL=postgresql://... \
  phils-jeopardy
```

### Docker Compose (recommended)

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

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── admin/          # CategoryEditor, QuestionEditor
│   │   └── comps/          # Navbar, GameSelect, PlayerSetup, QuestionModal, ...
│   ├── server/
│   │   ├── db.ts           # Drizzle instance
│   │   └── schema.ts       # DB schema (users, saved_games, game_sessions)
│   ├── stores/
│   │   ├── game.ts         # Game state + session persistence
│   │   └── savedGames.ts   # API-backed store for saved games
│   └── sounds.ts           # Web Audio API sounds
├── routes/
│   ├── api/                # REST endpoints (games, sessions)
│   ├── game/               # Game board
│   ├── game-config/        # Game management (admin)
│   ├── winner/             # Results & statistics
│   └── ...
└── auth.ts                 # Auth.js configuration
```

---

## License

Private project — no public licensing.
