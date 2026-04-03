import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	let hasUsername = true; // default true so non-logged-in users don't see the modal

	let username: string | null = null;

	if (session?.user?.id) {
		const [user] = await db
			.select({ username: users.username })
			.from(users)
			.where(eq(users.id, session.user.id))
			.limit(1);
		hasUsername = !!user?.username;
		username = user?.username ?? null;
	}

	return { session, hasUsername, username };
};
