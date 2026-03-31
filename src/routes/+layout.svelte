<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import Navbar from '$lib/components/comps/Navbar.svelte';
	import { browser } from '$app/environment';
	import { savedGamesStore } from '$lib/stores/savedGames';
	import { setGameUser } from '$lib/stores/game';
	import { playClick } from '$lib/sounds';
	import { t, locale } from '$lib/i18n';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

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

{@render children()}

<footer class="legal-footer">
	<a href="/privacy">{$t.layout.privacy}</a>
	<span>·</span>
	<a href="/terms">{$t.layout.terms}</a>
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

	.legal-footer {
		position: fixed;
		bottom: 0.6rem;
		left: 0.85rem;
		z-index: 50;
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
