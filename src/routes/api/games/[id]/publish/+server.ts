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

	let publishType: 'private' | 'public' | 'official';
	try {
		({ publishType } = await event.request.json());
		if (!['private', 'public', 'official'].includes(publishType)) {
			throw error(400, 'Ungültiger Veröffentlichungstyp');
		}
	} catch {
		throw error(400, 'Ungültige Anfrage');
	}

	// Only admins can publish as 'official'
	if (publishType === 'official' && !isAdmin) {
		throw error(403, 'Nur Admins können Spiele als offiziell veröffentlichen');
	}

	try {
		await db
			.update(savedGames)
			.set({ publishType })
			.where(and(eq(savedGames.id, event.params.id), eq(savedGames.userId, session.user.id)));
		return new Response(null, { status: 204 });
	} catch {
		throw error(500, 'Veröffentlichungstyp konnte nicht geändert werden');
	}
};
