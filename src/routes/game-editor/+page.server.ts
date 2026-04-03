import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) {
		throw redirect(302, '/');
	}
	const [user] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, session.user.id));
	return { isAdmin: user?.isAdmin ?? false };
};
