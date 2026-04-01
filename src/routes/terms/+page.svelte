<script lang="ts">
	// ═══════════════════════════════════════════════════════
	const BETREIBER_NAME = 'Philipp Stehle';
	const BETREIBER_STRASSE = 'Leipziger Straße 68';
	const BETREIBER_PLZ_ORT = '98617 Meiningen';
	const BETREIBER_EMAIL = 'philipp-stehle@outlook.de';
	const WEBSITE_URL = 'https://antiphil.de';
	const WEBSITE_NAME = 'Phils Jeopardy';
	// ═══════════════════════════════════════════════════════
</script>

<svelte:head>
	<title>Nutzungsbedingungen – {WEBSITE_NAME}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="legal-page">
	<a href="/" class="back-link">← Zurück zur Startseite</a>

	<h1 class="page-title">Nutzungsbedingungen</h1>
	<p class="last-updated">
		Stand: {new Date().toLocaleDateString('de-DE', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		})}
	</p>

	<section>
		<h2>1. Geltungsbereich</h2>
		<p>
			Diese Nutzungsbedingungen gelten für die Nutzung der Website <strong>{WEBSITE_NAME}</strong>
			unter <a href={WEBSITE_URL}>{WEBSITE_URL}</a>, betrieben von:
		</p>
		<address>
			{BETREIBER_NAME}<br />
			{BETREIBER_STRASSE}<br />
			{BETREIBER_PLZ_ORT}<br />
			E-Mail: <a href="mailto:{BETREIBER_EMAIL}">{BETREIBER_EMAIL}</a>
		</address>
		<p>
			Mit der Nutzung der Website erklärst du dich mit diesen Nutzungsbedingungen einverstanden.
		</p>
	</section>

	<section>
		<h2>2. Beschreibung des Dienstes</h2>
		<p>
			{WEBSITE_NAME} ist eine browserbasierte Quizspiel-Plattform im Jeopardy-Stil. Sie ermöglicht das
			Erstellen und Durchführen von Quizrunden im privaten und halbprivaten Rahmen. Der Dienst richtet
			sich an Privatpersonen und ist nicht für kommerzielle Zwecke bestimmt.
		</p>
		<p>
			Der Betrieb des Dienstes erfolgt unentgeltlich und ohne Gewähr auf dauerhafte Verfügbarkeit.
		</p>
	</section>

	<section>
		<h2>3. Registrierung und Nutzerkonten</h2>
		<p>
			Die Anmeldung erfolgt ausschließlich über externe OAuth-Anbieter (Discord, Google). Mit der
			Anmeldung bestätigst du:
		</p>
		<ul>
			<li>dass du mindestens 16 Jahre alt bist,</li>
			<li>dass die von dir übermittelten Daten korrekt sind,</li>
			<li>dass du die Nutzungsbedingungen des jeweiligen OAuth-Anbieters akzeptierst.</li>
		</ul>
		<p>Ein Anspruch auf Erstellung oder Aufrechterhaltung eines Kontos besteht nicht.</p>
	</section>

	<section>
		<h2>4. Erlaubte Nutzung</h2>
		<p>
			Die Nutzung der Plattform ist ausschließlich für private, nicht-kommerzielle Zwecke gestattet.
			Insbesondere ist es untersagt:
		</p>
		<ul>
			<li>
				rechtswidrige, beleidigende, diskriminierende oder jugendgefährdende Inhalte zu erstellen
				oder zu verbreiten,
			</li>
			<li>urheberrechtlich geschützte Inhalte ohne Genehmigung einzustellen,</li>
			<li>
				die technische Infrastruktur der Website zu beeinträchtigen oder zu missbrauchen (z. B.
				durch automatisierte Massenanfragen),
			</li>
			<li>die Plattform für kommerzielle Zwecke oder zu Werbezwecken zu nutzen.</li>
		</ul>
	</section>

	<section>
		<h2>5. Inhalte der Nutzer</h2>
		<p>
			Nutzer können eigene Spielinhalte (Fragen, Antworten, Bilder) erstellen. Du bist für die von
			dir eingestellten Inhalte selbst verantwortlich und sicherst zu, dass diese:
		</p>
		<ul>
			<li>keine Rechte Dritter verletzen (insbesondere Urheberrecht, Persönlichkeitsrecht),</li>
			<li>nicht gegen geltendes Recht verstoßen,</li>
			<li>keine personenbezogenen Daten Dritter ohne deren Einwilligung enthalten.</li>
		</ul>
		<p>
			Spielinhalte werden lokal im Browser gespeichert und nicht zentral auf Servern des Betreibers
			abgelegt.
		</p>
	</section>

	<section>
		<h2>6. Haftungsausschluss</h2>
		<p>Der Betreiber übernimmt keine Haftung für:</p>
		<ul>
			<li>die dauerhafte Verfügbarkeit oder Fehlerfreiheit der Website,</li>
			<li>Datenverluste durch technische Störungen oder Browserupdates,</li>
			<li>Schäden, die durch die Nutzung oder Nichtnutzung der Website entstehen,</li>
			<li>Inhalte externer Websites, die über Links erreichbar sind.</li>
		</ul>
		<p>
			Die Haftung bei Vorsatz und grober Fahrlässigkeit sowie für Schäden aus der Verletzung von
			Leben, Körper oder Gesundheit bleibt unberührt.
		</p>
	</section>

	<section>
		<h2>7. Verfügbarkeit</h2>
		<p>
			Ein Anspruch auf ununterbrochene Verfügbarkeit der Website besteht nicht. Der Betreiber behält
			sich vor, den Dienst jederzeit und ohne vorherige Ankündigung einzustellen, einzuschränken
			oder zu verändern.
		</p>
	</section>

	<section>
		<h2>8. Geistiges Eigentum</h2>
		<p>
			Alle Inhalte der Website (Design, Quellcode, Texte, Grafiken) sind geistiges Eigentum des
			Betreibers, soweit nicht anders gekennzeichnet. Eine Nutzung oder Vervielfältigung ohne
			ausdrückliche Genehmigung ist nicht gestattet.
		</p>
		<p>
			{WEBSITE_NAME} ist ein privates Quizspiel ohne kommerzielle Verbindung zur Marke „Jeopardy!" von
			Jeopardy Productions, Inc.
		</p>
	</section>

	<section>
		<h2>9. Sperrung und Kündigung</h2>
		<p>
			Der Betreiber behält sich vor, Nutzerkonten bei Verstößen gegen diese Nutzungsbedingungen zu
			sperren oder zu löschen, ohne dass ein Anspruch auf Entschädigung entsteht.
		</p>
	</section>

	<section>
		<h2>10. Änderungen der Nutzungsbedingungen</h2>
		<p>
			Der Betreiber behält sich vor, diese Nutzungsbedingungen jederzeit anzupassen. Bei
			wesentlichen Änderungen wird eine Information auf der Website veröffentlicht. Die fortgesetzte
			Nutzung der Website nach einer Änderung gilt als Zustimmung zu den aktualisierten Bedingungen.
		</p>
	</section>

	<section>
		<h2>11. Anwendbares Recht und Gerichtsstand</h2>
		<p>
			Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
			Gerichtsstand ist, soweit gesetzlich zulässig, der Wohnsitz des Betreibers.
		</p>
		<p>
			Für Verbraucher mit Wohnsitz in der EU gilt ergänzend das zwingende Verbraucherrecht des
			jeweiligen Wohnsitzstaates.
		</p>
		<p>
			Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: <a
				href="https://ec.europa.eu/consumers/odr"
				target="_blank"
				rel="noopener">ec.europa.eu/consumers/odr</a
			>. Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
			Verbraucherschlichtungsstelle teilzunehmen.
		</p>
	</section>

	<section>
		<h2>12. Salvatorische Klausel</h2>
		<p>
			Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam oder undurchführbar sein,
			bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An Stelle der unwirksamen
			Bestimmung gilt eine wirksame Regelung als vereinbart, die dem wirtschaftlichen Zweck der
			unwirksamen Regelung am nächsten kommt.
		</p>
	</section>

	<div class="footer-links">
		<a href="/privacy">Datenschutzerklärung</a>
		<a href="/">Startseite</a>
	</div>
</div>

<style>
	.legal-page {
		max-width: 760px;
		margin: 0 auto;
		padding: 2rem 1.5rem 5rem;
		position: relative;
		z-index: 1;
		font-family: 'Nunito', 'Segoe UI', sans-serif;
		color: #c4a8e8;
		line-height: 1.7;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 1.5rem;
		color: #7c5faa;
		text-decoration: none;
		font-weight: 700;
		font-size: 0.85rem;
		transition: color 0.15s;
	}

	.back-link:hover {
		color: #c084fc;
	}

	.page-title {
		font-family: 'Fredoka One', cursive;
		font-size: clamp(1.8rem, 5vw, 2.5rem);
		background: linear-gradient(90deg, #c084fc, #f0abfc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0 0 0.25rem;
	}

	.last-updated {
		font-size: 0.8rem;
		color: #5b21b6;
		font-weight: 600;
		margin: 0 0 2.5rem;
	}

	section {
		margin-bottom: 1.25rem;
		background: #1e0d38;
		border: 1.5px solid #3d1a6e;
		border-radius: 1rem;
		padding: 1.5rem 1.75rem;
	}

	h2 {
		font-family: 'Fredoka One', cursive;
		font-size: 1.2rem;
		color: #e2d0ff;
		margin: 0 0 0.85rem;
	}

	p {
		margin: 0 0 0.75rem;
		font-size: 0.9rem;
	}
	p:last-child {
		margin-bottom: 0;
	}

	ul {
		margin: 0.25rem 0 0.75rem 1.25rem;
		font-size: 0.9rem;
	}

	li {
		margin-bottom: 0.25rem;
	}

	address {
		font-style: normal;
		background: #261040;
		border: 1px solid #3d1a6e;
		border-radius: 0.6rem;
		padding: 0.85rem 1rem;
		font-size: 0.9rem;
		line-height: 1.8;
		margin-bottom: 0.75rem;
	}

	a {
		color: #a855f7;
		text-decoration: none;
	}
	a:hover {
		color: #c084fc;
		text-decoration: underline;
	}

	.footer-links {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		margin-top: 1rem;
		font-size: 0.85rem;
	}
</style>
