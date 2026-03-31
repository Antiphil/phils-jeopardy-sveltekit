<script lang="ts">
	import { page } from '$app/stores';
	import AuthPopup from './AuthPopup.svelte';
	import minilogo from "$lib/assets/logo_long.png"

	let showAuth = $state(false);

	let user = $derived($page.data.session?.user ?? null);
</script>

<nav class="navbar">
	<!-- Logo -->
	<a href="/" class="nav-logo">
		<div class="nav-logo-icon">
			<img src={minilogo} alt="Phils Jeopardy Logo" />
		</div>
	</a>

	<!-- Right-side buttons -->
	<div class="nav-actions">
		{#if user}
		<a href="/game-config" class="nav-btn" aria-label="Game Settings">
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="3" />
				<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
			</svg>
		</a>
		{/if}

		<!-- User button: zeigt Avatar wenn eingeloggt, sonst Icon -->
		<button
			class="nav-btn user-btn"
			class:logged-in={!!user}
			aria-label="User-Profil"
			onclick={() => showAuth = !showAuth}
		>
			{#if user?.image}
				<img class="user-nav-avatar" src={user.image} alt={user.name ?? 'Avatar'} />
			{:else if user?.name}
				<span class="user-nav-initial">{user.name[0].toUpperCase()}</span>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
					<circle cx="12" cy="7" r="4" />
				</svg>
			{/if}
		</button>
	</div>
</nav>

{#if showAuth}
	<AuthPopup onclose={() => showAuth = false} />
{/if}

<style>
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1.5rem;
		width: 100%;
		height: 70px;
		background: linear-gradient(90deg, #1a0d2e 0%, #261040 100%);
		border-bottom: 2px solid #5b21b6;
		box-shadow: 0 2px 20px rgba(168, 85, 247, 0.25);
		position: relative;
		z-index: 200;
	}

	.nav-logo {
		display: flex;
		align-items: center;
		text-decoration: none;
		transition: transform 0.2s ease;
		flex-shrink: 0;
		position: relative;
	}



	.nav-logo:hover {
		transform: scale(1.05);
	}

	.nav-logo-icon {
		display: flex;
		align-items: center;
		height: 38px;
		max-width: clamp(100px, 25vw, 220px);
		animation: logoPulse 2.8s ease-in-out infinite;
		transform-origin: center left;
	}

	.nav-logo-icon img {
		height: 100%;
		width: auto;
		max-width: 100%;
		object-fit: contain;
		display: block;
	}

	@keyframes logoPulse {
		0%, 100% { transform: scale(1); }
		50%       { transform: scale(1.04); }
	}

	

	.nav-logo-text {
		font-family: 'Fredoka One', cursive;
		font-size: 1.5rem;
		background: linear-gradient(90deg, #c084fc, #f0abfc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: 0.5px;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 1.5px solid #5b21b6;
		background: #32155a;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #c084fc;
		text-decoration: none;
		transition: background 0.15s, box-shadow 0.15s;
		padding: 0;
		overflow: hidden;
	}

	.nav-btn:hover {
		background: #5b21b6;
		box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
	}

	.user-btn.logged-in {
		border-color: #a855f7;
		box-shadow: 0 0 10px rgba(168, 85, 247, 0.35);
	}

	.user-nav-avatar {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}

	.user-nav-initial {
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		color: #e2d0ff;
	}
</style>
