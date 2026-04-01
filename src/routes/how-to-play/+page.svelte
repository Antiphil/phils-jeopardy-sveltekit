<script lang="ts">
	let activeSection = $state(0);

	const sections = [
		{ icon: '🎯', label: 'Ziel' },
		{ icon: '🗂️', label: 'Aufbau' },
		{ icon: '🎮', label: 'Ablauf' },
		{ icon: '💥', label: 'Punkte' },
		{ icon: '🎲', label: 'Chaos' },
		{ icon: '👥', label: 'Teams' },
	];
</script>

<svelte:head>
	<title>Spielanleitung – Phil's Jeopardy</title>
	<meta name="description" content="Lerne wie Phil's Jeopardy funktioniert: Spielregeln, Gamemaster-Modus, Chaos Category und mehr." />
	<meta property="og:title" content="Spielanleitung – Phil's Jeopardy" />
	<meta property="og:description" content="Lerne wie Phil's Jeopardy funktioniert: Spielregeln, Gamemaster-Modus, Chaos Category und mehr." />
</svelte:head>

<div class="page">

	<div class="hero">
		<h1 class="title">How to Play</h1>
		<p class="subtitle">Alles was du wissen musst — in unter 2 Minuten</p>
	</div>

	<!-- Tab nav -->
	<nav class="tabs">
		{#each sections as s, i}
			<button class="tab" class:active={activeSection === i} onclick={() => activeSection = i}>
				<span class="tab-icon">{s.icon}</span>
				<span class="tab-label">{s.label}</span>
			</button>
		{/each}
	</nav>

	<div class="content">

		<!-- ─── 0: Ziel ─────────────────────────────────────── -->
		{#if activeSection === 0}
			<section class="card-section">
				<h2 class="section-title">🎯 Das Ziel</h2>
				<p class="section-lead">Sammle so viele Punkte wie möglich, indem du Fragen richtig beantwortest.</p>

				<div class="goal-visual">
					<div class="goal-player">
						<div class="gp-avatar">🧑</div>
						<div class="gp-name">Anna</div>
						<div class="gp-score score-winner">1 800 Pkt.</div>
						<div class="gp-crown">👑</div>
					</div>
					<div class="goal-vs">VS</div>
					<div class="goal-player">
						<div class="gp-avatar">🧔</div>
						<div class="gp-name">Ben</div>
						<div class="gp-score">950 Pkt.</div>
					</div>
					<div class="goal-vs">VS</div>
					<div class="goal-player">
						<div class="gp-avatar">👩</div>
						<div class="gp-name">Clara</div>
						<div class="gp-score">1 200 Pkt.</div>
					</div>
				</div>

				<div class="tip-box">
					<span class="tip-icon">💡</span>
					<span>Wer am Ende die meisten Punkte hat, <strong>gewinnt</strong>. Punkte können aber auch ins Minus gehen!</span>
				</div>
			</section>

		<!-- ─── 1: Aufbau ───────────────────────────────────── -->
		{:else if activeSection === 1}
			<section class="card-section">
				<h2 class="section-title">🗂️ Der Spielaufbau</h2>
				<p class="section-lead">Das Spiel besteht aus <strong>2 Runden</strong> und einer Sonderkategorie.</p>

				<div class="boards-visual">
					<div class="board-preview">
						<div class="bp-label">Runde 1</div>
						<div class="bp-grid">
							{#each ['Geo', 'Geschichte', 'Sport', '…'] as cat}
								<div class="bp-cat">{cat}</div>
							{/each}
							{#each [100,200,300,400,500] as pts}
								{#each [0,1,2,3] as _}
									<div class="bp-tile">{pts}</div>
								{/each}
							{/each}
						</div>
						<div class="bp-pts-label">100 · 200 · 300 · 400 · 500 Pkt.</div>
					</div>

					<div class="boards-arrow">→</div>

					<div class="board-preview board-2">
						<div class="bp-label">Runde 2</div>
						<div class="bp-grid">
							{#each ['Tech', 'Natur', 'Film', '…'] as cat}
								<div class="bp-cat">{cat}</div>
							{/each}
							{#each [200,400,600,800,1000] as pts}
								{#each [0,1,2,3] as _}
									<div class="bp-tile bp-tile-2">{pts}</div>
								{/each}
							{/each}
						</div>
						<div class="bp-pts-label">200 · 400 · 600 · 800 · 1000 Pkt.</div>
					</div>

					<div class="phil-preview">
						<div class="bp-label phil-lbl">🎲 Phil</div>
						<div class="phil-tiles">
							{#each [250,500,750,1000,'…'] as pts}
								<div class="phil-tile">{pts}</div>
							{/each}
						</div>
						<div class="bp-pts-label phil-pts-lbl">250er Schritte · 10 Aufgaben</div>
					</div>
				</div>

				<div class="info-row">
					<div class="info-chip">
						<span>6 Kategorien pro Runde</span>
					</div>
					<div class="info-chip">
						<span>5 Fragen pro Kategorie</span>
					</div>
					<div class="info-chip">
						<span class="ic-icon">🔒</span>
						<span>Runde 2 erst nach Runde 1</span>
					</div>
				</div>
			</section>

		<!-- ─── 2: Ablauf ───────────────────────────────────── -->
		{:else if activeSection === 2}
			<section class="card-section">
				<h2 class="section-title">🎮 Der Spielablauf</h2>
				<p class="section-lead">Spieler sind abwechselnd dran und wählen eine Frage aus.</p>

				<div class="flow">
					<div class="flow-step">
						<div class="fs-num">1</div>
						<div class="fs-content">
							<div class="fs-title">Frage auswählen</div>
							<div class="fs-desc">Der aktive Spieler klickt auf ein Feld — z.B. <em>Geschichte / 300</em></div>
						</div>
						<div class="fs-visual">
							<div class="fv-tile fv-open">300</div>
						</div>
					</div>

					<div class="flow-arrow">↓</div>

					<div class="flow-step">
						<div class="fs-num">2</div>
						<div class="fs-content">
							<div class="fs-title">Frage wird vorgelesen</div>
							<div class="fs-desc">Der Gamemaster liest die Frage laut vor. Alle dürfen antworten — aber nur der aktive Spieler ist zunächst dran.</div>
						</div>
						<div class="fs-visual">
							<div class="fv-modal">
								<div class="fv-q">Was ist die Hauptstadt von Frankreich?</div>
								<div class="fv-btns">
									<div class="fv-btn fv-correct">✓</div>
									<div class="fv-btn fv-wrong">✗</div>
								</div>
							</div>
						</div>
					</div>

					<div class="flow-arrow">↓</div>

					<div class="flow-step">
						<div class="fs-num">3</div>
						<div class="fs-content">
							<div class="fs-title">Bewertung</div>
							<div class="fs-desc">Gamemaster klickt <strong class="correct-word">✓ Richtig</strong> oder <strong class="wrong-word">✗ Falsch</strong>. Bei Falsch können andere noch antworten.</div>
						</div>
						<div class="fs-visual fv-row">
							<div class="fv-tile fv-done">✓</div>
							<div class="fv-tile fv-missed">✗</div>
						</div>
					</div>

					<div class="flow-arrow">↓</div>

					<div class="flow-step">
						<div class="fs-num">4</div>
						<div class="fs-content">
							<div class="fs-title">Nächster Spieler</div>
							<div class="fs-desc">Der Zug wechselt automatisch zum nächsten Spieler. Das Scoreboard zeigt wer dran ist.</div>
						</div>
						<div class="fs-visual">
							<div class="fv-turn">▶ Anna ist dran!</div>
						</div>
					</div>
				</div>
			</section>

		<!-- ─── 3: Punkte ───────────────────────────────────── -->
		{:else if activeSection === 3}
			<section class="card-section">
				<h2 class="section-title">💥 Das Punktesystem</h2>
				<p class="section-lead">Richtige Antworten bringen Punkte — falsche kosten welche.</p>

				<div class="points-visual">
					<div class="pv-case correct-case">
						<div class="pvc-icon">✓</div>
						<div class="pvc-title">Richtig</div>
						<div class="pvc-example">
							<span class="pvc-q">300-Punkte-Frage</span>
							<span class="pvc-arrow">→</span>
							<span class="pvc-result pvc-plus">+300 Pkt.</span>
						</div>
						<div class="pvc-desc">Volle Punktzahl auf dein Konto</div>
					</div>

					<div class="pv-case wrong-case">
						<div class="pvc-icon">✗</div>
						<div class="pvc-title">Falsch</div>
						<div class="pvc-example">
							<span class="pvc-q">300-Punkte-Frage</span>
							<span class="pvc-arrow">→</span>
							<span class="pvc-result pvc-minus">−150 Pkt.</span>
						</div>
						<div class="pvc-desc">Halbe Punktzahl wird abgezogen</div>
					</div>
				</div>

				<div class="retry-box">
					<div class="rb-title">🔄 Andere Spieler dürfen nachziehen</div>
					<div class="rb-flow">
						<div class="rb-step">
							<div class="rbs-avatar">🧑 Anna</div>
							<div class="rbs-badge wrong-badge">✗ Falsch −150</div>
						</div>
						<div class="rb-arrow">→</div>
						<div class="rb-step">
							<div class="rbs-avatar">🧔 Ben</div>
							<div class="rbs-badge correct-badge">✓ Richtig +300</div>
						</div>
					</div>
					<div class="rb-note">Auch beim Nachziehen gilt: falsch = halbe Punkte abgezogen</div>
				</div>

				<div class="tip-box">
					<span class="tip-icon">⚠️</span>
					<span>Punkte können <strong>negativ</strong> werden! Riskante Antworten können das Spiel drehen.</span>
				</div>
			</section>

		<!-- ─── 4: Phil ─────────────────────────────────────── -->
		{:else if activeSection === 4}
			<section class="card-section">
				<h2 class="section-title">🎲 Chaos Category</h2>
				<p class="section-lead">Eine Sonderkategorie die auf <strong>beiden</strong> Runden verfügbar ist — unabhängig vom Spielfortschritt.</p>

				<div class="phil-visual">
					<div class="phil-column-preview">
						{#each [250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500] as pts}
							<div class="pvt">{pts}</div>
						{/each}
					</div>
					<div class="phil-rules">
						<div class="phil-rule">
							<span class="pr-icon">🎲</span>
							<div>
								<div class="pr-title">Eigene Aufgaben</div>
								<div class="pr-desc">Der Gamemaster legt die Aufgaben selbst fest — alles ist erlaubt: Singen, Zeichnen, Fragen, Challenges</div>
							</div>
						</div>
						<div class="phil-rule">
							<span class="pr-icon">📅</span>
							<div>
								<div class="pr-title">Immer spielbar</div>
								<div class="pr-desc">Chaos Category ist unabhängig von Runde 1 oder 2 — jederzeit anklickbar</div>
							</div>
						</div>
						<div class="phil-rule">
							<span class="pr-icon">📈</span>
							<div>
								<div class="pr-title">250er Schritte</div>
								<div class="pr-desc">Von 250 bis 2500 Punkte — 10 Aufgaben mit steigendem Wert</div>
							</div>
						</div>
						<div class="phil-rule">
							<span class="pr-icon">✏️</span>
							<div>
								<div class="pr-title">In Game Settings editierbar</div>
								<div class="pr-desc">Alle Aufgaben können in den Game Settings individuell angepasst werden</div>
							</div>
						</div>
					</div>
				</div>
			</section>

		<!-- ─── 5: Teams ────────────────────────────────────── -->
		{:else if activeSection === 5}
			<section class="card-section">
				<h2 class="section-title">👥 Teams</h2>
				<p class="section-lead">Ihr könnt auch in Teams spielen — perfekt für größere Gruppen.</p>

				<div class="teams-visual">
					<div class="team-card" style="border-color: #a855f7">
						<div class="tc-name" style="color: #a855f7">🟣 Team Lila</div>
						<div class="tc-members">
							<span>🧑 Anna</span>
							<span>👩 Clara</span>
						</div>
						<div class="tc-score">1 400 Pkt.</div>
					</div>
					<div class="teams-vs">VS</div>
					<div class="team-card" style="border-color: #06b6d4">
						<div class="tc-name" style="color: #06b6d4">🔵 Team Cyan</div>
						<div class="tc-members">
							<span>🧔 Ben</span>
							<span>👦 David</span>
						</div>
						<div class="tc-score">1 100 Pkt.</div>
					</div>
				</div>

				<div class="teams-rules">
					<div class="tr-item">
						<span class="tri-icon">🔄</span>
						<span>Teams wechseln sich ab — nicht einzelne Spieler</span>
					</div>
					<div class="tr-item">
						<span class="tri-icon">💬</span>
						<span>Das ganze Team darf beraten — einer antwortet</span>
					</div>
					<div class="tr-item">
						<span class="tri-icon">⚙️</span>
						<span>2, 3 oder 4 Teams wählbar bei der Spielereinrichtung</span>
					</div>
					<div class="tr-item">
						<span class="tri-icon">🎨</span>
						<span>Jedes Team bekommt eine eigene Farbe im Scoreboard</span>
					</div>
				</div>
			</section>
		{/if}

	</div>

	<!-- Nav arrows -->
	<div class="nav-row">
		<button class="nav-btn" disabled={activeSection === 0} onclick={() => activeSection--}>← Zurück</button>
		<div class="nav-dots">
			{#each sections as _, i}
				<button class="dot" class:active={activeSection === i} onclick={() => activeSection = i} aria-label={sections[i].label}></button>
			{/each}
		</div>
		<button class="nav-btn" disabled={activeSection === sections.length - 1} onclick={() => activeSection++}>Weiter →</button>
	</div>

</div>

<style>
	.page {
		max-width: 780px;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		position: relative;
		z-index: 1;
	}

	/* ── Hero ───────────────────────────────────────────── */
	.hero { text-align: center; }

	.title {
		font-family: 'Fredoka One', cursive;
		font-size: clamp(2rem, 6vw, 3rem);
		background: linear-gradient(90deg, #c084fc, #f0abfc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0 0 0.25rem;
	}

	.subtitle {
		color: #7c5faa;
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0;
	}

	/* ── Tabs ───────────────────────────────────────────── */
	.tabs {
		display: flex;
		gap: 0.4rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.tab {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		padding: 0.5rem 0.85rem;
		border-radius: 999px;
		border: 1.5px solid #3d1a6e;
		background: #1e0d38;
		color: #7c5faa;
		cursor: pointer;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
		font-size: 0.75rem;
		transition: border-color 0.15s, color 0.15s, background 0.15s;
	}

	.tab:hover { border-color: #a855f7; color: #c084fc; }

	.tab.active {
		background: linear-gradient(135deg, #a855f7, #d946ef);
		border-color: transparent;
		color: white;
		box-shadow: 0 3px 12px rgba(168,85,247,0.4);
	}

	.tab-icon { font-size: 1.1rem; }
	.tab-label { font-size: 0.7rem; }

	/* ── Content card ───────────────────────────────────── */
	.content {
		background: #1e0d38;
		border: 1.5px solid #3d1a6e;
		border-radius: 1.5rem;
		padding: 2rem 1.75rem;
		min-height: 360px;
	}

	.card-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		animation: fade-in 0.2s ease-out;
	}

	@keyframes fade-in {
		from { opacity: 0; transform: translateY(6px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.section-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1.5rem;
		color: #e2d0ff;
		margin: 0;
	}

	.section-lead {
		color: #a78bca;
		font-size: 0.95rem;
		margin: 0;
		line-height: 1.5;
	}

	/* ── Tip / info boxes ───────────────────────────────── */
	.tip-box {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		background: #261040;
		border: 1px solid #5b21b6;
		border-radius: 0.85rem;
		padding: 0.8rem 1rem;
		font-size: 0.85rem;
		color: #c4a8e8;
		line-height: 1.4;
	}

	.tip-icon { font-size: 1.1rem; flex-shrink: 0; }

	/* ── 0: Goal visual ─────────────────────────────────── */
	.goal-visual {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.25rem;
		flex-wrap: wrap;
	}

	.goal-player {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		background: #261040;
		border: 1.5px solid #3d1a6e;
		border-radius: 1rem;
		padding: 1rem 1.25rem;
		min-width: 90px;
	}

	.gp-avatar { font-size: 2rem; }
	.gp-name   { font-family: 'Fredoka One', cursive; font-size: 0.9rem; color: #e2d0ff; }
	.gp-score  { font-family: 'Fredoka One', cursive; font-size: 1rem; color: #a78bca; }
	.gp-crown  { font-size: 1.2rem; }
	.score-winner { color: #fbbf24 !important; }

	.goal-vs {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #5b21b6;
	}

	/* ── 1: Boards visual ───────────────────────────────── */
	.boards-visual {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.board-preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
	}

	.bp-label {
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		color: #c084fc;
		background: #261040;
		border: 1px solid #5b21b6;
		border-radius: 999px;
		padding: 0.2rem 0.75rem;
	}

	.bp-grid {
		display: grid;
		grid-template-columns: repeat(4, 38px);
		gap: 3px;
	}

	.bp-cat {
		background: linear-gradient(135deg, #3b1a6e, #261040);
		border: 1px solid #5b21b6;
		border-radius: 4px;
		font-size: 0.55rem;
		color: #c4a8e8;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 20px;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
	}

	.bp-tile {
		background: linear-gradient(135deg, #2d1260, #1e0d38);
		border: 1px solid #5b21b6;
		border-radius: 4px;
		font-size: 0.5rem;
		color: #e2d0ff;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 18px;
		font-family: 'Fredoka One', cursive;
	}

	.bp-tile-2 { border-color: #7c3aed; color: #c4b5fd; }

	.bp-pts-label {
		font-size: 0.6rem;
		color: #5b21b6;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
	}

	.boards-arrow {
		font-size: 1.5rem;
		color: #5b21b6;
		align-self: center;
		padding-top: 1.5rem;
	}

	.phil-preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
	}

	.phil-lbl { background: #2d0505 !important; border-color: #ef4444 !important; color: #fca5a5 !important; }

	.phil-tiles {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.pvt {
		background: linear-gradient(135deg, #450a0a, #1e0d0d);
		border: 1px solid #b91c1c;
		border-radius: 4px;
		font-size: 0.5rem;
		color: #fca5a5;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 16px;
		width: 60px;
		font-family: 'Fredoka One', cursive;
	}

	.phil-pts-lbl { color: #b91c1c !important; }

	.info-row {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.info-chip {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		background: #261040;
		border: 1px solid #3d1a6e;
		border-radius: 999px;
		padding: 0.3rem 0.85rem;
		font-size: 0.8rem;
		color: #a78bca;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
	}

	.ic-icon { font-size: 0.9rem; }

	/* ── 2: Flow ────────────────────────────────────────── */
	.flow {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.flow-step {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: #261040;
		border: 1px solid #3d1a6e;
		border-radius: 1rem;
		padding: 0.85rem 1rem;
	}

	.fs-num {
		font-family: 'Fredoka One', cursive;
		font-size: 1.3rem;
		color: #a855f7;
		min-width: 28px;
		text-align: center;
	}

	.fs-content { flex: 1; }

	.fs-title {
		font-family: 'Fredoka One', cursive;
		font-size: 0.95rem;
		color: #e2d0ff;
		margin-bottom: 0.15rem;
	}

	.fs-desc {
		font-size: 0.78rem;
		color: #7c5faa;
		line-height: 1.4;
	}

	.fs-visual { flex-shrink: 0; }

	.fv-tile {
		width: 44px;
		height: 44px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
	}

	.fv-open   { background: linear-gradient(135deg, #2d1260, #1e0d38); border: 1.5px solid #a855f7; color: #e2d0ff; }
	.fv-done   { background: linear-gradient(135deg, #052e16, #0a1f14); border: 1.5px solid #34d399; color: #34d399; }
	.fv-missed { background: #1c0a2a; border: 1.5px solid #3d1a6e; color: #5b21b6; opacity: 0.6; }

	.fv-row { display: flex; gap: 0.4rem; }

	.fv-modal {
		background: #1e0d38;
		border: 1.5px solid #5b21b6;
		border-radius: 8px;
		padding: 0.5rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		width: 160px;
	}

	.fv-q {
		font-size: 0.65rem;
		color: #c4a8e8;
		line-height: 1.3;
	}

	.fv-btns { display: flex; gap: 0.3rem; }

	.fv-btn {
		flex: 1;
		border-radius: 999px;
		font-size: 0.7rem;
		font-weight: 800;
		padding: 0.2rem;
		text-align: center;
		font-family: 'Fredoka One', cursive;
	}

	.fv-correct { background: linear-gradient(135deg, #059669, #34d399); color: white; }
	.fv-wrong   { background: linear-gradient(135deg, #be123c, #f87171); color: white; }

	.fv-turn {
		background: #1e0d38;
		border: 1.5px solid #5b21b6;
		border-radius: 999px;
		padding: 0.3rem 0.7rem;
		font-family: 'Fredoka One', cursive;
		font-size: 0.75rem;
		color: #c084fc;
		white-space: nowrap;
	}

	.flow-arrow {
		text-align: center;
		color: #3d1a6e;
		font-size: 1.2rem;
	}

	.correct-word { color: #34d399; }
	.wrong-word   { color: #f87171; }

	/* ── 3: Points ──────────────────────────────────────── */
	.points-visual {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.pv-case {
		flex: 1;
		min-width: 200px;
		border-radius: 1rem;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		align-items: center;
		text-align: center;
	}

	.correct-case { background: #052e16; border: 1.5px solid #34d399; }
	.wrong-case   { background: #1c0505; border: 1.5px solid #f87171; }

	.pvc-icon  { font-size: 2rem; }
	.pvc-title { font-family: 'Fredoka One', cursive; font-size: 1.1rem; color: #e2d0ff; }

	.pvc-example {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8rem;
	}

	.pvc-q     { color: #7c5faa; }
	.pvc-arrow { color: #5b21b6; }
	.pvc-result{ font-family: 'Fredoka One', cursive; font-size: 1.1rem; }
	.pvc-plus  { color: #34d399; }
	.pvc-minus { color: #f87171; }
	.pvc-desc  { font-size: 0.75rem; color: #7c5faa; }

	.retry-box {
		background: #261040;
		border: 1.5px solid #3d1a6e;
		border-radius: 1rem;
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.rb-title {
		font-family: 'Fredoka One', cursive;
		font-size: 0.95rem;
		color: #c084fc;
	}

	.rb-flow {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.rb-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}

	.rbs-avatar {
		font-size: 0.85rem;
		color: #c4a8e8;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
	}

	.rbs-badge {
		font-family: 'Fredoka One', cursive;
		font-size: 0.8rem;
		padding: 0.2rem 0.65rem;
		border-radius: 999px;
	}

	.correct-badge { background: #052e16; color: #34d399; border: 1px solid #34d399; }
	.wrong-badge   { background: #1c0505; color: #f87171; border: 1px solid #f87171; }

	.rb-arrow { color: #5b21b6; font-size: 1.2rem; }

	.rb-note {
		font-size: 0.75rem;
		color: #5b21b6;
		font-style: italic;
	}

	/* ── 4: Phil ────────────────────────────────────────── */
	.phil-visual {
		display: flex;
		gap: 1.5rem;
		align-items: flex-start;
		flex-wrap: wrap;
	}

	.phil-column-preview {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex-shrink: 0;
	}

	.pvt {
		background: linear-gradient(135deg, #450a0a, #1e0d0d);
		border: 1.5px solid #b91c1c;
		border-radius: 999px;
		font-family: 'Fredoka One', cursive;
		font-size: 0.8rem;
		color: #fca5a5;
		padding: 0.25rem 0.85rem;
		text-align: center;
		width: 80px;
	}

	.phil-rules {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		flex: 1;
	}

	.phil-rule {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		background: #1a0505;
		border: 1px solid #450a0a;
		border-radius: 0.75rem;
		padding: 0.65rem 0.85rem;
	}

	.pr-icon  { font-size: 1.2rem; flex-shrink: 0; }
	.pr-title { font-family: 'Fredoka One', cursive; font-size: 0.9rem; color: #fca5a5; margin-bottom: 0.1rem; }
	.pr-desc  { font-size: 0.75rem; color: #7c3a3a; line-height: 1.3; }

	/* ── 5: Teams ───────────────────────────────────────── */
	.teams-visual {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.team-card {
		background: #1e0d38;
		border: 2px solid;
		border-radius: 1rem;
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		min-width: 130px;
	}

	.tc-name {
		font-family: 'Fredoka One', cursive;
		font-size: 0.9rem;
	}

	.tc-members {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		font-size: 0.8rem;
		color: #a78bca;
		text-align: center;
		font-family: 'Nunito', sans-serif;
	}

	.tc-score {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #e2d0ff;
	}

	.teams-vs {
		font-family: 'Fredoka One', cursive;
		font-size: 1.2rem;
		color: #5b21b6;
	}

	.teams-rules {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.tr-item {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: #261040;
		border: 1px solid #3d1a6e;
		border-radius: 0.75rem;
		padding: 0.6rem 0.85rem;
		font-size: 0.82rem;
		color: #a78bca;
		font-family: 'Nunito', sans-serif;
	}

	.tri-icon { font-size: 1rem; flex-shrink: 0; }

	/* ── Nav row ────────────────────────────────────────── */
	.nav-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.nav-btn {
		font-family: 'Fredoka One', cursive;
		font-size: 0.9rem;
		padding: 0.45rem 1.25rem;
		border-radius: 999px;
		border: 1.5px solid #3d1a6e;
		background: #1e0d38;
		color: #7c5faa;
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
	}

	.nav-btn:hover:not(:disabled) { border-color: #a855f7; color: #c084fc; }
	.nav-btn:disabled { opacity: 0.3; cursor: default; }

	.nav-dots {
		display: flex;
		gap: 0.45rem;
		align-items: center;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		border: none;
		background: #3d1a6e;
		cursor: pointer;
		transition: background 0.15s, transform 0.15s;
		padding: 0;
	}

	.dot.active {
		background: #a855f7;
		transform: scale(1.3);
	}
</style>
