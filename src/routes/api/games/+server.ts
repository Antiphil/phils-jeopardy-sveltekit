import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { savedGames } from '$lib/server/schema';
import { eq, desc } from 'drizzle-orm';
import type { CategoryConfig, SavedGame } from '$lib/stores/savedGames';

async function requireUserId(event: Parameters<RequestHandler>[0]): Promise<string> {
	const session = await event.locals.auth();
	if (!session?.user?.id) throw error(401, 'Nicht angemeldet');
	return session.user.id;
}

function validateGame(body: SavedGame) {
	if (!body.name?.trim()) throw error(400, 'Spielname darf nicht leer sein');
	const allQuestions = [
		...body.board1.flatMap((c) => c.questions),
		...body.board2.flatMap((c) => c.questions),
		...(body.board3 ?? []).flatMap((c) => c.questions),
		...body.chaosCategory.questions,
	];
	for (const q of allQuestions) {
		if ((q.chaosType === 'wordle' || q.chaosType === 'hangman') && q.answer.trim().length < 2) {
			throw error(400, 'Wordle/Hangman-Wörter müssen mindestens 2 Buchstaben haben');
		}
		if (q.timerEnabled && q.timerSeconds != null && (q.timerSeconds < 5 || q.timerSeconds > 300)) {
			throw error(400, 'Timer muss zwischen 5 und 300 Sekunden liegen');
		}
	}
}

function toSavedGame(row: typeof savedGames.$inferSelect): SavedGame {
	const langs = (row.languages as string[] | null) ?? (row.language ? [row.language] : undefined);
	return {
		id: row.id,
		name: row.name,
		languages: langs,
		boardCount: (row.boardCount ?? 2) as 1 | 2 | 3,
		defaultTimerSeconds: row.defaultTimerSeconds ?? 45,
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

export const GET: RequestHandler = async (event) => {
	const userId = await requireUserId(event);
	try {
		const rows = await db
			.select()
			.from(savedGames)
			.where(eq(savedGames.userId, userId))
			.orderBy(desc(savedGames.updatedAt));
		return json(rows.map(toSavedGame));
	} catch {
		throw error(500, 'Spiele konnten nicht geladen werden');
	}
};

const PHIL_EMAIL = 'stehle@mailbox.org';

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) throw error(401, 'Nicht angemeldet');
	const userId = session.user.id;

	let body: SavedGame;
	try {
		body = await event.request.json();
	} catch {
		throw error(400, 'Ungültige Anfrage');
	}

	validateGame(body);

	const chaosCategory = session.user.email === PHIL_EMAIL
		? { ...body.chaosCategory, name: 'Phil wie er will' }
		: body.chaosCategory;

	try {
		const rows = await db
			.insert(savedGames)
			.values({
				id: body.id,
				userId,
				name: body.name,
				languages: body.languages ?? null,
				boardCount: body.boardCount ?? 2,
				defaultTimerSeconds: body.defaultTimerSeconds ?? 45,
				board1: body.board1 as unknown as typeof savedGames.$inferInsert['board1'],
				board2: body.board2 as unknown as typeof savedGames.$inferInsert['board2'],
				board3: body.board3 as unknown as typeof savedGames.$inferInsert['board3'],
				chaosCategory: chaosCategory as unknown as typeof savedGames.$inferInsert['chaosCategory'],
				chaosEnabled: body.chaosEnabled,
				createdAt: new Date(body.createdAt),
				updatedAt: new Date(body.updatedAt),
			})
			.returning();
		return json(toSavedGame(rows[0]), { status: 201 });
	} catch {
		throw error(500, 'Spiel konnte nicht erstellt werden');
	}
};
