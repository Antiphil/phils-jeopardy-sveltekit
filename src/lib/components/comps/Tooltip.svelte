<script lang="ts">
	let {
		text,
		position = 'top',
		children,
	}: {
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		children: import('svelte').Snippet;
	} = $props();

	let visible = $state(false);
</script>

<div
	class="tooltip-wrap"
	onmouseenter={() => (visible = true)}
	onmouseleave={() => (visible = false)}
	onfocus={() => (visible = true)}
	onblur={() => (visible = false)}
	role="group"
>
	{@render children()}
	{#if visible && text}
		<div class="tooltip-anchor {position}" role="tooltip">
			<div class="tooltip-inner">{text}</div>
		</div>
	{/if}
</div>

<style>
	.tooltip-wrap {
		position: relative;
		display: inline-flex;
		margin-bottom: 3px;
	}

	/* Anchor handles positioning only — no transform conflict with animation */
	.tooltip-anchor {
		position: absolute;
		pointer-events: none;
		z-index: 1000;
	}

	.top    { bottom: calc(100% + 7px); left: 50%; transform: translateX(-50%); }
	.bottom { top:    calc(100% + 7px); left: 50%; transform: translateX(-50%); }
	.left   { right:  calc(100% + 7px); top: 50%;  transform: translateY(-50%); }
	.right  { left:   calc(100% + 7px); top: 50%;  transform: translateY(-50%); }

	/* Inner handles styling + animation — no positioning transform here */
	.tooltip-inner {
		white-space: nowrap;
		background: #1e0d38;
		border: 1.5px solid #5b21b6;
		color: #e2d0ff;
		font-family: 'Nunito', sans-serif;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.3rem 0.7rem;
		border-radius: 0.5rem;
		box-shadow: 0 4px 16px rgba(91, 33, 182, 0.4);
		animation: fade-in 0.12s ease-out;
	}

	@keyframes fade-in {
		from { opacity: 0; transform: translateY(3px); }
		to   { opacity: 1; transform: translateY(0); }
	}
</style>
