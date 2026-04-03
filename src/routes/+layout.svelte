<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import Navbar from '$lib/components/comps/Navbar.svelte';
	import Toaster from '$lib/components/comps/Toaster.svelte';
	import UsernameSetup from '$lib/components/comps/UsernameSetup.svelte';
	import GameLoadingTransition from '$lib/components/comps/GameLoadingTransition.svelte';
	import { gameTransition } from '$lib/stores/gameTransition';
	import { browser } from '$app/environment';
	import { savedGamesStore } from '$lib/stores/savedGames';
	import { setGameUser } from '$lib/stores/game';
	import { playClick } from '$lib/sounds';
	import { t, locale } from '$lib/i18n';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	const bgParticles = [
		{ emoji: '🎯', left: 4,  delay: 0,    dur: 9,  size: 1.4, opacity: 0.07 },
		{ emoji: '⭐', left: 11, delay: 2.1,  dur: 11, size: 1.1, opacity: 0.06 },
		{ emoji: '🏆', left: 19, delay: 0.7,  dur: 8,  size: 1.6, opacity: 0.08 },
		{ emoji: '🎲', left: 27, delay: 3.4,  dur: 10, size: 1.2, opacity: 0.07 },
		{ emoji: '💡', left: 35, delay: 1.2,  dur: 12, size: 1.0, opacity: 0.06 },
		{ emoji: '❓', left: 43, delay: 4.8,  dur: 9,  size: 1.5, opacity: 0.08 },
		{ emoji: '🎉', left: 51, delay: 0.4,  dur: 10, size: 1.1, opacity: 0.07 },
		{ emoji: '💎', left: 58, delay: 2.9,  dur: 8,  size: 1.3, opacity: 0.06 },
		{ emoji: '🎮', left: 66, delay: 1.7,  dur: 11, size: 1.2, opacity: 0.08 },
		{ emoji: '🔥', left: 74, delay: 5.2,  dur: 9,  size: 1.0, opacity: 0.07 },
		{ emoji: '✨', left: 82, delay: 3.0,  dur: 12, size: 1.4, opacity: 0.06 },
		{ emoji: '🎊', left: 90, delay: 1.5,  dur: 10, size: 1.1, opacity: 0.07 },
		{ emoji: '🃏', left: 8,  delay: 6.1,  dur: 11, size: 1.3, opacity: 0.06 },
		{ emoji: '🪄', left: 23, delay: 4.0,  dur: 9,  size: 1.0, opacity: 0.07 },
		{ emoji: '🎭', left: 47, delay: 7.3,  dur: 10, size: 1.2, opacity: 0.06 },
		{ emoji: '🎪', left: 70, delay: 2.5,  dur: 8,  size: 1.5, opacity: 0.07 },
		{ emoji: '📺', left: 87, delay: 5.8,  dur: 12, size: 1.1, opacity: 0.06 },
	];

	let hasUsername = $state(data.hasUsername);
	$effect(() => { hasUsername = data.hasUsername; });

	const showUsernameModal = $derived(!!data.session?.user && !hasUsername);

	// Initialize synchronously so child components (e.g. home page) already see
	// the correct user-scoped data when they first mount.
	if (browser) {
		const uid = data.session?.user?.id ?? null;
		savedGamesStore._setUser(uid);
		setGameUser(uid);
		locale.init();
	}

	// Also react to login / logout without a full page reload.
	$effect(() => {
		const uid = data.session?.user?.id ?? null;
		savedGamesStore._setUser(uid);
		setGameUser(uid);
	});

	$effect(() => {
		if (!browser) return;
		function handleClick(e: MouseEvent) {
			const target = e.target as Element | null;
			if (target?.closest('button, a[href]')) playClick();
		}
		document.addEventListener('click', handleClick);
		return () => document.removeEventListener('click', handleClick);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Navbar />

<div class="bg-blobs" aria-hidden="true">
	<div class="blob blob-1"></div>
	<div class="blob blob-2"></div>
	<div class="blob blob-3"></div>
	<div class="blob blob-4"></div>
	<div class="blob blob-5"></div>
</div>

<div class="bg-particles" aria-hidden="true">
	{#each bgParticles as p}
		<span
			class="bg-particle"
			style="left:{p.left}%; animation-delay:{p.delay}s; animation-duration:{p.dur}s; font-size:{p.size}rem; opacity:{p.opacity};"
		>{p.emoji}</span>
	{/each}
</div>

{@render children()}
<Toaster />

{#if $gameTransition}
	<GameLoadingTransition ondone={() => gameTransition.set(false)} />
{/if}

{#if showUsernameModal}
	<UsernameSetup ondone={() => { hasUsername = true; }} />
{/if}

<footer class="legal-footer">
	<a href="/privacy">{$t.layout.privacy}</a>
	<span>·</span>
	<a href="/terms">{$t.layout.terms}</a>
	<span>·</span>
	<a href="https://github.com/AntiPhil/phils-jeopardy-sveltekit" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
		<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
		</svg>
	</a>
</footer>

<style>
	.bg-blobs {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
	}

	.blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(60px);
	}

	/* Top-left — kräftiges Lila, große Bewegung */
	.blob-1 {
		width: 650px;
		height: 650px;
		top: -180px;
		left: -150px;
		background: radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(139, 40, 230, 0.2) 50%, transparent 70%);
		animation: drift-1 14s ease-in-out infinite;
	}

	/* Bottom-right — leuchtendes Pink/Magenta */
	.blob-2 {
		width: 550px;
		height: 550px;
		bottom: -120px;
		right: -120px;
		background: radial-gradient(circle, rgba(217, 70, 239, 0.42) 0%, rgba(192, 38, 211, 0.18) 50%, transparent 70%);
		animation: drift-2 17s ease-in-out infinite;
	}

	/* Center-right — mittleres Violett */
	.blob-3 {
		width: 400px;
		height: 400px;
		top: 35%;
		left: 58%;
		background: radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, rgba(109, 40, 217, 0.15) 50%, transparent 70%);
		animation: drift-3 20s ease-in-out infinite;
	}

	/* Center-left — warmes Gold/Amber als Akzent */
	.blob-4 {
		width: 320px;
		height: 320px;
		top: 28%;
		left: 8%;
		background: radial-gradient(circle, rgba(251, 191, 36, 0.22) 0%, rgba(245, 158, 11, 0.08) 50%, transparent 70%);
		animation: drift-4 16s ease-in-out infinite;
	}

	/* Extra: kleiner intensiver Fleck oben rechts */
	.blob-5 {
		width: 280px;
		height: 280px;
		top: -60px;
		right: 15%;
		background: radial-gradient(circle, rgba(236, 72, 153, 0.28) 0%, transparent 65%);
		animation: drift-5 12s ease-in-out infinite;
	}

	@keyframes drift-1 {
		0%   { transform: translate(0, 0) scale(1); }
		25%  { transform: translate(80px, 100px) scale(1.15); }
		50%  { transform: translate(140px, 40px) scale(0.9); }
		75%  { transform: translate(40px, 130px) scale(1.1); }
		100% { transform: translate(0, 0) scale(1); }
	}

	@keyframes drift-2 {
		0%   { transform: translate(0, 0) scale(1); }
		30%  { transform: translate(-100px, -80px) scale(1.12); }
		60%  { transform: translate(-60px, -140px) scale(0.92); }
		80%  { transform: translate(-120px, -60px) scale(1.05); }
		100% { transform: translate(0, 0) scale(1); }
	}

	@keyframes drift-3 {
		0%   { transform: translate(0, 0) scale(1); }
		40%  { transform: translate(-120px, 80px) scale(1.2); }
		70%  { transform: translate(60px, 100px) scale(0.85); }
		100% { transform: translate(0, 0) scale(1); }
	}

	@keyframes drift-4 {
		0%   { transform: translate(0, 0) scale(1); }
		35%  { transform: translate(70px, -90px) scale(1.25); }
		65%  { transform: translate(-50px, -60px) scale(0.8); }
		100% { transform: translate(0, 0) scale(1); }
	}

	@keyframes drift-5 {
		0%   { transform: translate(0, 0) scale(1); opacity: 0.8; }
		50%  { transform: translate(-90px, 70px) scale(1.3); opacity: 1; }
		100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
	}

	.bg-particles {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
	}

	.bg-particle {
		position: absolute;
		bottom: -2rem;
		user-select: none;
		animation: bg-float linear infinite;
	}

	@keyframes bg-float {
		0%   { transform: translateY(0) rotate(0deg);   }
		100% { transform: translateY(-110vh) rotate(180deg); }
	}

	.legal-footer {
		position: fixed;
		bottom: 0.6rem;
		left: 0.85rem;
		z-index: 500;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.65rem;
		color: #3d1a6e;
		pointer-events: none;
	}

	.legal-footer a {
		color: #3d1a6e;
		text-decoration: none;
		pointer-events: all;
		transition: color 0.15s;
	}

	.legal-footer a:hover { color: #7c3aed; }
</style>
