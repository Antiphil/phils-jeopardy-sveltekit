<script lang="ts">
	import { formatDate } from '$lib/stores/savedGames';
	import type { SavedGame } from '$lib/stores/savedGames';

	let { game, active, onselect, ondelete }: {
		game: SavedGame;
		active: boolean;
		onselect: () => void;
		ondelete: () => void;
	} = $props();

	const publishIcon: Record<string, string> = {
		private: '🔒',
		public: '🌐',
		official: '⭐',
	};

	let confirmStep: 0 | 1 | 2 = $state(0); // 0=idle, 1=confirm, 2=final
</script>

<div
	class="game-item"
	class:active
	data-publish={game.publishType ?? 'private'}
	role="button"
	tabindex="0"
	onclick={onselect}
	onkeydown={(e) => e.key === 'Enter' && onselect()}
>
	<div class="game-item-info">
		<div class="game-item-name-row">
			<span class="publish-icon">{publishIcon[game.publishType ?? 'private']}</span>
			<span class="game-item-name">{game.name}</span>
			{#each game.languages ?? [] as lang}<span class="lang-badge">{lang === 'de' ? '🇩🇪' : '🇬🇧'}</span>{/each}
		</div>
		<span class="game-item-date">{formatDate(game.updatedAt)}</span>
	</div>

	{#if confirmStep === 2}
		<div class="delete-confirm" onclick={(e) => e.stopPropagation()} role="presentation">
			<span class="del-label danger">Wirklich sicher?</span>
			<button class="del-yes" onclick={ondelete}>Ja</button>
			<button class="del-no" onclick={() => confirmStep = 0}>Nein</button>
		</div>
	{:else if confirmStep === 1 && (game.publishType === 'public' || game.publishType === 'official')}
		<div class="delete-confirm" onclick={(e) => e.stopPropagation()} role="presentation">
			<span class="del-label warn">Öffentlich!</span>
			<button class="del-yes del-warn" onclick={() => confirmStep = 2}>Weiter</button>
			<button class="del-no" onclick={() => confirmStep = 0}>Nein</button>
		</div>
	{:else if confirmStep === 1}
		<div class="delete-confirm" onclick={(e) => e.stopPropagation()} role="presentation">
			<span class="del-label danger">Löschen?</span>
			<button class="del-yes" onclick={ondelete}>Ja</button>
			<button class="del-no" onclick={() => confirmStep = 0}>Nein</button>
		</div>
	{:else}
		<button
			class="game-item-del"
			aria-label="Spiel löschen"
			onclick={(e) => { e.stopPropagation(); confirmStep = 1; }}
		>🗑</button>
	{/if}
</div>

<style>
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

	/* ── private (default purple) ── */
	.game-item:hover { border-color: #7c3aed; background: #261040; }
	.game-item.active { border-color: #a855f7; background: #2d1260; }

	/* ── public (blue) ── */
	.game-item[data-publish="public"] { border-color: #1d4ed8; background: #080e1f; }
	.game-item[data-publish="public"]:hover { border-color: #3b82f6; background: #0d1830; }
	.game-item[data-publish="public"].active { border-color: #60a5fa; background: #0f1e3a; }

	/* ── official (yellow/gold) ── */
	.game-item[data-publish="official"] { border-color: #a16207; background: #1a1208; }
	.game-item[data-publish="official"]:hover { border-color: #ca8a04; background: #1e1609; }
	.game-item[data-publish="official"].active { border-color: #fbbf24; background: #22190a; }

	.game-item-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
		flex: 1;
	}

	.game-item-name-row {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		min-width: 0;
	}

	.publish-icon {
		font-size: 0.75rem;
		flex-shrink: 0;
		line-height: 1;
	}

	.game-item-name {
		font-family: 'Fredoka One', cursive;
		font-size: 0.9rem;
		color: #e2d0ff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.game-item-date { font-size: 0.7rem; color: #6b47a0; }
	.lang-badge { font-size: 0.8rem; flex-shrink: 0; }

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

	.del-label { font-size: 0.72rem; }
	.del-label.danger { color: #f87171; }
	.del-label.warn { color: #fbbf24; }

	.del-yes, .del-no {
		font-size: 0.7rem;
		font-family: 'Fredoka One', cursive;
		border-radius: 999px;
		border: none;
		padding: 0.15rem 0.5rem;
		cursor: pointer;
	}

	.del-yes { background: #be123c; color: white; }
	.del-yes.del-warn { background: #a16207; }
	.del-no { background: #3d1a6e; color: #c084fc; }
</style>
