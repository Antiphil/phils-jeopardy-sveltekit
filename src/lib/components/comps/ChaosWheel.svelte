<script lang="ts">
	// ─────────────────────────────────────────────────────────────────────────────
	// ChaosWheel — Extensible fortune wheel for the Chaos Category
	// To add a new effect: add an entry to SEGMENTS + a case in resolveResult()
	// ─────────────────────────────────────────────────────────────────────────────

	export type SegmentId =
		| 'double_points'
		| 'lose_half'
		| 'swap_random'
		| 'everyone_gains'
		| 'skip_turn';

	export type WheelSegment = {
		id: SegmentId;
		lines: string[];   // label text, split into display lines
		icon: string;
		bg: string;        // segment fill color
		text: string;      // label text color
		weight: number;    // relative probability (equal = same chance)
	};

	export type Scorer = {
		id: number;
		name: string;
		avatar: string;
		score: number;
		color: string;
	};

	export type WheelResult = {
		segment: WheelSegment;
		pointsDelta?: number;    // net change applied to spinner
		newScore?: number;       // spinner's score after effect
		swapWith?: Scorer;       // swap_random: the other player
		everyoneGains?: number;  // everyone_gains: bonus per player
	};

	// ── Segment registry ──────────────────────────────────────────────────────────
	const SEGMENTS: WheelSegment[] = [
		{
			id: 'double_points',
			lines: ['Doppelte', 'Punkte'],
			icon: '💰',
			bg: '#4c1d95',
			text: '#ddd6fe',
			weight: 1,
		},
		{
			id: 'lose_half',
			lines: ['Halbe', 'Punkte weg'],
			icon: '💸',
			bg: '#7f1d1d',
			text: '#fecaca',
			weight: 1,
		},
		{
			id: 'swap_random',
			lines: ['Punkte', 'tauschen'],
			icon: '🔄',
			bg: '#1e3a8a',
			text: '#bfdbfe',
			weight: 1,
		},
		{
			id: 'everyone_gains',
			lines: ['Alle außer', 'dir +250'],
			icon: '🎁',
			bg: '#064e3b',
			text: '#a7f3d0',
			weight: 1,
		},
		{
			id: 'skip_turn',
			lines: ['Runde', 'aussetzen'],
			icon: '⏭️',
			bg: '#78350f',
			text: '#fde68a',
			weight: 1,
		},
	];

	const EVERYONE_BONUS = 250;

	let {
		spinner,
		others = [],
		onresult,
	}: {
		spinner: Scorer;
		others: Scorer[];
		onresult: (result: WheelResult) => void;
	} = $props();

	// ── SVG geometry ─────────────────────────────────────────────────────────────
	const N = SEGMENTS.length;
	const SLICE = 360 / N;
	const CX = 150, CY = 150, R = 130, HUB = 18;

	function polar(deg: number, r: number): [number, number] {
		const rad = (deg - 90) * (Math.PI / 180); // 0° = 12 o'clock
		return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
	}

	function slicePath(i: number): string {
		const a1 = i * SLICE;
		const a2 = a1 + SLICE;
		const [x1, y1] = polar(a1, R);
		const [x2, y2] = polar(a2, R);
		return `M${CX},${CY} L${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 0 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`;
	}

	function midDeg(i: number): number {
		return i * SLICE + SLICE / 2;
	}

	// For segments in the lower half, flip text so it reads correctly
	function isLower(deg: number): boolean {
		return deg > 90 && deg < 270;
	}

	// ── Spin state ────────────────────────────────────────────────────────────────
	let spinning = $state(false);
	let totalDeg = $state(0);
	let result: WheelResult | null = $state(null);
	let showResult = $state(false);

	function weightedRandom(): number {
		const total = SEGMENTS.reduce((s, seg) => s + seg.weight, 0);
		let r = Math.random() * total;
		for (let i = 0; i < SEGMENTS.length; i++) {
			r -= SEGMENTS[i].weight;
			if (r <= 0) return i;
		}
		return SEGMENTS.length - 1;
	}

	function resolveResult(idx: number): WheelResult {
		const segment = SEGMENTS[idx];
		switch (segment.id) {
			case 'double_points': {
				const delta = spinner.score;
				return { segment, pointsDelta: delta, newScore: spinner.score + delta };
			}
			case 'lose_half': {
				const delta = -Math.floor(spinner.score / 2);
				return { segment, pointsDelta: delta, newScore: Math.max(0, spinner.score + delta) };
			}
			case 'swap_random': {
				const pool = others.filter((o) => o.id !== spinner.id);
				const target = pool.length > 0
					? pool[Math.floor(Math.random() * pool.length)]
					: undefined;
				return { segment, swapWith: target };
			}
			case 'everyone_gains':
				return { segment, everyoneGains: EVERYONE_BONUS };
			case 'skip_turn':
				return { segment };
			default:
				return { segment };
		}
	}

	function spin() {
		if (spinning || showResult) return;
		spinning = true;

		const picked = weightedRandom();
		const center = midDeg(picked);
		// Bring picked segment's center to the top pointer (0° = top)
		const alignTo0 = (360 - (center % 360)) % 360;
		// Small jitter so it doesn't always stop dead-center on the segment
		const jitter = (Math.random() - 0.5) * SLICE * 0.4;
		totalDeg = totalDeg + 1800 + alignTo0 + jitter;

		setTimeout(() => {
			spinning = false;
			result = resolveResult(picked);
			showResult = true;
		}, 3700);
	}

	// ── Result text helpers ───────────────────────────────────────────────────────
	function headline(r: WheelResult): string {
		switch (r.segment.id) {
			case 'double_points':  return '💰 Jackpot!';
			case 'lose_half':      return '💸 Pech gehabt!';
			case 'swap_random':    return r.swapWith ? '🔄 Punktetausch!' : '🔄 Kein Tauschpartner';
			case 'everyone_gains': return '🎁 Alle gewinnen!';
			case 'skip_turn':      return '⏭️ Aussetzen!';
			default:               return '🎲 Chaos!';
		}
	}

	function detailLine(r: WheelResult): string {
		const fmt = (n: number) => n.toLocaleString('de');
		switch (r.segment.id) {
			case 'double_points':
				return `${spinner.name} bekommt +${fmt(r.pointsDelta!)} → ${fmt(r.newScore!)} Punkte`;
			case 'lose_half':
				return `${spinner.name} verliert ${fmt(Math.abs(r.pointsDelta!))} → ${fmt(r.newScore!)} Punkte`;
			case 'swap_random':
				return r.swapWith
					? `${spinner.name} (${fmt(spinner.score)}) tauscht mit ${r.swapWith.name} (${fmt(r.swapWith.score)})`
					: 'Kein anderer Spieler vorhanden.';
			case 'everyone_gains':
				return `Alle anderen bekommen je +${fmt(r.everyoneGains!)} Punkte`;
			case 'skip_turn':
				return `${spinner.name} muss die nächste Runde aussetzen`;
			default:
				return '';
		}
	}
</script>

<div class="chaos-wheel">
	<!-- Who's spinning -->
	<div class="spinning-for">
		<span class="sf-avatar">{spinner.avatar}</span>
		<span class="sf-name" style={`color: ${spinner.color}`}>{spinner.name}</span>
		<span class="sf-label">dreht das Chaos Wheel!</span>
	</div>

	<!-- Wheel -->
	<div class="wheel-outer">
		<div class="pointer"></div>
		<div class="wheel-ring">
			<svg
				viewBox="0 0 300 300"
				class="wheel-svg"
				style={`transform: rotate(${totalDeg}deg); transition: transform ${spinning ? '3.7s cubic-bezier(0.12, 0.9, 0.25, 1.0)' : 'none'}`}
			>
				<!-- Outer ring -->
				<circle cx={CX} cy={CY} r={R + 4} fill="none" stroke="#7c3aed" stroke-width="3.5" />

				<!-- Segments -->
				{#each SEGMENTS as seg, i}
					{@const mid = midDeg(i)}
					{@const flip = isLower(mid)}
					{@const iconY = CY - R * 0.50}
					{@const labelY = CY - R * 0.78}
					<path d={slicePath(i)} fill={seg.bg} stroke="#06000f" stroke-width="1.5" />
					<g transform={`rotate(${mid}, ${CX}, ${CY})`}>
						<!-- Icon -->
						<text
							x={CX} y={iconY}
							text-anchor="middle" dominant-baseline="central"
							font-size="16"
							transform={flip ? `rotate(180, ${CX}, ${iconY})` : undefined}
						>{seg.icon}</text>
						<!-- Label -->
						<text
							x={CX} y={labelY}
							text-anchor="middle" dominant-baseline="central"
							fill={seg.text}
							font-size="9.5"
							font-family="Fredoka One, cursive"
							font-weight="700"
							transform={flip ? `rotate(180, ${CX}, ${labelY})` : undefined}
						>
							{#each seg.lines as line, li}
								<tspan x={CX} dy={li === 0 ? `${-(seg.lines.length - 1) * 5.5}` : '11'}>{line}</tspan>
							{/each}
						</text>
					</g>
				{/each}

				<!-- Divider lines -->
				{#each SEGMENTS as _, i}
					{@const [lx, ly] = polar(i * SLICE, R)}
					<line x1={CX} y1={CY} x2={lx} y2={ly} stroke="#06000f" stroke-width="2" />
				{/each}

				<!-- Center hub -->
				<circle cx={CX} cy={CY} r={HUB} fill="#170830" stroke="#7c3aed" stroke-width="2.5" />
				<circle cx={CX} cy={CY} r={7} fill="#a855f7" />
				<circle cx={CX} cy={CY} r={3} fill="#f3e8ff" />
			</svg>
		</div>
	</div>

	<!-- Spin button -->
	{#if !showResult}
		<button class="spin-btn" onclick={spin} disabled={spinning}>
			{#if spinning}
				<span class="spin-dice">🎲</span> Dreht sich…
			{:else}
				🎲 Rad drehen!
			{/if}
		</button>
	{/if}

	<!-- Result card -->
	{#if showResult && result}
		<div class="result-card" style={`border-color: ${result.segment.bg}; box-shadow: 0 6px 32px ${result.segment.bg}99`}>
			<div class="result-icon">{result.segment.icon}</div>
			<div class="result-headline">{headline(result)}</div>
			<div class="result-detail">{detailLine(result)}</div>

			<!-- Swap visual -->
			{#if result.segment.id === 'swap_random' && result.swapWith}
				<div class="swap-visual">
					<div class="swap-player">
						<span class="swap-av">{spinner.avatar}</span>
						<span class="swap-name" style={`color: ${spinner.color}`}>{spinner.name}</span>
						<span class="swap-pts-old">{spinner.score.toLocaleString('de')}</span>
						<span class="swap-pts-arrow">→</span>
						<span class="swap-pts-new">{result.swapWith.score.toLocaleString('de')}</span>
					</div>
					<span class="swap-mid">↔</span>
					<div class="swap-player">
						<span class="swap-av">{result.swapWith.avatar}</span>
						<span class="swap-name" style={`color: ${result.swapWith.color}`}>{result.swapWith.name}</span>
						<span class="swap-pts-old">{result.swapWith.score.toLocaleString('de')}</span>
						<span class="swap-pts-arrow">→</span>
						<span class="swap-pts-new">{spinner.score.toLocaleString('de')}</span>
					</div>
				</div>
			{/if}

			<!-- Everyone gains visual -->
			{#if result.segment.id === 'everyone_gains' && others.length > 0}
				<div class="gains-list">
					{#each others as o}
						<div class="gain-row">
							<span class="gain-av">{o.avatar}</span>
							<span class="gain-name" style={`color: ${o.color}`}>{o.name}</span>
							<span class="gain-badge">+{result.everyoneGains}</span>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Skip info -->
			{#if result.segment.id === 'skip_turn'}
				<div class="skip-info">
					<span class="skip-icon">⏭️</span>
					<span>{spinner.name} setzt eine Runde aus</span>
				</div>
			{/if}

			<button class="confirm-btn" onclick={() => onresult(result!)}>
				Weiter ›
			</button>
		</div>
	{/if}
</div>

<style>
	.chaos-wheel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.1rem;
		width: 100%;
		user-select: none;
		padding: 0.25rem 0;
	}

	/* ── Spinner label ────────────────────────────────── */
	.spinning-for {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		background: rgba(124, 58, 237, 0.1);
		border: 1px solid #5b21b6;
		border-radius: 999px;
		padding: 0.3rem 1rem;
	}

	.sf-avatar { font-size: 1.1rem; }

	.sf-name {
		font-family: 'Fredoka One', cursive;
		font-size: 0.95rem;
	}

	.sf-label {
		color: #7c5faa;
		font-size: 0.78rem;
		font-family: 'Nunito', sans-serif;
		font-weight: 600;
	}

	/* ── Wheel ────────────────────────────────────────── */
	.wheel-outer {
		position: relative;
		width: 300px;
		height: 300px;
	}

	.pointer {
		position: absolute;
		top: -6px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 11px solid transparent;
		border-right: 11px solid transparent;
		border-top: 24px solid #fbbf24;
		filter: drop-shadow(0 2px 6px rgba(251, 191, 36, 0.8));
		z-index: 10;
	}

	.wheel-ring {
		width: 300px;
		height: 300px;
		border-radius: 50%;
		overflow: hidden;
		box-shadow: 0 0 0 3px #5b21b6, 0 8px 40px rgba(124, 58, 237, 0.45);
	}

	.wheel-svg {
		width: 100%;
		height: 100%;
		transform-origin: 50% 50%;
		will-change: transform;
		display: block;
	}

	/* ── Spin button ──────────────────────────────────── */
	.spin-btn {
		background: linear-gradient(135deg, #7c3aed, #a855f7);
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 1.2rem;
		padding: 0.75rem 2.5rem;
		border-radius: 999px;
		border: none;
		cursor: pointer;
		box-shadow: 0 4px 18px rgba(124, 58, 237, 0.5);
		transition: transform 0.15s, box-shadow 0.15s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.spin-btn:hover:not(:disabled) {
		transform: translateY(-3px) scale(1.04);
		box-shadow: 0 6px 26px rgba(168, 85, 247, 0.65);
	}

	.spin-btn:disabled {
		opacity: 0.75;
		cursor: default;
	}

	.spin-dice {
		display: inline-block;
		animation: spin-dice 0.35s linear infinite;
	}

	@keyframes spin-dice {
		to { transform: rotate(360deg); }
	}

	/* ── Result card ──────────────────────────────────── */
	.result-card {
		width: 100%;
		max-width: 340px;
		background: #1e0d38;
		border: 2px solid;
		border-radius: 1.25rem;
		padding: 1.5rem 1.25rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
		animation: result-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
		text-align: center;
	}

	@keyframes result-pop {
		from { opacity: 0; transform: scale(0.75) translateY(12px); }
		to   { opacity: 1; transform: scale(1) translateY(0); }
	}

	.result-icon {
		font-size: 2.5rem;
		animation: bounce-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes bounce-in {
		from { transform: scale(0.2); }
		to   { transform: scale(1); }
	}

	.result-headline {
		font-family: 'Fredoka One', cursive;
		font-size: 1.55rem;
		color: #f3e8ff;
	}

	.result-detail {
		font-size: 0.88rem;
		color: #c4b5fd;
		font-weight: 600;
		line-height: 1.4;
	}

	/* ── Swap visual ──────────────────────────────────── */
	.swap-visual {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		background: #261040;
		border: 1px solid #3d1a6e;
		border-radius: 0.85rem;
		padding: 0.7rem 1rem;
		width: 100%;
		justify-content: center;
	}

	.swap-player {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
	}

	.swap-av { font-size: 1.4rem; }
	.swap-name { font-family: 'Fredoka One', cursive; font-size: 0.8rem; }
	.swap-pts-old { font-size: 0.72rem; color: #7c5faa; text-decoration: line-through; }
	.swap-pts-arrow { font-size: 0.65rem; color: #6b47a0; }
	.swap-pts-new { font-family: 'Fredoka One', cursive; font-size: 1rem; color: #fbbf24; }
	.swap-mid { font-size: 1.6rem; color: #6b47a0; }

	/* ── Everyone gains list ──────────────────────────── */
	.gains-list {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		width: 100%;
		background: #071a0f;
		border: 1px solid #065f46;
		border-radius: 0.75rem;
		padding: 0.6rem 0.9rem;
	}

	.gain-row {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.82rem;
	}

	.gain-av { font-size: 1rem; }

	.gain-name {
		font-family: 'Fredoka One', cursive;
		font-size: 0.82rem;
	}

	.gain-badge {
		margin-left: auto;
		background: #065f46;
		color: #a7f3d0;
		font-family: 'Fredoka One', cursive;
		font-size: 0.82rem;
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
	}

	/* ── Skip info ────────────────────────────────────── */
	.skip-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #1c0e04;
		border: 1px solid #78350f;
		border-radius: 0.75rem;
		padding: 0.5rem 0.9rem;
		font-family: 'Fredoka One', cursive;
		font-size: 0.88rem;
		color: #fde68a;
		width: 100%;
		justify-content: center;
	}

	.skip-icon { font-size: 1.1rem; }

	/* ── Confirm button ───────────────────────────────── */
	.confirm-btn {
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 1.1rem;
		padding: 0.6rem 2rem;
		border-radius: 999px;
		border: none;
		cursor: pointer;
		box-shadow: 0 3px 14px rgba(168, 85, 247, 0.4);
		transition: transform 0.15s, box-shadow 0.15s;
		margin-top: 0.2rem;
	}

	.confirm-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 20px rgba(217, 70, 239, 0.5);
	}
</style>
