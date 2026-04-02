<script lang="ts">
	import { gameStore } from '$lib/stores/game';
	import { t } from '$lib/i18n';
	import Tooltip from './Tooltip.svelte';

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

	let visible = $state(true);

	// ── Animated display scores ───────────────────────────
	let displayScores: Record<number, number> = {};
	let displayScoresTick = $state(0); // increment to trigger re-render
	let deltas = $state<Record<number, { value: number; key: number }>>({});
	const intervals: Record<number, ReturnType<typeof setInterval>> = {};

	function animateTo(id: number, target: number) {
		const start = displayScores[id] ?? target;
		if (start === target) return;

		const delta = target - start;
		deltas[id] = { value: delta, key: Date.now() + id };
		setTimeout(() => { deltas[id] = undefined!; }, 1900);

		if (intervals[id]) clearInterval(intervals[id]);

		const steps = 24;
		const stepMs = 800 / steps;
		let step = 0;
		intervals[id] = setInterval(() => {
			step++;
			const eased = 1 - Math.pow(1 - step / steps, 3);
			displayScores[id] = Math.round(start + delta * eased);
			displayScoresTick++;
			if (step >= steps) {
				clearInterval(intervals[id]);
				delete intervals[id];
				displayScores[id] = target;
				displayScoresTick++;
			}
		}, stepMs);
	}

	// Watch only gs.scores for changes
	$effect(() => {
		const scores = gs?.scores;
		if (!scores) return;
		for (const [idStr, target] of Object.entries(scores)) {
			const id = Number(idStr);
			if (displayScores[id] === undefined) {
				displayScores[id] = target; // init without animation
			} else {
				animateTo(id, target);
			}
		}
	});
</script>

{#if gs && entries.length > 0}
	<div class="scoreboard">
		<Tooltip text={visible ? 'Scoreboard ausblenden' : 'Scoreboard einblenden'} position="top">
		<button class="toggle-btn" onclick={() => visible = !visible} aria-label="Scoreboard ein-/ausblenden">
			{#if visible}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="18 15 12 9 6 15"/>
				</svg>
			{:else}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="6 9 12 15 18 9"/>
				</svg>
				<span class="mini-players">
					{#each entries as entry}
						<span
							class="mini-player"
							class:mini-active={entry.originalIndex === activeOriginalIndex}
							style={entry.originalIndex === activeOriginalIndex ? `color: ${entry.color}` : ''}
						>
							{entry.avatar}
						</span>
					{/each}
				</span>
			{/if}
		</button>
		</Tooltip>

		{#if visible}
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
							{(displayScoresTick, displayScores[entry.id] ?? entry.score).toLocaleString()} pts
						</span>
					</div>

					{#if isActive}
						<span class="dran-badge">{$t.scoreboard.turn}</span>
					{/if}

					{#if deltas[entry.id]}
						{@const d = deltas[entry.id]}
						{#key d.key}
							<span class="delta-badge" class:delta-pos={d.value > 0} class:delta-neg={d.value < 0}>
								{d.value > 0 ? '+' : ''}{d.value.toLocaleString()}
							</span>
						{/key}
					{/if}
				</div>
			{/each}
		</div>
		{/if}
	</div>
{/if}

<style>
	.scoreboard {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 0.35rem 1.5rem 0.75rem;
		z-index: 300;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #1e0d38cc;
		border: 1.5px solid #3d1a6e;
		border-radius: 999px;
		color: #7c5faa;
		padding: 0.2rem 0.75rem;
		cursor: pointer;
		font-size: 0.75rem;
		backdrop-filter: blur(6px);
		transition: border-color 0.15s, color 0.15s;
	}

	.toggle-btn:hover {
		border-color: #a855f7;
		color: #c084fc;
	}

	.mini-players {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.mini-player {
		font-family: 'Fredoka One', cursive;
		font-size: 0.8rem;
		opacity: 0.5;
	}

	.mini-player.mini-active {
		opacity: 1;
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
		position: relative;
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

	.delta-badge {
		position: absolute;
		bottom: calc(100% + 4px);
		left: 50%;
		transform: translateX(-50%);
		font-family: 'Fredoka One', cursive;
		font-size: 0.82rem;
		border-radius: 999px;
		padding: 0.15rem 0.55rem;
		white-space: nowrap;
		pointer-events: none;
		animation: delta-fly 1.8s ease-out forwards;
	}

	.delta-badge.delta-pos {
		background: rgba(74, 222, 128, 0.2);
		color: #4ade80;
		border: 1px solid #16a34a;
	}

	.delta-badge.delta-neg {
		background: rgba(248, 113, 113, 0.2);
		color: #f87171;
		border: 1px solid #b91c1c;
	}

	@keyframes delta-fly {
		0%   { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.8); }
		15%  { opacity: 1; transform: translateX(-50%) translateY(-4px) scale(1.15); }
		70%  { opacity: 1; transform: translateX(-50%) translateY(-14px) scale(1); }
		100% { opacity: 0; transform: translateX(-50%) translateY(-26px) scale(0.85); }
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
