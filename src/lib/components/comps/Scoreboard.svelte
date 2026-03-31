<script lang="ts">
	import { gameStore } from '$lib/stores/game';

	let gs = $derived($gameStore);

	type Entry = {
		id: number;
		name: string;
		avatar: string;
		score: number;
		color: string;
		originalIndex: number;
	};

	// Build flat list of scoreable entities (teams or players)
	let entries = $derived<Entry[]>(
		gs
			? gs.teams
				? gs.teams.map((t, i) => ({
						id: t.id,
						name: t.name,
						avatar: '👥',
						score: gs!.scores[t.id] ?? 0,
						color: t.color,
						originalIndex: i
					}))
				: gs.players.map((p, i) => ({
						id: p.id,
						name: p.name,
						avatar: p.avatar,
						score: gs!.scores[p.id] ?? 0,
						color: '#a855f7',
						originalIndex: i
					}))
			: []
	);

	// Sorted by score descending, ties keep original order
	let ranked = $derived(
		[...entries].sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
	);

	// Who is currently active (by original index)
	let activeOriginalIndex = $derived(gs?.currentTurnIndex ?? 0);
</script>

{#if gs && entries.length > 0}
	<div class="scoreboard">
		<div class="scoreboard-inner">
			{#each ranked as entry, rank}
				{@const isActive = entry.originalIndex === activeOriginalIndex}
				{@const isLeading = rank === 0}
				<div
					class="player-card"
					class:leading={isLeading}
					class:active={isActive}
					style={isActive
						? `border-color: ${entry.color}; box-shadow: 0 0 16px ${entry.color}55, 0 4px 16px rgba(0,0,0,0.4)`
						: ''}
				>
					{#if isActive}
						<span class="turn-arrow">▶</span>
					{:else}
						<span class="rank">#{rank + 1}</span>
					{/if}

					<div class="avatar" style={isActive ? `box-shadow: 0 0 0 2px ${entry.color}` : ''}>
						{entry.avatar}
					</div>

					<div class="player-info">
						<span class="player-name" style={isActive ? `color: white` : ''}>{entry.name}</span>
						<span
							class="player-score"
							style={isLeading && !isActive
								? 'color: #fbbf24'
								: isActive
									? `color: ${entry.color}`
									: ''}
						>
							{entry.score.toLocaleString()} pts
						</span>
					</div>

					{#if isActive}
						<span class="dran-badge">Dran!</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.scoreboard {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 0.5rem 1.5rem 1rem;
		z-index: 50;
	}

	.scoreboard-inner {
		display: flex;
		gap: 0.6rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.player-card {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		background: #261040;
		border: 1.5px solid #5b21b6;
		border-radius: 999px;
		padding: 0.35rem 0.85rem 0.35rem 0.45rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
		transition:
			transform 0.2s,
			box-shadow 0.2s,
			border-color 0.2s;
		min-width: 140px;
	}

	.player-card.leading {
		border-color: #fbbf24;
		box-shadow: 0 4px 16px rgba(251, 191, 36, 0.25);
	}

	.player-card.active {
		transform: translateY(-4px) scale(1.04);
		background: #2d1260;
	}

	.rank {
		font-family: 'Fredoka One', cursive;
		font-size: 0.75rem;
		color: #6b47a0;
		min-width: 20px;
		text-align: center;
	}

	.turn-arrow {
		font-size: 0.7rem;
		color: #fff;
		min-width: 20px;
		text-align: center;
		animation: pulse 0.9s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: translateX(0);
		}
		50% {
			opacity: 0.5;
			transform: translateX(3px);
		}
	}

	.avatar {
		font-size: 1.3rem;
		background: #32155a;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: box-shadow 0.2s;
	}

	.player-info {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
		flex: 1;
	}

	.player-name {
		font-family: 'Fredoka One', cursive;
		font-size: 0.9rem;
		color: #e2d0ff;
		white-space: nowrap;
	}

	.player-score {
		font-size: 0.72rem;
		font-weight: 800;
		color: #c084fc;
	}

	.dran-badge {
		font-family: 'Fredoka One', cursive;
		font-size: 0.68rem;
		background: white;
		color: #1a0d2e;
		border-radius: 999px;
		padding: 0.1rem 0.45rem;
		white-space: nowrap;
		flex-shrink: 0;
		animation: badge-pop 0.3s ease-out;
	}

	@keyframes badge-pop {
		from {
			transform: scale(0.6);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
