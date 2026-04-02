import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { savedGames, users } from '$lib/server/schema';
import { and, eq } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) throw error(401, 'Nicht angemeldet');

	let isAdmin: boolean;
	try {
		const [user] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, session.user.id));
		isAdmin = user?.isAdmin ?? false;
	} catch {
		throw error(500, 'Benutzer konnte nicht überprüft werden');
	}
	if (!isAdmin) throw error(403, 'Kein Admin');

	let isPublic: boolean;
	try {
		({ isPublic } = await event.request.json());
	} catch {
		throw error(400, 'Ungültige Anfrage');
	}

	try {
		await db
			.update(savedGames)
			.set({ isPublic })
			.where(and(eq(savedGames.id, event.params.id), eq(savedGames.userId, session.user.id)));
		return new Response(null, { status: 204 });
	} catch {
		throw error(500, 'Sichtbarkeit konnte nicht geändert werden');
	}
};
