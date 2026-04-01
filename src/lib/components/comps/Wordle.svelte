<script lang="ts">
	let { word, hint = '', onwin, onlose }: {
		word: string;
		hint?: string;
		onwin: () => void;
		onlose: () => void;
	} = $props();

	const TARGET = word.toUpperCase().trim();
	const WORD_LEN = TARGET.length;
	const MAX_GUESSES = 6;

	type CellState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

	let submittedGuesses: { letter: string; state: CellState }[][] = $state([]);
	let currentInput = $state('');
	let gameOver = $state(false);
	let won = $state(false);
	let shake = $state(false);
	let revealedRow = $state(-1);

	let keyStates: Record<string, CellState> = $state({});

	const PRIORITY: Record<CellState, number> = { correct: 3, present: 2, absent: 1, tbd: 0, empty: 0 };

	function evalGuess(input: string): { letter: string; state: CellState }[] {
		const guess = input.toUpperCase().split('');
		const targetArr = TARGET.split('');
		const states: CellState[] = Array(WORD_LEN).fill('absent');
		const targetUsed = Array(WORD_LEN).fill(false);
		const guessUsed = Array(WORD_LEN).fill(false);

		// Pass 1: correct position
		for (let i = 0; i < WORD_LEN; i++) {
			if (guess[i] === targetArr[i]) {
				states[i] = 'correct';
				targetUsed[i] = true;
				guessUsed[i] = true;
			}
		}
		// Pass 2: present but wrong position
		for (let i = 0; i < WORD_LEN; i++) {
			if (guessUsed[i]) continue;
			for (let j = 0; j < WORD_LEN; j++) {
				if (!targetUsed[j] && guess[i] === targetArr[j]) {
					states[i] = 'present';
					targetUsed[j] = true;
					break;
				}
			}
		}
		return guess.map((letter, i) => ({ letter, state: states[i] }));
	}

	function submitGuess() {
		if (gameOver || currentInput.length !== WORD_LEN) {
			shake = true;
			setTimeout(() => (shake = false), 420);
			return;
		}

		const cells = evalGuess(currentInput);
		const rowIdx = submittedGuesses.length;
		submittedGuesses = [...submittedGuesses, cells];
		revealedRow = rowIdx;

		// Update keyboard state
		const next = { ...keyStates };
		cells.forEach(({ letter, state }) => {
			if (!next[letter] || PRIORITY[state] > PRIORITY[next[letter]]) next[letter] = state;
		});
		keyStates = next;

		const isWin = cells.every((c) => c.state === 'correct');
		if (isWin) {
			won = true;
			gameOver = true;
			setTimeout(onwin, WORD_LEN * 120 + 600);
		} else if (submittedGuesses.length >= MAX_GUESSES) {
			gameOver = true;
			setTimeout(onlose, 800);
		}

		currentInput = '';
	}

	function pressKey(key: string) {
		if (gameOver) return;
		if (key === 'ENTER') { submitGuess(); return; }
		if (key === '⌫') { currentInput = currentInput.slice(0, -1); return; }
		if (/^[A-ZÄÖÜ]$/.test(key) && currentInput.length < WORD_LEN) currentInput += key;
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		if (e.key === 'Enter') { pressKey('ENTER'); return; }
		if (e.key === 'Backspace') { pressKey('⌫'); return; }
		pressKey(e.key.toUpperCase());
	}

	const KEYBOARD = [
		['Q','W','E','R','T','Z','U','I','O','P','Ü'],
		['A','S','D','F','G','H','J','K','L','Ö','Ä'],
		['ENTER','Y','X','C','V','B','N','M','⌫'],
	];

	const displayRows = $derived.by(() => {
		const rows: { letter: string; state: CellState; flip?: boolean }[][] = [];
		for (let i = 0; i < submittedGuesses.length; i++) {
			rows.push(submittedGuesses[i].map((c) => ({ ...c, flip: true })));
		}
		if (!gameOver && rows.length < MAX_GUESSES) {
			const row = Array.from({ length: WORD_LEN }, (_, i) => ({
				letter: currentInput[i] ?? '',
				state: (currentInput[i] ? 'tbd' : 'empty') as CellState,
				flip: false,
			}));
			rows.push(row);
		}
		while (rows.length < MAX_GUESSES) {
			rows.push(Array.from({ length: WORD_LEN }, () => ({ letter: '', state: 'empty' as CellState, flip: false })));
		}
		return rows;
	});
</script>

<svelte:window {onkeydown} />

<div class="wordle">
	{#if hint}
		<p class="wordle-hint">{hint}</p>
	{/if}

	<!-- Grid -->
	<div class="grid" style={`--cols: ${WORD_LEN}`}>
		{#each displayRows as row, ri}
			<div class="row" class:shake={shake && ri === submittedGuesses.length} class:win={won && ri === submittedGuesses.length - 1}>
				{#each row as cell, ci}
					<div
						class="cell"
						class:tbd={cell.state === 'tbd'}
						class:correct={cell.state === 'correct'}
						class:present={cell.state === 'present'}
						class:absent={cell.state === 'absent'}
						class:flip={cell.flip}
						style={cell.flip ? `animation-delay: ${ci * 120}ms` : ''}
					>
						{cell.letter}
					</div>
				{/each}
			</div>
		{/each}
	</div>

	{#if gameOver && !won}
		<div class="reveal-word">
			Das Wort war: <strong>{TARGET}</strong>
		</div>
	{/if}

	<!-- Keyboard -->
	<div class="keyboard">
		{#each KEYBOARD as row}
			<div class="kb-row">
				{#each row as key}
					<button
						class="kb-key"
						class:wide={key === 'ENTER' || key === '⌫'}
						class:correct={keyStates[key] === 'correct'}
						class:present={keyStates[key] === 'present'}
						class:absent={keyStates[key] === 'absent'}
						onclick={() => pressKey(key)}
					>
						{key}
					</button>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.wordle {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		width: 100%;
		user-select: none;
	}

	.wordle-hint {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #c4a8e8;
		margin: 0;
		text-align: center;
	}

	/* ── Grid ─────────────────────────────────── */
	.grid {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.row {
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		gap: 5px;
	}

	.row.shake {
		animation: shake 0.4s ease-out;
	}

	.row.win .cell {
		animation: bounce 0.1s ease-in-out forwards;
	}

	.row.win .cell:nth-child(1) { animation-delay: 0ms; }
	.row.win .cell:nth-child(2) { animation-delay: 80ms; }
	.row.win .cell:nth-child(3) { animation-delay: 160ms; }
	.row.win .cell:nth-child(4) { animation-delay: 240ms; }
	.row.win .cell:nth-child(5) { animation-delay: 320ms; }
	.row.win .cell:nth-child(6) { animation-delay: 400ms; }
	.row.win .cell:nth-child(7) { animation-delay: 480ms; }

	.cell {
		width: clamp(38px, 7vw, 52px);
		height: clamp(38px, 7vw, 52px);
		border: 2px solid #3d1a6e;
		border-radius: 0.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Fredoka One', cursive;
		font-size: clamp(1rem, 2.5vw, 1.4rem);
		color: #f3e8ff;
		background: transparent;
		transition: border-color 0.1s;
		text-transform: uppercase;
	}

	.cell.tbd {
		border-color: #7c3aed;
		animation: pop 0.08s ease-out;
	}

	.cell.flip {
		animation: flip 0.5s ease-in-out forwards;
	}

	.cell.correct {
		background: #16a34a;
		border-color: #16a34a;
		color: white;
	}

	.cell.present {
		background: #a16207;
		border-color: #a16207;
		color: white;
	}

	.cell.absent {
		background: #2a1050;
		border-color: #2a1050;
		color: #6b47a0;
	}

	@keyframes pop {
		0%   { transform: scale(1); }
		50%  { transform: scale(1.12); }
		100% { transform: scale(1); }
	}

	@keyframes flip {
		0%   { transform: rotateX(0deg); }
		45%  { transform: rotateX(-90deg); }
		55%  { transform: rotateX(-90deg); }
		100% { transform: rotateX(0deg); }
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		15%  { transform: translateX(-6px); }
		30%  { transform: translateX(6px); }
		45%  { transform: translateX(-5px); }
		60%  { transform: translateX(5px); }
		75%  { transform: translateX(-3px); }
		90%  { transform: translateX(3px); }
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(0) scale(1); }
		40%  { transform: translateY(-20px) scale(1.1); }
		60%  { transform: translateY(-12px); }
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

	/* ── Keyboard ─────────────────────────────── */
	.keyboard {
		display: flex;
		flex-direction: column;
		gap: 5px;
		width: 100%;
		max-width: 420px;
	}

	.kb-row {
		display: flex;
		gap: 4px;
		justify-content: center;
	}

	.kb-key {
		height: 42px;
		min-width: 30px;
		padding: 0 6px;
		border-radius: 0.4rem;
		border: none;
		background: #32155a;
		color: #e2d0ff;
		font-family: 'Fredoka One', cursive;
		font-size: 0.8rem;
		cursor: pointer;
		transition: background 0.15s, color 0.15s, transform 0.08s;
		flex: 1;
		max-width: 38px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.kb-key.wide {
		max-width: 58px;
		font-size: 0.65rem;
	}

	.kb-key:hover { background: #4a1e8a; }
	.kb-key:active { transform: scale(0.93); }

	.kb-key.correct { background: #16a34a; color: white; }
	.kb-key.present { background: #a16207; color: white; }
	.kb-key.absent  { background: #1a0a30; color: #3d1a6e; }
</style>
