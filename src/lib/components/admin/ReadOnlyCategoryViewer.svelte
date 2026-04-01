<script lang="ts">
	import type { CategoryConfig } from '$lib/stores/savedGames';

	let { category, editingLang = '' }: {
		category: CategoryConfig;
		editingLang?: string;
	} = $props();

	let openIdx: number | null = $state(null);

	function getName(): string {
		if (!editingLang || editingLang === 'de') return category.name;
		return category.nameTranslations?.[editingLang] || category.name;
	}

	function getQ(i: number): string {
		const q = category.questions[i];
		if (!editingLang || editingLang === 'de') return q.question;
		return q.translations?.[editingLang]?.question || q.question;
	}

	function getA(i: number): string {
		const q = category.questions[i];
		if (!editingLang || editingLang === 'de') return q.answer;
		return q.translations?.[editingLang]?.answer || q.answer;
	}
</script>

<div class="ro-cat">
	<div class="ro-header">
		<span class="ro-name">{getName()}</span>
		<span class="ro-lock">🔒</span>
	</div>
	<div class="ro-questions">
		{#each category.questions as q, i}
			{@const isOpen = openIdx === i}
			<button class="rq-row" onclick={() => openIdx = isOpen ? null : i}>
				<span class="rq-pts">{q.points > 0 ? `${q.points} Pkt` : '⭐'}</span>
				<span class="rq-preview">{isOpen ? getQ(i) : (getQ(i).slice(0, 50) + (getQ(i).length > 50 ? '…' : ''))}</span>
				{#if q.timerEnabled && q.timerSeconds}
					<span class="rq-timer-badge">⏱ {q.timerSeconds}s</span>
				{/if}
				<span class="rq-chevron" class:open={isOpen}>›</span>
			</button>
			{#if isOpen}
				<div class="rq-body">
					<div class="rq-field">
						<span class="rq-label">Frage</span>
						<p class="rq-text">{getQ(i)}</p>
					</div>
					<div class="rq-field">
						<span class="rq-label">Antwort</span>
						<p class="rq-text answer">{getA(i)}</p>
					</div>
					{#if q.timerEnabled && q.timerSeconds}
						<div class="rq-timer-info">
							<span class="rq-timer-dot"></span>
							<span class="rq-timer-text">Timer aktiv — {q.timerSeconds} Sekunden</span>
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.ro-cat {
		border: 2px solid #0e7490;
		border-radius: 0.9rem;
		overflow: hidden;
		background: #00111a;
		box-shadow: 0 0 16px rgba(6, 182, 212, 0.1);
	}

	.ro-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.65rem 0.85rem;
		background: linear-gradient(135deg, #052830, #041e26);
		border-bottom: 1px solid #0e7490;
	}

	.ro-name {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #67e8f9;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ro-lock {
		font-size: 0.8rem;
		flex-shrink: 0;
		opacity: 0.6;
	}

	.ro-questions {
		display: flex;
		flex-direction: column;
	}

	.rq-row {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: transparent;
		border: none;
		border-bottom: 1px solid #0a3040;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		text-align: left;
		transition: background 0.12s;
	}

	.rq-row:last-of-type { border-bottom: none; }
	.rq-row:hover { background: #041e26; }

	.rq-pts {
		font-family: 'Fredoka One', cursive;
		font-size: 0.72rem;
		color: #22d3ee;
		min-width: 50px;
		flex-shrink: 0;
	}

	.rq-preview {
		flex: 1;
		font-size: 0.78rem;
		color: #164e63;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.rq-row:hover .rq-preview { color: #0891b2; }

	.rq-chevron {
		font-size: 1.1rem;
		color: #155e75;
		transform: rotate(90deg);
		transition: transform 0.2s;
		flex-shrink: 0;
	}

	.rq-chevron.open { transform: rotate(-90deg); }

	.rq-body {
		background: #020d13;
		padding: 0.65rem 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border-bottom: 1px solid #0a3040;
	}

	.rq-field { display: flex; flex-direction: column; gap: 0.2rem; }

	.rq-label {
		font-size: 0.65rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: #155e75;
	}

	.rq-text {
		margin: 0;
		font-size: 0.88rem;
		color: #a5f3fc;
		line-height: 1.45;
	}

	.rq-text.answer {
		font-family: 'Fredoka One', cursive;
		font-size: 0.95rem;
		color: #22d3ee;
	}

	.rq-timer-badge {
		font-family: 'Fredoka One', cursive;
		font-size: 0.65rem;
		color: #fca5a5;
		background: rgba(239, 68, 68, 0.12);
		border: 1px solid #7f1d1d;
		border-radius: 999px;
		padding: 0.1rem 0.45rem;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.rq-timer-info {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.3rem 0.5rem;
		background: rgba(239, 68, 68, 0.07);
		border: 1px solid #7f1d1d;
		border-radius: 0.4rem;
	}

	.rq-timer-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #ef4444;
		flex-shrink: 0;
		box-shadow: 0 0 5px #ef4444aa;
		animation: timer-pulse 1.2s ease-in-out infinite alternate;
	}

	@keyframes timer-pulse {
		from { opacity: 0.5; box-shadow: 0 0 3px #ef4444aa; }
		to   { opacity: 1;   box-shadow: 0 0 8px #ef4444; }
	}

	.rq-timer-text {
		font-size: 0.7rem;
		font-weight: 700;
		color: #f87171;
		letter-spacing: 0.3px;
	}
</style>
