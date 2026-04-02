<script lang="ts">
	import { savedGamesStore } from '$lib/stores/savedGames';
	import { toast } from '$lib/stores/toast';
	import type { SavedGame, QuestionConfig } from '$lib/stores/savedGames';
	import CategoryEditor from '$lib/components/admin/CategoryEditor.svelte';
	import ReadOnlyCategoryViewer from '$lib/components/admin/ReadOnlyCategoryViewer.svelte';
	import GameListItem from '$lib/components/admin/GameListItem.svelte';
	import DemoGameListItem from '$lib/components/admin/DemoGameListItem.svelte';
import { DEMO_GAME } from '$lib/demoGame';
	import { locale } from '$lib/i18n';
	import type { PageData } from './$types';

	function isQuestionFilled(q: QuestionConfig, langs: string[]): boolean {
		if (q.chaosType === 'wheel' || q.chaosType === 'spotdiff') return true;
		const wordGuess = q.chaosType === 'wordle' || q.chaosType === 'hangman';
		if (!wordGuess && !q.question.trim()) return false;
		if (!q.answer.trim()) return false;
		if (langs.length > 1) {
			for (const lang of langs.slice(1)) {
				const tr = q.translations?.[lang];
				if (!wordGuess && !tr?.question.trim()) return false;
				if (!tr?.answer.trim()) return false;
			}
		}
		return true;
	}

	function checkReady(game: SavedGame): { ready: boolean; missing: number } {
		const langs = game.languages ?? [];
		const bc = game.boardCount ?? 2;
		const allQuestions = [
			...game.board1.flatMap((c) => c.questions),
			...(bc >= 2 ? game.board2.flatMap((c) => c.questions) : []),
			...(bc >= 3 ? game.board3.flatMap((c) => c.questions) : []),
			...(game.chaosEnabled ? game.chaosCategory.questions : []),
		];
		const missing = allQuestions.filter((q) => !isQuestionFilled(q, langs)).length;
		return { ready: missing === 0, missing };
	}

	let { data }: { data: PageData } = $props();

	type Tab = 'board1' | 'board2' | 'board3' | 'chaos';

	let games = $derived([...$savedGamesStore].sort((a, b) => Number(b.isPublic) - Number(a.isPublic)));
	let editing: SavedGame | null = $state(null);
	let viewingDemo = $state(false);
	let activeTab: Tab = $state('board1');
	let editingLang: string = $state('');
	let saving  = $state(false);
	let creating = $state(false);
	let nameError = $state(false);

	// Keep editingLang in sync when languages change
	$effect(() => {
		const langs = (viewingDemo ? DEMO_GAME : editing)?.languages ?? [];
		if (langs.length && !langs.includes(editingLang)) editingLang = langs[0];
		if (!langs.length) editingLang = '';
	});

	let readiness = $derived(editing ? checkReady(editing) : { ready: false, missing: 0 });

	function selectGame(game: SavedGame) {
		editing = structuredClone(game);
		viewingDemo = false;
		activeTab = 'board1';
	}

	function selectDemo() {
		editing = null;
		viewingDemo = true;
		activeTab = 'board1';
		editingLang = 'de';
	}

	async function newGame() {
		if (creating) return;
		creating = true;
		try {
			const created = await savedGamesStore.create($locale);
			editing = structuredClone(created);
			activeTab = 'board1';
		} catch {
			// toast already shown by store
		} finally {
			creating = false;
		}
	}

	async function saveGame() {
		if (!editing || saving) return;
		if (!editing.name.trim()) {
			toast.error('Bitte gib dem Spiel einen Namen.');
			nameError = true;
			return;
		}
		nameError = false;
		saving = true;
		try {
			const result = await savedGamesStore.save(editing);
			editing = structuredClone(result);
		} catch {
			// toast already shown by store
		} finally {
			saving = false;
		}
	}

	async function deleteGame(id: string) {
		try {
			await savedGamesStore.delete(id);
			if (editing?.id === id) editing = null;
		} catch {
			// toast already shown by store
		}
	}
</script>

<svelte:head>
	<title>Spiele verwalten – Phil's Jeopardy</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin-layout">

	<!-- Sidebar -->
	<aside class="sidebar">
		<div class="sidebar-header">
			<span class="sidebar-title">🎮 Spiele</span>
			<button class="btn-new" onclick={newGame} disabled={creating}>
			{creating ? '…' : '＋ Neu'}
		</button>
		</div>
		<div class="game-list">
			<DemoGameListItem active={viewingDemo} onselect={selectDemo} />
			<div class="list-divider"></div>
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
		{#if viewingDemo}
			<!-- ── Demo read-only view ── -->
			<div class="editor-topbar demo-topbar">
				<div class="topbar-row">
					<span class="demo-title-display">{DEMO_GAME.name}</span>
					<span class="demo-readonly-badge">🔒 Nur Vorschau</span>
				</div>
				<p class="demo-description">Dieses Beispiel-Spiel zeigt, wie ein vollständig ausgefülltes Spiel aussieht. Es kann von niemandem bearbeitet oder gelöscht werden.</p>
			</div>

			{@const demoLangs = DEMO_GAME.languages ?? []}

			<div class="tabs">
				<button class="tab demo-tab" class:active={activeTab === 'board1'} onclick={() => activeTab = 'board1'}>
					Runde 1 <span class="tab-pts">100–500</span>
				</button>
				<button class="tab demo-tab" class:active={activeTab === 'board2'} onclick={() => activeTab = 'board2'}>
					Runde 2 <span class="tab-pts">200–1000</span>
				</button>
				<button class="tab demo-tab tab-b3" class:active={activeTab === 'board3'} onclick={() => activeTab = 'board3'}>
					Runde 3 <span class="tab-pts">400–2000</span>
				</button>
				<button class="tab demo-tab phil-tab" class:active={activeTab === 'chaos'} onclick={() => activeTab = 'chaos'}>
					🎲 Chaos Category
				</button>
				<div class="tab-spacer"></div>
				{#each demoLangs as lang}
					<button
						class="lang-tab"
						class:active={editingLang === lang}
						onclick={() => editingLang = lang}
					>
						{lang === 'de' ? '🇩🇪' : '🇬🇧'}
						{lang === 'de' ? 'Deutsch' : 'English'}
					</button>
				{/each}
			</div>

			<div class="categories-scroll">
				{#if activeTab === 'chaos'}
					<div class="categories-grid single">
						<ReadOnlyCategoryViewer category={DEMO_GAME.chaosCategory} {editingLang} />
					</div>
				{:else if activeTab === 'board3'}
					<div class="categories-grid">
						{#each DEMO_GAME.board3 as cat}
							<ReadOnlyCategoryViewer category={cat} {editingLang} />
						{/each}
					</div>
				{:else if activeTab === 'board2'}
					<div class="categories-grid">
						{#each DEMO_GAME.board2 as cat}
							<ReadOnlyCategoryViewer category={cat} {editingLang} />
						{/each}
					</div>
				{:else}
					<div class="categories-grid">
						{#each DEMO_GAME.board1 as cat}
							<ReadOnlyCategoryViewer category={cat} {editingLang} />
						{/each}
					</div>
				{/if}
			</div>
		{:else if editing}
			<div class="editor-topbar">
				<div class="topbar-row">
					<input
						class="game-name-input"
						class:input-error={nameError}
						type="text"
						placeholder="Spielname…"
						maxlength={48}
						bind:value={editing.name}
						oninput={() => { if (nameError && editing?.name.trim()) nameError = false; }}
					/>
					<button class="btn-save" class:saving onclick={saveGame} disabled={saving}>
						{saving ? '…' : '💾 Speichern'}
					</button>
				</div>
				<div class="options-grid">
					<div class="opt-row">
						<span class="opt-label">Sprachen</span>
						<div class="lang-checkboxes">
							{#each [{ value: 'de', flag: '🇩🇪', name: 'Deutsch' }, { value: 'en', flag: '🇬🇧', name: 'English' }] as l}
								{@const active = editing.languages?.includes(l.value) ?? false}
								<label class="lang-check-label" class:active>
									<input
										type="checkbox"
										checked={active}
										onchange={() => {
											if (!editing) return;
											const current = editing.languages ?? [];
											const next = active
												? current.filter((x) => x !== l.value)
												: [...current, l.value];
											editing = { ...editing, languages: next.length ? next : undefined };
										}}
									/>
									{l.flag} {l.name}
								</label>
							{/each}
						</div>
					</div>

					<div class="opt-row">
						<span class="opt-label">Runden</span>
						<div class="board-count-btns">
							{#each ([1, 2, 3] as const) as n}
								<button
									class="board-count-btn"
									class:active={(editing.boardCount ?? 2) === n}
									onclick={() => {
										if (!editing) return;
										editing = { ...editing, boardCount: n };
										if (n < 3 && activeTab === 'board3') activeTab = 'board1';
									}}
								>
									{n}
								</button>
							{/each}
							<span class="board-count-hint">
								{#if (editing.boardCount ?? 2) === 1}Kurz (100–500){:else if (editing.boardCount ?? 2) === 2}Normal (bis 1000){:else}Lang (bis 2000){/if}
							</span>
						</div>
					</div>

					<div class="opt-row">
						<span class="opt-label">Chaos Category</span>
						<button
							class="opt-toggle"
							class:active={editing.chaosEnabled}
							onclick={() => {
								if (!editing) return;
								const next = !editing.chaosEnabled;
								editing = { ...editing, chaosEnabled: next };
								if (!next && activeTab === 'chaos') activeTab = 'board1';
							}}
						>
							<span class="opt-toggle-dot" class:on={editing.chaosEnabled}></span>
							{editing.chaosEnabled ? '🎲 Aktiv' : '🎲 Deaktiviert'}
						</button>
					</div>

					<div class="opt-row">
						<div class="opt-label-with-hint">
							<span class="opt-label">Standard-Timer</span>
							<div class="hint-wrap">
								<span class="hint-icon">?</span>
								<div class="hint-tooltip">
									Gilt für alle Fragen. Per-Frage-Timer in der Chaos Category überschreiben diesen Wert.
								</div>
							</div>
						</div>
						<div class="timer-default-row">
							<label class="timer-toggle-label">
								<input
									type="checkbox"
									class="timer-checkbox"
									checked={(editing.defaultTimerSeconds ?? 45) > 0}
									onchange={(e) => {
										if (!editing) return;
										const on = (e.target as HTMLInputElement).checked;
										editing = { ...editing, defaultTimerSeconds: on ? 45 : 0 };
									}}
								/>
								<span class="timer-toggle-text" class:on={(editing.defaultTimerSeconds ?? 45) > 0}>
									{(editing.defaultTimerSeconds ?? 45) > 0 ? '⏱ Aktiv' : '⏱ Deaktiviert'}
								</span>
							</label>
							{#if (editing.defaultTimerSeconds ?? 45) > 0}
								<input
									class="timer-seconds-input"
									type="number"
									min="5"
									max="300"
									value={editing.defaultTimerSeconds}
									oninput={(e) => {
										if (!editing) return;
										const val = Math.max(5, Math.min(300, parseInt((e.target as HTMLInputElement).value) || 30));
										editing = { ...editing, defaultTimerSeconds: val };
									}}
								/>
								<span class="timer-seconds-unit">Sekunden</span>
							{/if}
						</div>
					</div>

					{#if data.isAdmin}
						<div class="opt-row">
							<div class="opt-label-with-hint">
								<span class="opt-label">Sichtbarkeit</span>
								<div class="hint-wrap">
									<span class="hint-icon">?</span>
									<div class="hint-tooltip">
										Öffentliche Spiele erscheinen für alle Spieler in der Spielauswahl. Nur vollständig ausgefüllte Spiele können veröffentlicht werden.
									</div>
								</div>
							</div>
							<div class="opt-publish-row">
								<button
									class="opt-toggle"
									class:active={editing.isPublic}
									class:published={editing.isPublic}
									disabled={!readiness.ready && !editing.isPublic}
									onclick={() => {
										if (!editing || (!readiness.ready && !editing.isPublic)) return;
										const next = !editing.isPublic;
										savedGamesStore.togglePublic(editing.id, next);
										editing = { ...editing, isPublic: next };
									}}
								>
									<span class="opt-toggle-dot" class:on={editing.isPublic} class:green={editing.isPublic}></span>
									{editing.isPublic ? '🌐 Öffentlich' : '🔒 Privat'}
								</button>
								<div class="ready-badge" class:ready={readiness.ready}>
									<span class="ready-dot"></span>
									{readiness.ready ? 'Bereit zur Veröffentlichung' : `${readiness.missing} Frage${readiness.missing === 1 ? '' : 'n'} fehlen noch`}
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			{@const langs = editing.languages ?? []}

			{@const bc = editing.boardCount ?? 2}

			<div class="tabs">
				<button class="tab" class:active={activeTab === 'board1'} onclick={() => activeTab = 'board1'}>
					Runde 1 <span class="tab-pts">100–500</span>
				</button>
				{#if bc >= 2}
					<button class="tab" class:active={activeTab === 'board2'} onclick={() => activeTab = 'board2'}>
						Runde 2 <span class="tab-pts">200–1000</span>
					</button>
				{/if}
				{#if bc >= 3}
					<button class="tab tab-b3" class:active={activeTab === 'board3'} onclick={() => activeTab = 'board3'}>
						Runde 3 <span class="tab-pts">400–2000</span>
					</button>
				{/if}
				{#if editing.chaosEnabled}
					<button class="tab phil-tab" class:active={activeTab === 'chaos'} onclick={() => activeTab = 'chaos'}>
						🎲 Chaos Category
					</button>
				{/if}

				{#if langs.length > 1}
					<div class="tab-spacer"></div>
					{#each langs as lang}
						<button
							class="lang-tab"
							class:active={editingLang === lang}
							onclick={() => editingLang = lang}
						>
							{lang === 'de' ? '🇩🇪' : '🇬🇧'}
							{lang === 'de' ? 'Deutsch' : 'English'}
							{#if lang === langs[0]}<span class="lang-tab-primary">Primär</span>{/if}
						</button>
					{/each}
				{/if}
			</div>

			{@const e = editing!}

			<div class="categories-scroll">
				{#if activeTab === 'chaos'}
					<div class="categories-grid single">
						<CategoryEditor bind:category={e.chaosCategory} isPhil={true} {editingLang} {langs} />
					</div>
				{:else if activeTab === 'board3'}
					<div class="categories-grid">
						{#each e.board3 as _, i}
							<CategoryEditor bind:category={e.board3[i]} {editingLang} {langs} />
						{/each}
					</div>
				{:else if activeTab === 'board2'}
					<div class="categories-grid">
						{#each e.board2 as _, i}
							<CategoryEditor bind:category={e.board2[i]} {editingLang} {langs} />
						{/each}
					</div>
				{:else}
					<div class="categories-grid">
						{#each e.board1 as _, i}
							<CategoryEditor bind:category={e.board1[i]} {editingLang} {langs} />
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

	.list-divider {
		height: 1px;
		background: linear-gradient(90deg, transparent, #0e7490, transparent);
		margin: 0.1rem 0.25rem;
		flex-shrink: 0;
	}

	/* ── Demo topbar ─────────────────────────────────── */
	.demo-topbar {
		background: linear-gradient(135deg, #001a22, #00111a) !important;
		border-bottom-color: #0e7490 !important;
	}

	.demo-title-display {
		font-family: 'Fredoka One', cursive;
		font-size: 1.2rem;
		color: #67e8f9;
		flex: 1;
	}

	.demo-readonly-badge {
		font-family: 'Fredoka One', cursive;
		font-size: 0.8rem;
		color: #155e75;
		background: #002030;
		border: 1.5px solid #0e7490;
		border-radius: 999px;
		padding: 0.3rem 0.85rem;
		white-space: nowrap;
	}

	.demo-description {
		margin: 0;
		font-size: 0.75rem;
		color: #0e7490;
		line-height: 1.5;
	}

	.demo-tab { color: #0891b2 !important; border-color: #0e749060 !important; }
	.demo-tab:hover { background: #001a22 !important; color: #22d3ee !important; }
	.demo-tab.active { background: #12082a !important; color: #22d3ee !important; border-color: #0891b2 !important; border-bottom-color: #12082a !important; }

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

	.options-grid {
		display: flex;
		flex-direction: column;
		gap: 0;
		background: #0f0624;
		border: 1.5px solid #2a1050;
		border-radius: 0.75rem;
		overflow: hidden;
	}

	.opt-row {
		display: grid;
		grid-template-columns: 130px 1fr;
		align-items: center;
		gap: 0.75rem;
		padding: 0.55rem 0.85rem;
		border-bottom: 1px solid #1e0d38;
	}

	.opt-row:last-child { border-bottom: none; }

	.opt-label {
		font-size: 0.68rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.7px;
		color: #5b3d8a;
		white-space: nowrap;
	}

	.opt-label-with-hint {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.hint-wrap {
		position: relative;
		display: inline-flex;
	}

	.hint-icon {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #2a1050;
		border: 1px solid #3d1a6e;
		color: #6b47a0;
		font-size: 0.6rem;
		font-weight: 800;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: default;
		flex-shrink: 0;
		line-height: 1;
	}

	.hint-wrap:hover .hint-tooltip { display: block; }

	.hint-tooltip {
		display: none;
		position: absolute;
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
		background: #1e0d38;
		border: 1.5px solid #5b21b6;
		border-radius: 0.5rem;
		color: #c4a8e8;
		font-size: 0.72rem;
		font-family: 'Nunito', sans-serif;
		font-weight: 600;
		line-height: 1.45;
		padding: 0.45rem 0.65rem;
		width: 220px;
		white-space: normal;
		box-shadow: 0 4px 16px rgba(91, 33, 182, 0.4);
		z-index: 200;
		pointer-events: none;
	}

	.opt-publish-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.opt-toggle {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		background: #1a0a30;
		color: #6b47a0;
		border: 1.5px solid #2a1050;
		border-radius: 999px;
		padding: 0.3rem 0.85rem 0.3rem 0.5rem;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.15s, color 0.15s, border-color 0.15s;
	}

	.opt-toggle:hover:not(:disabled) { border-color: #5b21b6; color: #c084fc; }
	.opt-toggle.active { background: #2a0d4e; color: #d8b4fe; border-color: #7c3aed; }
	.opt-toggle.published { background: #052e16; color: #4ade80; border-color: #16a34a; }
	.opt-toggle.published:hover { background: #1c0505; color: #f87171; border-color: #b91c1c; }
	.opt-toggle:disabled { opacity: 0.35; cursor: not-allowed; }

	.opt-toggle-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #3d1a6e;
		flex-shrink: 0;
		transition: background 0.2s, box-shadow 0.2s;
	}

	.opt-toggle-dot.on { background: #a855f7; box-shadow: 0 0 6px #a855f799; }
	.opt-toggle-dot.on.green { background: #4ade80; box-shadow: 0 0 6px #4ade8099; }

	.ready-badge {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.7rem;
		font-weight: 700;
		color: #f87171;
		background: #1c050530;
		border: 1px solid #b91c1c40;
		border-radius: 999px;
		padding: 0.2rem 0.6rem;
	}

	.ready-badge.ready {
		color: #4ade80;
		background: #05301530;
		border-color: #16a34a40;
	}

	.ready-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
		background: #f87171;
	}

	.ready-badge.ready .ready-dot { background: #4ade80; box-shadow: 0 0 5px #4ade8099; }

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
	.game-name-input.input-error { border-color: #ef4444; }
	.game-name-input.input-error::placeholder { color: #f87171; }

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

		.btn-save.saving,
	.btn-save:disabled {
				opacity: 0.55;
		cursor: default;
	}

	.btn-save:hover { opacity: 0.88; }

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

	.tab-b3 { color: #fb923c; border-color: #7c2d1260; }
	.tab-b3:hover { background: #1a0800; color: #fdba74; }
	.tab-b3.active { background: #12082a; color: #fdba74; border-color: #ea580c; border-bottom-color: #12082a; }

	/* ── Board count selector ────────────────────────── */
	.board-count-btns {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.board-count-btn {
		font-family: 'Fredoka One', cursive;
		font-size: 0.9rem;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1.5px solid #3d1a6e;
		background: #1a0a30;
		color: #6b47a0;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s, color 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.board-count-btn:hover { border-color: #7c3aed; color: #c084fc; }
	.board-count-btn.active { background: linear-gradient(135deg, #a855f7, #d946ef); border-color: transparent; color: white; box-shadow: 0 2px 8px rgba(168,85,247,0.4); }

	.board-count-hint {
		font-size: 0.68rem;
		font-weight: 700;
		color: #4a2d7a;
		margin-left: 0.35rem;
		white-space: nowrap;
	}

	.timer-default-row {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		flex-wrap: wrap;
	}

	.timer-toggle-label {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
	}

	.timer-checkbox {
		width: 14px;
		height: 14px;
		accent-color: #ef4444;
		cursor: pointer;
		flex-shrink: 0;
	}

	.timer-toggle-text {
		font-family: 'Fredoka One', cursive;
		font-size: 0.82rem;
		color: #4a2d7a;
	}

	.timer-toggle-text.on { color: #f87171; }

	.timer-seconds-input {
		width: 64px;
		background: #261040;
		border: 1.5px solid #7f1d1d;
		border-radius: 0.4rem;
		color: #fca5a5;
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		padding: 0.25rem 0.45rem;
		text-align: center;
		outline: none;
	}

	.timer-seconds-input:focus { border-color: #ef4444; }
	.timer-seconds-input::-webkit-outer-spin-button,
	.timer-seconds-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
	.timer-seconds-input[type=number] { -moz-appearance: textfield; }

	.timer-seconds-unit {
		font-size: 0.72rem;
		font-weight: 700;
		color: #7f1d1d;
	}

	.tab-spacer { flex: 1; }

	.lang-tab {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-family: 'Fredoka One', cursive;
		font-size: 0.82rem;
		background: transparent;
		border: 1.5px solid #2a1050;
		color: #4a2d7a;
		border-radius: 0.6rem 0.6rem 0 0;
		border-bottom: none;
		padding: 0.4rem 0.85rem;
		cursor: pointer;
		transition: background 0.15s, color 0.15s, border-color 0.15s;
		margin-bottom: -1.5px;
		white-space: nowrap;
	}

	.lang-tab:hover { background: #1a0535; color: #a78bca; border-color: #3d1a6e; }
	.lang-tab.active { background: #12082a; color: #e2d0ff; border-color: #5b21b6; border-bottom-color: #12082a; }

	.lang-tab-primary {
		font-size: 0.58rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.4px;
		background: #3d1a6e;
		color: #a78bca;
		border-radius: 999px;
		padding: 0.05rem 0.35rem;
	}

	.lang-tab.active .lang-tab-primary { background: #5b21b6; color: #e2d0ff; }

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

	.lang-checkboxes {
		display: flex;
		gap: 0.3rem;
		flex-wrap: wrap;
	}

	.lang-check-label {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		color: #7c5faa;
		background: #1e0d38;
		border: 1.5px solid #3d1a6e;
		border-radius: 999px;
		padding: 0.2rem 0.65rem 0.2rem 0.45rem;
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s, background 0.15s;
		white-space: nowrap;
	}

	.lang-check-label:hover { border-color: #5b21b6; color: #c084fc; }
	.lang-check-label.active { border-color: #5b21b6; background: #32155a; color: #e2d0ff; }

	.lang-check-label input[type="checkbox"] {
		width: 14px;
		height: 14px;
		accent-color: #a855f7;
		cursor: pointer;
		flex-shrink: 0;
	}
</style>
