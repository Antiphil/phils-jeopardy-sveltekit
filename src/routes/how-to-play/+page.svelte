<script lang="ts">
	let activeSection = $state(0);

	const sections = [
		{ icon: '🎩', label: 'Gamemaster' },
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
		<p class="subtitle">Alles was du wissen musst — Schritt für Schritt</p>
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

		<!-- ─── 0: Gamemaster ──────────────────────────────── -->
		{#if activeSection === 0}
			<section class="card-section">
				<h2 class="section-title">🎩 Der Gamemaster</h2>
				<p class="section-lead">Für Phil's Jeopardy braucht ihr genau eine Person, die das Spiel hostet: den <strong>Gamemaster</strong>.</p>

				<div class="gm-visual">
					<div class="gm-host-card">
						<div class="gm-avatar">🎩</div>
						<div class="gm-name">Gamemaster</div>
						<div class="gm-role">öffnet das Spiel auf<br>seinem Gerät / Bildschirm</div>
					</div>
					<div class="gm-arrow">→</div>
					<div class="gm-players">
						<div class="gm-player">🧑 Anna</div>
						<div class="gm-player">🧔 Ben</div>
						<div class="gm-player">👩 Clara</div>
						<div class="gm-player-more">+ weitere</div>
					</div>
				</div>

				<div class="gm-duties">
					<div class="gm-duty">
						<span class="gd-icon">🖥️</span>
						<div>
							<div class="gd-title">Spiel hosten</div>
							<div class="gd-desc">Der Gamemaster öffnet Phil's Jeopardy auf seinem Gerät — idealerweise am TV oder Beamer für alle sichtbar</div>
						</div>
					</div>
					<div class="gm-duty">
						<span class="gd-icon">📝</span>
						<div>
							<div class="gd-title">Spiel erstellen oder wählen</div>
							<div class="gd-desc">Er kann ein eigenes Spiel in der Game-Config erstellen, oder ein öffentliches Spiel aus der Bibliothek nehmen</div>
						</div>
					</div>
					<div class="gm-duty">
						<span class="gd-icon">📖</span>
						<div>
							<div class="gd-title">Fragen vorlesen</div>
							<div class="gd-desc">Der Gamemaster liest die Fragen laut vor — die Spieler antworten, er entscheidet und klickt ✓ oder ✗</div>
						</div>
					</div>
					<div class="gm-duty">
						<span class="gd-icon">🏆</span>
						<div>
							<div class="gd-title">Scoreboard verwalten</div>
							<div class="gd-desc">Das Scoreboard ist immer sichtbar — Punkte werden automatisch nach jeder Bewertung aktualisiert</div>
						</div>
					</div>
				</div>

				<div class="tip-box">
					<span class="tip-icon">💡</span>
					<span>Der Gamemaster spielt <strong>nicht</strong> selbst mit — er leitet das Spiel. Für kleinere Runden kann er aber mitspielen und sich selbst als Spieler eintragen.</span>
				</div>
			</section>

		<!-- ─── 1: Ziel ─────────────────────────────────────── -->
		{:else if activeSection === 1}
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
					<span>Wer am Ende die meisten Punkte hat, <strong>gewinnt</strong>. Punkte können aber auch ins Minus gehen — also nicht zu riskant antworten!</span>
				</div>

				<div class="info-row">
					<div class="info-chip"><span>2–6 Spieler</span></div>
					<div class="info-chip"><span>1–3 Runden</span></div>
					<div class="info-chip"><span class="ic-icon">🎩</span><span>1 Gamemaster</span></div>
				</div>
			</section>

		<!-- ─── 2: Aufbau ───────────────────────────────────── -->
		{:else if activeSection === 2}
			<section class="card-section">
				<h2 class="section-title">🗂️ Der Spielaufbau</h2>
				<p class="section-lead">Das Spiel besteht aus <strong>1 bis 3 Runden</strong> mit je einem eigenen Board — plus optionaler Chaos Category.</p>

				<div class="boards-visual">
					<div class="board-preview">
						<div class="bp-label">Runde 1</div>
						<div class="bp-grid">
							{#each ['Geo', 'Film', 'Sport', '…'] as cat}
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

					<div class="boards-arrow">→</div>

					<div class="board-preview board-3">
						<div class="bp-label">Runde 3</div>
						<div class="bp-grid">
							{#each ['Epik', 'Wissen', 'Misc', '…'] as cat}
								<div class="bp-cat">{cat}</div>
							{/each}
							{#each [400,800,1200,1600,2000] as pts}
								{#each [0,1,2,3] as _}
									<div class="bp-tile bp-tile-3">{pts}</div>
								{/each}
							{/each}
						</div>
						<div class="bp-pts-label">400 · 800 · 1200 · 1600 · 2000 Pkt.</div>
					</div>
				</div>

				<div class="info-row">
					<div class="info-chip"><span>6 Kategorien pro Runde</span></div>
					<div class="info-chip"><span>5 Fragen pro Kategorie</span></div>
					<div class="info-chip"><span class="ic-icon">🔒</span><span>Runden nur der Reihe nach</span></div>
				</div>

				<div class="tip-box">
					<span class="tip-icon">🔒</span>
					<span>Das nächste Board ist erst zugänglich, wenn die aktuelle Runde abgeschlossen ist. Niemand kann vorspulen!</span>
				</div>
			</section>

		<!-- ─── 3: Ablauf ───────────────────────────────────── -->
		{:else if activeSection === 3}
			<section class="card-section">
				<h2 class="section-title">🎮 Der Spielablauf</h2>
				<p class="section-lead">Spieler sind abwechselnd dran und wählen eine Frage aus — der Gamemaster bewertet.</p>

				<div class="flow">
					<div class="flow-step">
						<div class="fs-num">1</div>
						<div class="fs-content">
							<div class="fs-title">Spieler einrichten</div>
							<div class="fs-desc">Zu Beginn trägt der Gamemaster alle Spielernamen ein. Er kann auch Teams bilden — mehr dazu im Teams-Tab.</div>
						</div>
						<div class="fs-visual">
							<div class="fv-turn">🧑 Anna  🧔 Ben</div>
						</div>
					</div>

					<div class="flow-arrow">↓</div>

					<div class="flow-step">
						<div class="fs-num">2</div>
						<div class="fs-content">
							<div class="fs-title">Frage auswählen</div>
							<div class="fs-desc">Der aktive Spieler wählt ein Feld auf dem Board — z.B. <em>Geschichte / 300</em>. Die Auswahl liegt bei ihm.</div>
						</div>
						<div class="fs-visual">
							<div class="fv-tile fv-open">300</div>
						</div>
					</div>

					<div class="flow-arrow">↓</div>

					<div class="flow-step">
						<div class="fs-num">3</div>
						<div class="fs-content">
							<div class="fs-title">Frage wird vorgelesen</div>
							<div class="fs-desc">Der Gamemaster liest die Frage laut vor. Ein optionaler Timer läuft ab — bei Ablauf zählt die Frage als falsch.</div>
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
						<div class="fs-num">4</div>
						<div class="fs-content">
							<div class="fs-title">Bewertung durch den Gamemaster</div>
							<div class="fs-desc">Der Gamemaster klickt <strong class="correct-word">✓ Richtig</strong> oder <strong class="wrong-word">✗ Falsch</strong>. Bei Falsch können andere Spieler nachziehen und antworten.</div>
						</div>
						<div class="fs-visual fv-row">
							<div class="fv-tile fv-done">✓</div>
							<div class="fv-tile fv-missed">✗</div>
						</div>
					</div>

					<div class="flow-arrow">↓</div>

					<div class="flow-step">
						<div class="fs-num">5</div>
						<div class="fs-content">
							<div class="fs-title">Nächster Spieler</div>
							<div class="fs-desc">Der Zug wechselt automatisch. Das Scoreboard zeigt jederzeit wer dran ist — auch während eine Frage offen ist.</div>
						</div>
						<div class="fs-visual">
							<div class="fv-turn">▶ Anna ist dran!</div>
						</div>
					</div>
				</div>
			</section>

		<!-- ─── 4: Punkte ───────────────────────────────────── -->
		{:else if activeSection === 4}
			<section class="card-section">
				<h2 class="section-title">💥 Das Punktesystem</h2>
				<p class="section-lead">Richtige Antworten bringen Punkte — falsche kosten welche. Die Chaos Category ist härter bestraft.</p>

				<div class="points-visual">
					<div class="pv-case correct-case">
						<div class="pvc-icon">✓</div>
						<div class="pvc-title">Richtig</div>
						<div class="pvc-example">
							<span class="pvc-q">300-Pkt-Frage</span>
							<span class="pvc-arrow">→</span>
							<span class="pvc-result pvc-plus">+300 Pkt.</span>
						</div>
						<div class="pvc-desc">Volle Punktzahl gutgeschrieben</div>
					</div>

					<div class="pv-case wrong-case">
						<div class="pvc-icon">✗</div>
						<div class="pvc-title">Falsch (regulär)</div>
						<div class="pvc-example">
							<span class="pvc-q">300-Pkt-Frage</span>
							<span class="pvc-arrow">→</span>
							<span class="pvc-result pvc-minus">−150 Pkt.</span>
						</div>
						<div class="pvc-desc">Halbe Punktzahl wird abgezogen</div>
					</div>

					<div class="pv-case chaos-wrong-case">
						<div class="pvc-icon">💥</div>
						<div class="pvc-title">Falsch (Chaos)</div>
						<div class="pvc-example">
							<span class="pvc-q">500-Pkt-Aufgabe</span>
							<span class="pvc-arrow">→</span>
							<span class="pvc-result pvc-minus">−500 Pkt.</span>
						</div>
						<div class="pvc-desc">Volle Punktzahl wird abgezogen!</div>
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
					<div class="rb-note">Auch beim Nachziehen gilt: falsch = Abzug. Nur einer kann die volle Punktzahl bekommen.</div>
				</div>

				<div class="tip-box">
					<span class="tip-icon">⚠️</span>
					<span>Punkte können <strong>negativ</strong> werden! In der Chaos Category lieber zweimal überlegen — dort gibt es volle Minuspunkte.</span>
				</div>
			</section>

		<!-- ─── 5: Chaos ────────────────────────────────────── -->
		{:else if activeSection === 5}
			<section class="card-section">
				<h2 class="section-title">🎲 Chaos Category</h2>
				<p class="section-lead">Eine Sonderkategorie, die auf <strong>allen Runden</strong> gleichzeitig sichtbar ist — mit vier verschiedenen Aufgabentypen.</p>

				<div class="chaos-types">
					<div class="ct-card ct-question">
						<div class="ct-icon">❓</div>
						<div class="ct-title">Freie Frage</div>
						<div class="ct-desc">Eine normale Frage oder eine wilde Challenge — Singen, Zeichnen, Rätsel, alles möglich. Der Gamemaster legt den Inhalt selbst fest.</div>
					</div>
					<div class="ct-card ct-wordle">
						<div class="ct-icon">🟩</div>
						<div class="ct-title">Wordle</div>
						<div class="ct-desc">Errate ein verstecktes Wort in bis zu 6 Versuchen. Grün = richtige Position, Gelb = im Wort aber falsch positioniert.</div>
					</div>
					<div class="ct-card ct-hangman">
						<div class="ct-icon">🪢</div>
						<div class="ct-title">Hangman</div>
						<div class="ct-desc">Buchstabe für Buchstabe — errate das Wort bevor die Figur vollständig gezeichnet ist. Zu viele Fehler = Runde verloren.</div>
					</div>
					<div class="ct-card ct-wheel">
						<div class="ct-icon">🎡</div>
						<div class="ct-title">Chaos Wheel</div>
						<div class="ct-desc">Das Glücksrad dreht sich und bestimmt einen zufälligen Effekt: Doppelte Punkte, Punktetausch, Aussetzen, Halbieren oder Bankrott!</div>
					</div>
				</div>

				<div class="chaos-rules">
					<div class="phil-rule">
						<span class="pr-icon">📊</span>
						<div>
							<div class="pr-title">250er Schritte</div>
							<div class="pr-desc">Von 250 bis 2500 Punkte — 10 Aufgaben mit steigendem Einsatz</div>
						</div>
					</div>
					<div class="phil-rule">
						<span class="pr-icon">💥</span>
						<div>
							<div class="pr-title">Volle Minuspunkte</div>
							<div class="pr-desc">Wer eine Chaos-Aufgabe falsch beantwortet, verliert die <strong>volle</strong> Punktzahl — kein Rabatt</div>
						</div>
					</div>
					<div class="phil-rule">
						<span class="pr-icon">⏱️</span>
						<div>
							<div class="pr-title">Optionaler Timer</div>
							<div class="pr-desc">Pro Aufgabe kann ein eigener Timer gesetzt werden — das Chaos Wheel ignoriert den Timer automatisch</div>
						</div>
					</div>
					<div class="phil-rule">
						<span class="pr-icon">📅</span>
						<div>
							<div class="pr-title">Immer spielbar</div>
							<div class="pr-desc">Die Chaos Category ist unabhängig von Runde 1, 2 oder 3 — jederzeit anklickbar</div>
						</div>
					</div>
				</div>
			</section>

		<!-- ─── 6: Teams ────────────────────────────────────── -->
		{:else if activeSection === 6}
			<section class="card-section">
				<h2 class="section-title">👥 Teams</h2>
				<p class="section-lead">Ihr könnt auch in Teams spielen — perfekt für größere Gruppen oder wenn mehr als 6 Leute mitspielen möchten.</p>

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
						<span>Das ganze Team darf beraten — einer antwortet für das Team</span>
					</div>
					<div class="tr-item">
						<span class="tri-icon">⚙️</span>
						<span>2, 3 oder 4 Teams wählbar bei der Spielereinrichtung</span>
					</div>
					<div class="tr-item">
						<span class="tri-icon">🎨</span>
						<span>Jedes Team bekommt eine eigene Farbe im Scoreboard</span>
					</div>
					<div class="tr-item">
						<span class="tri-icon">💥</span>
						<span>Chaos Category gilt für Teams genauso — volle Minuspunkte bei Falsch</span>
					</div>
				</div>

				<div class="tip-box">
					<span class="tip-icon">🎩</span>
					<span>Der Gamemaster trägt die Teamnamen zu Spielbeginn ein. Danach läuft alles automatisch — Scoreboard und Zugreihenfolge inklusive.</span>
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

	/* ── 0: Gamemaster ──────────────────────────────────── */
	.gm-visual {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.gm-host-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		background: linear-gradient(135deg, #2d0a5e, #1a0638);
		border: 2px solid #a855f7;
		border-radius: 1rem;
		padding: 1rem 1.5rem;
		box-shadow: 0 0 18px rgba(168,85,247,0.25);
	}

	.gm-avatar { font-size: 2.2rem; }

	.gm-name {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #c084fc;
	}

	.gm-role {
		font-size: 0.72rem;
		color: #7c5faa;
		text-align: center;
		line-height: 1.4;
	}

	.gm-arrow {
		font-size: 1.5rem;
		color: #5b21b6;
	}

	.gm-players {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.gm-player {
		background: #261040;
		border: 1px solid #3d1a6e;
		border-radius: 999px;
		padding: 0.3rem 0.9rem;
		font-size: 0.82rem;
		color: #a78bca;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
	}

	.gm-player-more {
		font-size: 0.72rem;
		color: #5b21b6;
		text-align: center;
		font-style: italic;
	}

	.gm-duties {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.gm-duty {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		background: #261040;
		border: 1px solid #3d1a6e;
		border-radius: 0.85rem;
		padding: 0.75rem 1rem;
	}

	.gd-icon { font-size: 1.3rem; flex-shrink: 0; margin-top: 0.05rem; }

	.gd-title {
		font-family: 'Fredoka One', cursive;
		font-size: 0.92rem;
		color: #e2d0ff;
		margin-bottom: 0.1rem;
	}

	.gd-desc {
		font-size: 0.78rem;
		color: #7c5faa;
		line-height: 1.4;
	}

	/* ── 1: Goal visual ─────────────────────────────────── */
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

	/* ── 2: Boards visual ───────────────────────────────── */
	.boards-visual {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
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
		grid-template-columns: repeat(4, 34px);
		gap: 3px;
	}

	.bp-cat {
		background: linear-gradient(135deg, #3b1a6e, #261040);
		border: 1px solid #5b21b6;
		border-radius: 4px;
		font-size: 0.5rem;
		color: #c4a8e8;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 18px;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
	}

	.bp-tile {
		background: linear-gradient(135deg, #2d1260, #1e0d38);
		border: 1px solid #5b21b6;
		border-radius: 4px;
		font-size: 0.45rem;
		color: #e2d0ff;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 16px;
		font-family: 'Fredoka One', cursive;
	}

	.bp-tile-2 { border-color: #7c3aed; color: #c4b5fd; }
	.bp-tile-3 { border-color: #d946ef; color: #f0abfc; }

	.bp-pts-label {
		font-size: 0.55rem;
		color: #5b21b6;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
	}

	.boards-arrow {
		font-size: 1.3rem;
		color: #5b21b6;
		align-self: center;
		padding-top: 1.5rem;
	}

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

	/* ── 3: Flow ────────────────────────────────────────── */
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

	/* ── 4: Points ──────────────────────────────────────── */
	.points-visual {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.pv-case {
		flex: 1;
		min-width: 160px;
		border-radius: 1rem;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		align-items: center;
		text-align: center;
	}

	.correct-case     { background: #052e16; border: 1.5px solid #34d399; }
	.wrong-case       { background: #1c0505; border: 1.5px solid #f87171; }
	.chaos-wrong-case { background: #1a0000; border: 1.5px solid #f97316; }

	.pvc-icon  { font-size: 2rem; }
	.pvc-title { font-family: 'Fredoka One', cursive; font-size: 1.1rem; color: #e2d0ff; }

	.pvc-example {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.78rem;
		flex-wrap: wrap;
		justify-content: center;
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

	/* ── 5: Chaos ───────────────────────────────────────── */
	.chaos-types {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 0.75rem;
	}

	.ct-card {
		border-radius: 1rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		border: 1.5px solid;
	}

	.ct-question { background: #1c0838; border-color: #7c3aed; }
	.ct-wordle   { background: #0a1f14; border-color: #34d399; }
	.ct-hangman  { background: #1c1005; border-color: #fbbf24; }
	.ct-wheel    { background: #1a0505; border-color: #f97316; }

	.ct-icon  { font-size: 1.5rem; }

	.ct-title {
		font-family: 'Fredoka One', cursive;
		font-size: 0.92rem;
		color: #e2d0ff;
	}

	.ct-desc {
		font-size: 0.75rem;
		color: #7c5faa;
		line-height: 1.4;
	}

	.chaos-rules {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.phil-rule {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		background: #261040;
		border: 1px solid #3d1a6e;
		border-radius: 0.75rem;
		padding: 0.65rem 0.85rem;
	}

	.pr-icon  { font-size: 1.2rem; flex-shrink: 0; }
	.pr-title { font-family: 'Fredoka One', cursive; font-size: 0.9rem; color: #e2d0ff; margin-bottom: 0.1rem; }
	.pr-desc  { font-size: 0.75rem; color: #7c5faa; line-height: 1.3; }

	/* ── 6: Teams ───────────────────────────────────────── */
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
