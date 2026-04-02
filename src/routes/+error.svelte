<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const STATUS_MESSAGES: Record<number, { heading: string; sub: string }> = {
		404: { heading: 'Seite nicht gefunden', sub: 'Diese Seite existiert nicht (mehr).' },
		401: { heading: 'Nicht angemeldet', sub: 'Meld dich an, um auf diese Seite zuzugreifen.' },
		403: { heading: 'Kein Zugriff', sub: 'Du hast keine Berechtigung für diese Seite.' },
		500: { heading: 'Serverfehler', sub: 'Auf dem Server ist etwas schiefgelaufen.' },
	};

	const status = $derived($page.status);
	const info = $derived(STATUS_MESSAGES[status] ?? { heading: 'Unbekannter Fehler', sub: $page.error?.message ?? '' });
</script>

<svelte:head>
	<title>Fehler {status} – Phil's Jeopardy</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="error-page">
	<div class="card">
		<div class="status-badge">{status}</div>
		<h1 class="heading">{info.heading}</h1>
		<p class="sub">{info.sub}</p>
		<button class="btn-home" onclick={() => goto('/')}>
			← Zurück zur Startseite
		</button>
	</div>
</div>

<style>
	.error-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.card {
		background: #1e0d38;
		border: 2px solid #5b21b6;
		border-radius: 1.5rem;
		padding: 3rem 2.5rem;
		max-width: 420px;
		width: 100%;
		text-align: center;
		box-shadow: 0 8px 48px rgba(168, 85, 247, 0.25);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.status-badge {
		font-family: 'Fredoka One', cursive;
		font-size: 4rem;
		line-height: 1;
		background: linear-gradient(135deg, #a855f7, #d946ef);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.heading {
		font-family: 'Fredoka One', cursive;
		font-size: 1.6rem;
		color: #f3e8ff;
		margin: 0;
	}

	.sub {
		font-size: 0.95rem;
		color: #a78bca;
		margin: 0;
		line-height: 1.5;
	}

	.btn-home {
		margin-top: 0.5rem;
		background: linear-gradient(135deg, #a855f7, #d946ef);
		border: none;
		color: white;
		font-family: 'Fredoka One', cursive;
		font-size: 1rem;
		padding: 0.65rem 1.75rem;
		border-radius: 999px;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
		transition: transform 0.15s, box-shadow 0.15s;
	}

	.btn-home:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(217, 70, 239, 0.5);
	}
</style>
