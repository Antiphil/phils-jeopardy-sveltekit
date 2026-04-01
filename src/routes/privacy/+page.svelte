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
	<title>Datenschutzerklärung – {WEBSITE_NAME}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="legal-page">
	<a href="/" class="back-link">← Zurück zur Startseite</a>

	<h1 class="page-title">Datenschutzerklärung</h1>
	<p class="last-updated">
		Stand: {new Date().toLocaleDateString('de-DE', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		})}
	</p>

	<section>
		<h2>1. Verantwortlicher</h2>
		<p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
		<address>
			{BETREIBER_NAME}<br />
			{BETREIBER_STRASSE}<br />
			{BETREIBER_PLZ_ORT}<br />
			E-Mail: <a href="mailto:{BETREIBER_EMAIL}">{BETREIBER_EMAIL}</a>
		</address>
	</section>

	<section>
		<h2>2. Erhebung und Verarbeitung personenbezogener Daten</h2>
		<p>
			Diese Website erhebt und verarbeitet personenbezogene Daten nur in dem Umfang, der für die
			Bereitstellung der Dienste erforderlich ist.
		</p>

		<h3>2.1 Beim Besuch der Website</h3>
		<p>Beim Aufrufen der Website werden automatisch folgende Daten in Server-Logs gespeichert:</p>
		<ul>
			<li>IP-Adresse des anfragenden Geräts</li>
			<li>Datum und Uhrzeit des Abrufs</li>
			<li>Name und URL der abgerufenen Datei</li>
			<li>Übertragene Datenmenge</li>
			<li>Browser und Betriebssystem</li>
		</ul>
		<p>
			Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren und
			stabilen Bereitstellung der Website). Die Daten werden nach 7 Tagen automatisch gelöscht.
		</p>

		<h3>2.2 Anmeldung via OAuth (Discord / Google)</h3>
		<p>Die Website bietet die Möglichkeit, sich über externe Anbieter anzumelden:</p>
		<ul>
			<li>
				<strong>Discord</strong> (Discord Inc., 444 De Haro Street, Suite 200, San Francisco, CA 94107,
				USA)
			</li>
			<li>
				<strong>Google</strong> (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland)
			</li>
		</ul>
		<p>Bei der OAuth-Anmeldung werden vom jeweiligen Anbieter folgende Daten übertragen:</p>
		<ul>
			<li>Name und E-Mail-Adresse</li>
			<li>Profilbild (sofern vorhanden)</li>
			<li>Eindeutige Nutzer-ID des Anbieters</li>
		</ul>
		<p>
			Diese Daten werden ausschließlich zur Authentifizierung verwendet. Rechtsgrundlage ist Art. 6
			Abs. 1 lit. b DSGVO (Vertragserfüllung). Die Datenschutzerklärungen der Anbieter findest du
			unter:
		</p>
		<ul>
			<li>
				<a href="https://discord.com/privacy" target="_blank" rel="noopener">discord.com/privacy</a>
			</li>
			<li>
				<a href="https://policies.google.com/privacy" target="_blank" rel="noopener"
					>policies.google.com/privacy</a
				>
			</li>
		</ul>

		<h3>2.3 Lokale Datenspeicherung (localStorage)</h3>
		<p>
			Die Website speichert Spielstände und Spielkonfigurationen ausschließlich lokal im Browser des
			Nutzers (<code>localStorage</code>). Diese Daten werden nicht an Server übertragen und
			verlassen das Gerät des Nutzers nicht. Es handelt sich nicht um Cookies im technischen Sinne;
			eine Einwilligung ist daher nicht erforderlich.
		</p>
	</section>

	<section>
		<h2>3. Datenweitergabe an Dritte</h2>
		<p>Eine Weitergabe personenbezogener Daten an Dritte erfolgt nicht, außer:</p>
		<ul>
			<li>
				wenn dies zur Vertragserfüllung erforderlich ist (z. B. OAuth-Anbieter bei der Anmeldung),
			</li>
			<li>wenn eine gesetzliche Verpflichtung besteht,</li>
			<li>oder wenn du ausdrücklich eingewilligt hast.</li>
		</ul>
	</section>

	<section>
		<h2>4. Datenübertragung in Drittländer</h2>
		<p>
			Bei Nutzung der OAuth-Anmeldung (Discord, Google) kann eine Datenübertragung in die USA
			stattfinden. Beide Anbieter sind nach dem EU-U.S. Data Privacy Framework zertifiziert, das ein
			angemessenes Datenschutzniveau gewährleistet (Art. 45 DSGVO).
		</p>
	</section>

	<section>
		<h2>5. Speicherdauer</h2>
		<p>
			Personenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck
			erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Anmeldedaten (Session-Token)
			werden nach dem Abmelden oder Ablauf der Sitzung gelöscht.
		</p>
	</section>

	<section>
		<h2>6. Deine Rechte</h2>
		<p>
			Du hast gegenüber dem Verantwortlichen folgende Rechte bezüglich deiner personenbezogenen
			Daten:
		</p>
		<ul>
			<li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO)</li>
			<li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>
			<li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO)</li>
			<li><strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
			<li><strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
			<li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>
		</ul>
		<p>
			Zur Ausübung deiner Rechte wende dich an: <a href="mailto:{BETREIBER_EMAIL}"
				>{BETREIBER_EMAIL}</a
			>
		</p>
		<p>
			Außerdem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Die
			zuständige Behörde richtet sich nach deinem Wohnort.
		</p>
	</section>

	<section>
		<h2>7. Sicherheit</h2>
		<p>
			Die Website verwendet eine TLS/SSL-Verschlüsselung für die Datenübertragung. Trotz technischer
			und organisatorischer Maßnahmen kann absolute Sicherheit nicht garantiert werden.
		</p>
	</section>

	<section>
		<h2>8. Änderungen dieser Datenschutzerklärung</h2>
		<p>
			Diese Datenschutzerklärung kann bei Bedarf aktualisiert werden, um rechtlichen Anforderungen
			oder Änderungen der Dienste zu entsprechen. Die jeweils aktuelle Version ist unter <a
				href="{WEBSITE_URL}/privacy">{WEBSITE_URL}/privacy</a
			> abrufbar.
		</p>
	</section>

	<div class="footer-links">
		<a href="/terms">Nutzungsbedingungen</a>
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
		margin-bottom: 2.25rem;
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

	h3 {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #c084fc;
		margin: 1.25rem 0 0.5rem;
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
	}

	a {
		color: #a855f7;
		text-decoration: none;
	}
	a:hover {
		color: #c084fc;
		text-decoration: underline;
	}

	code {
		background: #261040;
		border: 1px solid #3d1a6e;
		border-radius: 4px;
		padding: 0.1rem 0.4rem;
		font-size: 0.82rem;
		color: #fbbf24;
	}

	.footer-links {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		margin-top: 1rem;
		font-size: 0.85rem;
	}
</style>
