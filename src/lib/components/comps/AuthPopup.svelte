<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n';
	import { toast } from '$lib/stores/toast';

	let { onclose }: { onclose: () => void } = $props();

	let session  = $derived($page.data.session);
	let user     = $derived(session?.user ?? null);
	let username = $derived(($page.data as { username?: string }).username ?? null);

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}
</script>

<!-- Backdrop -->
<div
	class="backdrop"
	role="button"
	tabindex="-1"
	onmousedown={handleBackdrop}
	onkeydown={() => {}}
>
	<div class="popup" role="dialog" aria-modal="true">

		{#if user}
			<!-- ── Eingeloggt ───────────────────────────────── -->
			<div class="user-section">
				{#if user.image}
					<img class="user-avatar" src={user.image} alt={user.name ?? 'Avatar'} />
				{:else}
					<div class="user-avatar-fallback">{(user.name ?? '?')[0].toUpperCase()}</div>
				{/if}
				<div class="user-info">
					<div class="user-name">{user.name ?? 'Unbekannt'}</div>
				</div>
			</div>

			<div class="divider"></div>

			<nav class="user-nav">
				<a class="nav-link" href="/" onclick={onclose}>
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
					</svg>
					{$t.auth.home}
				</a>
				{#if username}
					<a class="nav-link" href="/profile/{username}" onclick={onclose}>
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
						</svg>
						Mein Profil
					</a>
				{/if}
				<a class="nav-link" href="/game-config" onclick={onclose}>
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
					</svg>
					{$t.auth.home === 'Home' ? 'Game Konfiguration' : 'Game Settings'}
				</a>
				<a class="nav-link" href="/how-to-play" onclick={onclose}>
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
					</svg>
					Spielanleitung
				</a>
			</nav>

			<div class="divider"></div>

			<form method="POST" action="/signout" use:enhance={() => { onclose(); return async ({ update }) => { toast.info('Abgemeldet.'); update(); }; }}>
				<button class="btn-signout" type="submit">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
					</svg>
					{$t.auth.signOut}
				</button>
			</form>

		{:else}
			<!-- ── Nicht eingeloggt ─────────────────────────── -->
			<div class="popup-header">
				<div class="popup-title">{$t.auth.signIn}</div>
				<div class="popup-sub">{$t.auth.chooseProvider}</div>
			</div>

			<div class="providers">

				<!-- Discord -->
				<form method="POST" action="/signin" use:enhance>
					<input type="hidden" name="providerId" value="discord" />
					<button class="provider-btn discord-btn" type="submit">
						<svg class="provider-logo" viewBox="0 0 24 24" fill="currentColor">
							<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.056a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.026c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
						</svg>
						<span>{$t.auth.signInWithDiscord}</span>
					</button>
				</form>

				<!-- Google -->
				<form method="POST" action="/signin" use:enhance>
					<input type="hidden" name="providerId" value="google" />
					<button class="provider-btn google-btn" type="submit">
						<svg class="provider-logo" viewBox="0 0 24 24" fill="currentColor">
							<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
							<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
							<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
							<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
						</svg>
						<span>{$t.auth.signInWithGoogle}</span>
					</button>
				</form>

			</div>

			<p class="privacy-note">
				{$t.auth.privacyNotePre}
				<a href="/terms" onclick={onclose}>{$t.auth.terms}</a>
				{$t.auth.privacyNoteAnd}
				<a href="/privacy" onclick={onclose}>{$t.auth.privacy}</a>.
			</p>
		{/if}

	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 300;
		background: transparent;
	}

	.popup {
		position: fixed;
		top: 78px;
		right: 1.25rem;
		background: #1e0d38;
		border: 1.5px solid #5b21b6;
		border-radius: 1.25rem;
		padding: 1.25rem;
		width: 280px;
		box-shadow: 0 8px 40px rgba(91, 33, 182, 0.45);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		animation: pop-in 0.18s ease-out;
		z-index: 301;
	}

	@keyframes pop-in {
		from { opacity: 0; transform: translateY(-8px) scale(0.97); }
		to   { opacity: 1; transform: translateY(0)   scale(1); }
	}

	/* ── Header ─────────────────────────────────────────── */
	.popup-header { display: flex; flex-direction: column; gap: 0.15rem; }

	.popup-title {
		font-family: 'Fredoka One', cursive;
		font-size: 1.1rem;
		color: #e2d0ff;
	}

	.popup-sub {
		font-size: 0.75rem;
		color: #7c5faa;
		font-weight: 600;
	}

	/* ── Providers ──────────────────────────────────────── */
	.providers {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.providers form { margin: 0; }

	.provider-btn {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.65rem 1rem;
		border-radius: 999px;
		border: 1.5px solid transparent;
		cursor: pointer;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
		font-size: 0.9rem;
		transition: transform 0.12s, box-shadow 0.12s, filter 0.12s;
	}

	.provider-btn:hover {
		transform: translateY(-2px);
		filter: brightness(1.1);
	}

	.provider-logo {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	.discord-btn {
		background: #5865F2;
		color: white;
		box-shadow: 0 3px 14px rgba(88, 101, 242, 0.45);
	}

	.google-btn {
		background: white;
		color: #3c3c3c;
		border-color: #e0e0e0;
		box-shadow: 0 2px 8px rgba(0,0,0,0.15);
	}

	/* ── User nav ───────────────────────────────────────── */
	.user-nav {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem 0.65rem;
		border-radius: 0.65rem;
		color: #a78bca;
		text-decoration: none;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
		font-size: 0.88rem;
		transition: background 0.12s, color 0.12s;
	}

	.nav-link:hover {
		background: #2d1260;
		color: #e2d0ff;
	}

	/* ── Logged in ───────────────────────────────────────── */
	.user-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.user-avatar {
		width: 46px;
		height: 46px;
		border-radius: 50%;
		border: 2px solid #a855f7;
		object-fit: cover;
	}

	.user-avatar-fallback {
		width: 46px;
		height: 46px;
		border-radius: 50%;
		border: 2px solid #a855f7;
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 1.3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}

	.user-name {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #e2d0ff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.divider {
		height: 1px;
		background: #3d1a6e;
	}

	.btn-signout {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 1rem;
		border-radius: 999px;
		border: 1.5px solid #3d1a6e;
		background: transparent;
		color: #a78bca;
		font-family: 'Nunito', sans-serif;
		font-weight: 700;
		font-size: 0.85rem;
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s, background 0.15s;
	}

	.btn-signout:hover {
		border-color: #f87171;
		color: #f87171;
		background: rgba(248,113,113,0.06);
	}

	/* ── Privacy note ───────────────────────────────────── */
	.privacy-note {
		font-size: 0.7rem;
		color: #4a2e7a;
		text-align: center;
		margin: 0;
		line-height: 1.4;
	}

	.privacy-note a {
		color: #6b3fa0;
		text-decoration: underline;
	}

	.privacy-note a:hover { color: #a855f7; }
</style>
