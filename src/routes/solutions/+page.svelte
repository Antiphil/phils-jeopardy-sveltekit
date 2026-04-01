<script lang="ts">
	import { browser } from '$app/environment';
	import type { Category } from '$lib/stores/game';

	type SolutionsData = {
		boardCount?: 1 | 2 | 3;
		board1: Category[];
		board2: Category[];
		board3: Category[];
		chaosCategory: Category;
		chaosEnabled: boolean;
	};

	let data: SolutionsData | null = $state(null);

	if (browser) {
		try {
			const raw = localStorage.getItem('jeopardy_solutions_data');
			if (raw) data = JSON.parse(raw);
		} catch {
			// ignore
		}
	}
</script>

<svelte:head>
	<title>Lösungen – Phil's Jeopardy</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="solutions-page">
	<div class="page-header">
		<h1 class="page-title">🗝️ Lösungsübersicht</h1>
		<p class="page-sub">Nur für den Gamemaster</p>
	</div>

	{#if !data}
		<div class="empty">Keine Spieldaten gefunden. Öffne dieses Fenster über den Button im Gameboard.</div>
	{:else}
		{@const bc = data.boardCount ?? 2}
		{@const rounds = [
			{ label: 'Runde 1', cats: data.board1 },
			...(bc >= 2 ? [{ label: 'Runde 2', cats: data.board2 }] : []),
			...(bc >= 3 ? [{ label: 'Runde 3', cats: data.board3 ?? [] }] : []),
		]}
		{#each rounds as round}
			<section class="round-section">
				<h2 class="round-title" class:round3-title={round.label === 'Runde 3'}>{round.label}</h2>
				<div class="cats-grid">
					{#each round.cats as cat}
						<div class="cat-card">
							<div class="cat-name">{cat.name}</div>
							{#each cat.questions as q}
								<div class="q-row">
									<span class="q-points">{q.points}</span>
									<div class="q-content">
										<div class="q-question">{q.question || '–'}</div>
										<div class="q-answer">{q.answer || '–'}</div>
									</div>
								</div>
							{/each}
						</div>
					{/each}
				</div>
			</section>
		{/each}

		<!-- Chaos Category -->
		{#if data.chaosEnabled}
		<section class="round-section">
			<h2 class="round-title phil-title">🎲 {data.chaosCategory.name}</h2>
			<div class="phil-grid">
				{#each data.chaosCategory.questions as q}
					<div class="q-row phil-row">
						<span class="q-points phil-pts">{q.points}</span>
						<div class="q-content">
							<div class="q-question">{q.question || '–'}</div>
							<div class="q-answer">{q.answer || '–'}</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
		{/if}
	{/if}
</div>

<style>
	:global(body) {
		background: #0f0620;
		margin: 0;
	}

	.solutions-page {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
		font-family: 'Nunito', 'Segoe UI', sans-serif;
		color: #e2d0ff;
	}

	.page-header {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.page-title {
		font-family: 'Fredoka One', cursive;
		font-size: 2.2rem;
		background: linear-gradient(90deg, #c084fc, #f0abfc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0 0 0.25rem;
	}

	.page-sub {
		color: #7c5faa;
		font-size: 0.9rem;
		margin: 0;
		font-weight: 600;
		letter-spacing: 1px;
		text-transform: uppercase;
	}

	.empty {
		text-align: center;
		color: #7c5faa;
		font-size: 1.1rem;
		margin-top: 4rem;
	}

	.round-section {
		margin-bottom: 3rem;
	}

	.round-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1.4rem;
		color: #c084fc;
		border-bottom: 2px solid #3d1a6e;
		padding-bottom: 0.5rem;
		margin: 0 0 1.25rem;
	}

	.phil-title { color: #fca5a5; border-color: #7f1d1d; }
	.round3-title { color: #fdba74; border-color: #7c2d12; }

	.cats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.cat-card {
		background: #1e0d38;
		border: 1.5px solid #5b21b6;
		border-radius: 1rem;
		overflow: hidden;
	}

	.cat-name {
		background: linear-gradient(135deg, #3b1a6e, #261040);
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		color: #e2d0ff;
		padding: 0.55rem 0.85rem;
		text-align: center;
		border-bottom: 1px solid #3d1a6e;
	}

	.q-row {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		padding: 0.55rem 0.75rem;
		border-bottom: 1px solid #261040;
	}

	.q-row:last-child { border-bottom: none; }

	.q-points {
		font-family: 'Fredoka One', cursive;
		font-size: 0.8rem;
		color: #a855f7;
		min-width: 32px;
		text-align: right;
		padding-top: 0.1rem;
		flex-shrink: 0;
	}

	.q-content {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.q-question {
		font-size: 0.78rem;
		color: #c4a8e8;
		line-height: 1.3;
	}

	.q-answer {
		font-family: 'Fredoka One', cursive;
		font-size: 0.9rem;
		color: #fbbf24;
		line-height: 1.2;
	}

	/* Phil section */
	.phil-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.6rem;
	}

	.phil-row {
		background: #1e0d0d;
		border: 1.5px solid #7f1d1d;
		border-radius: 0.75rem;
		padding: 0.65rem 0.85rem;
	}

	.phil-pts { color: #ef4444; }
</style>
