// @ts-nocheck
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { gameSessions, savedGames } from '$lib/server/schema';
import { eq, desc } from 'drizzle-orm';
import type { GameState } from '$lib/stores/game';
import type { CategoryConfig, SavedGame } from '$lib/stores/savedGames';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	const session = await event.locals.auth();

	const publicRows = await db
		.select()
		.from(savedGames)
		.where(eq(savedGames.isPublic, true))
		.orderBy(desc(savedGames.updatedAt));

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
