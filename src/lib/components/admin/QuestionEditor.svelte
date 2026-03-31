<script lang="ts">
	import type { QuestionConfig } from '$lib/stores/savedGames';

	let { question = $bindable() }: { question: QuestionConfig } = $props();

	let expanded = $state(!question.question && !question.answer);
</script>

<div class="qe" class:expanded>
	<button class="qe-header" onclick={() => expanded = !expanded}>
		<span class="qe-pts">{question.points > 0 ? `${question.points} Pkt` : '⭐ Phil'}</span>
		<span class="qe-preview">
			{question.question ? question.question.slice(0, 48) + (question.question.length > 48 ? '…' : '') : 'Keine Frage'}
		</span>
		<span class="qe-chevron" class:open={expanded}>›</span>
	</button>

	{#if expanded}
		<div class="qe-body">
			<div class="field">
				<span class="field-label">Frage</span>
				<textarea
					class="field-input"
					rows="2"
					placeholder="Frage eingeben…"
					bind:value={question.question}
				></textarea>
			</div>

			<div class="field">
				<span class="field-label">Antwort</span>
				<input
					class="field-input"
					type="text"
					placeholder="Antwort eingeben…"
					bind:value={question.answer}
				/>
			</div>

			<div class="field">
				<span class="field-label">Bild-URL (optional)</span>
				<input
					class="field-input"
					type="url"
					placeholder="https://beispiel.de/bild.jpg"
					bind:value={question.image}
				/>
				{#if question.image}
					<img class="img-preview" src={question.image} alt="Vorschau" />
				{/if}
			</div>

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
</style>
