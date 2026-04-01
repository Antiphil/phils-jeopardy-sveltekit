<script lang="ts">
	import type { CategoryConfig } from '$lib/stores/savedGames';
	import QuestionEditor from './QuestionEditor.svelte';

	let { category = $bindable(), isPhil = false, editingLang = '', langs = [] }: {
		category: CategoryConfig;
		isPhil?: boolean;
		editingLang?: string;
		langs?: string[];
	} = $props();

	const showTimer = $derived(isPhil);

	const isMulti = $derived(langs.length > 1);
	const isPrimary = $derived(!editingLang || editingLang === langs[0]);

	const isComplete = $derived(
		!!category.name.trim() &&
		category.questions.every((q) => !!q.question.trim() && !!q.answer.trim())
	);

	function getName(): string {
		if (isPrimary || !editingLang) return category.name;
		return category.nameTranslations?.[editingLang] ?? '';
	}

	function setName(val: string) {
		if (isPrimary || !editingLang) {
			category = { ...category, name: val };
		} else {
			category = {
				...category,
				nameTranslations: { ...category.nameTranslations, [editingLang]: val },
			};
		}
	}
</script>

<div class="cat-editor" class:phil={isPhil} class:complete={isComplete}>
	<div class="cat-header">
		{#if isPhil}
			<div class="cat-name-fixed">🎲 Chaos Category</div>
		{:else}
			<div class="cat-name-wrap">
				<span class="cat-name-label">✏️ Kategoriename</span>
				<input
					class="cat-name-input"
					type="text"
					placeholder="Kategoriename eingeben…"
					maxlength={32}
					value={getName()}
					oninput={(e) => setName((e.target as HTMLInputElement).value)}
				/>
			</div>
		{/if}
		{#if isComplete}
			<span class="cat-complete-badge">✓ Fertig</span>
		{/if}
	</div>

	<div class="questions-list">
		{#each category.questions as _, i}
			<QuestionEditor bind:question={category.questions[i]} {editingLang} {langs} {showTimer} />
		{/each}
	</div>
</div>

<style>
	.cat-editor {
		background: #1a0a30;
		border: 1.5px solid #3d1a6e;
		border-radius: 0.9rem;
		overflow: hidden;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.cat-editor.phil { border-color: #d946ef; }

	.cat-editor.complete {
		border-color: #16a34a;
		box-shadow: 0 0 12px rgba(22, 163, 74, 0.2);
		background: #061410;
	}

	.cat-editor.phil.complete { border-color: #16a34a; }

	.cat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.65rem 0.85rem;
		background: #220d40;
		border-bottom: 1px solid #3d1a6e;
		transition: background 0.2s;
	}

	.complete .cat-header {
		background: #071f12;
		border-bottom-color: #14532d;
	}

	.phil .cat-header {
		background: #2e0a48;
		border-bottom-color: #d946ef60;
	}

	.cat-complete-badge {
		font-family: 'Fredoka One', cursive;
		font-size: 0.72rem;
		color: #4ade80;
		background: rgba(74, 222, 128, 0.1);
		border: 1px solid #16a34a;
		border-radius: 999px;
		padding: 0.15rem 0.55rem;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.cat-name-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		flex: 1;
		min-width: 0;
	}

	.cat-name-label {
		font-size: 0.65rem;
		font-weight: 700;
		color: #7c5faa;
		text-transform: uppercase;
		letter-spacing: 0.8px;
	}

	.cat-name-input {
		width: 100%;
		background: #32155a;
		border: 1.5px solid #5b21b6;
		border-radius: 0.5rem;
		outline: none;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #f3e8ff;
		padding: 0.35rem 0.65rem;
		transition: border-color 0.15s, box-shadow 0.15s, background 0.2s;
	}

	.cat-name-input:focus {
		border-color: #a855f7;
		box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
	}

	.cat-name-input::placeholder { color: #5b2d8a; }

	.complete .cat-name-input {
		background: #0d3320;
		border-color: #16a34a;
		color: #86efac;
	}

	.complete .cat-name-input:focus {
		border-color: #4ade80;
		box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.15);
	}

	.cat-name-fixed {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #f0abfc;
	}

	.questions-list {
		padding: 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
</style>
