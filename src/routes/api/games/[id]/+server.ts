import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { savedGames } from '$lib/server/schema';
import { and, eq } from 'drizzle-orm';
import type { CategoryConfig, SavedGame } from '$lib/stores/savedGames';

async function requireUserId(event: Parameters<RequestHandler>[0]): Promise<string> {
	const session = await event.locals.auth();
	if (!session?.user?.id) throw error(401, 'Nicht angemeldet');
	return session.user.id;
}

function toSavedGame(row: typeof savedGames.$inferSelect): SavedGame {
	const langs = (row.languages as string[] | null) ?? (row.language ? [row.language] : undefined);
	return {
		id: row.id,
		name: row.name,
		languages: langs,
		boardCount: (row.boardCount ?? 2) as 1 | 2 | 3,
		board1: row.board1 as CategoryConfig[],
		board2: row.board2 as CategoryConfig[],
		board3: (row.board3 as CategoryConfig[]) ?? [],
		chaosCategory: row.chaosCategory as CategoryConfig,
		chaosEnabled: row.chaosEnabled,
		isPublic: row.isPublic,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

export const PUT: RequestHandler = async (event) => {
	const userId = await requireUserId(event);
	const body: SavedGame = await event.request.json();
	const rows = await db
		.update(savedGames)
		.set({
			name: body.name,
			languages: body.languages ?? null,
			boardCount: body.boardCount ?? 2,
			board1: body.board1 as unknown as typeof savedGames.$inferInsert['board1'],
			board2: body.board2 as unknown as typeof savedGames.$inferInsert['board2'],
			board3: body.board3 as unknown as typeof savedGames.$inferInsert['board3'],
			chaosCategory: body.chaosCategory as unknown as typeof savedGames.$inferInsert['chaosCategory'],
			chaosEnabled: body.chaosEnabled,
			updatedAt: new Date(body.updatedAt),
		})
		.where(and(eq(savedGames.id, event.params.id), eq(savedGames.userId, userId)))
		.returning();
	if (!rows.length) throw error(404, 'Nicht gefunden');
	return json(toSavedGame(rows[0]));
};

export const DELETE: RequestHandler = async (event) => {
	const userId = await requireUserId(event);
	await db
		.delete(savedGames)
		.where(and(eq(savedGames.id, event.params.id), eq(savedGames.userId, userId)));
	return new Response(null, { status: 204 });
};
