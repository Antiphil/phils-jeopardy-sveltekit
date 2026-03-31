<script lang="ts">
	import { savedGamesStore, formatDate } from '$lib/stores/savedGames';
	import type { SavedGame } from '$lib/stores/savedGames';
	import CategoryEditor from '$lib/components/admin/CategoryEditor.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Tab = 'board1' | 'board2' | 'chaos';

	let games = $derived([...$savedGamesStore].sort((a, b) => Number(b.isPublic) - Number(a.isPublic)));
	let editing: SavedGame | null = $state(null);
	let activeTab: Tab = $state('board1');
	let saved = $state(false);
	let deleteConfirm: string | null = $state(null);
	let deleteConfirmFinal: string | null = $state(null);

	function selectGame(game: SavedGame) {
		editing = structuredClone(game);
		activeTab = 'board1';
	}

	async function newGame() {
		const created = await savedGamesStore.create();
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
		deleteConfirm = null;
		deleteConfirmFinal = null;
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
				<div
					class="game-item"
					class:active={editing?.id === game.id}
					class:is-public={game.isPublic}
					role="button"
					tabindex="0"
					onclick={() => selectGame(game)}
					onkeydown={(e) => e.key === 'Enter' && selectGame(game)}
				>
					<div class="game-item-info">
						<div class="game-item-name-row">
							<span class="game-item-name">{game.name}</span>
							{#if game.isPublic}
								<span class="public-badge">🌐</span>
							{/if}
						</div>
						<span class="game-item-date">{formatDate(game.updatedAt)}</span>
					</div>
					{#if game.isPublic && deleteConfirmFinal === game.id}
						<div class="delete-confirm" onclick={(e) => e.stopPropagation()} role="presentation">
							<span style="font-size:0.72rem;color:#f87171;">Wirklich sicher?</span>
							<button class="del-yes" onclick={() => deleteGame(game.id)}>Ja</button>
							<button class="del-no" onclick={() => { deleteConfirm = null; deleteConfirmFinal = null; }}>Nein</button>
						</div>
					{:else if game.isPublic && deleteConfirm === game.id}
						<div class="delete-confirm" onclick={(e) => e.stopPropagation()} role="presentation">
							<span style="font-size:0.72rem;color:#fbbf24;">Öffentlich!</span>
							<button class="del-yes del-warn" onclick={() => deleteConfirmFinal = game.id}>Weiter</button>
							<button class="del-no" onclick={() => deleteConfirm = null}>Nein</button>
						</div>
					{:else if deleteConfirm === game.id}
						<div class="delete-confirm" onclick={(e) => e.stopPropagation()} role="presentation">
							<span style="font-size:0.72rem;color:#f87171;">Löschen?</span>
							<button class="del-yes" onclick={() => deleteGame(game.id)}>Ja</button>
							<button class="del-no"  onclick={() => deleteConfirm = null}>Nein</button>
						</div>
					{:else}
						<button
							class="game-item-del"
							aria-label="Spiel löschen"
							onclick={(e) => { e.stopPropagation(); deleteConfirm = game.id; }}
						>🗑</button>
					{/if}
				</div>
			{/each}
		</div>
	</aside>

	<!-- Main editor -->
	<main class="editor">
		{#if !editing}
			<div class="empty-state">
				<div class="empty-icon">🎯</div>
				<p class="empty-text">Wähle ein Spiel aus<br/>oder erstelle ein neues.</p>
				<button class="btn-primary" onclick={newGame}>＋ Neues Spiel erstellen</button>
			</div>
		{:else}
			<!-- Top bar -->
			<div class="editor-topbar">
				<input
					class="game-name-input"
					type="text"
					placeholder="Spielname…"
					maxlength={48}
					bind:value={editing.name}
				/>
				{#if data.isAdmin}
					<button
						class="btn-publish"
						class:published={editing.isPublic}
						onclick={() => {
							if (!editing) return;
							const next = !editing.isPublic;
							savedGamesStore.togglePublic(editing.id, next);
							editing = { ...editing, isPublic: next };
						}}
						title={editing.isPublic ? 'Öffentlich – klicken zum Deaktivieren' : 'Privat – klicken zum Veröffentlichen'}
					>
						{#if editing.isPublic}🌐 Öffentlich{:else}🔒 Privat{/if}
					</button>
				{/if}
				<button class="btn-save" class:saved onclick={saveGame}>
					{#if saved}✓ Gespeichert{:else}💾 Speichern{/if}
				</button>
			</div>

			<!-- Tabs -->
			<div class="tabs">
				<button class="tab" class:active={activeTab === 'board1'} onclick={() => activeTab = 'board1'}>
					Runde 1
					<span class="tab-pts">100–500</span>
				</button>
				<button class="tab" class:active={activeTab === 'board2'} onclick={() => activeTab = 'board2'}>
					Runde 2
					<span class="tab-pts">200–1000</span>
				</button>
				<button class="tab phil-tab" class:active={activeTab === 'chaos'} onclick={() => activeTab = 'chaos'}>
					🎲 Chaos Category
				</button>
			</div>

			<!-- Category editors -->
			<div class="categories-scroll">
				{#if activeTab === 'board1'}
					<div class="categories-grid">
						{#each editing.board1 as _, i}
							<CategoryEditor bind:category={editing.board1[i]} />
						{/each}
					</div>
				{:else if activeTab === 'board2'}
					<div class="categories-grid">
						{#each editing.board2 as _, i}
							<CategoryEditor bind:category={editing.board2[i]} />
						{/each}
					</div>
				{:else if activeTab === 'chaos'}
					<div class="categories-grid single">
						<div class="chaos-toggle-row">
							<label class="chaos-toggle-label">
								<input type="checkbox" bind:checked={editing.chaosEnabled} class="chaos-checkbox" />
								<span>Chaos Category aktiviert</span>
							</label>
							<span class="chaos-toggle-hint">Wenn deaktiviert, wird die Spalte im Gameboard ausgeblendet</span>
						</div>
						<CategoryEditor bind:category={editing.chaosCategory} isPhil={true} />
					</div>
				{/if}
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

	.game-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		background: #1e0d38;
		border: 1.5px solid #3d1a6e;
		border-radius: 0.65rem;
		padding: 0.55rem 0.7rem;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
	}

	.game-item:hover { border-color: #7c3aed; background: #261040; }
	.game-item.active { border-color: #a855f7; background: #2d1260; }

	.game-item.is-public {
		border-color: #a16207;
		background: #1a1208;
	}

	.game-item.is-public:hover { border-color: #ca8a04; background: #1e1609; }
	.game-item.is-public.active { border-color: #fbbf24; background: #22190a; }

	.game-item-name-row {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		min-width: 0;
	}

	.public-badge {
		font-size: 0.75rem;
		flex-shrink: 0;
	}

	.game-item-lock {
		font-size: 0.8rem;
		opacity: 0.6;
		flex-shrink: 0;
		padding: 0.1rem;
	}

	.game-item-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
		flex: 1;
	}

	.game-item-name {
		font-family: 'Fredoka One', cursive;
		font-size: 0.9rem;
		color: #e2d0ff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.game-item-date {
		font-size: 0.7rem;
		color: #6b47a0;
	}

	.game-item-del {
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 0.85rem;
		opacity: 0.4;
		transition: opacity 0.15s;
		flex-shrink: 0;
		padding: 0.1rem;
	}

	.game-item-del:hover { opacity: 1; }

	.delete-confirm {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		flex-shrink: 0;
	}

	.del-yes, .del-no {
		font-size: 0.7rem;
		font-family: 'Fredoka One', cursive;
		border-radius: 999px;
		border: none;
		padding: 0.15rem 0.5rem;
		cursor: pointer;
	}

	.del-yes { background: #be123c; color: white; }
	.del-yes.del-warn { background: #a16207; color: white; }
	.del-no  { background: #3d1a6e; color: #c084fc; }

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
		color: #5b2d8a;
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
		align-items: center;
		gap: 0.75rem;
		padding: 0.85rem 1.25rem;
		border-bottom: 1.5px solid #3d1a6e;
		flex-shrink: 0;
		background: #160930;
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

	.btn-publish:hover {
		border-color: #a855f7;
		color: #c084fc;
	}

	.btn-publish.published {
		background: #14532d30;
		color: #4ade80;
		border-color: #16a34a;
	}

	.btn-publish.published:hover {
		background: #7f1d1d30;
		color: #f87171;
		border-color: #b91c1c;
	}

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

	.tab.active {
		background: #12082a;
		color: #c084fc;
		border-color: #7c3aed;
		border-bottom-color: #12082a;
	}

	.tab-pts {
		font-size: 0.68rem;
		color: #fbbf24;
		font-family: 'Nunito', sans-serif;
		font-weight: 800;
	}

	.tab.active .tab-pts { color: #fbbf24; }

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

	.categories-grid.single {
		grid-template-columns: minmax(320px, 600px);
	}

	.chaos-toggle-row {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		background: #1e0d38;
		border: 1.5px solid #3d1a6e;
		border-radius: 0.75rem;
		padding: 0.85rem 1rem;
	}

	.chaos-toggle-label {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-family: 'Fredoka One', cursive;
		font-size: 0.95rem;
		color: #e2d0ff;
		cursor: pointer;
	}

	.chaos-checkbox {
		width: 18px;
		height: 18px;
		accent-color: #a855f7;
		cursor: pointer;
	}

	.chaos-toggle-hint {
		font-size: 0.72rem;
		color: #6b47a0;
		padding-left: 1.6rem;
	}
</style>
