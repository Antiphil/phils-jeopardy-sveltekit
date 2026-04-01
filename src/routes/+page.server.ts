import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { gameSessions, savedGames, gameRatings } from '$lib/server/schema';
import { eq, desc, avg, count } from 'drizzle-orm';
import type { GameState } from '$lib/stores/game';
import type { CategoryConfig, SavedGame } from '$lib/stores/savedGames';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	const publicRows = await db
		.select()
		.from(savedGames)
		.where(eq(savedGames.isPublic, true))
		.orderBy(desc(savedGames.updatedAt));

	const ratingRows = await db
		.select({ gameId: gameRatings.gameId, avg: avg(gameRatings.rating), count: count() })
		.from(gameRatings)
		.groupBy(gameRatings.gameId);

	const ratingMap = Object.fromEntries(ratingRows.map((r) => [r.gameId, { avg: Number(r.avg), count: r.count }]));

	const publicGames: SavedGame[] = publicRows.map((row) => ({
		id: row.id,
		name: row.name,
		language: row.language ?? undefined,
		board1: row.board1 as CategoryConfig[],
		board2: row.board2 as CategoryConfig[],
		chaosCategory: row.chaosCategory as CategoryConfig,
		chaosEnabled: row.chaosEnabled,
		isPublic: row.isPublic,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
		avgRating: ratingMap[row.id]?.avg,
		ratingCount: ratingMap[row.id]?.count,
	}));

	if (!session?.user?.id) return { gameSessions: [], publicGames };

	const rows = await db
		.select()
		.from(gameSessions)
		.where(eq(gameSessions.userId, session.user.id))
		.orderBy(desc(gameSessions.updatedAt));

	return {
		gameSessions: rows.map((r) => ({
			id: r.id,
			state: r.state as GameState,
			updatedAt: r.updatedAt.toISOString(),
		})),
		publicGames,
	};
};
