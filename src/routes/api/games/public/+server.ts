import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { savedGames } from '$lib/server/schema';
import { eq, desc } from 'drizzle-orm';
import type { CategoryConfig, SavedGame } from '$lib/stores/savedGames';

export const GET: RequestHandler = async () => {
	const rows = await db
		.select()
		.from(savedGames)
		.where(eq(savedGames.isPublic, true))
		.orderBy(desc(savedGames.updatedAt));

	return json(
		rows.map((row): SavedGame => ({
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
		}))
	);
};
