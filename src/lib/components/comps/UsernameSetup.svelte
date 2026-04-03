<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let { ondone }: { ondone: () => void } = $props();

	let username = $state('');
	let status: 'idle' | 'checking' | 'available' | 'taken' | 'invalid' = $state('idle');
	let errorMsg = $state('');
	let saving = $state(false);

	let checkTimeout: ReturnType<typeof setTimeout> | undefined;

	function onInput(val: string) {
		username = val;
		status = 'idle';
		errorMsg = '';
		clearTimeout(checkTimeout);
		if (!val.trim()) return;
		status = 'checking';
		checkTimeout = setTimeout(() => checkAvailability(val.trim()), 400);
	}

	async function checkAvailability(name: string) {
		const res = await fetch(`/api/username?name=${encodeURIComponent(name)}`);
		const data = await res.json();
		if (data.error) {
			status = 'invalid';
			errorMsg = data.error;
		} else {
			status = data.available ? 'available' : 'taken';
		}
	}

	async function handleSubmit() {
		if (saving || status !== 'available') return;
		saving = true;
		try {
			const res = await fetch('/api/username', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: username.trim() }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				errorMsg = data.message ?? 'Fehler beim Speichern';
				status = 'invalid';
				return;
			}
			await invalidateAll();
			ondone();
		} finally {
			saving = false;
		}
	}
</script>

<div class="backdrop">
	<div class="modal" role="dialog" aria-modal="true" aria-labelledby="username-title">
		<div class="modal-icon">👤</div>
		<h2 class="modal-title" id="username-title">Wähle deinen Benutzernamen</h2>
		<p class="modal-sub">
			Dieser Name ist einmalig und kann später nicht mehr geändert werden.
		</p>

		<div class="input-wrap">
			<input
				class="username-input"
				class:state-available={status === 'available'}
				class:state-error={status === 'taken' || status === 'invalid'}
				type="text"
				placeholder="dein_name"
				maxlength={20}
				autocomplete="off"
				autocorrect="off"
				spellcheck="false"
				value={username}
				oninput={(e) => onInput((e.target as HTMLInputElement).value)}
				onkeydown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
			/>
			<span class="status-icon">
				{#if status === 'checking'}
					<span class="spinner"></span>
				{:else if status === 'available'}
					✓
				{:else if status === 'taken' || status === 'invalid'}
					✕
				{/if}
			</span>
		</div>

		<div class="hint-row">
			{#if status === 'available'}
				<span class="hint hint-ok">Verfügbar</span>
			{:else if status === 'taken'}
				<span class="hint hint-err">Bereits vergeben</span>
			{:else if status === 'invalid'}
				<span class="hint hint-err">{errorMsg}</span>
			{:else}
				<span class="hint hint-muted">2–20 Zeichen · Buchstaben, Zahlen, _ und -</span>
			{/if}
		</div>

		<button
			class="btn-confirm"
			disabled={status !== 'available' || saving}
			onclick={handleSubmit}
		>
			{saving ? '…' : 'Bestätigen'}
		</button>
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(10, 4, 20, 0.88);
		backdrop-filter: blur(8px);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal {
		background: #1e0d38;
		border: 2px solid #5b21b6;
		border-radius: 1.5rem;
		padding: 2.5rem 2rem 2rem;
		width: 100%;
		max-width: 420px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.85rem;
		box-shadow: 0 8px 48px rgba(168, 85, 247, 0.35);
		animation: pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes pop-in {
		from { opacity: 0; transform: scale(0.9) translateY(12px); }
		to   { opacity: 1; transform: scale(1) translateY(0); }
	}

	.modal-icon {
		font-size: 2.5rem;
		line-height: 1;
	}

	.modal-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1.6rem;
		background: linear-gradient(90deg, #c084fc, #f0abfc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0;
		text-align: center;
	}

	.modal-sub {
		font-size: 0.85rem;
		color: #7c5faa;
		margin: 0;
		text-align: center;
		line-height: 1.5;
	}

	.input-wrap {
		position: relative;
		width: 100%;
		margin-top: 0.25rem;
	}

	.username-input {
		width: 100%;
		background: #261040;
		border: 2px solid #3d1a6e;
		border-radius: 0.75rem;
		color: #f3e8ff;
		font-family: 'Nunito', sans-serif;
		font-size: 1.1rem;
		font-weight: 700;
		padding: 0.65rem 2.5rem 0.65rem 1rem;
		outline: none;
		transition: border-color 0.15s;
		box-sizing: border-box;
	}

	.username-input:focus { border-color: #7c3aed; }
	.username-input::placeholder { color: #4a2d7a; }
	.username-input.state-available { border-color: #16a34a; }
	.username-input.state-error { border-color: #ef4444; }

	.status-icon {
		position: absolute;
		right: 0.85rem;
		top: 50%;
		transform: translateY(-50%);
		font-size: 0.9rem;
		font-weight: 800;
		color: #4ade80;
		display: flex;
		align-items: center;
	}

	.username-input.state-error + .status-icon { color: #f87171; }

	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid #5b21b6;
		border-top-color: #a855f7;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		display: inline-block;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.hint-row {
		min-height: 1.1rem;
		width: 100%;
	}

	.hint {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.3px;
	}

	.hint-ok   { color: #4ade80; }
	.hint-err  { color: #f87171; }
	.hint-muted { color: #4a2d7a; }

	.btn-confirm {
		width: 100%;
		background: linear-gradient(135deg, #a855f7, #d946ef);
		border: none;
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 1.1rem;
		padding: 0.7rem;
		border-radius: 999px;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
		transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
		margin-top: 0.25rem;
	}

	.btn-confirm:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(217, 70, 239, 0.5);
	}

	.btn-confirm:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
</style>
