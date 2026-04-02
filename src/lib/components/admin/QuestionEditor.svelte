<script lang="ts">
	import type { QuestionConfig } from '$lib/stores/savedGames';
	import { t } from '$lib/i18n';

	let { question = $bindable(), editingLang = '', langs = [], showTimer = false }: {
		question: QuestionConfig;
		editingLang?: string;
		langs?: string[];
		showTimer?: boolean;
	} = $props();

	const MAX_GUESSES = 6;

	let expanded = $state(false);

	const isPrimary = $derived(!editingLang || editingLang === langs[0]);
	const chaosType = $derived(question.chaosType ?? 'question');
	const isComplete = $derived(
		chaosType === 'wheel' || chaosType === 'spotdiff'
			? true
			: !!question.question.trim() && !!question.answer.trim()
	);

	function getQ(): string {
		if (isPrimary) return question.question;
		return question.translations?.[editingLang]?.question ?? '';
	}

	function setQ(val: string) {
		if (isPrimary) {
			question = { ...question, question: val };
		} else {
			question = {
				...question,
				translations: { ...question.translations, [editingLang]: { question: val, answer: getA() } },
			};
		}
	}

	function getA(): string {
		if (isPrimary) return question.answer;
		return question.translations?.[editingLang]?.answer ?? '';
	}

	function setA(val: string) {
		if (isPrimary) {
			question = { ...question, answer: val };
		} else {
			question = {
				...question,
				translations: { ...question.translations, [editingLang]: { question: getQ(), answer: val } },
			};
		}
	}

	const preview = $derived(question.question
		? question.question.slice(0, 48) + (question.question.length > 48 ? '…' : '')
		: $t.questionEditor.noQuestion);
</script>

<div class="qe" class:expanded class:complete={isComplete}>
	<button class="qe-header" onclick={() => expanded = !expanded}>
		<span class="qe-pts">{question.points > 0 ? `${question.points} Pkt` : '⭐ Phil'}</span>
		<span class="qe-preview" class:done={isComplete}>{preview}</span>
		{#if isComplete}<span class="qe-check">✓</span>{/if}
		<span class="qe-chevron" class:open={expanded}>›</span>
	</button>

	{#if expanded}
		<div class="qe-body">
			{#if showTimer}
				<div class="field">
					<span class="field-label">Spielmodus</span>
					<select
						class="field-input type-select"
						value={chaosType}
						onchange={(e) => {
							question = { ...question, chaosType: (e.target as HTMLSelectElement).value as 'question' | 'wordle' | 'hangman' | 'wheel' | 'spotdiff' };
						}}
					>
						<option value="question">❓ Frage / Aufgabe</option>
						<option value="wordle">🟩 Wordle</option>
						<option value="hangman">🪢 Hangman</option>
						<option value="wheel">🎡 Chaos Wheel</option>
							<option value="spotdiff">🔍 Finde den Fehler</option>
					</select>
				</div>
			{/if}

			{#if chaosType === 'wheel'}
				<div class="wheel-info">
					<span class="wheel-info-icon">🎡</span>
					<span>Das Chaos Wheel dreht sich — kein Text nötig.<br/>Die Effekte werden zufällig bestimmt.</span>
				</div>
			{:else if chaosType === 'spotdiff'}
				<div class="wheel-info">
					<span class="wheel-info-icon">🔍</span>
					<span>Ein 8×8-Bild-Grid wird angezeigt — ein Tile enthält einen Fehler.<br/>Szenen werden aus <code>src/lib/assets/spot-diff/</code> geladen.</span>
				</div>
			{:else if chaosType === 'wordle' || chaosType === 'hangman'}
				<div class="field">
					<span class="field-label">Wort zum Erraten</span>
					<input
						class="field-input wordle-word-input"
						type="text"
						placeholder="z.B. BERLIN"
						value={getA()}
						oninput={(e) => {
							const val = (e.target as HTMLInputElement).value.replace(/[^a-zA-ZäöüÄÖÜ]/g, '').toUpperCase();
							(e.target as HTMLInputElement).value = val;
							setA(val);
						}}
					/>
					{#if question.answer}
						<span class="wordle-len-hint">{question.answer.length} Buchstaben · {MAX_GUESSES} Versuche</span>
					{/if}
				</div>
				<div class="field">
					<span class="field-label">Hinweis (optional)</span>
					<textarea
						class="field-input"
						rows="2"
						placeholder="Wird über dem Spielfeld angezeigt…"
						value={getQ()}
						oninput={(e) => setQ((e.target as HTMLTextAreaElement).value)}
					></textarea>
				</div>
			{:else}
				<div class="field">
					<span class="field-label">{$t.questionEditor.question}</span>
					<textarea
						class="field-input"
						rows="2"
						placeholder={$t.questionEditor.questionPlaceholder}
						value={getQ()}
						oninput={(e) => setQ((e.target as HTMLTextAreaElement).value)}
					></textarea>
				</div>

				<div class="field">
					<span class="field-label">{$t.questionEditor.answer}</span>
					<input
						class="field-input"
						type="text"
						placeholder={$t.questionEditor.answerPlaceholder}
						value={getA()}
						oninput={(e) => setA((e.target as HTMLInputElement).value)}
					/>
				</div>

				<div class="field">
					<span class="field-label">{$t.questionEditor.imageUrl}</span>
					<input
						class="field-input"
						type="url"
						placeholder={$t.questionEditor.imagePlaceholder}
						bind:value={question.image}
					/>
					{#if question.image}
						<img class="img-preview" src={question.image} alt="Vorschau" />
					{/if}
				</div>
			{/if}

			{#if showTimer}
				<div class="field timer-field" class:timer-disabled={chaosType === 'wheel'}>
					<label class="timer-toggle">
						<input
							type="checkbox"
							class="timer-checkbox"
							checked={question.timerEnabled ?? false}
							disabled={chaosType === 'wheel'}
							onchange={(e) => {
								const enabled = (e.target as HTMLInputElement).checked;
								question = { ...question, timerEnabled: enabled, timerSeconds: question.timerSeconds ?? 30 };
							}}
						/>
						<span class="timer-toggle-label">⏱ Timer aktivieren</span>
					</label>
					{#if question.timerEnabled}
						<div class="timer-seconds-row">
							<input
								class="field-input timer-input"
								type="number"
								min="5"
								max="300"
								value={question.timerSeconds ?? 30}
								oninput={(e) => {
									const val = parseInt((e.target as HTMLInputElement).value) || 30;
									question = { ...question, timerSeconds: Math.max(5, Math.min(300, val)) };
								}}
							/>
							<span class="timer-unit">Sekunden</span>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.qe {
		border: 1.5px solid #3d1a6e;
		border-radius: 0.65rem;
		overflow: hidden;
		transition: border-color 0.15s;
	}

	.qe.expanded { border-color: #7c3aed; }

	.qe.complete {
		border-color: #166534;
		box-shadow: inset 3px 0 0 #16a34a;
	}

	.qe.complete.expanded { border-color: #16a34a; }

	.qe-header {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: #1e0d38;
		border: none;
		padding: 0.55rem 0.75rem;
		cursor: pointer;
		text-align: left;
		transition: background 0.15s;
	}

	.qe-header:hover { background: #2a1050; }

	.qe.complete .qe-header { background: #0a1f14; }
	.qe.complete .qe-header:hover { background: #0d2a1a; }

	.qe-pts {
		font-family: 'Fredoka One', cursive;
		font-size: 0.75rem;
		background: linear-gradient(135deg, #fbbf24, #f59e0b);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		min-width: 52px;
		flex-shrink: 0;
	}

	.qe-preview {
		flex: 1;
		font-size: 0.8rem;
		color: #a78bca;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.qe-preview.done { color: #4ade80; }

	.qe-check {
		font-size: 0.72rem;
		font-weight: 800;
		color: #4ade80;
		flex-shrink: 0;
	}

	.qe-chevron {
		font-size: 1.1rem;
		color: #6b47a0;
		transform: rotate(90deg);
		transition: transform 0.2s;
		flex-shrink: 0;
	}

	.qe-chevron.open { transform: rotate(-90deg); }

	.qe-body {
		background: #170a2e;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		border-top: 1px solid #3d1a6e;
	}

	.field { display: flex; flex-direction: column; gap: 0.25rem; }

	.field-label {
		font-size: 0.7rem;
		font-weight: 700;
		color: #7c5faa;
		text-transform: uppercase;
		letter-spacing: 0.8px;
	}

	.field-input {
		background: #261040;
		border: 1.5px solid #3d1a6e;
		border-radius: 0.5rem;
		color: #f3e8ff;
		font-family: 'Nunito', sans-serif;
		font-size: 0.9rem;
		padding: 0.45rem 0.65rem;
		resize: vertical;
		outline: none;
		transition: border-color 0.15s;
		width: 100%;
	}

	.field-input:focus { border-color: #7c3aed; }
	.field-input::placeholder { color: #4a2d7a; }

	.img-preview {
		max-width: 100%;
		max-height: 140px;
		border-radius: 0.5rem;
		border: 1.5px solid #3d1a6e;
		object-fit: contain;
		margin-top: 0.25rem;
	}

	.timer-field {
		border-top: 1px solid #2a1050;
		padding-top: 0.5rem;
		gap: 0.4rem;
	}

	.timer-disabled {
		opacity: 0.35;
		pointer-events: none;
	}

	.timer-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		width: fit-content;
	}

	.timer-checkbox {
		width: 15px;
		height: 15px;
		accent-color: #ef4444;
		cursor: pointer;
		flex-shrink: 0;
	}

	.timer-toggle-label {
		font-size: 0.78rem;
		font-weight: 700;
		color: #f87171;
		letter-spacing: 0.3px;
	}

	.timer-seconds-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.timer-input {
		width: 80px !important;
		text-align: center;
		border-color: #7f1d1d !important;
		color: #fca5a5 !important;
	}

	.timer-input:focus { border-color: #ef4444 !important; }

	.timer-unit {
		font-size: 0.78rem;
		color: #7f1d1d;
		font-weight: 700;
	}

	.type-select {
		appearance: none;
		cursor: pointer;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b47a0'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.65rem center;
		padding-right: 2rem;
	}

	.wordle-word-input {
		font-family: 'Fredoka One', cursive;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		font-size: 1rem;
	}

	.wheel-info {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		background: rgba(124, 58, 237, 0.08);
		border: 1px dashed #5b21b6;
		border-radius: 0.5rem;
		padding: 0.6rem 0.75rem;
		font-size: 0.78rem;
		color: #a78bca;
		line-height: 1.5;
	}

	.wheel-info-icon { font-size: 1.1rem; flex-shrink: 0; }

	.wordle-len-hint {
		font-size: 0.68rem;
		font-weight: 700;
		color: #4ade80;
		letter-spacing: 0.3px;
	}
</style>
