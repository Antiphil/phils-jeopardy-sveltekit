<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<div class="signin-page">
	<div class="signin-card">
		<div class="card-header">
			<h1 class="card-title">Anmelden</h1>
			<p class="card-sub">Wähle einen Anbieter um fortzufahren</p>
		</div>

		<div class="providers">

			<!-- Discord -->
			<form method="POST" use:enhance>
				<input type="hidden" name="providerId" value="discord" />
				<button class="provider-btn discord-btn" type="submit">
					<svg class="provider-logo" viewBox="0 0 24 24" fill="currentColor">
						<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.056a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.026c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
					</svg>
					<span>Mit Discord anmelden</span>
				</button>
			</form>

			<!-- Google (coming soon) -->
			<div class="google-wrapper">
				<button class="provider-btn google-btn" type="button" disabled>
					<svg class="provider-logo" viewBox="0 0 24 24" fill="currentColor">
						<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
						<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
						<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
						<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
					</svg>
					<span>Mit Google anmelden</span>
				</button>
				<span class="coming-soon-badge">Demnächst</span>
			</div>

		</div>

		<p class="privacy-note">
			Mit der Anmeldung akzeptierst du unsere
			<a href="/terms">Nutzungsbedingungen</a>
			und
			<a href="/privacy">Datenschutzerklärung</a>.
		</p>
	</div>
</div>

<style>
	.signin-page {
		min-height: calc(100vh - 70px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		position: relative;
		z-index: 1;
	}

	.signin-card {
		background: #1e0d38;
		border: 2px solid #5b21b6;
		border-radius: 1.5rem;
		padding: 2rem 1.75rem;
		width: 100%;
		max-width: 380px;
		box-shadow: 0 8px 48px rgba(168, 85, 247, 0.3);
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		animation: pop-in 0.22s ease-out;
	}

	@keyframes pop-in {
		from { opacity: 0; transform: translateY(12px) scale(0.97); }
		to   { opacity: 1; transform: translateY(0) scale(1); }
	}

	.card-header {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		text-align: center;
	}

	.card-title {
		font-family: 'Fredoka One', cursive;
		font-size: 2rem;
		background: linear-gradient(90deg, #c084fc, #f0abfc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0;
	}

	.card-sub {
		font-size: 0.85rem;
		color: #7c5faa;
		font-weight: 600;
		margin: 0;
	}

	.providers {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.providers form { margin: 0; }

	.provider-btn {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.75rem 1.25rem;
		border-radius: 999px;
		border: 1.5px solid transparent;
		cursor: pointer;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
		font-size: 1rem;
		transition: transform 0.12s, box-shadow 0.12s, filter 0.12s;
	}

	.provider-btn:hover {
		transform: translateY(-2px);
		filter: brightness(1.1);
	}

	.provider-logo {
		width: 22px;
		height: 22px;
		flex-shrink: 0;
	}

	.discord-btn {
		background: #5865F2;
		color: white;
		box-shadow: 0 4px 16px rgba(88, 101, 242, 0.45);
	}

	.google-wrapper {
		position: relative;
	}

	.google-btn {
		background: #1a1025;
		color: #4a3d60;
		border-color: #2d1a4a;
		box-shadow: none;
		cursor: not-allowed;
		opacity: 0.55;
	}

	.google-btn:hover {
		transform: none;
		filter: none;
	}

	.coming-soon-badge {
		position: absolute;
		top: -7px;
		right: 12px;
		background: #3d1a6e;
		color: #a78bca;
		font-size: 0.62rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		pointer-events: none;
	}

	.privacy-note {
		font-size: 0.72rem;
		color: #4a2e7a;
		text-align: center;
		margin: 0;
		line-height: 1.5;
	}

	.privacy-note a {
		color: #6b3fa0;
		text-decoration: underline;
	}

	.privacy-note a:hover { color: #a855f7; }
</style>
