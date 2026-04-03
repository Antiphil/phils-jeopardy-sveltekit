import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/schema';
import { eq, and, ne } from 'drizzle-orm';

const USERNAME_REGEX = /^[a-zA-Z0-9_\-äöüÄÖÜ]+$/;

function validateUsername(username: string): string | null {
	if (username.length < 2) return 'Mindestens 2 Zeichen erforderlich';
	if (username.length > 20) return 'Maximal 20 Zeichen erlaubt';
	if (!USERNAME_REGEX.test(username)) return 'Nur Buchstaben, Zahlen, _ und - erlaubt';
	return null;
}

// GET /api/username?name=foo — check availability
export const GET: RequestHandler = async (event) => {
	const name = event.url.searchParams.get('name')?.trim() ?? '';
	const validationError = validateUsername(name);
	if (validationError) return json({ available: false, error: validationError });

	const session = await event.locals.auth();
	const userId = session?.user?.id;

	const [existing] = await db
		.select({ id: users.id })
		.from(users)
		.where(
			userId
				? and(eq(users.username, name), ne(users.id, userId))
				: eq(users.username, name)
		)
		.limit(1);

	return json({ available: !existing });
};

// POST /api/username — set username for current user
export const POST: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) throw error(401, 'Nicht angemeldet');

	let body: { username: string };
	try {
		body = await event.request.json();
	} catch {
		throw error(400, 'Ungültige Anfrage');
	}

	const username = body.username?.trim() ?? '';
	const validationError = validateUsername(username);
	if (validationError) throw error(400, validationError);

	try {
		await db
			.update(users)
			.set({ username })
			.where(eq(users.id, session.user.id));
		return json({ ok: true });
	} catch {
		// Unique constraint violation
		throw error(409, 'Dieser Benutzername ist bereits vergeben');
	}
};
