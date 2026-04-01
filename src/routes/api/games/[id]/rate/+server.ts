import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { savedGames, gameRatings } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
	const { rating } = await event.request.json();
	if (typeof rating !== 'number' || rating < 0 || rating > 5 || !Number.isInteger(rating)) {
		throw error(400, 'Invalid rating');
	}

	const [game] = await db
		.select({ isPublic: savedGames.isPublic })
		.from(savedGames)
		.where(eq(savedGames.id, event.params.id))
		.limit(1);

	if (!game?.isPublic) throw error(403, 'Game is not public');

	await db.insert(gameRatings).values({
		id: crypto.randomUUID(),
		gameId: event.params.id,
		rating,
	});

	return json({ ok: true });
};
