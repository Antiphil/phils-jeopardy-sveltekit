<script lang="ts">
	let { word, hint = '', onwin, onlose }: {
		word: string;
		hint?: string;
		onwin: () => void;
		onlose: () => void;
	} = $props();

	const TARGET = word.toUpperCase().trim();
	const MAX_WRONG = 6;

	let guessed: Set<string> = $state(new Set());
	let gameOver = $state(false);
	let won = $state(false);

	const wrongGuesses = $derived([...guessed].filter((l) => !TARGET.includes(l)));
	const wrongCount = $derived(wrongGuesses.length);

	const displayWord = $derived(
		TARGET.split('').map((l) => (l === ' ' ? ' ' : guessed.has(l) ? l : '_'))
	);

	const allRevealed = $derived(
		TARGET.split('').every((l) => l === ' ' || guessed.has(l))
	);

	$effect(() => {
		if (gameOver) return;
		if (allRevealed) {
			won = true;
			gameOver = true;
			setTimeout(onwin, 600);
		} else if (wrongCount >= MAX_WRONG) {
			gameOver = true;
			setTimeout(onlose, 800);
		}
	});

	function guess(letter: string) {
		if (gameOver || guessed.has(letter)) return;
		guessed = new Set([...guessed, letter]);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		const key = e.key.toUpperCase();
		if (/^[A-ZÄÖÜ]$/.test(key)) guess(key);
	}

	const KEYBOARD = [
		['Q','W','E','R','T','Z','U','I','O','P','Ü'],
		['A','S','D','F','G','H','J','K','L','Ö','Ä'],
		['Y','X','C','V','B','N','M'],
	];

	// SVG hangman parts — drawn progressively
	const PARTS = [
		// 1: head
		`<circle cx="100" cy="35" r="14" stroke="#ef4444" stroke-width="3" fill="none"/>`,
		// 2: body
		`<line x1="100" y1="49" x2="100" y2="100" stroke="#ef4444" stroke-width="3"/>`,
		// 3: left arm
		`<line x1="100" y1="62" x2="74" y2="84" stroke="#ef4444" stroke-width="3"/>`,
		// 4: right arm
		`<line x1="100" y1="62" x2="126" y2="84" stroke="#ef4444" stroke-width="3"/>`,
		// 5: left leg
		`<line x1="100" y1="100" x2="76" y2="124" stroke="#ef4444" stroke-width="3"/>`,
		// 6: right leg
		`<line x1="100" y1="100" x2="124" y2="124" stroke="#ef4444" stroke-width="3"/>`,
	];
</script>

<svelte:window {onkeydown} />

<div class="hangman">
	{#if hint}
		<p class="hint">{hint}</p>
	{/if}

	<!-- SVG Gallows -->
	<div class="gallows-wrap">
		<svg viewBox="0 0 160 145" class="gallows" xmlns="http://www.w3.org/2000/svg">
			<!-- Static structure -->
			<line x1="20" y1="140" x2="140" y2="140" stroke="#5b21b6" stroke-width="3"/>
			<line x1="50" y1="140" x2="50" y2="10"   stroke="#5b21b6" stroke-width="3"/>
			<line x1="50" y1="10"  x2="100" y2="10"  stroke="#5b21b6" stroke-width="3"/>
			<line x1="100" y1="10" x2="100" y2="21"  stroke="#5b21b6" stroke-width="3"/>
			<!-- Body parts -->
			{#each PARTS.slice(0, wrongCount) as part}
				{@html part}
			{/each}
		</svg>

		<!-- Wrong count badge -->
		<div class="wrong-badge" class:danger={wrongCount >= 4}>
			{wrongCount}/{MAX_WRONG}
		</div>
	</div>

	<!-- Word display -->
	<div class="word-display">
		{#each displayWord as char, i}
			{#if char === ' '}
				<span class="letter-gap"></span>
			{:else}
				<span
					class="letter-cell"
					class:revealed={char !== '_'}
					class:new-reveal={char !== '_' && guessed.has(TARGET[i])}
				>
					{char}
				</span>
			{/if}
		{/each}
	</div>

	{#if gameOver && !won}
		<div class="reveal-word">
			Das Wort war: <strong>{TARGET}</strong>
		</div>
	{/if}

	<!-- Wrong letters -->
	{#if wrongGuesses.length > 0}
		<div class="wrong-letters">
			{#each wrongGuesses as l}
				<span class="wrong-letter">{l}</span>
			{/each}
		</div>
	{/if}

	<!-- Keyboard -->
	<div class="keyboard">
		{#each KEYBOARD as row}
			<div class="kb-row">
				{#each row as key}
					{@const isGuessed = guessed.has(key)}
					{@const isCorrect = isGuessed && TARGET.includes(key)}
					{@const isWrong = isGuessed && !TARGET.includes(key)}
					<button
						class="kb-key"
						class:correct={isCorrect}
						class:wrong={isWrong}
						disabled={isGuessed || gameOver}
						onclick={() => guess(key)}
					>
						{key}
					</button>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.hangman {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.9rem;
		width: 100%;
		user-select: none;
	}

	.hint {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #c4a8e8;
		margin: 0;
		text-align: center;
	}

	/* ── Gallows ──────────────────────────────── */
	.gallows-wrap {
		position: relative;
		width: 140px;
	}

	.gallows {
		width: 100%;
		height: auto;
	}

	.wrong-badge {
		position: absolute;
		bottom: 0;
		right: 0;
		font-family: 'Fredoka One', cursive;
		font-size: 0.75rem;
		color: #6b47a0;
		background: #1e0d38;
		border: 1px solid #3d1a6e;
		border-radius: 999px;
		padding: 0.1rem 0.45rem;
		transition: color 0.2s, border-color 0.2s;
	}

	.wrong-badge.danger { color: #ef4444; border-color: #7f1d1d; }

	/* ── Word ─────────────────────────────────── */
	.word-display {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 5px;
	}

	.letter-cell {
		width: clamp(24px, 5vw, 36px);
		height: clamp(30px, 5.5vw, 42px);
		border-bottom: 2.5px solid #5b21b6;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 3px;
		font-family: 'Fredoka One', cursive;
		font-size: clamp(0.9rem, 2.2vw, 1.3rem);
		color: #f3e8ff;
		transition: color 0.15s;
	}

	.letter-cell.revealed { border-bottom-color: #4ade80; color: #4ade80; }
	.letter-cell.new-reveal { animation: pop-in 0.2s ease-out; }

	.letter-gap { width: 18px; }

	@keyframes pop-in {
		0%   { transform: scale(0.5); opacity: 0; }
		60%  { transform: scale(1.2); }
		100% { transform: scale(1);   opacity: 1; }
	}

	/* ── Reveal ───────────────────────────────── */
	.reveal-word {
		font-size: 0.9rem;
		color: #f87171;
		font-weight: 700;
		text-align: center;
	}

	.reveal-word strong {
		font-family: 'Fredoka One', cursive;
		font-size: 1.1rem;
		color: #fbbf24;
	}

	/* ── Wrong letters ────────────────────────── */
	.wrong-letters {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.wrong-letter {
		font-family: 'Fredoka One', cursive;
		font-size: 0.8rem;
		color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid #7f1d1d;
		border-radius: 0.3rem;
		padding: 0.1rem 0.4rem;
	}

	/* ── Keyboard ─────────────────────────────── */
	.keyboard {
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: 100%;
		max-width: 400px;
	}

	.kb-row {
		display: flex;
		gap: 3px;
		justify-content: center;
	}

	.kb-key {
		height: 38px;
		min-width: 28px;
		flex: 1;
		max-width: 36px;
		border-radius: 0.4rem;
		border: none;
		background: #32155a;
		color: #e2d0ff;
		font-family: 'Fredoka One', cursive;
		font-size: 0.78rem;
		cursor: pointer;
		transition: background 0.12s, color 0.12s, transform 0.08s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.kb-key:hover:not(:disabled) { background: #4a1e8a; }
	.kb-key:active:not(:disabled) { transform: scale(0.91); }
	.kb-key:disabled { cursor: default; }

	.kb-key.correct { background: #16a34a; color: white; }
	.kb-key.wrong   { background: #1a0a30; color: #3d1a6e; }
</style>
