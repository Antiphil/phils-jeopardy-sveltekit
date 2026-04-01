<script lang="ts">
	import type { Question } from '$lib/stores/game';
	import { playCorrect, playWrong } from '$lib/sounds';
	import { t } from '$lib/i18n';
	import Wordle from './Wordle.svelte';

	let { question, answerer, onclose, onaward, ontimeout }: {
		question: Question;
		answerer?: { name: string; avatar: string; color: string };
		onclose: () => void;
		onaward: (points: number) => void;
		ontimeout?: () => void;
	} = $props();

	// Answer is only revealed after a correct award
	let answerRevealed = $state(false);
	let timedOut = $state(false);

	// Timer state
	const hasTimer = $derived(!!(question.timerEnabled && question.timerSeconds && question.timerSeconds > 0));
	let timeLeft = $state(question.timerSeconds ?? 0);
	let timerRunning = $state(false);

	$effect(() => {
		if (!hasTimer) return;

		timeLeft = question.timerSeconds!;
		timerRunning = true;

		const interval = setInterval(() => {
			if (!timerRunning) { clearInterval(interval); return; }
			timeLeft--;
			if (timeLeft <= 0) {
				clearInterval(interval);
				timerRunning = false;
				timedOut = true;
				playWrong();
				// Brief delay so "Zeit abgelaufen!" is visible
				setTimeout(() => {
					ontimeout?.();
				}, 1400);
			}
		}, 1000);

		return () => {
			clearInterval(interval);
			timerRunning = false;
		};
	});

	const timerPercent = $derived(
		hasTimer && question.timerSeconds ? Math.max(0, timeLeft / question.timerSeconds) * 100 : 100
	);

	const timerUrgent = $derived(timeLeft <= 5 && timeLeft > 0);
	const timerCritical = $derived(timeLeft <= 10 && !timerUrgent);

	function stopTimer() {
		timerRunning = false;
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget && !answerRevealed && !timedOut) onclose();
	}

	const isWordle = $derived(question.chaosType === 'wordle');

	function handleAward(points: number) {
		stopTimer();
		if (points > 0) {
			playCorrect();
			answerRevealed = true;
		} else {
			playWrong();
			onaward(0);
		}
	}

	function handleWordleWin() {
		stopTimer();
		playCorrect();
		answerRevealed = true;
	}

	function handleWordleLose() {
		stopTimer();
		playWrong();
		onaward(0);
	}
</script>

<div class="backdrop" role="button" tabindex="-1" onmousedown={handleBackdrop} onkeydown={() => {}}>
	<div class="modal" role="dialog" aria-modal="true">

		<div class="points-badge">{question.points > 0 ? `${question.points} ${$t.questionModal.points}` : '🎲 Chaos Category'}</div>

		{#if hasTimer && !timedOut}
			<div class="timer-bar-wrap" class:urgent={timerUrgent} class:critical={timerCritical}>
				<div class="timer-bar-bg">
					<div class="timer-bar-fill" style={`width: ${timerPercent}%`}></div>
				</div>
				<span class="timer-count" class:urgent={timerUrgent}>{timeLeft}s</span>
			</div>
		{/if}

		{#if timedOut}
			<div class="timeout-banner">⏰ Zeit abgelaufen!</div>
		{/if}

		{#if answerer}
			<div class="answerer-row">
				<span class="answerer-avatar">{answerer.avatar}</span>
				<span class="answerer-name" style={`color: ${answerer.color}`}>{answerer.name}</span>
				<span class="answerer-label">{$t.questionModal.answering}</span>
			</div>
		{/if}

		{#if question.image}
			{@const domain = (() => { try { return new URL(question.image!).hostname.replace(/^www\./, ''); } catch { return null; } })()}
			<div class="image-wrap">
				<img class="question-image" src={question.image} alt="Fragenbild" />
				{#if domain}
					<a class="image-source" href={question.image} target="_blank" rel="noopener noreferrer">{domain}</a>
				{/if}
			</div>
		{/if}

		{#if isWordle}
			{#if answerRevealed}
				<div class="answer-box">
					<div class="answer-label">🟩 Gelöst!</div>
					<div class="answer-text">{question.answer.toUpperCase()}</div>
				</div>
				<button class="btn-reveal" onclick={() => onaward(question.points)}>
					{$t.questionModal.next}
				</button>
			{:else if !timedOut}
				<Wordle
					word={question.answer}
					hint={question.question}
					onwin={handleWordleWin}
					onlose={handleWordleLose}
				/>
			{/if}
		{:else}
			<div class="question-text">{question.question}</div>

			{#if answerRevealed}
				<div class="answer-box">
					<div class="answer-label">{$t.questionModal.answer}</div>
					<div class="answer-text">{question.answer}</div>
				</div>
				<button class="btn-reveal" onclick={() => onaward(question.points)}>
					{$t.questionModal.next}
				</button>
			{:else if !timedOut}
				<div class="award-row">
					<span class="award-label">{$t.questionModal.correctOrWrong}</span>
					<div class="award-btns">
						<button class="btn-award correct" onclick={() => handleAward(question.points)}>
							{$t.questionModal.correct}
						</button>
						<button class="btn-award wrong" onclick={() => handleAward(0)}>
							{$t.questionModal.wrong}
						</button>
					</div>
				</div>
			{/if}
		{/if}

		{#if !timedOut}
			<button class="close-btn" onclick={onclose} aria-label={$t.questionModal.close}>✕</button>
		{/if}
	</div>
</div>

<style>
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

	.modal {
		background: #1e0d38;
		border: 2px solid #5b21b6;
		border-radius: 1.5rem;
		padding: 2.5rem 2rem 2rem;
		width: 100%;
		max-width: 520px;
		max-height: 92vh;
		overflow-y: auto;
		box-shadow: 0 8px 48px rgba(168, 85, 247, 0.4);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		position: relative;
		text-align: center;
	}

	/* ── Timer bar ─────────────────────────────── */
	.timer-bar-wrap {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.timer-bar-bg {
		flex: 1;
		height: 8px;
		background: #2a1050;
		border-radius: 999px;
		overflow: hidden;
	}

	.timer-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #22d3ee, #a855f7);
		border-radius: 999px;
		transition: width 1s linear, background 0.3s;
	}

	.timer-bar-wrap.critical .timer-bar-fill {
		background: linear-gradient(90deg, #fbbf24, #f97316);
	}

	.timer-bar-wrap.urgent .timer-bar-fill {
		background: linear-gradient(90deg, #ef4444, #dc2626);
		animation: pulse-bar 0.5s ease-in-out infinite alternate;
	}

	@keyframes pulse-bar {
		from { opacity: 0.7; }
		to   { opacity: 1; }
	}

	.timer-count {
		font-family: 'Fredoka One', cursive;
		font-size: 1.1rem;
		color: #a78bca;
		min-width: 36px;
		text-align: right;
		transition: color 0.3s;
	}

	.timer-count.urgent {
		color: #ef4444;
		animation: pulse-count 0.4s ease-in-out infinite alternate;
	}

	@keyframes pulse-count {
		from { transform: scale(1); }
		to   { transform: scale(1.15); }
	}

	/* ── Timeout banner ────────────────────────── */
	.timeout-banner {
		font-family: 'Fredoka One', cursive;
		font-size: 1.6rem;
		color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
		border: 2px solid #ef4444;
		border-radius: 1rem;
		padding: 0.5rem 1.5rem;
		animation: shake 0.4s ease-out;
	}

	@keyframes shake {
		0%   { transform: translateX(0); }
		20%  { transform: translateX(-6px); }
		40%  { transform: translateX(6px); }
		60%  { transform: translateX(-4px); }
		80%  { transform: translateX(4px); }
		100% { transform: translateX(0); }
	}

	/* ── Rest (unchanged) ──────────────────────── */
	.answerer-row {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		background: #261040;
		border: 1px solid #3d1a6e;
		border-radius: 999px;
		padding: 0.25rem 0.85rem 0.25rem 0.5rem;
		font-size: 0.85rem;
	}

	.answerer-avatar { font-size: 1.1rem; }

	.answerer-name {
		font-family: 'Fredoka One', cursive;
		font-size: 0.9rem;
	}

	.answerer-label { color: #7c5faa; font-weight: 600; }

	.image-wrap {
		position: relative;
		width: 100%;
	}

	.question-image {
		width: 100%;
		max-height: 340px;
		object-fit: contain;
		border-radius: 0.85rem;
		border: 1.5px solid #5b21b6;
		background: #12082a;
		display: block;
	}

	.image-source {
		position: absolute;
		bottom: 6px;
		right: 8px;
		font-size: 0.6rem;
		color: rgba(255, 255, 255, 0.6);
		background: rgba(0, 0, 0, 0.5);
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		max-width: 70%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-decoration: none;
		transition: color 0.15s, background 0.15s;
	}

	.image-source:hover {
		color: rgba(255, 255, 255, 0.95);
		background: rgba(0, 0, 0, 0.75);
		text-decoration: underline;
	}

	.points-badge {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		padding: 0.3rem 1.2rem;
		border-radius: 999px;
		box-shadow: 0 2px 12px rgba(168,85,247,0.4);
	}

	.question-text {
		font-family: 'Fredoka One', cursive;
		font-size: clamp(1.3rem, 4vw, 1.9rem);
		color: #f3e8ff;
		line-height: 1.3;
	}

	.btn-reveal {
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 1.1rem;
		padding: 0.65rem 2rem;
		border-radius: 999px;
		border: none;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
		transition: transform 0.15s, box-shadow 0.15s;
	}

	.btn-reveal:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(217, 70, 239, 0.5);
	}

	.answer-box {
		background: #261040;
		border: 1.5px solid #5b21b6;
		border-radius: 1rem;
		padding: 1rem 1.5rem;
		width: 100%;
	}

	.answer-label {
		font-size: 0.75rem;
		color: #a78bca;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-bottom: 0.4rem;
	}

	.answer-text {
		font-family: 'Fredoka One', cursive;
		font-size: 1.4rem;
		color: #fbbf24;
	}

	.award-row {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
	}

	.award-label {
		font-size: 0.85rem;
		color: #a78bca;
		font-weight: 600;
	}

	.award-btns {
		display: flex;
		gap: 0.75rem;
	}

	.btn-award {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		padding: 0.55rem 1.5rem;
		border-radius: 999px;
		border: none;
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.15s;
	}

	.btn-award.correct {
		background: linear-gradient(135deg, #059669, #34d399);
		color: white;
		box-shadow: 0 3px 12px rgba(52,211,153,0.35);
	}

	.btn-award.correct:hover { transform: translateY(-2px); box-shadow: 0 5px 16px rgba(52,211,153,0.5); }

	.btn-award.wrong {
		background: linear-gradient(135deg, #be123c, #f87171);
		color: white;
		box-shadow: 0 3px 12px rgba(248,113,113,0.35);
	}

	.btn-award.wrong:hover { transform: translateY(-2px); box-shadow: 0 5px 16px rgba(248,113,113,0.5); }

	.close-btn {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: #32155a;
		border: 1px solid #5b21b6;
		color: #a78bca;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s, color 0.15s;
	}

	.close-btn:hover { background: #5b21b6; color: #f3e8ff; }
</style>
