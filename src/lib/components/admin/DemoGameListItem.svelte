<script lang="ts">
	import { DEMO_GAME } from '$lib/demoGame';

	let { active, onselect }: {
		active: boolean;
		onselect: () => void;
	} = $props();
</script>

<div
	class="demo-item"
	class:active
	role="button"
	tabindex="0"
	onclick={onselect}
	onkeydown={(e) => e.key === 'Enter' && onselect()}
>
	<div class="demo-item-info">
		<div class="demo-item-name-row">
			<span class="demo-item-name">{DEMO_GAME.name}</span>
			<span class="lang-badge">🇩🇪</span>
			<span class="lang-badge">🇬🇧</span>
		</div>
		<span class="demo-item-sub">Vorschau · nicht editierbar</span>
	</div>
	<span class="demo-eye">👁</span>
</div>

<style>
	.demo-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		background: #001a22;
		border: 2px solid #0e7490;
		border-radius: 0.65rem;
		padding: 0.55rem 0.7rem;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
		box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
	}

	.demo-item:hover { border-color: #06b6d4; background: #002030; }
	.demo-item.active { border-color: #22d3ee; background: #003040; box-shadow: 0 0 14px rgba(34, 211, 238, 0.2); }

	.demo-item-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
		flex: 1;
	}

	.demo-item-name-row {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		min-width: 0;
	}

	.demo-item-name {
		font-family: 'Fredoka One', cursive;
		font-size: 0.9rem;
		color: #67e8f9;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.demo-item-sub {
		font-size: 0.65rem;
		color: #155e75;
		white-space: nowrap;
	}

	.lang-badge { font-size: 0.8rem; flex-shrink: 0; }

	.demo-eye {
		font-size: 0.9rem;
		opacity: 0.5;
		flex-shrink: 0;
	}

	.demo-item.active .demo-eye { opacity: 1; }
</style>
