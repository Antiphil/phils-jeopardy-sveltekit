<script lang="ts">
	import type { CategoryConfig } from '$lib/stores/savedGames';
	import QuestionEditor from './QuestionEditor.svelte';

	let { category = $bindable(), isPhil = false }: {
		category: CategoryConfig;
		isPhil?: boolean;
	} = $props();
</script>

<div class="cat-editor" class:phil={isPhil}>
	<div class="cat-header">
		{#if isPhil}
			<div class="cat-name-fixed">🎲 Chaos Category</div>
			<span class="cat-hint">Name ist fest</span>
		{:else}
			<div class="cat-name-wrap">
				<span class="cat-name-label">✏️ Kategoriename</span>
				<input
					class="cat-name-input"
					type="text"
					placeholder="Kategoriename eingeben…"
					maxlength={32}
					bind:value={category.name}
				/>
			</div>
		{/if}
	</div>

	<div class="questions-list">
		{#each category.questions as _, i}
			<QuestionEditor bind:question={category.questions[i]} />
		{/each}
	</div>
</div>

<style>
	.cat-editor {
		background: #1a0a30;
		border: 1.5px solid #3d1a6e;
		border-radius: 0.9rem;
		overflow: hidden;
	}

	.cat-editor.phil {
		border-color: #d946ef;
	}

	.cat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.65rem 0.85rem;
		background: #220d40;
		border-bottom: 1px solid #3d1a6e;
	}

	.phil .cat-header {
		background: #2e0a48;
		border-bottom-color: #d946ef60;
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
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.cat-name-input:focus {
		border-color: #a855f7;
		box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
	}

	.cat-name-input::placeholder { color: #5b2d8a; }

	.cat-name-fixed {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #f0abfc;
	}

	.cat-hint {
		font-size: 0.7rem;
		color: #7c5faa;
		font-style: italic;
	}

	.questions-list {
		padding: 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
</style>
