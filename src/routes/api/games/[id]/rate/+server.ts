import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { savedGames, gameRatings } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { checkRateLimit } from '$lib/server/rateLimit';

const RATING_WINDOW_MS = 24 * 60 * 60 * 1000; // 1 Bewertung pro IP + Spiel pro Tag

export const POST: RequestHandler = async (event) => {
	let rating: number;
	try {
		({ rating } = await event.request.json());
	} catch {
		throw error(400, 'Ungültige Anfrage');
	}

	if (typeof rating !== 'number' || rating < 0 || rating > 5 || !Number.isInteger(rating)) {
		throw error(400, 'Ungültige Bewertung');
	}

	const ip = event.getClientAddress();
	const rateLimitKey = `rate:${ip}:${event.params.id}`;
	if (!checkRateLimit(rateLimitKey, RATING_WINDOW_MS)) {
		throw error(429, 'Du hast dieses Spiel heute bereits bewertet');
	}

	try {
		const [game] = await db
			.select({ isPublic: savedGames.isPublic })
			.from(savedGames)
			.where(eq(savedGames.id, event.params.id))
			.limit(1);

		if (!game?.isPublic) throw error(403, 'Spiel ist nicht öffentlich');

		await db.insert(gameRatings).values({
			id: crypto.randomUUID(),
			gameId: event.params.id,
			rating,
		});

		return json({ ok: true });
	} catch (e: unknown) {
		if (e && typeof e === 'object' && 'status' in e) throw e;
		throw error(500, 'Bewertung konnte nicht gespeichert werden');
	}
};
