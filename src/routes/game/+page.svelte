<script lang="ts">
	import { gameStore } from '$lib/stores/game';
	import type { Question } from '$lib/stores/game';
	import QuestionModal from '$lib/components/comps/QuestionModal.svelte';
	import type { WheelResult } from '$lib/components/comps/ChaosWheel.svelte';
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

	// All scoreable entities (teams or players), including current score for the wheel
	let scorers = $derived(
		gs?.teams
			? gs.teams.map((t) => ({ id: t.id, name: t.name, avatar: '👥', color: t.color, score: gs!.scores[t.id] ?? 0 }))
			: (gs?.players ?? []).map((p) => ({
					id: p.id,
					name: p.name,
					avatar: p.avatar,
					color: '#a855f7',
					score: gs!.scores[p.id] ?? 0,
				}))
	);

	// Wheel props: who's spinning and who else is playing
	let spinnerScorer = $derived(
		currentAnswererId !== null ? (scorers.find((s) => s.id === currentAnswererId) ?? undefined) : undefined
	);
	let otherScorers = $derived(
		currentAnswererId !== null ? scorers.filter((s) => s.id !== currentAnswererId) : []
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
			// Wrong — chaos category deducts full points, regular questions half
			const isChaos = gs.chaosEnabled && gs.chaosCategory.questions.some(q => q.id === activeQuestion!.id);
			const deduction = isChaos ? activeQuestion.points : Math.floor(activeQuestion.points / 2);
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

	function handleWheelResult(result: WheelResult) {
		if (!activeQuestion || currentAnswererId === null) return;
		// Apply the wheel effect to scores
		switch (result.segment.id) {
			case 'double_points':
			case 'lose_half':
				if (result.pointsDelta !== undefined) gameStore.addPoints(currentAnswererId, result.pointsDelta);
				break;
			case 'swap_random':
				if (result.swapWith) gameStore.swapScores(currentAnswererId, result.swapWith.id);
				break;
			case 'everyone_gains':
				if (result.everyoneGains) {
					for (const s of scorers) {
						if (s.id !== currentAnswererId) gameStore.addPoints(s.id, result.everyoneGains);
					}
				}
				break;
			case 'skip_turn':
				gameStore.scheduleSkip(currentAnswererId);
				break;
		}
		// Mark question answered (wheel = chaos, no direct point award)
		gameStore.markAnswered(activeQuestion.id, -1, 0);
		activeQuestion = null;
		currentAnswererId = null;
		wrongAnswerers = [];
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
			{spinnerScorer}
			{otherScorers}
			onwheelresult={handleWheelResult}
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
		<!-- Top bar: round indicator + turn + actions -->
		<div class="game-topbar">
			<!-- Round display -->
			<div class="round-indicator">
				<span class="round-label">Runde</span>
				<span class="round-nums">
					{#each Array.from({ length: gs.boardCount }, (_, i) => i + 1) as n}
						<span
							class="round-pip"
							class:active={gs.currentBoard === n}
							class:done={n === 1 ? gs.board1Complete : n === 2 ? gs.board2Complete : false}
						>{n}</span>
					{/each}
				</span>
				<span class="round-of">von {gs.boardCount}</span>
			</div>

			<!-- Current turn -->
			{#if currentTurnEntry}
				<div class="turn-pill" style={`border-color: ${currentTurnEntry.color}60`}>
					<span class="turn-avatar">{currentTurnEntry.avatar}</span>
					<span class="turn-name" style={`color: ${currentTurnEntry.color}`}>{currentTurnEntry.name}</span>
					<span class="turn-label">ist dran</span>
				</div>
			{/if}

			<!-- Actions (right-aligned) -->
			<div class="topbar-actions">
				<button class="action-btn" onclick={openSolutions} title="Lösungsboard öffnen">
					<span class="action-icon">🗝️</span>
					<span class="action-label">Lösungen</span>
				</button>
				<button class="action-btn action-end" onclick={() => goto('/winner')} title="Spiel beenden">
					<span class="action-icon">🏆</span>
					<span class="action-label">Beenden</span>
				</button>
			</div>
		</div>

		<!-- Next-round unlock banner -->
		{#if gs.currentBoard === 1 && gs.board1Complete && gs.boardCount >= 2}
			<div class="advance-banner" onclick={() => gameStore.switchBoard(2)} role="button" tabindex="0" onkeydown={() => {}}>
				🎉 Runde 1 abgeschlossen — <strong>Runde 2 starten →</strong>
			</div>
		{/if}
		{#if gs.currentBoard === 2 && gs.board2Complete && gs.boardCount >= 3}
			<div class="advance-banner" onclick={() => gameStore.switchBoard(3)} role="button" tabindex="0" onkeydown={() => {}}>
				🎉 Runde 2 abgeschlossen — <strong>Runde 3 starten →</strong>
			</div>
		{/if}

		<!-- Game board -->
		<div class="board-wrap">
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
		</div>

		<!-- Chaos Category: full-width row below the board -->
		{#if gs.chaosEnabled}
			<div class="chaos-section">
				<div class="chaos-header">
					<span class="chaos-dice">🎲</span>
					<span class="chaos-title">{gs.chaosCategory.name}</span>
					<span class="chaos-dice">🎲</span>
				</div>
				<div class="chaos-row">
					{#each gs.chaosCategory.questions as philQ}
						{@const philTs = tileStatus(philQ.id)}
						{@const typeIcon = philQ.chaosType === 'wordle' ? '🟩' : philQ.chaosType === 'hangman' ? '🪢' : '❓'}
						<button
							class="chaos-tile"
							class:correct={philTs === 'correct'}
							class:missed={philTs === 'missed'}
							class:open={philTs === 'open'}
							disabled={philTs !== 'open'}
							onclick={() => openQuestion(philQ)}
						>
							{#if philTs === 'correct'}
								<span class="chaos-tile-avatar">{scorerAvatar(gs.answered[philQ.id]!)}</span>
								<span class="chaos-tile-name">{scorerName(gs.answered[philQ.id]!)}</span>
							{:else if philTs === 'missed'}
								<span class="tile-missed-icon">✗</span>
							{:else}
								<span class="chaos-tile-type">{typeIcon}</span>
								<span class="chaos-tile-pts">{philQ.points}</span>
								{#if philQ.timerEnabled}<span class="chaos-timer-badge">⏱</span>{/if}
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
	<Scoreboard />
{/if}

<style>
	.game-page {
		min-height: calc(100vh - 70px - 90px);
		padding: 1.25rem 1rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		position: relative;
		z-index: 1;
	}

	/* ── Game topbar ────────────────────────────────────── */
	.game-topbar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 0.65rem;
		background: #160930;
		border: 1.5px solid #2a1050;
		border-radius: 1rem;
		padding: 0.5rem 0.85rem;
		margin: 0 20px;
	}

	.round-indicator {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-shrink: 0;
	}

	.round-label {
		font-size: 0.7rem;
		font-weight: 700;
		color: #4a2d7a;
		text-transform: uppercase;
		letter-spacing: 0.8px;
	}

	.round-nums {
		display: flex;
		gap: 0.25rem;
	}

	.round-pip {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Fredoka One', cursive;
		font-size: 0.82rem;
		border: 1.5px solid #2a1050;
		background: #0f0624;
		color: #4a2d7a;
		transition: all 0.2s;
	}

	.round-pip.active {
		background: linear-gradient(135deg, #a855f7, #d946ef);
		border-color: transparent;
		color: white;
		box-shadow: 0 2px 10px rgba(168, 85, 247, 0.5);
	}

	.round-pip.done {
		background: #052e16;
		border-color: #16a34a;
		color: #4ade80;
	}

	.round-of {
		font-size: 0.7rem;
		font-weight: 700;
		color: #4a2d7a;
	}

	.turn-pill {
		justify-self: center;
		display: flex;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid;
		border-radius: 999px;
		padding: 0.2rem 0.7rem 0.2rem 0.45rem;
		background: rgba(255,255,255,0.03);
		animation: slide-in 0.25s ease-out;
	}

	@keyframes slide-in {
		from { opacity: 0; transform: translateY(-4px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.turn-avatar { font-size: 1rem; }

	.turn-name {
		font-family: 'Fredoka One', cursive;
		font-size: 0.88rem;
		font-weight: 900;
	}

	.turn-label {
		font-size: 0.72rem;
		color: #4a2d7a;
		font-weight: 600;
	}

	.topbar-actions {
		display: flex;
		gap: 0.4rem;
		justify-content: flex-end;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		background: #1a0a30;
		border: 1.5px solid #2a1050;
		border-radius: 0.6rem;
		color: #6b47a0;
		font-family: 'Fredoka One', cursive;
		font-size: 0.78rem;
		padding: 0.3rem 0.65rem;
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
		flex-shrink: 0;
	}

	.action-btn:hover { border-color: #5b21b6; color: #a78bca; }

	.action-end { border-color: #451a03; color: #92400e; }
	.action-end:hover { border-color: #b45309; color: #fbbf24; }

	.action-icon { font-size: 0.9rem; }
	.action-label { font-size: 0.75rem; }

	/* ── Advance banner ─────────────────────────────────── */
	.advance-banner {
		text-align: center;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #4ade80;
		background: #052e16;
		border: 1.5px solid #16a34a;
		border-radius: 1rem;
		padding: 0.6rem 1rem;
		cursor: pointer;
		transition: box-shadow 0.15s;
		animation: slide-in 0.3s ease-out;
	}

	.advance-banner:hover {
		box-shadow: 0 4px 18px rgba(74, 222, 128, 0.3);
	}

	/* ── Board grid ─────────────────────────────────────── */
	.board-wrap {
		overflow-x: auto;
	}

	.main-board {
		display: grid;
		gap: 6px;
		padding: 0 20px;
		min-width: 600px;
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

	/* ── Chaos section ──────────────────────────────────── */
	.chaos-section {
		margin: 0 20px;
		border: 1.5px solid #b91c1c;
		border-radius: 1.25rem;
		overflow: hidden;
		box-shadow: 0 4px 24px rgba(239, 68, 68, 0.2);
	}

	.chaos-header {
		background: linear-gradient(135deg, #7f1d1d, #450a0a);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		padding: 0.55rem 1rem;
	}

	.chaos-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #fca5a5;
		letter-spacing: 0.5px;
	}

	.chaos-dice {
		font-size: 1rem;
		animation: spin-slow 4s linear infinite;
	}

	@keyframes spin-slow {
		0%   { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.chaos-row {
		display: flex;
		gap: 6px;
		padding: 10px;
		overflow-x: auto;
		background: #1a0808;
	}

	.chaos-tile {
		flex: 1;
		min-width: 72px;
		min-height: 80px;
		border-radius: 0.85rem;
		border: 1.5px solid #b91c1c;
		background: linear-gradient(160deg, #3b0a0a, #1e0505);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.2rem;
		position: relative;
		transition: transform 0.12s, box-shadow 0.12s, background 0.15s;
		padding: 0.5rem 0.3rem;
	}

	.chaos-tile.open:hover:not(:disabled) {
		transform: translateY(-4px) scale(1.04);
		box-shadow: 0 8px 24px rgba(239, 68, 68, 0.5);
		background: linear-gradient(160deg, #7f1d1d, #450a0a);
		border-color: #ef4444;
	}

	.chaos-tile:disabled { cursor: default; }

	.chaos-tile.correct {
		background: linear-gradient(135deg, #052e16, #0a1f14);
		border-color: #34d399;
		opacity: 0.75;
	}

	.chaos-tile.missed {
		background: linear-gradient(135deg, #1c0505, #150303);
		border-color: #450a0a;
		opacity: 0.4;
	}

	.chaos-tile-type {
		font-size: 1.1rem;
	}

	.chaos-tile-pts {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #fca5a5;
	}

	.chaos-timer-badge {
		position: absolute;
		top: 4px;
		right: 5px;
		font-size: 0.65rem;
		opacity: 0.7;
	}

	.chaos-tile-avatar {
		font-size: 1.2rem;
	}

	.chaos-tile-name {
		font-size: 0.6rem;
		color: #34d399;
		font-weight: 700;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 68px;
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

</style>
