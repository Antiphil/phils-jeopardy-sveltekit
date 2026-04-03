<script lang="ts">
	import { page } from '$app/stores';
	import AuthPopup from './AuthPopup.svelte';
	import minilogo from "$lib/assets/logo_long.png"
	import { locale, t } from '$lib/i18n';
	import type { Locale } from '$lib/i18n';

	let showAuth = $state(false);
	let showLang = $state(false);

	let user = $derived($page.data.session?.user ?? null);

	const LOCALES: { value: Locale; label: string; flag: string }[] = [
		{ value: 'de', label: 'DE', flag: '🇩🇪' },
		{ value: 'en', label: 'EN', flag: '🇬🇧' },
	];

	let currentLocale = $derived(LOCALES.find(l => l.value === $locale)!);

	function selectLocale(value: Locale) {
		locale.set(value);
		showLang = false;
	}

	$effect(() => {
		if (!showLang) return;
		function onOutside(e: MouseEvent) {
			if (!(e.target as Element).closest('.lang-switcher')) showLang = false;
		}
		document.addEventListener('mousedown', onOutside);
		return () => document.removeEventListener('mousedown', onOutside);
	});

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
		<!-- Language switcher -->
		<div class="lang-switcher">
			<button
				class="lang-trigger"
				onclick={() => showLang = !showLang}
				aria-label="Language"
				aria-expanded={showLang}
			>
				<span>{currentLocale.flag}</span>
				<span class="lang-label">{currentLocale.label}</span>
				<svg class="lang-chevron" class:open={showLang} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="6 9 12 15 18 9"/>
				</svg>
			</button>

			{#if showLang}
				<div class="lang-dropdown" role="menu">
					{#each LOCALES as l}
						<button
							class="lang-option"
							class:active={$locale === l.value}
							role="menuitem"
							onclick={() => selectLocale(l.value)}
						>
							<span>{l.flag}</span>
							<span>{l.label}</span>
							{#if $locale === l.value}
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="20 6 9 17 4 12"/>
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>


		<!-- User button: zeigt Avatar wenn eingeloggt, sonst Icon -->
		<button
			class="nav-btn user-btn"
			class:logged-in={!!user}
			aria-label={$t.nav.userProfile}
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
		position: fixed;
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

	

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.lang-switcher {
		position: relative;
		display: flex;
		align-items: center;
	}

	.lang-trigger {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		background: #32155a;
		border: 1.5px solid #5b21b6;
		border-radius: 999px;
		color: #c084fc;
		font-family: 'Nunito', sans-serif;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.25rem 0.65rem;
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
		height: 34px;
	}

	.lang-trigger:hover {
		border-color: #a855f7;
		background: #3d1a6e;
		box-shadow: 0 0 8px rgba(168, 85, 247, 0.3);
	}

	.lang-label {
		letter-spacing: 0.5px;
	}

	.lang-chevron {
		color: #7c5faa;
		transition: transform 0.2s;
		flex-shrink: 0;
	}

	.lang-chevron.open {
		transform: rotate(180deg);
	}

	.lang-dropdown {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: #1e0d38;
		border: 1.5px solid #5b21b6;
		border-radius: 0.85rem;
		padding: 0.3rem;
		min-width: 100px;
		box-shadow: 0 8px 32px rgba(91, 33, 182, 0.45);
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		z-index: 400;
		animation: drop-in 0.15s ease-out;
	}

	@keyframes drop-in {
		from { opacity: 0; transform: translateY(-6px) scale(0.97); }
		to   { opacity: 1; transform: translateY(0) scale(1); }
	}

	.lang-option {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		background: transparent;
		border: none;
		border-radius: 0.55rem;
		color: #a78bca;
		font-family: 'Nunito', sans-serif;
		font-size: 0.8rem;
		font-weight: 700;
		padding: 0.4rem 0.65rem;
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition: background 0.12s, color 0.12s;
	}

	.lang-option:hover {
		background: #2d1260;
		color: #e2d0ff;
	}

	.lang-option.active {
		color: #c084fc;
	}

	.lang-option svg {
		margin-left: auto;
		color: #a855f7;
		flex-shrink: 0;
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
