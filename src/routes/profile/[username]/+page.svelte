<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { user, stats, isOwnProfile } = data;

	function memberSince(date: Date | string): string {
		return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
	}

	function renderStars(avg: number | null): string {
		if (avg === null) return '—';
		const full  = Math.floor(avg);
		const half  = avg - full >= 0.5 ? 1 : 0;
		const empty = 5 - full - half;
		return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
	}
</script>

<svelte:head>
	<title>@{user?.username ?? user?.name} – Phil's Jeopardy</title>
	{#if !isOwnProfile}
		<meta name="description" content="Profil von @{user?.username} auf Phil's Jeopardy" />
	{:else}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<div class="profile-page">

	<!-- Hero card -->
	<div class="hero-card">
		<div class="avatar-wrap">
			{#if user?.image}
				<img class="avatar" src={user.image} alt={user?.name ?? 'Avatar'} />
			{:else}
				<div class="avatar-fallback">{(user?.name ?? '?')[0].toUpperCase()}</div>
			{/if}
			{#if user?.isAdmin}
				<span class="admin-badge">Admin</span>
			{/if}
		</div>

		<div class="hero-info">
			<h1 class="username">@{user?.username ?? user?.name ?? 'Unbekannt'}</h1>
			{#if user?.username && user?.name && user.username !== user.name}
				<div class="real-name">{user.name}</div>
			{/if}
			<div class="meta-row">
				<span class="meta-chip">📅 Dabei seit {user?.createdAt ? memberSince(user.createdAt) : '—'}</span>
			</div>
		</div>
	</div>

	<!-- Stats grid -->
	<div class="section-title">Spielstatistiken</div>
	<div class="stats-grid">

		<div class="stat-card accent-purple">
			<div class="stat-icon">🎮</div>
			<div class="stat-value">{stats.gamesTotal}</div>
			<div class="stat-label">Spiele erstellt</div>
		</div>

		<div class="stat-card accent-green">
			<div class="stat-icon">🌐</div>
			<div class="stat-value">{stats.gamesPublic}</div>
			<div class="stat-label">Öffentlich</div>
		</div>

		<div class="stat-card accent-yellow">
			<div class="stat-icon">⭐</div>
			<div class="stat-value">{stats.avgRating !== null ? stats.avgRating : '—'}</div>
			<div class="stat-label">Ø Bewertung</div>
			{#if stats.avgRating !== null}
				<div class="stat-stars">{renderStars(stats.avgRating)}</div>
			{/if}
		</div>

		<div class="stat-card accent-pink">
			<div class="stat-icon">📊</div>
			<div class="stat-value">{stats.totalRatings}</div>
			<div class="stat-label">Bewertungen erhalten</div>
		</div>

		<div class="stat-card accent-blue">
			<div class="stat-icon">🎯</div>
			<div class="stat-value">{stats.sessionsTotal}</div>
			<div class="stat-label">Spiele gespielt</div>
		</div>

		<div class="stat-card accent-orange">
			<div class="stat-icon">🎲</div>
			<div class="stat-value">{stats.gamesChaos}</div>
			<div class="stat-label">mit Chaos Category</div>
		</div>

	</div>

	<!-- Rounds breakdown -->
	{#if stats.gamesTotal > 0}
		<div class="section-title">Rundenverteilung</div>
		<div class="breakdown-card">
			{#each [
				{ label: '1 Runde', count: stats.gamesRound1, color: '#a855f7' },
				{ label: '2 Runden', count: stats.gamesRound2, color: '#d946ef' },
				{ label: '3 Runden', count: stats.gamesRound3, color: '#ec4899' },
			] as row}
				<div class="breakdown-row">
					<span class="breakdown-label">{row.label}</span>
					<div class="breakdown-bar-wrap">
						<div
							class="breakdown-bar"
							style="width: {stats.gamesTotal > 0 ? (row.count / stats.gamesTotal) * 100 : 0}%; background: {row.color};"
						></div>
					</div>
					<span class="breakdown-count">{row.count}</span>
				</div>
			{/each}
		</div>
	{/if}

	<div class="back-row">
		<a class="btn-back" href="/">← Zurück</a>
	</div>

</div>

<style>
	.profile-page {
		max-width: 680px;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	/* ── Hero card ──────────────────────────────────────── */
	.hero-card {
		background: #1e0d38;
		border: 2px solid #5b21b6;
		border-radius: 1.5rem;
		padding: 1.75rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
		box-shadow: 0 4px 32px rgba(168, 85, 247, 0.2);
	}

	.avatar-wrap { position: relative; flex-shrink: 0; }

	.avatar, .avatar-fallback {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		border: 3px solid #a855f7;
		object-fit: cover;
	}

	.avatar-fallback {
		background: linear-gradient(135deg, #a855f7, #d946ef);
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 1.8rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.admin-badge {
		position: absolute;
		bottom: -4px;
		left: 50%;
		transform: translateX(-50%);
		background: linear-gradient(135deg, #fbbf24, #f59e0b);
		color: #1a0d2e;
		font-family: 'Fredoka One', cursive;
		font-size: 0.6rem;
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		white-space: nowrap;
	}

	.hero-info {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 0;
	}

	.username {
		font-family: 'Fredoka One', cursive;
		font-size: 1.7rem;
		background: linear-gradient(90deg, #c084fc, #f0abfc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0;
		line-height: 1.1;
	}

	.real-name {
		font-size: 0.85rem;
		color: #7c5faa;
		font-weight: 600;
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.15rem;
	}

	.meta-chip {
		font-size: 0.72rem;
		color: #a78bca;
		background: #261040;
		border: 1px solid #3d1a6e;
		border-radius: 999px;
		padding: 0.2rem 0.65rem;
	}

	/* ── Section title ──────────────────────────────────── */
	.section-title {
		font-family: 'Fredoka One', cursive;
		font-size: 0.85rem;
		color: #7c5faa;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		padding-left: 0.25rem;
	}

	/* ── Stats grid ─────────────────────────────────────── */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	@media (max-width: 480px) {
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
	}

	.stat-card {
		background: #1e0d38;
		border: 1.5px solid #3d1a6e;
		border-radius: 1.1rem;
		padding: 1.1rem 0.75rem 0.9rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		text-align: center;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.stat-card:hover { border-color: #5b21b6; box-shadow: 0 0 16px rgba(168,85,247,0.15); }

	.stat-icon { font-size: 1.4rem; line-height: 1; }

	.stat-value {
		font-family: 'Fredoka One', cursive;
		font-size: 1.9rem;
		line-height: 1.1;
	}

	.stat-label {
		font-size: 0.68rem;
		font-weight: 700;
		color: #7c5faa;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-stars {
		font-size: 0.8rem;
		color: #fbbf24;
		margin-top: 0.1rem;
	}

	.accent-purple .stat-value { color: #c084fc; }
	.accent-green  .stat-value { color: #4ade80; }
	.accent-yellow .stat-value { color: #fbbf24; }
	.accent-pink   .stat-value { color: #f472b6; }
	.accent-blue   .stat-value { color: #60a5fa; }
	.accent-orange .stat-value { color: #fb923c; }

	/* ── Breakdown card ─────────────────────────────────── */
	.breakdown-card {
		background: #1e0d38;
		border: 1.5px solid #3d1a6e;
		border-radius: 1.1rem;
		padding: 1.1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.breakdown-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.breakdown-label {
		font-size: 0.78rem;
		font-weight: 700;
		color: #a78bca;
		width: 72px;
		flex-shrink: 0;
	}

	.breakdown-bar-wrap {
		flex: 1;
		height: 8px;
		background: #261040;
		border-radius: 999px;
		overflow: hidden;
	}

	.breakdown-bar {
		height: 100%;
		border-radius: 999px;
		transition: width 0.4s ease;
		min-width: 2px;
	}

	.breakdown-count {
		font-family: 'Fredoka One', cursive;
		font-size: 0.9rem;
		color: #c084fc;
		width: 20px;
		text-align: right;
		flex-shrink: 0;
	}

	/* ── Back ───────────────────────────────────────────── */
	.back-row { display: flex; justify-content: center; }

	.btn-back {
		background: transparent;
		border: 1.5px solid #3d1a6e;
		color: #7c5faa;
		font-family: 'Fredoka One', cursive;
		font-size: 0.95rem;
		padding: 0.5rem 1.5rem;
		border-radius: 999px;
		text-decoration: none;
		transition: border-color 0.15s, color 0.15s;
	}

	.btn-back:hover { border-color: #a855f7; color: #c084fc; }
</style>
