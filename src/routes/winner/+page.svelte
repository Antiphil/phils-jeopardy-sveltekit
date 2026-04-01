<script lang="ts">
	import { gameStore } from '$lib/stores/game';
	import { goto } from '$app/navigation';
	import { playWinnerFanfare } from '$lib/sounds';
	import { t } from '$lib/i18n';

	let gs = $derived($gameStore);

	$effect(() => {
		if (!gs) goto('/');
	});

	let scorers = $derived(
		gs?.teams
			? gs.teams.map((t) => ({ id: t.id, name: t.name, avatar: '👥', color: t.color }))
			: (gs?.players ?? []).map((p) => ({
					id: p.id,
					name: p.name,
					avatar: p.avatar,
					color: '#a855f7'
				}))
	);

	let allQuestions = $derived(
		gs
			? [
					...gs.board1Categories.flatMap((c) => c.questions),
					...gs.board2Categories.flatMap((c) => c.questions),
					...(gs.chaosEnabled ? gs.chaosCategory.questions : [])
				]
			: []
	);

	type ScorerStats = {
		id: number;
		name: string;
		avatar: string;
		color: string;
		score: number;
		correct: number;
		wrong: number;
		skipped: number; // questions nobody got
		pointsLost: number;
		biggestWin: number; // highest single question value won
		highestMiss: number; // highest question value answered wrong
		streak: number; // longest correct streak (by answered order)
	};

	let stats = $derived(
		!gs
			? ([] as ScorerStats[])
			: (() => {
					const answeredIds = Object.keys(gs!.answered);
					return scorers.map((s) => {
						const correct = answeredIds.filter((qid) => gs!.answered[qid] === s.id).length;
						const wrong = Object.values(gs!.wrongAnswers).filter((ids) =>
							ids.includes(s.id)
						).length;

						const biggestWin = answeredIds
							.filter((qid) => gs!.answered[qid] === s.id)
							.reduce((max, qid) => {
								const q = allQuestions.find((q) => q.id === qid);
								return q ? Math.max(max, q.points) : max;
							}, 0);

						const highestMiss = Object.entries(gs!.wrongAnswers)
							.filter(([, ids]) => ids.includes(s.id))
							.reduce((max, [qid]) => {
								const q = allQuestions.find((q) => q.id === qid);
								return q ? Math.max(max, q.points) : max;
							}, 0);

						return {
							...s,
							score: gs!.scores[s.id] ?? 0,
							pointsLost: gs!.pointsLost[s.id] ?? 0,
							correct,
							wrong,
							skipped: answeredIds.filter((qid) => gs!.answered[qid] === -1).length,
							biggestWin,
							highestMiss,
							streak: 0
						} satisfies ScorerStats;
					});
				})()
	);

	let ranked = $derived([...stats].sort((a, b) => b.score - a.score));

	let totalAnswered = $derived(
		gs ? Object.values(gs.answered).filter((v) => v !== -1 && v !== null).length : 0
	);
	let totalSkipped = $derived(gs ? Object.values(gs.answered).filter((v) => v === -1).length : 0);
	let totalQuestions = $derived(allQuestions.length);

	// Most wrong answers scorer
	let mostWrong = $derived(stats.length ? [...stats].sort((a, b) => b.wrong - a.wrong)[0] : null);
	// Most correct
	let mostCorrect = $derived(
		stats.length ? [...stats].sort((a, b) => b.correct - a.correct)[0] : null
	);
	// Biggest single win
	let biggestSingleWin = $derived(
		stats.length ? [...stats].sort((a, b) => b.biggestWin - a.biggestWin)[0] : null
	);
	// Most points lost
	let mostReckless = $derived(
		stats.length ? [...stats].sort((a, b) => b.pointsLost - a.pointsLost)[0] : null
	);

	const MEDALS = ['🥇', '🥈', '🥉'];
	let PLACE_LABELS = $derived($t.winner.placeLabels);

	// ── Konfetti-Einstellungen ────────────────────────────
	const CONFETTI_COUNT = 200; // Anzahl der Konfetti-Stücke
	const CONFETTI_DURATION = 10; // Sekunden bis Konfetti verschwindet
	// ─────────────────────────────────────────────────────

	let showConfetti = $state(true);
	$effect(() => {
		const t = setTimeout(() => (showConfetti = false), CONFETTI_DURATION * 1000);
		return () => clearTimeout(t);
	});

	// Rating
	let hoverRating = $state(0);
	let submittedRating = $state(0);
	let ratingDone = $state(false);

	async function submitRating(stars: number) {
		if (ratingDone || !gs?.savedGameId) return;
		submittedRating = stars;
		ratingDone = true;
		await fetch(`/api/games/${gs.savedGameId}/rate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ rating: stars }),
		});
	}

	$effect(() => {
		if (gs) playWinnerFanfare();
	});
</script>

<svelte:head><title>Gewinner – Jeopardy</title></svelte:head>

{#if showConfetti}
	<div class="confetti-wrap" aria-hidden="true">
		{#each Array(CONFETTI_COUNT) as _, i}
			<div
				class="confetti-piece"
				style={`
				left: ${(i * 31 + 7) % 100}%;
				animation-delay: ${(i * 0.17) % (CONFETTI_DURATION * 0.6)}s;
				animation-duration: ${CONFETTI_DURATION * 0.3 + ((i * 0.19) % (CONFETTI_DURATION * 0.4))}s;
				background: ${['#a855f7', '#d946ef', '#fbbf24', '#34d399', '#f87171', '#60a5fa', '#fb923c', '#f472b6', '#a3e635'][i % 9]};
				width: ${5 + (i % 8)}px;
				height: ${10 + (i % 12)}px;
				border-radius: ${i % 3 === 0 ? '50%' : '2px'};
				transform: rotate(${(i * 53) % 360}deg);
			`}
			></div>
		{/each}
	</div>
{/if}

<div class="winner-page">
	<div class="hero">
		<div class="trophy">🏆</div>
		<h1 class="hero-title">{$t.winner.gameOver}</h1>
		{#if ranked[0]}
			<p class="hero-sub">
				<span style={`color: ${ranked[0].color}`}>{ranked[0].avatar} {ranked[0].name}</span>
				{$t.winner.winsWith} <strong>{ranked[0].score} {$t.winner.points}</strong>!
			</p>
		{/if}
	</div>

	<!-- Podium -->
	<div class="podium-wrap">
		{#each ranked.slice(0, 3) as scorer, i}
			<div class="podium-card" class:gold={i === 0} class:silver={i === 1} class:bronze={i === 2}>
				<div class="podium-medal">{MEDALS[i] ?? '🎖️'}</div>
				<div class="podium-avatar">{scorer.avatar}</div>
				<div class="podium-name" style={`color: ${scorer.color}`}>{scorer.name}</div>
				<div class="podium-score">{scorer.score} {$t.winner.pts}</div>
				<div class="podium-detail">
					<span class="pd-correct">✓ {scorer.correct}</span>
					<span class="pd-wrong">✗ {scorer.wrong}</span>
				</div>
				<div class="podium-place">{PLACE_LABELS[i]}</div>
			</div>
		{/each}
	</div>

	<!-- Full leaderboard -->
	{#if ranked.length > 3}
		<div class="leaderboard">
			{#each ranked.slice(3) as scorer, i}
				<div class="lb-row">
					<span class="lb-rank">{i + 4}.</span>
					<span class="lb-avatar">{scorer.avatar}</span>
					<span class="lb-name" style={`color: ${scorer.color}`}>{scorer.name}</span>
					<span class="lb-score">{scorer.score} Pkt.</span>
					<span class="lb-correct">✓ {scorer.correct}</span>
					<span class="lb-wrong">✗ {scorer.wrong}</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Stats grid -->
	<h2 class="section-title">{$t.winner.stats}</h2>
	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-icon">❓</div>
			<div class="stat-value">{totalAnswered} / {totalQuestions}</div>
			<div class="stat-label">{$t.winner.questionsAnswered}</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">💨</div>
			<div class="stat-value">{totalSkipped}</div>
			<div class="stat-label">{$t.winner.questionsSkipped}</div>
		</div>

		{#if mostCorrect && mostCorrect.correct > 0}
			<div class="stat-card highlight-green">
				<div class="stat-icon">{mostCorrect.avatar}</div>
				<div class="stat-value" style={`color: ${mostCorrect.color}`}>{mostCorrect.name}</div>
				<div class="stat-label">{$t.winner.mostCorrect} ({mostCorrect.correct}✓)</div>
			</div>
		{/if}

		{#if mostWrong && mostWrong.wrong > 0}
			<div class="stat-card highlight-red">
				<div class="stat-icon">{mostWrong.avatar}</div>
				<div class="stat-value" style={`color: ${mostWrong.color}`}>{mostWrong.name}</div>
				<div class="stat-label">{$t.winner.mostWrong} ({mostWrong.wrong}✗)</div>
			</div>
		{/if}

		{#if biggestSingleWin && biggestSingleWin.biggestWin > 0}
			<div class="stat-card highlight-gold">
				<div class="stat-icon">{biggestSingleWin.avatar}</div>
				<div class="stat-value" style={`color: ${biggestSingleWin.color}`}>
					{biggestSingleWin.name}
				</div>
				<div class="stat-label">{$t.winner.biggestWin} ({biggestSingleWin.biggestWin} {$t.winner.pts})</div>
			</div>
		{/if}

		{#if mostReckless && mostReckless.pointsLost > 0}
			<div class="stat-card highlight-red">
				<div class="stat-icon">💸</div>
				<div class="stat-value" style={`color: ${mostReckless.color}`}>{mostReckless.name}</div>
				<div class="stat-label">{$t.winner.mostLost} ({mostReckless.pointsLost} {$t.winner.pts})</div>
			</div>
		{/if}
	</div>

	<!-- Per-player detail table -->
	<h2 class="section-title">{$t.winner.playerDetails}</h2>
	<div class="detail-table-wrap">
		<table class="detail-table">
			<thead>
				<tr>
					<th>{$t.winner.tablePlayer}</th>
					<th>{$t.winner.tablePoints}</th>
					<th>{$t.winner.tableCorrect}</th>
					<th>{$t.winner.tableWrong}</th>
					<th>{$t.winner.tableLost}</th>
					<th>{$t.winner.tableBest}</th>
					<th>{$t.winner.tableMiss}</th>
				</tr>
			</thead>
			<tbody>
				{#each ranked as s, i}
					<tr class:winner-row={i === 0}>
						<td class="td-player">
							<span class="td-avatar">{s.avatar}</span>
							<span style={`color: ${s.color}`}>{s.name}</span>
							{#if i === 0}<span class="td-crown">👑</span>{/if}
						</td>
						<td class="td-score">{s.score}</td>
						<td class="td-correct">{s.correct}</td>
						<td class="td-wrong">{s.wrong}</td>
						<td class="td-lost">{s.pointsLost > 0 ? `-${s.pointsLost}` : '–'}</td>
						<td class="td-best">{s.biggestWin > 0 ? `${s.biggestWin} ${$t.winner.pts}` : '–'}</td>
						<td class="td-miss">{s.highestMiss > 0 ? `${s.highestMiss} ${$t.winner.pts}` : '–'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if gs?.isPublicGame && gs?.savedGameId}
		<div class="rating-section">
			<h2 class="section-title">Runde bewerten</h2>
			<div class="stars">
				{#each [1,2,3,4,5] as star}
					<button
						class="star"
						class:filled={star <= (ratingDone ? submittedRating : hoverRating)}
						class:done={ratingDone}
						onmouseenter={() => { if (!ratingDone) hoverRating = star; }}
						onmouseleave={() => { if (!ratingDone) hoverRating = 0; }}
						onclick={() => submitRating(star)}
						aria-label="{star} Sterne"
					>★</button>
				{/each}
			</div>
			{#if ratingDone}
				<p class="rating-thanks">Danke für deine Bewertung!</p>
			{/if}
		</div>
	{/if}

	<div class="actions">
		<button
			class="btn-home"
			onclick={() => {
				gameStore.reset();
				goto('/');
			}}
		>
			{$t.winner.backHome}
		</button>
	</div>
</div>

<style>
	/* ── Confetti ───────────────────────────────────────── */
	.confetti-wrap {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 999;
		overflow: hidden;
	}

	.confetti-piece {
		position: absolute;
		top: -20px;
		animation: fall linear forwards;
	}

	@keyframes fall {
		0% {
			transform: translateY(0) rotate(0deg) translateX(0);
			opacity: 1;
		}
		20% {
			transform: translateY(20vh) rotate(144deg) translateX(18px);
		}
		40% {
			transform: translateY(40vh) rotate(288deg) translateX(-14px);
		}
		60% {
			transform: translateY(60vh) rotate(432deg) translateX(20px);
		}
		80% {
			transform: translateY(80vh) rotate(576deg) translateX(-10px);
			opacity: 1;
		}
		100% {
			transform: translateY(112vh) rotate(720deg) translateX(8px);
			opacity: 0;
		}
	}

	/* ── Page ───────────────────────────────────────────── */
	.winner-page {
		padding: 2rem 1.5rem 4rem;
		max-width: 960px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		position: relative;
		z-index: 1;
	}

	/* ── Hero ───────────────────────────────────────────── */
	.hero {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.trophy {
		font-size: 4rem;
		animation: bounce 1s ease-in-out infinite alternate;
	}

	@keyframes bounce {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-12px);
		}
	}

	.hero-title {
		font-family: 'Fredoka One', cursive;
		font-size: clamp(2.5rem, 7vw, 4rem);
		background: linear-gradient(90deg, #fbbf24, #f59e0b, #d97706);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0;
	}

	.hero-sub {
		font-family: 'Nunito', sans-serif;
		font-size: 1.15rem;
		color: #c4a8e8;
		margin: 0;
	}

	/* ── Podium ─────────────────────────────────────────── */
	.podium-wrap {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.podium-card {
		background: #1e0d38;
		border: 2px solid #5b21b6;
		border-radius: 1.5rem;
		padding: 1.5rem 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		width: 160px;
		position: relative;
		transition: transform 0.2s;
	}

	.podium-card.gold {
		border-color: #fbbf24;
		background: #1e1505;
		box-shadow: 0 0 32px rgba(251, 191, 36, 0.25);
		transform: translateY(-12px);
	}
	.podium-card.silver {
		border-color: #94a3b8;
		background: #0f1520;
	}
	.podium-card.bronze {
		border-color: #b45309;
		background: #1a0d05;
	}

	.podium-medal {
		font-size: 2rem;
	}
	.podium-avatar {
		font-size: 2.2rem;
	}

	.podium-name {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		text-align: center;
	}

	.podium-score {
		font-family: 'Fredoka One', cursive;
		font-size: 1.3rem;
		color: #e2d0ff;
	}

	.podium-detail {
		display: flex;
		gap: 0.5rem;
		font-size: 0.8rem;
		font-weight: 700;
		font-family: 'Nunito', sans-serif;
	}

	.pd-correct {
		color: #34d399;
	}
	.pd-wrong {
		color: #f87171;
	}

	.podium-place {
		position: absolute;
		bottom: -1px;
		left: 50%;
		transform: translateX(-50%);
		background: #261040;
		border: 1px solid #5b21b6;
		border-radius: 999px;
		font-size: 0.65rem;
		color: #a78bca;
		padding: 0.1rem 0.6rem;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
		white-space: nowrap;
	}

	/* ── Full leaderboard ───────────────────────────────── */
	.leaderboard {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.lb-row {
		background: #1e0d38;
		border: 1px solid #3d1a6e;
		border-radius: 999px;
		padding: 0.5rem 1.25rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-family: 'Nunito', sans-serif;
	}

	.lb-rank {
		color: #7c5faa;
		font-weight: 800;
		font-size: 0.85rem;
		min-width: 20px;
	}
	.lb-avatar {
		font-size: 1.1rem;
	}
	.lb-name {
		font-family: 'Fredoka One', cursive;
		flex: 1;
	}
	.lb-score {
		color: #e2d0ff;
		font-weight: 800;
		font-size: 0.95rem;
	}
	.lb-correct {
		color: #34d399;
		font-weight: 700;
		font-size: 0.8rem;
	}
	.lb-wrong {
		color: #f87171;
		font-weight: 700;
		font-size: 0.8rem;
	}

	/* ── Section title ──────────────────────────────────── */
	.section-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1.4rem;
		color: #c084fc;
		border-bottom: 2px solid #3d1a6e;
		padding-bottom: 0.5rem;
		margin: 0;
	}

	/* ── Stats grid ─────────────────────────────────────── */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
	}

	.stat-card {
		background: #1e0d38;
		border: 1.5px solid #3d1a6e;
		border-radius: 1.25rem;
		padding: 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		text-align: center;
	}

	.stat-card.highlight-green {
		border-color: #34d399;
		background: #052e16;
	}
	.stat-card.highlight-red {
		border-color: #f87171;
		background: #1c0505;
	}
	.stat-card.highlight-gold {
		border-color: #fbbf24;
		background: #1e1505;
	}

	.stat-icon {
		font-size: 1.8rem;
	}
	.stat-value {
		font-family: 'Fredoka One', cursive;
		font-size: 1.1rem;
		color: #e2d0ff;
	}
	.stat-label {
		font-size: 0.75rem;
		color: #7c5faa;
		font-weight: 600;
	}

	/* ── Detail table ───────────────────────────────────── */
	.detail-table-wrap {
		overflow-x: auto;
		border-radius: 1rem;
		border: 1.5px solid #3d1a6e;
	}

	.detail-table {
		width: 100%;
		border-collapse: collapse;
		font-family: 'Nunito', sans-serif;
		font-size: 0.9rem;
	}

	.detail-table th {
		background: #261040;
		color: #a78bca;
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 0.65rem 0.85rem;
		text-align: left;
		border-bottom: 1px solid #3d1a6e;
	}

	.detail-table td {
		padding: 0.6rem 0.85rem;
		border-bottom: 1px solid #1e0d38;
		color: #c4a8e8;
	}

	.detail-table tr:last-child td {
		border-bottom: none;
	}

	tr.winner-row td {
		background: rgba(251, 191, 36, 0.06);
	}

	.td-player {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-family: 'Fredoka One', cursive;
	}
	.td-avatar {
		font-size: 1.1rem;
	}
	.td-crown {
		font-size: 0.9rem;
	}
	.td-score {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #e2d0ff;
	}
	.td-correct {
		color: #34d399;
		font-weight: 700;
	}
	.td-wrong {
		color: #f87171;
		font-weight: 700;
	}
	.td-lost {
		color: #f87171;
	}
	.td-best {
		color: #fbbf24;
	}
	.td-miss {
		color: #fb923c;
	}

	/* ── Actions ────────────────────────────────────────── */
	.actions {
		display: flex;
		justify-content: center;
	}

	.btn-home {
		font-family: 'Fredoka One', cursive;
		font-size: 1.1rem;
		padding: 0.7rem 2.2rem;
		border-radius: 999px;
		border: none;
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		cursor: pointer;
		box-shadow: 0 4px 18px rgba(168, 85, 247, 0.4);
		transition:
			transform 0.15s,
			box-shadow 0.15s;
	}

	.btn-home:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 24px rgba(217, 70, 239, 0.5);
	}

	/* ── Rating ─────────────────────────────────────────── */
	.rating-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.stars {
		display: flex;
		gap: 0.4rem;
	}

	.star {
		font-size: 2.8rem;
		background: none;
		border: none;
		cursor: pointer;
		color: #3d1a6e;
		transition: color 0.1s, transform 0.1s;
		line-height: 1;
		padding: 0;
	}

	.star.filled { color: #fbbf24; }
	.star:not(.done):hover { transform: scale(1.15); }
	.star.done { cursor: default; }

	.rating-thanks {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #34d399;
		margin: 0;
	}
</style>
