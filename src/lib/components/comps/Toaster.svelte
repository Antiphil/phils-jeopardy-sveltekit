<script lang="ts">
	import { toast } from '$lib/stores/toast';

	const icons = { success: '✓', error: '✕', info: 'ℹ' };
</script>

<div class="toaster">
	{#each $toast as t (t.id)}
		<button class="toast toast-{t.type}" onclick={() => toast.remove(t.id)} aria-label="Schließen">
			<div class="toast-body">
				<span class="toast-icon">{icons[t.type]}</span>
				<span class="toast-msg">{t.message}</span>
			</div>
			<div class="toast-timer"></div>
		</button>
	{/each}
</div>

<style>
	.toaster {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 600;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-end;
		pointer-events: none;
	}

	.toast {
		pointer-events: all;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		min-width: 220px;
		max-width: 320px;
		border-radius: 0.85rem;
		border: 1.5px solid;
		overflow: hidden;
		text-align: left;
		background: none;
		padding: 0;
		animation: slide-in 0.22s ease-out;
		transition: transform 0.15s, opacity 0.15s;
	}

	.toast:hover { transform: scale(1.02); }

	@keyframes slide-in {
		from { opacity: 0; transform: translateX(28px); }
		to   { opacity: 1; transform: translateX(0); }
	}

	.toast-body {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.65rem 0.9rem;
	}

	/* ── Success ── */
	.toast-success {
		background: linear-gradient(135deg, #0d2b1a, #1a0d38);
		border-color: #34d399;
		box-shadow: 0 0 18px rgba(52, 211, 153, 0.2), 0 4px 16px rgba(0,0,0,0.5);
	}

	.toast-success .toast-icon {
		color: #34d399;
		background: rgba(52, 211, 153, 0.12);
		border: 1px solid rgba(52, 211, 153, 0.3);
	}

	.toast-success .toast-msg { color: #a7f3d0; }

	.toast-success .toast-timer {
		background: linear-gradient(90deg, #34d399, #6ee7b7);
		box-shadow: 0 0 6px rgba(52, 211, 153, 0.5);
	}

	/* ── Error ── */
	.toast-error {
		background: linear-gradient(135deg, #2b0d0d, #1a0d38);
		border-color: #f87171;
		box-shadow: 0 0 18px rgba(248, 113, 113, 0.2), 0 4px 16px rgba(0,0,0,0.5);
	}

	.toast-error .toast-icon {
		color: #f87171;
		background: rgba(248, 113, 113, 0.12);
		border: 1px solid rgba(248, 113, 113, 0.3);
	}

	.toast-error .toast-msg { color: #fecaca; }

	.toast-error .toast-timer {
		background: linear-gradient(90deg, #f87171, #fca5a5);
		box-shadow: 0 0 6px rgba(248, 113, 113, 0.5);
	}

	/* ── Info ── */
	.toast-info {
		background: linear-gradient(135deg, #1a0d38, #2d1260);
		border-color: #a855f7;
		box-shadow: 0 0 18px rgba(168, 85, 247, 0.25), 0 4px 16px rgba(0,0,0,0.5);
	}

	.toast-info .toast-icon {
		color: #c084fc;
		background: rgba(168, 85, 247, 0.12);
		border: 1px solid rgba(168, 85, 247, 0.3);
	}

	.toast-info .toast-msg { color: #e9d5ff; }

	.toast-info .toast-timer {
		background: linear-gradient(90deg, #a855f7, #d946ef);
		box-shadow: 0 0 6px rgba(168, 85, 247, 0.5);
	}

	/* ── Shared ── */
	.toast-icon {
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.toast-msg {
		font-family: 'Nunito', sans-serif;
		font-size: 0.83rem;
		font-weight: 700;
		line-height: 1.35;
		flex: 1;
	}

	/* ── Timer bar ── */
	.toast-timer {
		height: 3px;
		width: 100%;
		transform-origin: left;
		animation: timer-drain 5s linear forwards;
	}

	@keyframes timer-drain {
		from { transform: scaleX(1); }
		to   { transform: scaleX(0); }
	}
</style>
