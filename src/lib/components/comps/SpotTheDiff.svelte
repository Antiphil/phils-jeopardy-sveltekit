<script lang="ts">
	import { onMount } from 'svelte';

	let { onwin, onlose }: {
		onwin: () => void;
		onlose: () => void;
	} = $props();

	// ── Load all SVGs via Vite glob ──────────────────────────────────────────────
	const allFiles = import.meta.glob(
		'/src/lib/assets/spot-diff/*.svg',
		{ query: '?raw', import: 'default', eager: true }
	) as Record<string, string>;

	type Scene = { name: string; original: string; errors: string[] };

	function buildScenes(): Scene[] {
		const map: Record<string, Scene> = {};
		for (const [path, content] of Object.entries(allFiles)) {
			const filename = path.split('/').pop()!.replace('.svg', '');
			const orig  = filename.match(/^(.+)_Original$/);
			const error = filename.match(/^(.+)_Fehler_\d+$/);
			if (orig) {
				const n = orig[1];
				if (!map[n]) map[n] = { name: n, original: '', errors: [] };
				map[n].original = content;
			} else if (error) {
				const n = error[1];
				if (!map[n]) map[n] = { name: n, original: '', errors: [] };
				map[n].errors.push(content);
			}
		}
		return Object.values(map).filter(s => s.original && s.errors.length > 0);
	}

	function normalizeSvg(raw: string): string {
		return raw.replace(/<svg([^>]*)>/, (_, attrs) => {
			const cleaned = attrs
				.replace(/\s*width="[^"]*"/, '')
				.replace(/\s*height="[^"]*"/, '');
			return `<svg${cleaned} width="100%" height="100%">`;
		});
	}

	// ── Grid dimensions ──────────────────────────────────────────────────────────
	const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
	const ROWS = 5;

	function tileCoord(idx: number): string {
		return COLS[idx % COLS.length] + (Math.floor(idx / COLS.length) + 1);
	}

	// ── State ────────────────────────────────────────────────────────────────────
	const scenes = buildScenes();

	let originalSvg = $state('');
	let errorSvg    = $state('');
	let errorTile   = $state(-1);
	let selected    = $state<number | null>(null);
	let submitted   = $state(false);
	let countdown   = $state(4);

	const hasScenes = scenes.length > 0;
	const isCorrect = $derived(selected !== null && selected === errorTile);

	onMount(() => {
		if (!hasScenes) return;
		const scene = scenes[Math.floor(Math.random() * scenes.length)];
		const err   = scene.errors[Math.floor(Math.random() * scene.errors.length)];
		originalSvg = normalizeSvg(scene.original);
		errorSvg    = normalizeSvg(err);
		errorTile   = Math.floor(Math.random() * (COLS.length * ROWS));
	});

	function handleTileClick(idx: number) {
		if (submitted) return;
		selected = idx;
	}

	function handleSubmit() {
		if (selected === null || submitted) return;
		submitted = true;

		const correct = selected === errorTile;
		const interval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(interval);
				if (correct) onwin();
				else onlose();
			}
		}, 1000);
	}
</script>

{#if !hasScenes}
	<div class="no-scenes">
		<div class="ns-icon">🖼️</div>
		<div class="ns-title">Keine Szenen gefunden</div>
		<div class="ns-hint">Lege SVG-Dateien in <code>src/lib/assets/spot-diff/</code> ab.<br/>Siehe <code>EIGENE_SZENEN_HIER.md</code> für das Namensschema.</div>
	</div>
{:else}
	<div class="spotdiff">

		<div class="instructions">
			Finde das Tile mit dem <strong>Fehler</strong> und klicke es an!
		</div>

		<!-- Grid -->
		<div class="grid-scroll">
		<div class="grid-outer">
			<!-- Column headers -->
			<div class="col-headers">
				<div class="corner"></div>
				{#each COLS as col}
					<div class="col-label">{col}</div>
				{/each}
			</div>

			<!-- Rows -->
			{#each Array.from({ length: ROWS }, (_, r) => r) as row}
				<div class="grid-row">
					<div class="row-label">{row + 1}</div>
					{#each Array.from({ length: COLS.length }, (_, c) => c) as col}
						{@const idx = row * COLS.length + col}
						{@const isError = idx === errorTile}
						{@const isSelected = selected === idx}
						<button
							class="tile"
							class:selected={isSelected && !submitted}
							class:reveal-correct={submitted && isError}
							class:reveal-wrong={submitted && isSelected && !isError}
							onclick={() => handleTileClick(idx)}
							aria-label={tileCoord(idx)}
						>
							{@html isError ? errorSvg : originalSvg}
						</button>
					{/each}
				</div>
			{/each}
		</div>
		</div>

		<!-- Result banner after submit -->
		{#if submitted}
			<div class="result-banner" class:result-correct={isCorrect} class:result-wrong={!isCorrect}>
				{#if isCorrect}
					✓ Richtig! Fehler war bei <strong>{tileCoord(errorTile)}</strong>
				{:else}
					✗ Falsch! Der Fehler war bei <strong>{tileCoord(errorTile)}</strong>
				{/if}
				<span class="result-countdown">{countdown}s</span>
			</div>
		{:else}
			<!-- Submit button — greyed out until a tile is selected -->
			<button
				class="btn-submit"
				class:active={selected !== null}
				disabled={selected === null}
				onclick={handleSubmit}
			>
				{selected !== null ? `${tileCoord(selected)} absenden` : 'Tile auswählen…'}
			</button>
		{/if}

	</div>
{/if}

<style>
	.spotdiff {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.85rem;
		width: 100%;
	}

	.instructions {
		font-size: 0.82rem;
		color: #a78bca;
		text-align: center;
		line-height: 1.4;
	}

	/* ── Grid ──────────────────────────────────────────── */
	.grid-scroll {
		width: 100%;
		overflow-x: auto;
		padding-bottom: 4px;
	}

	.grid-outer {
		--tile: clamp(64px, calc((92vw - 60px) / 10 - 2px), 96px);
		display: flex;
		flex-direction: column;
		gap: 2px;
		user-select: none;
		width: max-content;
		margin: 0 auto;
	}

	.col-headers {
		display: flex;
		gap: 2px;
	}

	.corner {
		width: 20px;
		flex-shrink: 0;
	}

	.col-label {
		width: var(--tile);
		text-align: center;
		font-family: 'Fredoka One', cursive;
		font-size: 0.72rem;
		color: #7c5faa;
		flex-shrink: 0;
	}

	.grid-row {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.row-label {
		width: 20px;
		text-align: center;
		font-family: 'Fredoka One', cursive;
		font-size: 0.72rem;
		color: #7c5faa;
		flex-shrink: 0;
	}

	.tile {
		width: var(--tile);
		height: var(--tile);
		padding: 0;
		border: 1.5px solid #3d1a6e;
		border-radius: 5px;
		background: #1e0d38;
		cursor: pointer;
		overflow: hidden;
		transition: border-color 0.12s, transform 0.1s;
		flex-shrink: 0;
		display: block;
	}

	.tile:hover:not(:disabled) {
		border-color: #a855f7;
		transform: scale(1.06);
		z-index: 2;
		position: relative;
	}

	.tile.selected {
		border-color: #fbbf24;
		border-width: 2px;
		box-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
		transform: scale(1.08);
		z-index: 3;
		position: relative;
	}

	.tile.reveal-correct {
		border-color: #34d399;
		border-width: 2.5px;
		box-shadow: 0 0 14px rgba(52, 211, 153, 0.7);
		animation: pulse-correct 0.5s ease;
		z-index: 3;
		position: relative;
	}

	.tile.reveal-wrong {
		border-color: #f87171;
		border-width: 2px;
		box-shadow: 0 0 8px rgba(248, 113, 113, 0.5);
	}

	@keyframes pulse-correct {
		0%   { transform: scale(1); }
		50%  { transform: scale(1.15); }
		100% { transform: scale(1); }
	}

	/* ── Submit button ──────────────────────────────────── */
	.btn-submit {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		padding: 0.5rem 2rem;
		border-radius: 999px;
		border: 2px solid #3d1a6e;
		background: #1e0d38;
		color: #3d1a6e;
		cursor: default;
		transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
	}

	.btn-submit.active {
		background: linear-gradient(135deg, #a855f7, #d946ef);
		border-color: transparent;
		color: white;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
	}

	.btn-submit.active:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(217, 70, 239, 0.5);
	}

	/* ── Result banner ──────────────────────────────────── */
	.result-banner {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		padding: 0.65rem 1.25rem;
		border-radius: 0.85rem;
		border: 2px solid;
		animation: pop-in 0.3s ease-out;
	}

	.result-correct {
		background: #052e16;
		border-color: #34d399;
		color: #34d399;
	}

	.result-wrong {
		background: #1c0505;
		border-color: #f87171;
		color: #f87171;
	}

	.result-countdown {
		font-size: 0.8rem;
		opacity: 0.6;
		margin-left: auto;
	}

	@keyframes pop-in {
		from { opacity: 0; transform: scale(0.92); }
		to   { opacity: 1; transform: scale(1); }
	}

	/* ── No scenes fallback ─────────────────────────────── */
	.no-scenes {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		padding: 1.5rem;
		background: #261040;
		border: 1.5px dashed #5b21b6;
		border-radius: 1rem;
		text-align: center;
	}

	.ns-icon  { font-size: 2.5rem; }
	.ns-title { font-family: 'Fredoka One', cursive; color: #c084fc; font-size: 1rem; }
	.ns-hint  { font-size: 0.78rem; color: #7c5faa; line-height: 1.5; }
	.ns-hint code { background: #1e0d38; padding: 0.1rem 0.35rem; border-radius: 4px; font-size: 0.75rem; }
</style>
