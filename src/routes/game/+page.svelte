<script lang="ts">
	import { gameStore } from '$lib/stores/game';
	import type { Question } from '$lib/stores/game';
	import QuestionModal from '$lib/components/comps/QuestionModal.svelte';
	import Scoreboard from '$lib/components/comps/Scoreboard.svelte';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';

	let gs = $derived($gameStore);

	// Redirect home if no game started
	$effect(() => {
		if (!gs) goto('/');
	});

	let activeQuestion: Question | null = $state(null);
	let currentAnswererId: number | null = $state(null); // scorer ID currently answering
	let wrongAnswerers: number[] = $state([]); // scorer IDs who got it wrong
	let retryQuestion: Question | null = $state(null); // question waiting for retries
	let showRetryPicker = $state(false);
	let showSkipAnswer = $state(false);

	let categories = $derived(
		gs?.currentBoard === 1 ? (gs?.board1Categories ?? [])
		: gs?.currentBoard === 3 ? (gs?.board3Categories ?? [])
		: (gs?.board2Categories ?? [])
	);

	// All scoreable entities (teams or players)
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

	// Scorer ID for whoever's turn it currently is
	let currentTurnScorerId = $derived(
		gs?.teams
			? (gs.teams[gs.currentTurnIndex]?.id ?? null)
			: (gs?.players[gs.currentTurnIndex]?.id ?? null)
	);

	// Entry (name/avatar/color) for the current answerer
	let answererEntry = $derived(
		currentAnswererId !== null ? (scorers.find((s) => s.id === currentAnswererId) ?? null) : null
	);

	let currentTurnEntry = $derived(
		gs
			? gs.teams
				? (() => {
						const t = gs!.teams![gs!.currentTurnIndex];
						return t ? { name: t.name, avatar: '👥', color: t.color } : null;
					})()
				: (() => {
						const p = gs!.players[gs!.currentTurnIndex];
						return p ? { name: p.name, avatar: p.avatar, color: '#a855f7' } : null;
					})()
			: null
	);

	// Scorers still eligible to retry (haven't tried yet)
	let retryEligible = $derived(scorers.filter((s) => !wrongAnswerers.includes(s.id)));

	function openQuestion(q: Question) {
		if (gs?.answered[q.id] !== undefined) return;
		activeQuestion = q;
		currentAnswererId = currentTurnScorerId;
		wrongAnswerers = [];
	}

	function handleAward(points: number) {
		if (!activeQuestion || currentAnswererId === null) return;

		if (points > 0) {
			// Correct — award to whoever answered, mark done, advance turn
			gameStore.markAnswered(activeQuestion.id, currentAnswererId, points);
			activeQuestion = null;
			currentAnswererId = null;
			wrongAnswerers = [];
		} else {
			// Wrong — deduct half points from the answerer
			const deduction = Math.floor(activeQuestion.points / 2);
			if (deduction > 0) gameStore.deductPoints(currentAnswererId, deduction, activeQuestion.id);

			wrongAnswerers = [...wrongAnswerers, currentAnswererId];
			retryQuestion = activeQuestion;
			activeQuestion = null;

			// Check if anyone is left to retry
			const remaining = scorers.filter((s) => !wrongAnswerers.includes(s.id));
			if (remaining.length > 0) {
				showRetryPicker = true;
			} else {
				// Everyone tried — mark as missed, advance turn
				gameStore.markAnswered(retryQuestion.id, -1, 0);
				retryQuestion = null;
				wrongAnswerers = [];
			}
		}
	}

	function startRetry(scorerId: number) {
		if (!retryQuestion) return;
		currentAnswererId = scorerId;
		activeQuestion = retryQuestion;
		showRetryPicker = false;
	}

	function skipRetry() {
		if (!retryQuestion) return;
		// Show the answer before closing
		showRetryPicker = false;
		showSkipAnswer = true;
	}

	function handleTimeout() {
		if (!activeQuestion) return;
		// Timer expired: auto-mark as missed, no retries
		gameStore.markAnswered(activeQuestion.id, -1, 0);
		activeQuestion = null;
		currentAnswererId = null;
		wrongAnswerers = [];
		retryQuestion = null;
	}

	function confirmSkip() {
		if (!retryQuestion) return;
		gameStore.markAnswered(retryQuestion.id, -1, 0);
		retryQuestion = null;
		showSkipAnswer = false;
		wrongAnswerers = [];
		currentAnswererId = null;
	}

	function tileStatus(questionId: string): 'open' | 'correct' | 'missed' {
		if (!gs) return 'open';
		const s = gs.answered[questionId];
		if (s === undefined) return 'open';
		return s === -1 ? 'missed' : 'correct';
	}

	function scorerName(id: number): string {
		if (!gs) return '';
		if (gs.teams) return gs.teams.find((t) => t.id === id)?.name ?? '';
		return gs.players.find((p) => p.id === id)?.name ?? '';
	}

	function scorerAvatar(id: number): string {
		if (!gs) return '';
		if (gs.teams) return '👥';
		return gs.players.find((p) => p.id === id)?.avatar ?? '';
	}

	// Keep answered state in sync for the solutions window
	$effect(() => {
		if (!gs) return;
		localStorage.setItem('jeopardy_solutions_answered', JSON.stringify(gs.answered));
	});

	function openSolutions() {
		if (!gs) return;
		localStorage.setItem(
			'jeopardy_solutions_data',
			JSON.stringify({
				boardCount: gs.boardCount,
				board1: gs.board1Categories,
				board2: gs.board2Categories,
				board3: gs.board3Categories,
				chaosCategory: gs.chaosCategory,
				chaosEnabled: gs.chaosEnabled
			})
		);
		localStorage.setItem('jeopardy_solutions_answered', JSON.stringify(gs.answered));
		window.open('/solutions', '_blank', 'noopener');
	}
</script>

<svelte:head>
	<title>Spiel läuft – Phil's Jeopardy</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if !gs}
	<div
		style="display:flex;align-items:center;justify-content:center;height:80vh;color:#a78bca;font-family:'Fredoka One',cursive;font-size:1.5rem"
	>
		{$t.game.redirecting}
	</div>
{:else}
	<!-- Question modal -->
	{#if activeQuestion}
		<QuestionModal
			question={activeQuestion}
			answerer={answererEntry ?? undefined}
			onclose={() => (activeQuestion = null)}
			onaward={handleAward}
			ontimeout={handleTimeout}
		/>
	{/if}

	<!-- Answer reveal after everyone skipped -->
	{#if showSkipAnswer && retryQuestion}
		<div class="backdrop" role="button" tabindex="-1" onmousedown={() => {}} onkeydown={() => {}}>
			<div class="scorer-modal" role="dialog" aria-modal="true">
				<h3 class="scorer-title">{$t.game.nobodyKnew}</h3>
				<p class="scorer-sub">{retryQuestion.question}</p>
				<div class="answer-box-inline">
					<div class="answer-label-inline">{$t.game.answer}</div>
					<div class="answer-text-inline">{retryQuestion.answer}</div>
				</div>
				<button class="btn-skip" onclick={confirmSkip}>{$t.game.next}</button>
			</div>
		</div>
	{/if}

	<!-- Retry picker: shown after a wrong answer when others can still try -->
	{#if showRetryPicker && retryQuestion}
		<div class="backdrop" role="button" tabindex="-1" onmousedown={() => {}} onkeydown={() => {}}>
			<div class="scorer-modal" role="dialog" aria-modal="true">
				<h3 class="scorer-title">{$t.game.anyoneElse}</h3>
				<p class="scorer-sub">
					-{Math.floor(retryQuestion.points / 2)} {$t.game.pointsDeducted}
				</p>
				<div class="scorer-list">
					{#each retryEligible as scorer}
						<button
							class="scorer-btn"
							style={`border-color: ${scorer.color}60; background: ${scorer.color}15`}
							onclick={() => startRetry(scorer.id)}
						>
							<span class="scorer-avatar">{scorer.avatar}</span>
							<span class="scorer-name" style={`color: ${scorer.color}`}>{scorer.name}</span>
						</button>
					{/each}
				</div>
				<button class="btn-skip" onclick={skipRetry}>{$t.game.skipNobody}</button>
			</div>
		</div>
	{/if}

	<div class="game-page">
		<!-- Current turn banner -->
		{#if currentTurnEntry}
			<div class="turn-banner">
				<span class="turn-avatar">{currentTurnEntry.avatar}</span>
				<span class="turn-text">
					<span class="turn-name" style={`color: ${currentTurnEntry.color}`}
						>{currentTurnEntry.name}</span
					>
					{$t.game.isTurn}
				</span>
			</div>
		{/if}

		<!-- Board switcher -->
		<div class="board-switcher">
			<button
				class="board-tab"
				class:active={gs.currentBoard === 1}
				onclick={() => gameStore.switchBoard(1)}
			>
				{$t.game.round1}
				{#if gs.board1Complete}<span class="done-badge">✓</span>{/if}
			</button>
			<button
				class="board-tab"
				class:active={gs.currentBoard === 2}
				onclick={() => gameStore.switchBoard(2)}
				title={!gs.board1Complete ? $t.game.round1 : ''}
			>
				{$t.game.round2}
				{#if !gs.board1Complete}<span class="lock-icon">🔒</span>{/if}
			</button>
			{#if gs.boardCount >= 3}
				<button
					class="board-tab board-tab-3"
					class:active={gs.currentBoard === 3}
					onclick={() => gameStore.switchBoard(3)}
					title={!gs.board2Complete ? 'Runde 2 muss zuerst abgeschlossen werden' : ''}
				>
					Runde 3
					{#if gs.board2Complete && !gs.board3Categories.flatMap(c => c.questions).every(q => gs.answered[q.id] !== undefined)}<span class=""></span>{/if}
					{#if !gs.board2Complete}<span class="lock-icon">🔒</span>{/if}
				</button>
			{/if}
			<button
				class="board-tab solutions-btn"
				onclick={openSolutions}
				title="Lösungen in neuem Fenster öffnen"
			>
				🗝️
			</button>
			<button
				class="board-tab end-btn"
				onclick={() => goto('/winner')}
				title="Spiel beenden & Auswertung"
			>
				🏆
			</button>
		</div>

		{#if gs.currentBoard === 2 && !gs.board1Complete}
			<div class="locked-banner">{$t.game.lockedBanner}</div>
		{/if}
		{#if gs.currentBoard === 3 && !gs.board2Complete}
			<div class="locked-banner">Runde 2 muss erst vollständig beantwortet werden.</div>
		{/if}

		<!-- Game board -->
		<div class="board-wrap">
			<div class="board-flex">
				<!-- Main grid: 6 regular categories × 5 questions -->
				<div class="main-board" style={`grid-template-columns: repeat(${categories.length}, 1fr)`}>
					{#each categories as cat}
						<div class="cat-header">{cat.name}</div>
					{/each}
					{#each [0, 1, 2, 3, 4] as row}
						{#each categories as cat}
							{@const q = cat.questions[row]}
							{@const ts = tileStatus(q.id)}
							<button
								class="tile"
								class:correct={ts === 'correct'}
								class:missed={ts === 'missed'}
								class:open={ts === 'open'}
								disabled={ts !== 'open' || (gs.currentBoard === 2 && !gs.board1Complete) || (gs.currentBoard === 3 && !gs.board2Complete)}
								onclick={() => openQuestion(q)}
							>
								{#if ts === 'correct'}
									<span class="tile-scorer">
										{scorerAvatar(gs.answered[q.id]!)}
										<span class="tile-scorer-name">{scorerName(gs.answered[q.id]!)}</span>
									</span>
								{:else if ts === 'missed'}
									<span class="tile-missed-icon">✗</span>
								{:else}
									<span class="tile-points">{q.points}</span>
								{/if}
							</button>
						{/each}
					{/each}
				</div>

				<!-- Chaos Category column: 10 questions, separate -->
				{#if gs.chaosEnabled}
				<div class="phil-column">
					<div class="cat-header phil-header">🎲 {gs.chaosCategory.name}</div>
					{#each gs.chaosCategory.questions as philQ}
						{@const philTs = tileStatus(philQ.id)}
						<button
							class="tile phil-tile"
							class:correct={philTs === 'correct'}
							class:missed={philTs === 'missed'}
							class:open={philTs === 'open'}
							disabled={philTs !== 'open'}
							onclick={() => openQuestion(philQ)}
						>
							{#if philTs === 'correct'}
								<span class="tile-scorer">
									{scorerAvatar(gs.answered[philQ.id]!)}
									<span class="tile-scorer-name phil-scorer-name"
										>{scorerName(gs.answered[philQ.id]!)}</span
									>
								</span>
							{:else if philTs === 'missed'}
								<span class="tile-missed-icon">✗</span>
							{:else}
								<span class="tile-points phil-points">{philQ.points}</span>
							{/if}
						</button>
					{/each}
				</div>
				{/if}
			</div>
		</div>
	</div>
	<Scoreboard />
{/if}

<style>
	.game-page {
		min-height: calc(100vh - 70px - 90px);
		padding: 1.25rem 1rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		position: relative;
		z-index: 1;
	}

	/* ── Turn banner ────────────────────────────────────── */
	.turn-banner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #a78bca;
		background: #1e0d38;
		border: 1.5px solid #3d1a6e;
		border-radius: 999px;
		padding: 0.35rem 1.25rem;
		width: fit-content;
		margin: 0 auto;
		animation: slide-in 0.25s ease-out;
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.turn-avatar {
		font-size: 1.1rem;
	}

	.turn-name {
		font-weight: 900;
	}

	/* ── Board switcher ─────────────────────────────────── */
	.board-switcher {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.board-tab {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		padding: 0.45rem 1.6rem;
		border-radius: 999px;
		border: 1.5px solid #5b21b6;
		background: #261040;
		color: #a78bca;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s,
			box-shadow 0.15s;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.board-tab:hover {
		border-color: #a855f7;
		color: #c084fc;
	}

	.board-tab.active {
		background: linear-gradient(135deg, #a855f7, #d946ef);
		border-color: transparent;
		color: white;
		box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
	}

	.done-badge {
		background: #34d399;
		color: #052e16;
		font-size: 0.7rem;
		padding: 0.1rem 0.4rem;
		border-radius: 999px;
		font-family: 'Nunito', sans-serif;
		font-weight: 800;
	}

	.lock-icon {
		font-size: 0.85rem;
	}

	.locked-banner {
		text-align: center;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #a78bca;
		background: #261040;
		border: 1.5px dashed #5b21b6;
		border-radius: 1rem;
		padding: 0.6rem 1rem;
	}

	/* ── Board grid ─────────────────────────────────────── */
	.board-wrap {
		overflow-x: auto;
		flex: 1;
	}

	.board-flex {
		display: flex;
		gap: 8px;
		min-width: 700px;
		align-items: stretch;
		padding: 20px;
	}

	.main-board {
		display: grid;
		gap: 6px;
		flex: 1;
	}

	.phil-column {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 110px;
		flex-shrink: 0;
	}

	.cat-header {
		background: radial-gradient(#bb4ed6, #662177);
		border: 1px solid #cc8ddb;
		border-radius: 999px;
		padding: 0.6rem 1rem;
		text-align: center;
		font-family: 'Fredoka One', cursive;
		font-size: clamp(0.65rem, 1.4vw, 0.9rem);
		color: #e2d0ff;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 52px;
		line-height: 1.2;
		box-shadow: 0 2px 12px rgba(6, 3, 12, 0.25);
		margin-bottom: 20px;
	}

	.phil-header {
		background: linear-gradient(135deg, #7f1d1d, #450a0a);
		border-color: #ef4444;
		color: #fca5a5;
		box-shadow: 0 2px 14px rgba(239, 68, 68, 0.35);
		font-size: 0.75rem;
	}

	.tile {
		background: linear-gradient(135deg, #2d1260, #1e0d38);
		border: 1.5px solid #5b21b6;
		border-radius: 999px;
		min-height: 64px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		transition:
			transform 0.12s,
			box-shadow 0.12s,
			background 0.15s;
		padding: 0.3rem 0.6rem;
	}

	.tile.open:hover:not(:disabled) {
		transform: translateY(-3px) scale(1.03);
		box-shadow: 0 6px 22px rgba(168, 85, 247, 0.45);
		background: linear-gradient(135deg, #4a1e8a, #2d1260);
		border-color: #a855f7;
	}

	.tile:disabled {
		cursor: default;
	}

	.tile.correct {
		background: linear-gradient(135deg, #052e16, #0a1f14);
		border-color: #34d399;
		opacity: 0.7;
	}

	.tile.missed {
		background: linear-gradient(135deg, #1c0a2a, #1a0d2e);
		border-color: #3d1a6e;
		opacity: 0.45;
	}

	.phil-tile {
		border-color: #b91c1c;
		background: linear-gradient(135deg, #450a0a, #1e0d0d);
		min-height: 0;
		flex: 1;
	}

	.phil-tile.open:hover:not(:disabled) {
		box-shadow: 0 6px 22px rgba(239, 68, 68, 0.45);
		background: linear-gradient(135deg, #7f1d1d, #450a0a);
		border-color: #ef4444;
	}

	.phil-tile.correct {
		background: linear-gradient(135deg, #052e16, #0a1f14);
		border-color: #34d399;
	}

	.phil-tile.missed {
		background: linear-gradient(135deg, #1c0505, #1a0d0d);
		border-color: #7f1d1d;
	}

	.phil-points {
		color: #fca5a5;
		font-size: 1rem;
	}

	.phil-scorer-name {
		font-size: 0.6rem;
		color: #34d399;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 80px;
	}

	.tile-points {
		font-family: 'Fredoka One', cursive;
		font-size: clamp(1rem, 2.5vw, 1.5rem);
		color: #e2d0ff;
	}

	.tile-scorer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
	}

	.tile-scorer-name {
		font-size: 0.65rem;
		color: #34d399;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 90px;
	}

	.tile-missed-icon {
		font-size: 1.2rem;
		color: #6b21a8;
	}

	/* ── Scorer picker ──────────────────────────────────── */
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(10, 4, 20, 0.82);
		backdrop-filter: blur(8px);
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.scorer-modal {
		background: #1e0d38;
		border: 2px solid #5b21b6;
		border-radius: 1.5rem;
		padding: 2rem;
		width: 100%;
		max-width: 400px;
		box-shadow: 0 8px 48px rgba(168, 85, 247, 0.4);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		text-align: center;
	}

	.scorer-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1.5rem;
		background: linear-gradient(90deg, #c084fc, #f0abfc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0;
	}

	.scorer-sub {
		font-family: 'Fredoka One', cursive;
		font-size: 1.1rem;
		color: #fbbf24;
		margin: 0;
	}

	.scorer-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		justify-content: center;
	}

	.scorer-btn {
		border: 1.5px solid;
		border-radius: 999px;
		padding: 0.5rem 1.2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		transition:
			transform 0.12s,
			box-shadow 0.12s;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
	}

	.scorer-btn:hover {
		transform: translateY(-2px) scale(1.04);
	}

	.scorer-avatar {
		font-size: 1.2rem;
	}

	.scorer-name {
		font-size: 0.95rem;
	}

	.btn-skip {
		background: transparent;
		border: none;
		color: #6b47a0;
		font-size: 0.85rem;
		font-family: 'Nunito', sans-serif;
		cursor: pointer;
		text-decoration: underline;
		transition: color 0.15s;
	}

	.btn-skip:hover {
		color: #a78bca;
	}

	.answer-box-inline {
		background: #261040;
		border: 1.5px solid #5b21b6;
		border-radius: 1rem;
		padding: 0.85rem 1.5rem;
		width: 100%;
		text-align: center;
		animation: reveal-in 0.3s ease-out;
	}

	.answer-label-inline {
		font-size: 0.7rem;
		color: #a78bca;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-bottom: 0.35rem;
	}

	.answer-text-inline {
		font-family: 'Fredoka One', cursive;
		font-size: 1.4rem;
		color: #fbbf24;
	}

	@keyframes reveal-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.board-tab-3 { border-color: #7c2d12; color: #fb923c; }
	.board-tab-3:hover { border-color: #ea580c; color: #fdba74; }
	.board-tab-3.active { background: linear-gradient(135deg, #ea580c, #f97316); border-color: transparent; color: white; box-shadow: 0 4px 14px rgba(234,88,12,0.4); }

	.end-btn {
		border-color: #854d0e;
		color: #fbbf24;
	}

	.end-btn:hover {
		border-color: #fbbf24;
		color: #fde68a;
	}
</style>
