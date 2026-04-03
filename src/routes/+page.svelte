<script lang="ts">
	import PlayerSetup from '$lib/components/comps/PlayerSetup.svelte';
	import GameSelect from '$lib/components/comps/GameSelect.svelte';
	import { gameTransition } from '$lib/stores/gameTransition';
	import { gameStore } from '$lib/stores/game';
	import type { GameState } from '$lib/stores/game';
	import { goto } from '$app/navigation';
	import type { Player, Team } from '$lib/stores/game';
	import type { SavedGame } from '$lib/stores/savedGames';
	import { DEMO_GAME, DEMO_GAME_PLAYABLE } from '$lib/demoGame';
	import { PATCHNOTES } from '$lib/patchnotes';
	import { toast } from '$lib/stores/toast';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import logo from '$lib/assets/logo.png';
	import { t } from '$lib/i18n';

	let showPatchnotes = $state(false);
	let menuView: 'main' | 'host' | 'join' = $state('main');
	let roomCode = $state('');

	let { data }: { data: PageData } = $props();

	type SessionInfo = { id: string; state: GameState; updatedAt: string };

	type Step = 'closed' | 'players' | 'game';
	let step: Step = $state('closed');
	let pendingPlayers: Player[] = $state([]);
	let pendingTeams: Team[] | null = $state(null);
	let maxSessionsError = $state(false);

	let sessions = $state<SessionInfo[]>(data.gameSessions);
	$effect(() => { sessions = data.gameSessions; });

	function onPlayersReady(players: Player[], teams: Team[] | null) {
		pendingPlayers = players;
		pendingTeams = teams;
		step = 'game';
	}

	async function onGameSelected(game: SavedGame | null) {
		try {
			await gameStore.start(pendingPlayers, pendingTeams, game);
			step = 'closed';
			gameTransition.set(true);
			goto('/game');
		} catch (e) {
			if ((e as Error).message === 'MAX_SESSIONS') {
				step = 'closed';
				triggerMaxSessionsError();
			}
		}
	}

	function resumeSession(session: SessionInfo) {
		gameStore.resume(session.state, session.id);
		gameTransition.set(true);
		goto('/game');
	}

	async function discardSession(id: string) {
		try {
			const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error();
			sessions = sessions.filter((s) => s.id !== id);
			maxSessionsError = false;
		} catch {
			toast.error('Session konnte nicht gelöscht werden.');
		}
	}

	let resumeCardsEl: HTMLDivElement | undefined = $state();

	function triggerMaxSessionsError() {
		maxSessionsError = true;
		setTimeout(() => resumeCardsEl?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
	}

	function getSessionSummary(s: SessionInfo) {
		const gs = s.state;
		const names = gs.teams
			? gs.teams.map((t) => t.name)
			: gs.players.map((p) => `${p.avatar} ${p.name}`);
		const answeredCount = Object.keys(gs.answered).length;
		const totalCount =
			gs.board1Categories.flatMap((c) => c.questions).length +
			gs.board2Categories.flatMap((c) => c.questions).length +
			(gs.chaosEnabled ? gs.chaosCategory.questions.length : 0);
		const entries = Object.entries(gs.scores) as [string, number][];
		const topScorer = entries.length
			? (() => {
					const [id, pts] = [...entries].sort((a, b) => b[1] - a[1])[0];
					const scorerId = Number(id);
					const name = gs.teams
						? (gs.teams.find((t) => t.id === scorerId)?.name ?? '?')
						: (gs.players.find((p) => p.id === scorerId)?.name ?? '?');
					return { name, pts };
				})()
			: null;
		return { names, answeredCount, totalCount, topScorer, board: gs.currentBoard };
	}
</script>

<svelte:head>
	<title>Phil's Jeopardy – Spiele mit Freunden</title>
	<meta name="description" content="Starte eine Jeopardy-Runde mit deinen Freunden. Wähle ein Spiel, lege Spieler oder Teams fest und los geht's!" />
	<meta property="og:title" content="Phil's Jeopardy – Spiele mit Freunden" />
	<meta property="og:description" content="Starte eine Jeopardy-Runde mit deinen Freunden. Wähle ein Spiel, lege Spieler oder Teams fest und los geht's!" />
</svelte:head>

{#if step === 'players'}
	<PlayerSetup onclose={() => (step = 'closed')} onstart={onPlayersReady} />
{:else if step === 'game'}
	<GameSelect
		players={pendingPlayers}
		teams={pendingTeams}
		publicGames={data.publicGames}
		loggedIn={!!$page.data.session?.user}
		demoGame={DEMO_GAME_PLAYABLE ? DEMO_GAME : undefined}
		onback={() => (step = 'players')}
		onstart={onGameSelected}
	/>
{/if}


<div class="home">
	<div class="hero">
		<div class="logo-wrapper">
			<div class="logo-inner">
				<img id="logo" src={logo} alt="logo">
				<span class="version-tag">version {PATCHNOTES[0].version}</span>
			</div>
		</div>
		<div class="resume-cards" bind:this={resumeCardsEl}>
			{#each sessions as session (session.id)}
				{@const summary = getSessionSummary(session)}
				<div class="resume-card" class:limit-reached={maxSessionsError}>
					<div class="resume-header">
						<span class="resume-icon">⏸️</span>
						<span class="resume-title">{$t.home.runningGame}</span>
						{#if maxSessionsError}
							<span class="limit-hint">← Beende dieses Spiel</span>
						{/if}
					</div>
					<div class="resume-info">
						<span class="resume-players">{summary.names.join(' · ')}</span>
						<span class="resume-progress"
							>{$t.home.round} {summary.board} · {summary.answeredCount}/{summary.totalCount}
							{$t.home.questionsPlayed}</span
						>
						{#if summary.topScorer}
							<span class="resume-leader"
								>{$t.home.leading} {summary.topScorer.name} ({summary.topScorer.pts} Pkt.)</span
							>
						{/if}
					</div>
					<div class="resume-actions">
						<button class="btn-resume" onclick={() => resumeSession(session)}>{$t.home.resume}</button>
						<button class="btn-discard" class:btn-discard-urgent={maxSessionsError} onclick={() => discardSession(session.id)}>{$t.home.discard}</button>
					</div>
				</div>
			{/each}
		</div>

		{#if maxSessionsError}
			<div class="sessions-error">
				{$t.home.maxSessions}
			</div>
		{/if}

		<div class="menu-box">

			{#if menuView === 'main'}
				<div class="menu-view">

					<!-- PRIMARY ACTIONS -->
					<div class="primary-actions">
						<button class="cta-host" onclick={() => menuView = 'host'}>
							<div class="cta-glow"></div>
							<span class="cta-icon">🎮</span>
							<div class="cta-body">
								<span class="cta-label">Hosten</span>
								<span class="cta-sub">Runde erstellen</span>
							</div>
							<span class="cta-chevron">›</span>
						</button>

						<button class="cta-join" onclick={() => menuView = 'join'}>
							<div class="cta-glow cta-glow-blue"></div>
							<span class="cta-icon">🔗</span>
							<div class="cta-body">
								<span class="cta-label">Beitreten</span>
								<span class="cta-sub">Raum betreten</span>
							</div>
							<span class="cta-chevron">›</span>
						</button>
					</div>

					<!-- SECONDARY -->
					<div class="secondary-actions">
						<a class="sec-btn" href="/how-to-play">
							<span class="sec-icon">📖</span>
							<span>Spielanleitung</span>
						</a>
						<div class="sec-divider"></div>
						<button class="sec-btn" onclick={() => (showPatchnotes = true)}>
							<span class="sec-icon">📋</span>
							<span>Patchnotes</span>
						</button>
						<div class="sec-divider"></div>
						<button class="sec-btn sec-btn-disabled" disabled>
							<span class="sec-icon">📷</span>
							<span>QR Code scannen</span>
						</button>
						<!-- weitere Menüpunkte hier einfügen -->
					</div>

				</div>

			{:else if menuView === 'host'}
				<div class="menu-view">

					<div class="sub-header">
						<button class="back-btn" onclick={() => menuView = 'main'}>‹</button>
						<span class="sub-title">Spielmodus wählen</span>
					</div>

					<div class="mode-list">
						<button class="mode-card mode-gm" onclick={() => { menuView = 'main'; step = 'players'; }}>
							<div class="mode-card-glow"></div>
							<span class="mode-card-icon">🖥️</span>
							<div class="mode-card-body">
								<span class="mode-card-name">Gamemaster Mode</span>
								<span class="mode-card-desc">Ein Bildschirm für alle — perfekt für Game Nights</span>
							</div>
							<span class="mode-card-arrow">›</span>
						</button>

						<button class="mode-card mode-online" disabled>
							<span class="mode-card-icon mode-icon-dim">🌐</span>
							<div class="mode-card-body">
								<span class="mode-card-name mode-name-dim">Online Mode</span>
								<span class="mode-card-desc mode-desc-dim">Jeder spielt auf seinem eigenen Gerät</span>
							</div>
							<span class="coming-soon-pill">Bald</span>
						</button>
					</div>

				</div>

			{:else if menuView === 'join'}
				<div class="menu-view">

					<div class="sub-header">
						<button class="back-btn" onclick={() => menuView = 'main'}>‹</button>
						<span class="sub-title">Raum beitreten</span>
					</div>

					<div class="join-body">
						<div class="join-code-wrap">
							<input
								class="join-code-input"
								type="text"
								placeholder="RAUMCODE"
								maxlength={8}
								bind:value={roomCode}
								disabled
							/>
							<button class="join-go" disabled>Los →</button>
						</div>
						<p class="join-note">
							🚧 Online Mode ist in Entwicklung.<br/>Raumcodes werden dann hier funktionieren.
						</p>
					</div>

				</div>
			{/if}

		</div>
	</div>
</div>

{#if showPatchnotes}
	<div class="pn-backdrop" role="button" tabindex="-1" onmousedown={(e) => { if (e.target === e.currentTarget) showPatchnotes = false; }} onkeydown={() => {}}>
		<div class="pn-modal" role="dialog" aria-modal="true">
			<div class="pn-header">
				<span class="pn-title">📋 Patchnotes</span>
				<button class="pn-close" onclick={() => (showPatchnotes = false)}>✕</button>
			</div>
			<div class="pn-body">
				{#each PATCHNOTES as patch}
					<div class="pn-version">
						<div class="pn-version-header">
							<span class="pn-ver-badge">v{patch.version}</span>
							<span class="pn-ver-date">{patch.date}</span>
						</div>
						<ul class="pn-list">
							{#each patch.changes as c}
								<li class="pn-item pn-{c.type}">
									<span class="pn-type-icon">{c.type === 'new' ? '✨' : c.type === 'fix' ? '🐛' : '⚡'}</span>
									{c.text}
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}


<style>
	.logo-wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	padding: clamp(0.4rem, 1.5vw, 1.5rem);
	box-sizing: border-box;
	position: relative; /* wichtig für das ::before */
	}

	.logo-wrapper::before {
	content: '';
	position: absolute;
	width: calc(30% + 48px);
	height: calc(82% + 32px);
	transform: translate(-50%, -50%);
	border-radius: 999px;
	background: radial-gradient(
		ellipse,
		rgba(216, 100, 255, 0.9) 0%,
		rgba(217, 70, 239, 0.55) 40%,
		transparent 72%
	);
	filter: blur(18px);
	animation: glowPulse 2.8s ease-in-out infinite;
	pointer-events: none;
	z-index: -1;
	}

	.logo-inner {
		position: relative;
		width: fit-content;
		display: flex;
	}

	.version-tag {
		position: absolute;
		bottom: 12%;
		right: 6%;
		animation: versionPulse 2.8s ease-in-out infinite;
		transform-origin: center;
		font-family: 'Fredoka One', cursive;
		font-size: clamp(0.85rem, 1.8vw, 1.15rem);
		background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.5));
		pointer-events: none;
		user-select: none;
		letter-spacing: 0.03em;
	}

	.logo-wrapper img {
	width: min(46vw, 530px);
	height: auto;
	max-width: 100%;
	display: block;
	animation: logoPulse 2.8s ease-in-out infinite;
	transform-origin: center;
	position: relative;
	}

	@keyframes logoPulse {
	0%, 100% { transform: scale(1); }
	50% { transform: scale(1.01); }
	}

	@keyframes versionPulse {
	0%, 100% { transform: rotate(-30deg) scale(1); }
	50% { transform: rotate(-30deg) scale(1.14); }
	}

	@keyframes glowPulse {
	0%, 100% { opacity: 0.5; transform: scale(0.9); }
	50% { opacity: 1; transform: scale(1.10); }
	}
	.home {
		min-height: calc(100vh - 70px);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		text-align: center;
		position: relative;
		z-index: 1;
	}

	.hero {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		flex-direction: column;
		width: 100%;
	}

	.hero-title {
		font-family: 'Fredoka One', cursive;
		font-size: clamp(3rem, 8vw, 5.5rem);
		background: linear-gradient(135deg, #c084fc 0%, #f0abfc 50%, #fbbf24 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0 0 0.5rem;
		line-height: 1.1;
		filter: drop-shadow(0 0 30px rgba(192, 132, 252, 0.4));
	}

	.hero-sub {
		font-size: 1.2rem;
		color: #a78bca;
		margin: 0 0 2.5rem;
		font-weight: 600;
	}

	/* ── Menu box ───────────────────────────────────────── */
	.menu-box {
		width: 100%;
		max-width: 680px;
	}

	.menu-view {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		animation: view-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes view-in {
		from { opacity: 0; transform: scale(0.96) translateY(8px); }
		to   { opacity: 1; transform: scale(1) translateY(0); }
	}

	/* ── Primary CTA buttons ─────────────────────────── */
	.primary-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
	}

	.cta-host, .cta-join {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.9rem;
		padding: 1.5rem 1.25rem;
		border-radius: 1.1rem;
		border: none;
		cursor: pointer;
		text-align: left;
		width: 100%;
		overflow: hidden;
		transition: transform 0.18s, box-shadow 0.18s;
	}

	.cta-host {
		background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%);
		box-shadow: 0 4px 24px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.1);
	}

	.cta-join {
		background: linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #3b82f6 100%);
		box-shadow: 0 4px 24px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
	}

	.cta-host:hover {
		transform: translateY(-3px) scale(1.02);
		box-shadow: 0 8px 36px rgba(168,85,247,0.6), inset 0 1px 0 rgba(255,255,255,0.15);
	}

	.cta-join:hover {
		transform: translateY(-3px) scale(1.02);
		box-shadow: 0 8px 36px rgba(59,130,246,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
	}

	.cta-host:active, .cta-join:active { transform: translateY(-1px) scale(0.99); }

	/* Animated glow blob */
	.cta-glow {
		position: absolute;
		right: -20px;
		top: -20px;
		width: 100px;
		height: 100px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
		animation: glow-spin 4s ease-in-out infinite;
		pointer-events: none;
	}

	.cta-glow-blue {
		background: radial-gradient(circle, rgba(147,197,253,0.2) 0%, transparent 70%);
	}

	@keyframes glow-spin {
		0%, 100% { transform: scale(1) translate(0,0); }
		50%       { transform: scale(1.4) translate(-8px, 8px); }
	}

	.cta-icon {
		font-size: 2.2rem;
		line-height: 1;
		filter: drop-shadow(0 0 10px rgba(255,255,255,0.35));
	}

	.cta-body {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.cta-label {
		font-family: 'Fredoka One', cursive;
		font-size: 1.35rem;
		color: white;
		line-height: 1.1;
		text-shadow: 0 1px 4px rgba(0,0,0,0.3);
	}

	.cta-sub {
		font-size: 0.72rem;
		color: rgba(255,255,255,0.6);
		font-weight: 600;
	}

	.cta-chevron {
		font-size: 1.8rem;
		color: rgba(255,255,255,0.6);
		margin-left: auto;
		flex-shrink: 0;
		transition: transform 0.18s, color 0.18s;
	}

	.cta-host:hover .cta-chevron,
	.cta-join:hover .cta-chevron {
		transform: translateX(4px);
		color: white;
	}

	/* ── Secondary row ───────────────────────────────── */
	.secondary-actions {
		display: flex;
		flex-wrap: wrap;
		background: rgba(255,255,255,0.03);
		border: 1px solid rgba(255,255,255,0.06);
		border-radius: 0.9rem;
		overflow: hidden;
	}

	/* Every sec-btn takes equal space, min 2 per row */
	.sec-btn {
		flex: 1 1 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		padding: 0.65rem 0.5rem;
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		color: #7c5faa;
		background: transparent;
		border: none;
		cursor: pointer;
		text-decoration: none;
		transition: background 0.15s, color 0.15s;
		/* top border for items that wrap to a second row */
		border-top: 1px solid rgba(255,255,255,0.06);
	}

	.sec-btn { border-top: none; }

	.sec-btn:hover { background: rgba(168,85,247,0.1); color: #c084fc; }
	.sec-btn-disabled { opacity: 0.35; cursor: not-allowed; }
	.sec-btn-disabled:hover { background: transparent; color: #7c5faa; }

	.sec-icon { font-size: 1rem; }

	.sec-divider { width: 1px; background: rgba(255,255,255,0.06); flex-shrink: 0; align-self: stretch; }

	/* ── Sub-view header ─────────────────────────────── */
	.sub-header {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		margin-bottom: 0.2rem;
	}

	.back-btn {
		background: rgba(255,255,255,0.06);
		border: 1px solid rgba(255,255,255,0.1);
		color: #a78bca;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 1.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: background 0.15s, color 0.15s;
	}

	.back-btn:hover { background: rgba(168,85,247,0.2); color: white; }

	.sub-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #c084fc;
	}

	/* ── Mode cards (host view) ──────────────────────── */
	.mode-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mode-card {
		position: relative;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.1rem;
		border-radius: 1rem;
		border: 1.5px solid transparent;
		background: rgba(255,255,255,0.04);
		cursor: pointer;
		text-align: left;
		width: 100%;
		overflow: hidden;
		transition: border-color 0.18s, background 0.18s, transform 0.18s, box-shadow 0.18s;
	}

	.mode-gm { border-color: #5b21b6; }
	.mode-gm:hover {
		border-color: #a855f7;
		background: rgba(168,85,247,0.12);
		transform: translateY(-2px);
		box-shadow: 0 6px 24px rgba(168,85,247,0.25);
	}

	.mode-card-glow {
		position: absolute;
		left: 0; top: 0; bottom: 0;
		width: 3px;
		background: linear-gradient(to bottom, #a855f7, #d946ef);
		border-radius: 999px 0 0 999px;
	}

	.mode-online {
		border-color: rgba(255,255,255,0.06);
		cursor: not-allowed;
	}

	.mode-card-icon { font-size: 1.6rem; flex-shrink: 0; }
	.mode-icon-dim  { opacity: 0.3; }

	.mode-card-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.mode-card-name {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #e2d0ff;
	}

	.mode-name-dim  { color: #3d2460; }

	.mode-card-desc {
		font-size: 0.68rem;
		color: #6b47a0;
		font-weight: 600;
	}

	.mode-desc-dim  { color: #2d1a4a; }

	.mode-card-arrow {
		font-size: 1.4rem;
		color: #7c3aed;
		flex-shrink: 0;
		transition: transform 0.15s;
	}

	.mode-gm:hover .mode-card-arrow { transform: translateX(4px); color: #c084fc; }

	.coming-soon-pill {
		font-size: 0.6rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: #3d1a6e;
		background: #1a0d30;
		border: 1px solid #3d1a6e;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		flex-shrink: 0;
	}

	/* ── Join view ───────────────────────────────────── */
	.join-body {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.join-code-wrap {
		display: flex;
		gap: 0.5rem;
	}

	.join-code-input {
		flex: 1;
		background: rgba(255,255,255,0.04);
		border: 1.5px solid rgba(255,255,255,0.08);
		border-radius: 0.85rem;
		color: #4a2d7a;
		font-family: 'Fredoka One', cursive;
		font-size: 1.15rem;
		letter-spacing: 0.25em;
		text-align: center;
		padding: 0.65rem 1rem;
		outline: none;
		cursor: not-allowed;
	}

	.join-code-input::placeholder { color: #2d1a4a; }

	.join-go {
		background: rgba(255,255,255,0.04);
		border: 1.5px solid rgba(255,255,255,0.08);
		border-radius: 0.85rem;
		color: #3d1a6e;
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		padding: 0 1rem;
		cursor: not-allowed;
		white-space: nowrap;
	}

	.join-note {
		font-size: 0.72rem;
		color: #3d1a6e;
		font-weight: 600;
		text-align: center;
		margin: 0;
		line-height: 1.6;
		background: rgba(255,255,255,0.02);
		border: 1px dashed rgba(255,255,255,0.05);
		border-radius: 0.75rem;
		padding: 0.65rem 0.85rem;
	}

	/* ── Resume cards ───────────────────────────────────── */
	.resume-cards {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
		width: 100%;
		margin-bottom: 1rem;
	}

	.resume-card {
		background: #1e0d38;
		border: 2px solid #a855f7;
		border-radius: 1rem;
		padding: 0.65rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		max-width: 420px;
		width: 100%;
		box-shadow: 0 0 32px rgba(168, 85, 247, 0.2);
		animation: pop-in 0.3s ease-out;
	}

	@keyframes pop-in {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.resume-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.resume-icon {
		font-size: 1rem;
	}

	.resume-title {
		font-family: 'Fredoka One', cursive;
		font-size: 0.9rem;
		color: #c084fc;
	}

	.resume-info {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		text-align: left;
	}

	.resume-players {
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		color: #e2d0ff;
	}

	.resume-progress {
		font-size: 0.72rem;
		color: #7c5faa;
		font-weight: 600;
	}

	.resume-leader {
		font-size: 0.72rem;
		color: #fbbf24;
		font-weight: 700;
	}

	.resume-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-resume {
		flex: 1;
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		padding: 0.4rem 0.75rem;
		border-radius: 999px;
		border: none;
		cursor: pointer;
		box-shadow: 0 3px 12px rgba(168, 85, 247, 0.35);
		transition:
			transform 0.15s,
			box-shadow 0.15s;
	}

	.btn-resume:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 18px rgba(217, 70, 239, 0.5);
	}

	.btn-discard {
		background: transparent;
		border: 1.5px solid #3d1a6e;
		color: #6b47a0;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
		font-size: 0.78rem;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		cursor: pointer;
		transition:
			border-color 0.15s,
			color 0.15s;
	}

	.btn-discard:hover {
		border-color: #f87171;
		color: #f87171;
	}

	.resume-card.limit-reached {
		border-color: #f59e0b;
		box-shadow: 0 0 0 2px #f59e0b40, 0 0 32px rgba(245, 158, 11, 0.25);
		animation: pop-in 0.3s ease-out, limit-pulse 1.8s ease-in-out infinite;
	}

	@keyframes limit-pulse {
		0%, 100% { box-shadow: 0 0 0 2px #f59e0b40, 0 0 20px rgba(245, 158, 11, 0.2); }
		50%       { box-shadow: 0 0 0 3px #f59e0b80, 0 0 36px rgba(245, 158, 11, 0.4); }
	}

	.limit-hint {
		margin-left: auto;
		font-size: 0.72rem;
		font-weight: 800;
		color: #f59e0b;
		letter-spacing: 0.3px;
		white-space: nowrap;
	}

	.btn-discard-urgent {
		border-color: #f59e0b !important;
		color: #f59e0b !important;
		font-weight: 800;
	}

	.btn-discard-urgent:hover {
		border-color: #f87171 !important;
		color: #f87171 !important;
		background: rgba(248, 113, 113, 0.1);
	}


	/* ── Patchnotes modal ───────────────────────────────── */
	.pn-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(10, 4, 20, 0.82);
		backdrop-filter: blur(8px);
		z-index: 400;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.pn-modal {
		background: #1e0d38;
		border: 2px solid #5b21b6;
		border-radius: 1.5rem;
		width: 100%;
		max-width: 540px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 8px 48px rgba(168, 85, 247, 0.4);
		animation: pn-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes pn-pop {
		from { opacity: 0; transform: scale(0.92) translateY(12px); }
		to   { opacity: 1; transform: scale(1) translateY(0); }
	}

	.pn-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.1rem 1.5rem 0.85rem;
		border-bottom: 1px solid #2a1050;
		flex-shrink: 0;
	}

	.pn-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1.25rem;
		color: #e2d0ff;
	}

	.pn-close {
		background: #32155a;
		border: 1px solid #5b21b6;
		color: #a78bca;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 0.72rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s;
	}

	.pn-close:hover { background: #5b21b6; color: white; }

	.pn-body {
		overflow-y: auto;
		padding: 1rem 1.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.pn-version-header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.6rem;
	}

	.pn-ver-badge {
		font-family: 'Fredoka One', cursive;
		font-size: 0.95rem;
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		padding: 0.15rem 0.75rem;
		border-radius: 999px;
	}

	.pn-ver-date {
		font-size: 0.72rem;
		color: #4a2d7a;
		font-weight: 700;
	}

	.pn-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.pn-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-size: 0.83rem;
		line-height: 1.4;
		color: #c4b5fd;
	}

	.pn-type-icon { flex-shrink: 0; font-size: 0.85rem; margin-top: 0.05rem; }

	.pn-item.pn-new  { color: #c4b5fd; }
	.pn-item.pn-fix  { color: #86efac; }
	.pn-item.pn-change { color: #fde68a; }

	/* ── Sessions error ─────────────────────────────────── */
	.sessions-error {
		color: #f87171;
		font-size: 0.9rem;
		text-align: center;
		padding: 0.75rem;
		background: #3d1a6e40;
		border-radius: 0.75rem;
		border: 1px solid #f8717140;
		max-width: 420px;
		width: 100%;
		margin-bottom: 1.5rem;
	}
</style>
