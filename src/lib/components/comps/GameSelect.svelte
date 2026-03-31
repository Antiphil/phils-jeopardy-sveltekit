<script lang="ts">
	import { savedGamesStore, formatDate } from '$lib/stores/savedGames';
	import { t, locale } from '$lib/i18n';
	import type { SavedGame } from '$lib/stores/savedGames';
	import type { Player, Team } from '$lib/stores/game';

	let { players, teams, publicGames = [], loggedIn = false, onback, onstart }: {
		players: Player[];
		teams: Team[] | null;
		publicGames?: SavedGame[];
		loggedIn?: boolean;
		onback: () => void;
		onstart: (game: SavedGame | null) => void;
	} = $props();

	const filteredPublicGames = $derived(publicGames.filter((g) => !g.language || g.language === $locale));
	const publicIds = $derived(new Set(filteredPublicGames.map((g) => g.id)));
	let games = $derived($savedGamesStore.filter((g) => !publicIds.has(g.id)));
	let selectedId: string | null = $state(null);

	let selectedGame = $derived(
		games.find(g => g.id === selectedId) ?? filteredPublicGames.find(g => g.id === selectedId) ?? null
	);

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) onback();
	}
</script>

<div class="backdrop" role="button" tabindex="-1" onmousedown={handleBackdrop} onkeydown={() => {}}>
	<div class="modal" role="dialog" aria-modal="true">

		<!-- Header -->
		<div class="modal-header">
			<div>
				<div class="step-badge">{$t.gameSelect.step}</div>
				<h2 class="modal-title">{$t.gameSelect.title}</h2>
			</div>
			<button class="close-btn" onclick={onback} aria-label={$t.gameSelect.back}>✕</button>
		</div>

		<!-- Players summary -->
		<div class="players-summary">
			{#if teams}
				{#each teams as team}
					<span class="summary-chip" style={`border-color: ${team.color}60; color: ${team.color}`}>
						👥 {team.name}
					</span>
				{/each}
			{:else}
				{#each players as p}
					<span class="summary-chip">{p.avatar} {p.name}</span>
				{/each}
			{/if}
		</div>

		<div class="section-label">{$t.gameSelect.whichGame}</div>

		<!-- Game cards -->
		<div class="games-list">

			{#if filteredPublicGames.length > 0}
				<div class="section-divider">{$t.gameSelect.officialGames}</div>
				{#each filteredPublicGames as game (game.id)}
					<button
						class="game-card game-card-public"
						class:selected={selectedId === game.id}
						onclick={() => selectedId = game.id}
					>
						<div class="game-card-icon">🏆</div>
						<div class="game-card-info">
							<span class="game-card-name">{game.name}{#if game.language} <span class="game-lang">{game.language === 'de' ? '🇩🇪' : '🇬🇧'}</span>{/if}</span>
							
							<div class="game-card-cats">
								{#each game.board1.slice(0, 4) as cat}
									<span class="cat-pill">{cat.name}</span>
								{/each}
								{#if game.board1.length > 4}
									<span class="cat-pill muted">+{game.board1.length - 4}</span>
								{/if}
							</div>
						</div>
						{#if selectedId === game.id}
							<span class="check">✓</span>
						{/if}
					</button>
				{/each}
			{/if}

			{#if games.length > 0}
				<div class="section-divider">{$t.gameSelect.myGames}</div>
			{/if}

			{#if games.length === 0}
				<div class="no-games">
					{#if loggedIn}
						{$t.gameSelect.noGamesLoggedIn}<br/>
						<a href="/game-config">{$t.gameSelect.noGamesLoggedInLink}</a>
					{:else}
						{$t.gameSelect.noGamesLoggedOut}<br/>
						<a href="/auth/signin">{$t.gameSelect.noGamesLoggedOutLink}</a>
					{/if}
				</div>
			{:else}
				{#each games as game (game.id)}
					<button
						class="game-card"
						class:selected={selectedId === game.id}
						onclick={() => selectedId = game.id}
					>
						<div class="game-card-icon">🗂️</div>
						<div class="game-card-info">
							<span class="game-card-name">{game.name}{#if game.language} <span class="game-lang">{game.language === 'de' ? '🇩🇪' : '🇬🇧'}</span>{/if}</span>

							<div class="game-card-cats">
								{#each game.board1.slice(0, 4) as cat}
									<span class="cat-pill">{cat.name}</span>
								{/each}
								{#if game.board1.length > 4}
									<span class="cat-pill muted">+{game.board1.length - 4}</span>
								{/if}
							</div>
						</div>
						{#if selectedId === game.id}
							<span class="check">✓</span>
						{/if}
					</button>
				{/each}
			{/if}
		</div>

		<!-- Footer -->
		<div class="modal-footer">
			<button class="btn-back" onclick={onback}>{$t.gameSelect.back}</button>
			<button
				class="btn-start"
				disabled={selectedId === null}
				onclick={() => onstart(selectedGame)}
			>
				{$t.gameSelect.startGame}
			</button>
		</div>

	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 70px 0 0 0;
		background: rgba(10, 4, 20, 0.78);
		backdrop-filter: blur(6px);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal {
		background: #1e0d38;
		border: 2px solid #5b21b6;
		border-radius: 1.5rem;
		padding: 1.75rem;
		width: 100%;
		max-width: 500px;
		max-height: calc(100vh - 70px - 2rem);
		overflow-y: auto;
		box-shadow: 0 8px 48px rgba(168, 85, 247, 0.35);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.modal-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.step-badge {
		font-size: 0.7rem;
		font-weight: 800;
		color: #7c5faa;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-bottom: 0.25rem;
	}

	.modal-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1.6rem;
		background: linear-gradient(90deg, #c084fc, #f0abfc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0;
	}

	.close-btn {
		background: #32155a;
		border: 1px solid #5b21b6;
		color: #a78bca;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 0.8rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: background 0.15s, color 0.15s;
	}

	.close-btn:hover { background: #5b21b6; color: #f3e8ff; }

	.players-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.summary-chip {
		font-size: 0.8rem;
		font-weight: 700;
		background: #261040;
		border: 1px solid #5b21b6;
		border-radius: 999px;
		padding: 0.2rem 0.65rem;
		color: #c084fc;
	}

	.section-label {
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		color: #a78bca;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.games-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.game-card {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		background: #261040;
		border: 1.5px solid #3d1a6e;
		border-radius: 1rem;
		padding: 0.75rem 1rem;
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
	}

	.game-card:hover {
		border-color: #7c3aed;
		background: #2d1260;
	}

	.game-card.selected {
		border-color: #a855f7;
		background: #2d1260;
		box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
	}

	.game-card-icon {
		font-size: 1.8rem;
		flex-shrink: 0;
		width: 42px;
		height: 42px;
		background: #32155a;
		border-radius: 0.65rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.game-card-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.game-card-name {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #f3e8ff;
	}

	.game-lang {
		font-size: 0.85rem;
		vertical-align: middle;
	}

	.game-card-meta {
		font-size: 0.72rem;
		color: #7c5faa;
	}

	.game-card-cats {
		display: flex;
		gap: 0.3rem;
		margin-top: 0.2rem;
	}

	.cat-pill {
		font-size: 0.68rem;
		font-weight: 700;
		background: #3d1a6e40;
		border: 1px solid #5b21b650;
		border-radius: 999px;
		padding: 0.1rem 0.5rem;
		color: #a78bca;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 90px;
	}

	.cat-pill.muted { color: #5b2d8a; border-color: transparent; }

	.check {
		font-size: 1rem;
		color: #a855f7;
		font-weight: 900;
		flex-shrink: 0;
	}

	.no-games {
		text-align: center;
		color: #5b2d8a;
		font-size: 0.85rem;
		padding: 1rem;
		line-height: 1.7;
	}

	.no-games a {
		color: #a855f7;
		text-decoration: none;
		font-weight: 700;
	}

	.no-games a:hover { color: #c084fc; }

	.section-divider {
		font-size: 0.72rem;
		font-weight: 800;
		color: #7c5faa;
		text-transform: uppercase;
		letter-spacing: 1px;
		padding: 0.4rem 0.2rem 0.1rem;
	}

	.game-card-public {
		border-color: #854d0e40;
		background: #1a1208;
	}

	.game-card-public:hover {
		border-color: #a16207;
		background: #1e1609;
	}

	.game-card-public.selected {
		border-color: #fbbf24;
		background: #1e1609;
		box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.15);
	}

	.modal-footer {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 0.25rem;
	}

	.btn-back {
		background: transparent;
		border: 1.5px solid #5b21b6;
		color: #a78bca;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		padding: 0.55rem 1.4rem;
		border-radius: 999px;
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
	}

	.btn-back:hover { border-color: #a855f7; color: #c084fc; }

	.btn-start {
		background: linear-gradient(135deg, #a855f7, #d946ef);
		border: none;
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		padding: 0.55rem 1.75rem;
		border-radius: 999px;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
		transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
	}

	.btn-start:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(217, 70, 239, 0.5);
	}

	.btn-start:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
