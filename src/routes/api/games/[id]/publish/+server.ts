import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { savedGames, users } from '$lib/server/schema';
import { and, eq } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) throw error(401, 'Nicht angemeldet');

	// Check admin status directly in DB
	const [user] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, session.user.id));
	if (!user?.isAdmin) throw error(403, 'Kein Admin');

	const { isPublic }: { isPublic: boolean } = await event.request.json();

	await db
		.update(savedGames)
		.set({ isPublic })
		.where(and(eq(savedGames.id, event.params.id), eq(savedGames.userId, session.user.id)));

	return new Response(null, { status: 204 });
};
