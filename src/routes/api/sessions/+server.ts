import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { gameSessions } from '$lib/server/schema';
import { eq, count, desc } from 'drizzle-orm';
import type { GameState } from '$lib/stores/game';

const MAX_SESSIONS = 2;

async function requireUserId(event: Parameters<RequestHandler>[0]): Promise<string> {
	const session = await event.locals.auth();
	if (!session?.user?.id) throw error(401, 'Nicht angemeldet');
	return session.user.id;
}

export const GET: RequestHandler = async (event) => {
	const userId = await requireUserId(event);
	const rows = await db
		.select()
		.from(gameSessions)
		.where(eq(gameSessions.userId, userId))
		.orderBy(desc(gameSessions.updatedAt));
	return json(
		rows.map((r) => ({
			id: r.id,
			state: r.state as GameState,
			updatedAt: r.updatedAt.toISOString(),
		}))
	);
};

export const POST: RequestHandler = async (event) => {
	const userId = await requireUserId(event);

	// Enforce max sessions
	const [{ value: sessionCount }] = await db
		.select({ value: count() })
		.from(gameSessions)
		.where(eq(gameSessions.userId, userId));
	if (sessionCount >= MAX_SESSIONS) {
		throw error(409, 'Maximale Anzahl an Sessions erreicht');
	}

	const body: { state: GameState; savedGameId: string | null } = await event.request.json();
	const id = crypto.randomUUID();
	await db.insert(gameSessions).values({
		id,
		userId,
		savedGameId: body.savedGameId ?? null,
		state: body.state as unknown as typeof gameSessions.$inferInsert['state'],
	});
	return json({ id }, { status: 201 });
};
