import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
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
	let body: { state: GameState };
	try {
		body = await event.request.json();
	} catch {
		throw error(400, 'Ungültige Anfrage');
	}
	try {
		await db
			.update(gameSessions)
			.set({
				state: body.state as unknown as typeof gameSessions.$inferInsert['state'],
				updatedAt: new Date(),
			})
			.where(and(eq(gameSessions.id, event.params.id), eq(gameSessions.userId, userId)));
		return new Response(null, { status: 204 });
	} catch {
		throw error(500, 'Spielstand konnte nicht gespeichert werden');
	}
};

export const DELETE: RequestHandler = async (event) => {
	const userId = await requireUserId(event);
	try {
		await db
			.delete(gameSessions)
			.where(and(eq(gameSessions.id, event.params.id), eq(gameSessions.userId, userId)));
		return new Response(null, { status: 204 });
	} catch {
		throw error(500, 'Session konnte nicht gelöscht werden');
	}
};
