<script lang="ts">
	import { onMount } from 'svelte';

	let { ondone }: { ondone: () => void } = $props();

	const funMessages = [
		'🎯 Bereite Fragen vor...',
		'🎤 Wecke den Moderator auf...',
		'🏆 Poliere Trophäen...',
		'🎭 Kalibriere Dramatik-Engine...',
		'🍕 Bestelle Pizza fürs Team...',
		'📡 Verbinde mit Jeopardy-Servern...',
		'🎵 Lade epische Musik...',
		'🧠 Schärfe Rätselsinn...',
		'✨ Poliere Glitzer...',
		'🎲 Würfle Spiellogik...',
		'🪄 Beschwöre Kategorien...',
		'📺 Starte Showtime-Modus...',
	];

	let progress = $state(0);
	let msgIdx = $state(0);
	let leaving = $state(false);
	let entered = $state(false);

	onMount(() => {
		requestAnimationFrame(() => { entered = true; });

		const duration = 4030;
		const start = performance.now();

		function tick(now: number) {
			const elapsed = now - start;
			const t = Math.min(1, elapsed / duration);
			// ease: slow start, fast mid, slow end
			const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
			progress = Math.round(eased * 100);
			if (elapsed < duration) {
				requestAnimationFrame(tick);
			} else {
				progress = 100;
				setTimeout(() => {
					leaving = true;
					setTimeout(ondone, 650);
				}, 320);
			}
		}
		requestAnimationFrame(tick);

		const interval = setInterval(() => {
			msgIdx = (msgIdx + 1) % funMessages.length;
		}, 370);

		return () => clearInterval(interval);
	});

	// Jeopardy board tiles: 6 cols × 5 rows
	const tiles = Array.from({ length: 30 }, (_, i) => ({
		delay: (i % 6) * 0.15 + Math.floor(i / 6) * 0.1,
		points: [200, 400, 600, 800, 1000][Math.floor(i / 6)],
		hue: 260 + (i % 6) * 12,
	}));

	// Floating particles
	const particles = Array.from({ length: 20 }, (_, i) => ({
		emoji: ['🎯', '🎲', '💡', '⭐', '🏆', '🎉', '🎊', '❓', '💎', '🔥', '🎮', '📺', '🎵', '✨', '🪄', '🎪', '🃏', '🎰', '🎭', '🏅'][i],
		left: 2 + (i * 4.9) % 96,
		delay: (i * 0.41) % 2.8,
		dur: 2.8 + (i * 0.27) % 2.2,
		size: 1.1 + (i * 0.09) % 1.3,
	}));
</script>

<div class="overlay" class:entered class:leaving role="status" aria-live="polite" aria-label="Spiel wird gestartet">

	<!-- Jeopardy board background -->
	<div class="board-bg" aria-hidden="true">
		{#each tiles as tile}
			<div class="tile" style="animation-delay:{tile.delay}s; --hue:{tile.hue}">
				<span class="tile-pts">${tile.points}</span>
			</div>
		{/each}
	</div>

	<!-- CRT scanline -->
	<div class="scanline" aria-hidden="true"></div>

	<!-- Floating emoji particles -->
	{#each particles as p}
		<span
			class="particle"
			aria-hidden="true"
			style="left:{p.left}%; animation-delay:{p.delay}s; animation-duration:{p.dur}s; font-size:{p.size}rem;"
		>{p.emoji}</span>
	{/each}

	<!-- Main content card -->
	<div class="card">
		<div class="game-icon" aria-hidden="true">🎮</div>

		<h1 class="title">SPIEL STARTET!</h1>
		<p class="subtitle">Mach dich bereit...</p>

		<div class="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
			<div class="progress-fill" style="width:{progress}%">
				<div class="progress-shine"></div>
			</div>
		</div>
		<div class="progress-pct" aria-hidden="true">{progress}%</div>

		<div class="msg-slot">
			{#key msgIdx}
				<p class="msg">{funMessages[msgIdx]}</p>
			{/key}
		</div>
	</div>
</div>

<style>
	/* ── Overlay ──────────────────────────────────────────────────────────── */
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: radial-gradient(ellipse at 50% 35%, #2d0a5e 0%, #0d0017 65%);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		opacity: 0;
		transform: scale(1.04);
		transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1),
		            transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.overlay.entered {
		opacity: 1;
		transform: scale(1);
	}
	.overlay.leaving {
		opacity: 0;
		transform: scale(0.95);
		transition: opacity 0.6s ease-in, transform 0.6s ease-in;
	}

	/* ── Jeopardy board background ────────────────────────────────────────── */
	.board-bg {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-template-rows: repeat(5, 1fr);
		gap: 5px;
		padding: 5px;
		opacity: 0.15;
		pointer-events: none;
	}
	.tile {
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: hsl(var(--hue), 60%, 12%);
		border: 2px solid hsl(var(--hue), 60%, 30%);
		animation: tile-pulse 2.8s ease-in-out infinite;
	}
	.tile-pts {
		font-family: 'Fredoka One', cursive;
		font-size: clamp(0.55rem, 1.4vw, 1.1rem);
		color: #fbbf24;
		letter-spacing: 1px;
	}
	@keyframes tile-pulse {
		0%, 100% { background: hsl(var(--hue), 60%, 10%); border-color: hsl(var(--hue), 60%, 22%); }
		50%       { background: hsl(var(--hue), 70%, 18%); border-color: hsl(var(--hue), 70%, 42%); box-shadow: 0 0 12px hsl(var(--hue), 80%, 35%); }
	}

	/* ── CRT scanline ─────────────────────────────────────────────────────── */
	.scanline {
		position: absolute;
		left: 0; right: 0;
		height: 4px;
		background: linear-gradient(transparent, rgba(168, 85, 247, 0.25), transparent);
		pointer-events: none;
		animation: scan 3.5s linear infinite;
	}
	@keyframes scan {
		0%   { top: -4px; }
		100% { top: 100%; }
	}

	/* ── Floating particles ───────────────────────────────────────────────── */
	.particle {
		position: absolute;
		bottom: -2rem;
		pointer-events: none;
		user-select: none;
		animation: float-up linear forwards;
	}
	@keyframes float-up {
		0%   { transform: translateY(0) rotate(0deg) scale(1);    opacity: 0.85; }
		70%  { opacity: 0.6; }
		100% { transform: translateY(-110vh) rotate(400deg) scale(0.5); opacity: 0; }
	}

	/* ── Content card ─────────────────────────────────────────────────────── */
	.card {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2.5rem 3rem;
		background: rgba(14, 4, 30, 0.65);
		border: 1.5px solid rgba(168, 85, 247, 0.3);
		border-radius: 2rem;
		backdrop-filter: blur(16px);
		box-shadow: 0 0 60px rgba(168, 85, 247, 0.2), 0 0 0 1px rgba(168, 85, 247, 0.1) inset;
		text-align: center;
	}

	/* ── Game icon ────────────────────────────────────────────────────────── */
	.game-icon {
		font-size: clamp(3.5rem, 10vw, 5.5rem);
		line-height: 1;
		animation: icon-bounce 1.4s ease-in-out infinite;
		filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.9));
	}
	@keyframes icon-bounce {
		0%, 100% { transform: translateY(0) rotate(-4deg) scale(1); }
		30%      { transform: translateY(-14px) rotate(4deg) scale(1.1); }
		60%      { transform: translateY(-6px) rotate(-1deg) scale(1.05); }
	}

	/* ── Title ────────────────────────────────────────────────────────────── */
	.title {
		font-family: 'Fredoka One', cursive;
		font-size: clamp(2.4rem, 7vw, 4.5rem);
		margin: 0;
		letter-spacing: 3px;
		background: linear-gradient(90deg, #f0abfc, #c084fc, #d946ef, #f0abfc);
		background-size: 300%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: title-gradient 1.8s linear infinite, title-glow 1.8s ease-in-out infinite;
	}
	@keyframes title-gradient {
		0%   { background-position: 0%; }
		100% { background-position: 300%; }
	}
	@keyframes title-glow {
		0%, 100% { filter: drop-shadow(0 0 10px rgba(192, 132, 252, 0.7)); }
		50%      { filter: drop-shadow(0 0 28px rgba(217, 70, 239, 1)); }
	}

	/* ── Subtitle ─────────────────────────────────────────────────────────── */
	.subtitle {
		font-family: 'Fredoka One', cursive;
		font-size: 1.15rem;
		color: #c084fc;
		margin: -0.25rem 0 0;
		opacity: 0.75;
		animation: subtitle-pulse 2s ease-in-out infinite;
	}
	@keyframes subtitle-pulse {
		0%, 100% { opacity: 0.65; }
		50%      { opacity: 0.95; }
	}

	/* ── Progress bar ─────────────────────────────────────────────────────── */
	.progress-track {
		width: min(380px, 75vw);
		height: 14px;
		background: #130828;
		border: 1.5px solid #3d1a6e;
		border-radius: 999px;
		overflow: hidden;
		position: relative;
		box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1) inset;
	}
	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #6d28d9, #a855f7, #d946ef);
		border-radius: 999px;
		transition: width 0.1s linear;
		position: relative;
		overflow: hidden;
	}
	.progress-shine {
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%);
		animation: shine-sweep 1.2s ease-in-out infinite;
	}
	@keyframes shine-sweep {
		0%   { transform: translateX(-100%); }
		100% { transform: translateX(200%); }
	}

	.progress-pct {
		font-family: 'Fredoka One', cursive;
		font-size: 0.95rem;
		color: #a855f7;
		margin-top: -0.25rem;
		letter-spacing: 1px;
	}

	/* ── Loading message ──────────────────────────────────────────────────── */
	.msg-slot {
		height: 1.75rem;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.msg {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #c084fc;
		margin: 0;
		animation: msg-pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both;
		white-space: nowrap;
	}
	@keyframes msg-pop {
		0%   { opacity: 0; transform: translateY(10px) scale(0.9); }
		100% { opacity: 1; transform: translateY(0) scale(1); }
	}
</style>
