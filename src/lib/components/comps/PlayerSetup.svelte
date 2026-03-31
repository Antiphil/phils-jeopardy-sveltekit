<script lang="ts">
	let { onclose, onstart }: {
		onclose: () => void;
		onstart: (players: Player[], teams: Team[] | null) => void;
	} = $props();

	type Player = { id: number; name: string; avatar: string };
	type Team   = { id: number; name: string; color: string; playerIds: number[] };

	const AVATARS = ['🦊','🐼','🐸','🦄','🐯','🦁','🐶','🐱','🐻','🦋','🐲','👾'];
	const TEAM_COLORS = ['#a855f7','#d946ef','#fbbf24','#34d399','#38bdf8','#f87171'];
	const TEAM_NAMES  = ['Team Lila','Team Pink','Team Gold','Team Grün','Team Blau','Team Rot'];

	let players: Player[] = $state([
		{ id: 1, name: '', avatar: '🦊' },
		{ id: 2, name: '', avatar: '🐼' },
	]);
	let teamsEnabled = $state(false);
	let teamCount    = $state(2);
	let nextId       = $state(3);
	let openAvatarId: number | null = $state(null);
	let dropdownPos = $state({ top: 0, left: 0 });

	let teams: Team[] = $derived(
		Array.from({ length: teamCount }, (_, i) => ({
			id: i + 1,
			name: TEAM_NAMES[i] ?? `Team ${i + 1}`,
			color: TEAM_COLORS[i] ?? '#a855f7',
			playerIds: players
				.filter((_, pi) => pi % teamCount === i)
				.map(p => p.id),
		}))
	);

	function addPlayer() {
		const avatar = AVATARS[players.length % AVATARS.length];
		players = [...players, { id: nextId++, name: '', avatar }];
	}

	function removePlayer(id: number) {
		if (players.length <= 1) return;
		players = players.filter(p => p.id !== id);
	}

	function setAvatar(id: number, avatar: string) {
		players = players.map(p => p.id === id ? { ...p, avatar } : p);
		openAvatarId = null;
	}

	function handleStart() {
		const filled = players.filter(p => p.name.trim());
		if (filled.length === 0) return;
		onstart(filled, teamsEnabled ? teams : null);
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
		openAvatarId = null;
	}

	function teamOfPlayer(playerId: number): Team | undefined {
		return teams.find(t => t.playerIds.includes(playerId));
	}
</script>

<!-- Backdrop -->
<div class="backdrop" role="button" tabindex="-1" onmousedown={handleBackdrop} onkeydown={() => {}}>
	<div class="modal" role="dialog" aria-modal="true">

		<!-- Header -->
		<div class="modal-header">
			<h2 class="modal-title">Spieler einrichten 🎮</h2>
			<button class="close-btn" onclick={onclose} aria-label="Schließen">✕</button>
		</div>

		<!-- Players list -->
		<div class="section-label">Spieler</div>
		<div class="players-list">
			{#each players as player (player.id)}
				{@const team = teamsEnabled ? teamOfPlayer(player.id) : undefined}
				<div class="player-row" style={team ? `border-color: ${team.color}40; background: ${team.color}10` : ''}>
					<div class="avatar-wrap">
						<button
							class="avatar-btn"
							class:open={openAvatarId === player.id}
							onclick={(e) => {
							if (openAvatarId === player.id) { openAvatarId = null; return; }
							const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
							dropdownPos = { top: r.bottom + 6, left: r.left + r.width / 2 };
							openAvatarId = player.id;
						}}
							title="Avatar wählen"
							style={team ? `box-shadow: 0 0 0 2px ${team.color}` : ''}
						>{player.avatar}</button>
					</div>

					<input
						class="player-input"
						type="text"
						placeholder="Spielername…"
						maxlength={20}
						bind:value={player.name}
					/>

					{#if teamsEnabled && team}
						<span class="team-badge" style={`background: ${team.color}30; color: ${team.color}; border-color: ${team.color}60`}>
							{team.name}
						</span>
					{/if}

					<button
						class="remove-btn"
						onclick={() => removePlayer(player.id)}
						disabled={players.length <= 1}
						aria-label="Spieler entfernen"
					>✕</button>
				</div>
			{/each}
		</div>

		<button class="add-player-btn" onclick={addPlayer}>
			＋ Spieler hinzufügen
		</button>

		<!-- Divider -->
		<div class="divider"></div>

		<!-- Teams toggle -->
		<div class="teams-section">
			<div class="toggle-row">
				<div>
					<div class="section-label" style="margin-bottom: 0.1rem">Teams aktivieren</div>
					<div class="toggle-hint">Spieler werden automatisch auf Teams verteilt</div>
				</div>
				<button
					class="toggle"
					class:active={teamsEnabled}
					onclick={() => teamsEnabled = !teamsEnabled}
					role="switch"
					aria-checked={teamsEnabled}
					aria-label="Teams aktivieren"
				>
					<span class="toggle-knob"></span>
				</button>
			</div>

			{#if teamsEnabled}
				<div class="team-count-row">
					<span class="toggle-hint">Anzahl Teams</span>
					<div class="count-btns">
						{#each [2,3,4] as n}
							<button
								class="count-btn"
								class:active={teamCount === n}
								onclick={() => teamCount = n}
							>{n}</button>
						{/each}
					</div>
				</div>

				<div class="team-preview">
					{#each teams as team}
						<div class="team-chip" style={`border-color: ${team.color}; color: ${team.color}`}>
							<span class="team-chip-name">{team.name}</span>
							<span class="team-chip-players">
								{team.playerIds.map(id => players.find(p => p.id === id)?.avatar ?? '').join(' ')}
							</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="modal-footer">
			<button class="btn-cancel" onclick={onclose}>Abbrechen</button>
			<button
				class="btn-start"
				onclick={handleStart}
				disabled={players.filter(p => p.name.trim()).length === 0}
			>
				▶ Spiel starten
			</button>
		</div>

	</div>
</div>

{#if openAvatarId !== null}
	{@const currentPlayer = players.find(p => p.id === openAvatarId)}
	<div
		class="avatar-dropdown"
		style="top: {dropdownPos.top}px; left: {dropdownPos.left}px;"
	>
		{#each AVATARS as a}
			<button
				class="avatar-option"
				class:selected={currentPlayer?.avatar === a}
				onclick={() => { if (openAvatarId !== null) setAvatar(openAvatarId, a); }}
			>{a}</button>
		{/each}
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(10, 4, 20, 0.75);
		backdrop-filter: blur(6px);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal {
		background: #1e0d38;
		border: 2px solid #5b21b6;
		border-radius: 1.5rem;
		padding: 1.75rem;
		width: 100%;
		max-width: 480px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 8px 48px rgba(168, 85, 247, 0.35);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.modal-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1.6rem;
		background: linear-gradient(90deg, #c084fc, #f0abfc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0;
	}

	.close-btn {
		background: #32155a;
		border: 1px solid #5b21b6;
		color: #a78bca;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 0.8rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s, color 0.15s;
	}

	.close-btn:hover { background: #5b21b6; color: #f3e8ff; }

	.section-label {
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		color: #a78bca;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-bottom: 0.4rem;
	}

	.players-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.player-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: #261040;
		border: 1.5px solid #5b21b6;
		border-radius: 999px;
		padding: 0.35rem 0.5rem 0.35rem 0.4rem;
		transition: border-color 0.2s, background 0.2s;
	}

	.avatar-wrap {
		position: relative;
		flex-shrink: 0;
	}

	.avatar-btn {
		font-size: 1.4rem;
		background: #32155a;
		border: 1.5px solid transparent;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: transform 0.1s, border-color 0.15s;
	}

	.avatar-btn:hover  { transform: scale(1.12); }
	.avatar-btn.open   { border-color: #a855f7; transform: scale(1.12); }

	.avatar-dropdown {
		position: fixed;
		transform: translateX(-50%);
		background: #1e0d38;
		border: 1.5px solid #5b21b6;
		border-radius: 0.9rem;
		padding: 0.5rem;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.3rem;
		z-index: 500;
		box-shadow: 0 8px 32px rgba(168, 85, 247, 0.4);
		animation: dropIn 0.12s ease-out;
	}

	@keyframes dropIn {
		from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
		to   { opacity: 1; transform: translateX(-50%) translateY(0); }
	}

	.avatar-option {
		font-size: 1.35rem;
		background: transparent;
		border: 1.5px solid transparent;
		border-radius: 0.5rem;
		width: 38px;
		height: 38px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.1s, border-color 0.1s;
	}

	.avatar-option:hover    { background: #32155a; border-color: #7c3aed; }
	.avatar-option.selected { background: #3d1a6e; border-color: #a855f7; }

	.player-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: #f3e8ff;
		font-family: 'Nunito', sans-serif;
		font-size: 1rem;
		font-weight: 700;
	}

	.player-input::placeholder { color: #6b47a0; }

	.team-badge {
		font-family: 'Fredoka One', cursive;
		font-size: 0.72rem;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		border: 1px solid;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.remove-btn {
		background: transparent;
		border: none;
		color: #6b47a0;
		cursor: pointer;
		font-size: 0.75rem;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: color 0.15s, background 0.15s;
	}

	.remove-btn:hover:not(:disabled) { color: #f87171; background: rgba(248,113,113,0.15); }
	.remove-btn:disabled { opacity: 0.25; cursor: not-allowed; }

	.add-player-btn {
		background: transparent;
		border: 1.5px dashed #5b21b6;
		color: #a78bca;
		font-family: 'Fredoka One', cursive;
		font-size: 0.95rem;
		border-radius: 999px;
		padding: 0.5rem;
		cursor: pointer;
		width: 100%;
		transition: border-color 0.15s, color 0.15s;
	}

	.add-player-btn:hover { border-color: #a855f7; color: #c084fc; }

	.divider {
		height: 1px;
		background: #2d1560;
		margin: 0.25rem 0;
	}

	.teams-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.toggle-hint {
		font-size: 0.8rem;
		color: #6b47a0;
	}

	.toggle {
		position: relative;
		width: 46px;
		height: 26px;
		background: #32155a;
		border: 1.5px solid #5b21b6;
		border-radius: 999px;
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.2s, border-color 0.2s;
	}

	.toggle.active {
		background: #a855f7;
		border-color: #a855f7;
	}

	.toggle-knob {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 18px;
		height: 18px;
		background: white;
		border-radius: 50%;
		transition: transform 0.2s;
		display: block;
	}

	.toggle.active .toggle-knob { transform: translateX(20px); }

	.team-count-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.count-btns {
		display: flex;
		gap: 0.4rem;
	}

	.count-btn {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		border: 1.5px solid #5b21b6;
		background: #32155a;
		color: #a78bca;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.15s, color 0.15s, border-color 0.15s;
	}

	.count-btn.active, .count-btn:hover {
		background: #a855f7;
		border-color: #a855f7;
		color: white;
	}

	.team-preview {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.team-chip {
		border: 1.5px solid;
		border-radius: 0.75rem;
		padding: 0.35rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 90px;
		background: rgba(0,0,0,0.2);
	}

	.team-chip-name {
		font-family: 'Fredoka One', cursive;
		font-size: 0.8rem;
	}

	.team-chip-players { font-size: 1rem; }

	.modal-footer {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 0.25rem;
	}

	.btn-cancel {
		background: transparent;
		border: 1.5px solid #5b21b6;
		color: #a78bca;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		padding: 0.55rem 1.4rem;
		border-radius: 999px;
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
	}

	.btn-cancel:hover { border-color: #a855f7; color: #c084fc; }

	.btn-start {
		background: linear-gradient(135deg, #a855f7, #d946ef);
		border: none;
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		padding: 0.55rem 1.75rem;
		border-radius: 999px;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
		transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
	}

	.btn-start:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(217, 70, 239, 0.5);
	}

	.btn-start:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
