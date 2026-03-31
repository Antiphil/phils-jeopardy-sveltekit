<script lang="ts">
	import PlayerSetup from '$lib/components/comps/PlayerSetup.svelte';
	import GameSelect from '$lib/components/comps/GameSelect.svelte';
	import { gameStore } from '$lib/stores/game';
	import type { GameState } from '$lib/stores/game';
	import { goto } from '$app/navigation';
	import type { Player, Team } from '$lib/stores/game';
	import type { SavedGame } from '$lib/stores/savedGames';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import logo from '$lib/assets/logo.png'

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
			goto('/game');
		} catch (e) {
			if ((e as Error).message === 'MAX_SESSIONS') {
				maxSessionsError = true;
				step = 'closed';
			}
		}
	}

	function resumeSession(session: SessionInfo) {
		gameStore.resume(session.state, session.id);
		goto('/game');
	}

	async function discardSession(id: string) {
		await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
		sessions = sessions.filter((s) => s.id !== id);
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

{#if step === 'players'}
	<PlayerSetup onclose={() => (step = 'closed')} onstart={onPlayersReady} />
{:else if step === 'game'}
	<GameSelect
		players={pendingPlayers}
		teams={pendingTeams}
		publicGames={data.publicGames}
		loggedIn={!!$page.data.session?.user}
		onback={() => (step = 'players')}
		onstart={onGameSelected}
	/>
{/if}

<div class="home">
	<div class="hero">
		<div class="logo-wrapper">
			<img id="logo" src={logo} alt="logo">
		</div>
		<div class="resume-cards">
			{#each sessions as session (session.id)}
				{@const summary = getSessionSummary(session)}
				<div class="resume-card">
					<div class="resume-header">
						<span class="resume-icon">⏸️</span>
						<span class="resume-title">Laufendes Spiel</span>
					</div>
					<div class="resume-info">
						<span class="resume-players">{summary.names.join(' · ')}</span>
						<span class="resume-progress"
							>Runde {summary.board} · {summary.answeredCount}/{summary.totalCount}
							Fragen gespielt</span
						>
						{#if summary.topScorer}
							<span class="resume-leader"
								>Führend: {summary.topScorer.name} ({summary.topScorer.pts} Pkt.)</span
							>
						{/if}
					</div>
					<div class="resume-actions">
						<button class="btn-resume" onclick={() => resumeSession(session)}>▶ Weiterspielen</button>
						<button class="btn-discard" onclick={() => discardSession(session.id)}>✕ Verwerfen</button>
					</div>
				</div>
			{/each}
		</div>

		{#if maxSessionsError}
			<div class="sessions-error">
				Du hast bereits 2 aktive Sessions. Bitte beende zuerst eine.
			</div>
		{/if}

		<div class="hero-actions">
			<button class="btn-primary" onclick={() => (step = 'players')}>▶ Neues Spiel</button>
			<a class="btn-outline" href="/how-to-play">⚙ How to Play</a>
		</div>
	</div>
</div>

<style>
	.logo-wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	padding: clamp(1rem, 3vw, 3rem);
	box-sizing: border-box;
	
	}

	.logo-wrapper img {
	width: min(90vw, 700px);
	height: auto;
	max-width: 100%;
	display: block;
	animation: logoPulse 2.8s ease-in-out infinite;
	transform-origin: center;
	position: relative;
	}
		.logo-wrapper img::before {
		content: '';
		position: absolute;
		inset: -16px -24px;
		border-radius: 999px;
		background: radial-gradient(ellipse, rgba(216, 100, 255, 0.9) 0%, rgba(217, 70, 239, 0.55) 40%, transparent 72%);
		filter: blur(18px);
		animation: glowPulse 2.8s ease-in-out infinite;
		pointer-events: none;
		z-index: -1;
	}

	@keyframes logoPulse {
	0%,
	100% {
		transform: scale(1);
	}

	50% {
		transform: scale(1.04);
	}
	}
	@keyframes glowPulse {
		0%, 100% { opacity: 0.5; transform: scale(0.9); }
		50%       { opacity: 1;   transform: scale(1.15); }
	}
	.home {
		min-height: calc(100vh - 70px);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
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

	.hero-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn-primary {
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 1.2rem;
		padding: 0.75rem 2.5rem;
		border-radius: 999px;
		border: none;
		cursor: pointer;
		box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
		transition:
			transform 0.15s,
			box-shadow 0.15s;
	}

	.btn-primary:hover {
		transform: translateY(-2px) scale(1.03);
		box-shadow: 0 6px 20px rgba(217, 70, 239, 0.5);
	}

	.btn-primary:active {
		transform: translateY(0) scale(0.98);
	}

	.btn-outline {
		background: transparent;
		border: 2px solid #5b21b6;
		color: #c084fc;
		font-family: 'Fredoka One', cursive;
		font-size: 1.1rem;
		padding: 0.6rem 1.8rem;
		border-radius: 999px;
		cursor: pointer;
		transition:
			border-color 0.15s,
			color 0.15s,
			box-shadow 0.15s;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
	}

	.btn-outline:hover {
		border-color: #a855f7;
		color: #f0abfc;
		box-shadow: 0 0 12px rgba(168, 85, 247, 0.3);
	}

	/* ── Resume cards ───────────────────────────────────── */
	.resume-cards {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
		width: 100%;
		margin-bottom: 2rem;
	}

	.resume-card {
		background: #1e0d38;
		border: 2px solid #a855f7;
		border-radius: 1.5rem;
		padding: 1.25rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
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
		font-size: 1.2rem;
	}

	.resume-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1.1rem;
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
		font-size: 0.95rem;
		color: #e2d0ff;
	}

	.resume-progress {
		font-size: 0.8rem;
		color: #7c5faa;
		font-weight: 600;
	}

	.resume-leader {
		font-size: 0.8rem;
		color: #fbbf24;
		font-weight: 700;
	}

	.resume-actions {
		display: flex;
		gap: 0.75rem;
	}

	.btn-resume {
		flex: 1;
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		padding: 0.55rem 1rem;
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
		font-size: 0.85rem;
		padding: 0.5rem 1rem;
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
