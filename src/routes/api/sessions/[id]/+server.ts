import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { gameSessions } from '$lib/server/schema';
import { and, eq } from 'drizzle-orm';
import type { GameState } from '$lib/stores/game';

async function requireUserId(event: Parameters<RequestHandler>[0]): Promise<string> {
	const session = await event.locals.auth();
	if (!session?.user?.id) throw error(401, 'Nicht angemeldet');
	return session.user.id;
}

export const PUT: RequestHandler = async (event) => {
	const userId = await requireUserId(event);
	const body: { state: GameState } = await event.request.json();
	await db
		.update(gameSessions)
		.set({
			state: body.state as unknown as typeof gameSessions.$inferInsert['state'],
			updatedAt: new Date(),
		})
		.where(and(eq(gameSessions.id, event.params.id), eq(gameSessions.userId, userId)));
	return new Response(null, { status: 204 });
};

export const DELETE: RequestHandler = async (event) => {
	const userId = await requireUserId(event);
	await db
		.delete(gameSessions)
		.where(and(eq(gameSessions.id, event.params.id), eq(gameSessions.userId, userId)));
	return new Response(null, { status: 204 });
};
