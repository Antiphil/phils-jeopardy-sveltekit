<script lang="ts">
	import { savedGamesStore } from '$lib/stores/savedGames';
	import type { SavedGame } from '$lib/stores/savedGames';
	import CategoryEditor from '$lib/components/admin/CategoryEditor.svelte';
	import GameListItem from '$lib/components/admin/GameListItem.svelte';
	import { locale } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Tab = 'board1' | 'board2' | 'chaos';

	let games = $derived([...$savedGamesStore].sort((a, b) => Number(b.isPublic) - Number(a.isPublic)));
	let editing: SavedGame | null = $state(null);
	let activeTab: Tab = $state('board1');
	let saved = $state(false);

	function selectGame(game: SavedGame) {
		editing = structuredClone(game);
		activeTab = 'board1';
	}

	async function newGame() {
		const created = await savedGamesStore.create($locale);
		editing = structuredClone(created);
		activeTab = 'board1';
	}

	async function saveGame() {
		if (!editing) return;
		const result = await savedGamesStore.save(editing);
		editing = structuredClone(result);
		saved = true;
		setTimeout(() => (saved = false), 1800);
	}

	async function deleteGame(id: string) {
		await savedGamesStore.delete(id);
		if (editing?.id === id) editing = null;
	}
</script>

<div class="admin-layout">

	<!-- Sidebar -->
	<aside class="sidebar">
		<div class="sidebar-header">
			<span class="sidebar-title">🎮 Spiele</span>
			<button class="btn-new" onclick={newGame}>＋ Neu</button>
		</div>
		<div class="game-list">
			{#if games.length === 0}
				<div class="empty-hint">Noch keine Spiele.<br/>Klick auf "＋ Neu".</div>
			{/if}
			{#each games as game (game.id)}
				<GameListItem
					{game}
					active={editing?.id === game.id}
					onselect={() => selectGame(game)}
					ondelete={() => deleteGame(game.id)}
				/>
			{/each}
		</div>
	</aside>

	<!-- Main editor -->
	<main class="editor">
		{#if editing}
			<div class="editor-topbar">
				<div class="topbar-row">
					<input
						class="game-name-input"
						type="text"
						placeholder="Spielname…"
						maxlength={48}
						bind:value={editing.name}
					/>
					<button class="btn-save" class:saved onclick={saveGame}>
						{#if saved}✓ Gespeichert{:else}💾 Speichern{/if}
					</button>
				</div>
				<div class="topbar-row topbar-options">
					<div class="option-field">
						<span class="option-label">Sprache</span>
						<div class="lang-picker">
							{#each [{ value: 'de', flag: '🇩🇪', name: 'DE' }, { value: 'en', flag: '🇬🇧', name: 'EN' }] as l}
								<button
									class="lang-pick-btn"
									class:active={editing.language === l.value}
									onclick={() => { if (editing) editing = { ...editing, language: l.value }; }}
								>{l.flag} {l.name}</button>
							{/each}
						</div>
					</div>
					<div class="option-field">
						<span class="option-label">Chaos Category</span>
						<button
							class="btn-toggle"
							class:active={editing.chaosEnabled}
							onclick={() => {
								if (!editing) return;
								const next = !editing.chaosEnabled;
								editing = { ...editing, chaosEnabled: next };
								if (!next && activeTab === 'chaos') activeTab = 'board1';
							}}
						>
							{#if editing.chaosEnabled}🎲 Aktiv{:else}🎲 Deaktiviert{/if}
						</button>
					</div>
					{#if data.isAdmin}
						<div class="option-field">
							<span class="option-label">Sichtbarkeit</span>
							<button
								class="btn-publish"
								class:published={editing.isPublic}
								onclick={() => {
									if (!editing) return;
									const next = !editing.isPublic;
									savedGamesStore.togglePublic(editing.id, next);
									editing = { ...editing, isPublic: next };
								}}
							>
								{#if editing.isPublic}🌐 Öffentlich{:else}🔒 Privat{/if}
							</button>
						</div>
					{/if}
				</div>
			</div>

			<div class="tabs">
				<button class="tab" class:active={activeTab === 'board1'} onclick={() => activeTab = 'board1'}>
					Runde 1 <span class="tab-pts">100–500</span>
				</button>
				<button class="tab" class:active={activeTab === 'board2'} onclick={() => activeTab = 'board2'}>
					Runde 2 <span class="tab-pts">200–1000</span>
				</button>
				{#if editing.chaosEnabled}
					<button class="tab phil-tab" class:active={activeTab === 'chaos'} onclick={() => activeTab = 'chaos'}>
						🎲 Chaos Category
					</button>
				{/if}
			</div>

			<div class="categories-scroll">
				{#if activeTab === 'chaos'}
					<div class="categories-grid single">
						<CategoryEditor bind:category={editing.chaosCategory} isPhil={true} />
					</div>
				{:else if activeTab === 'board1'}
					<div class="categories-grid">
						{#each editing.board1 as _, i}
							<CategoryEditor bind:category={editing.board1[i]} />
						{/each}
					</div>
				{:else}
					<div class="categories-grid">
						{#each editing.board2 as _, i}
							<CategoryEditor bind:category={editing.board2[i]} />
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">🎯</div>
				<p class="empty-text">Wähle ein Spiel aus<br/>oder erstelle ein neues.</p>
				<button class="btn-primary" onclick={newGame}>＋ Neues Spiel erstellen</button>
			</div>
		{/if}
	</main>

</div>

<style>
	.admin-layout {
		display: flex;
		height: calc(100vh - 70px);
		overflow: hidden;
		position: relative;
		z-index: 1;
	}

	/* ── Sidebar ─────────────────────────────────────── */
	.sidebar {
		width: 260px;
		flex-shrink: 0;
		background: #160930;
		border-right: 2px solid #3d1a6e;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid #3d1a6e;
		flex-shrink: 0;
	}

	.sidebar-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1.1rem;
		color: #c084fc;
	}

	.btn-new {
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		border: none;
		border-radius: 999px;
		padding: 0.3rem 0.8rem;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.btn-new:hover { opacity: 0.85; }

	.game-list {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.empty-hint {
		text-align: center;
		color: #5b2d8a;
		font-size: 0.85rem;
		padding: 2rem 1rem;
		line-height: 1.6;
	}

	/* ── Editor ──────────────────────────────────────── */
	.editor {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: #12082a;
	}

	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.empty-icon { font-size: 3.5rem; }

	.empty-text {
		text-align: center;
		font-size: 1rem;
		line-height: 1.6;
		color: #7c5faa;
	}

	.btn-primary {
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		padding: 0.6rem 1.8rem;
		border-radius: 999px;
		border: none;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(168, 85, 247, 0.35);
		transition: transform 0.15s;
	}

	.btn-primary:hover { transform: translateY(-2px); }

	.editor-topbar {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.85rem 1.25rem;
		border-bottom: 1.5px solid #3d1a6e;
		flex-shrink: 0;
		background: #160930;
	}

	.topbar-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.topbar-options {
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.option-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.option-label {
		font-size: 0.65rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.7px;
		color: #7c5faa;
	}

	.game-name-input {
		flex: 1;
		background: #261040;
		border: 1.5px solid #3d1a6e;
		border-radius: 0.65rem;
		color: #f3e8ff;
		font-family: 'Fredoka One', cursive;
		font-size: 1.2rem;
		padding: 0.45rem 0.85rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.game-name-input:focus { border-color: #7c3aed; }
	.game-name-input::placeholder { color: #4a2d7a; }

	.btn-save {
		font-family: 'Fredoka One', cursive;
		font-size: 0.95rem;
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		border: none;
		border-radius: 999px;
		padding: 0.45rem 1.3rem;
		cursor: pointer;
		white-space: nowrap;
		box-shadow: 0 3px 12px rgba(168,85,247,0.35);
		transition: background 0.3s, box-shadow 0.15s;
	}

	.btn-save.saved {
		background: linear-gradient(135deg, #059669, #34d399);
		box-shadow: 0 3px 12px rgba(52,211,153,0.35);
	}

	.btn-save:hover { opacity: 0.88; }

	.btn-publish {
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		background: #1e0d38;
		color: #7c5faa;
		border: 1.5px solid #3d1a6e;
		border-radius: 999px;
		padding: 0.45rem 1rem;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.2s, color 0.2s, border-color 0.2s;
	}

	.btn-publish:hover { border-color: #a855f7; color: #c084fc; }
	.btn-publish.published { background: #14532d30; color: #4ade80; border-color: #16a34a; }
	.btn-publish.published:hover { background: #7f1d1d30; color: #f87171; border-color: #b91c1c; }

	/* ── Tabs ────────────────────────────────────────── */
	.tabs {
		display: flex;
		gap: 0.4rem;
		padding: 0.75rem 1.25rem 0;
		border-bottom: 1.5px solid #3d1a6e;
		flex-shrink: 0;
		background: #160930;
	}

	.tab {
		font-family: 'Fredoka One', cursive;
		font-size: 0.9rem;
		background: transparent;
		border: 1.5px solid #3d1a6e;
		color: #7c5faa;
		border-radius: 0.6rem 0.6rem 0 0;
		border-bottom: none;
		padding: 0.45rem 1.1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		transition: background 0.15s, color 0.15s;
		margin-bottom: -1.5px;
	}

	.tab:hover { background: #261040; color: #c084fc; }
	.tab.active { background: #12082a; color: #c084fc; border-color: #7c3aed; border-bottom-color: #12082a; }

	.tab-pts { font-size: 0.68rem; color: #fbbf24; font-family: 'Nunito', sans-serif; font-weight: 800; }

	.phil-tab { color: #f0abfc; border-color: #7c1a8a; }
	.phil-tab.active { border-color: #d946ef; color: #f0abfc; }

	/* ── Categories grid ─────────────────────────────── */
	.categories-scroll {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 1.25rem;
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 0.85rem;
	}

	.categories-grid.single { grid-template-columns: minmax(320px, 600px); }

	.btn-toggle {
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		background: #1e0d38;
		color: #7c5faa;
		border: 1.5px solid #3d1a6e;
		border-radius: 999px;
		padding: 0.45rem 1rem;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.2s, color 0.2s, border-color 0.2s;
	}

	.btn-toggle:hover { border-color: #a855f7; color: #c084fc; }
	.btn-toggle.active { background: #2a0d4e; color: #d8b4fe; border-color: #7c3aed; }

	.lang-picker {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		background: #1e0d38;
		border: 1.5px solid #3d1a6e;
		border-radius: 999px;
		padding: 0.2rem 0.3rem;
		flex-shrink: 0;
	}

	.lang-pick-btn {
		font-size: 0.85rem;
		background: transparent;
		border: 1.5px solid transparent;
		border-radius: 999px;
		padding: 0.2rem 0.5rem;
		cursor: pointer;
		opacity: 0.45;
		font-family: 'Fredoka One', cursive;
		color: #c084fc;
		transition: opacity 0.15s, border-color 0.15s, background 0.15s;
		line-height: 1;
		white-space: nowrap;
	}

	.lang-pick-btn:hover { opacity: 0.75; }
	.lang-pick-btn.active { opacity: 1; border-color: #5b21b6; background: #32155a; }
</style>
