import { SvelteKitAuth } from '@auth/sveltekit';
import Discord from '@auth/sveltekit/providers/discord';
import Google from '@auth/sveltekit/providers/google';
import { db } from '$lib/server/db';
import { users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
	providers: [Discord, Google],
	pages: { signIn: '/signin' },
	callbacks: {
		session({ session, token }) {
			if (token.sub && session.user) {
				session.user.id = token.sub;
				(session.user as typeof session.user & { isAdmin: boolean }).isAdmin =
					(token as typeof token & { isAdmin?: boolean }).isAdmin ?? false;
			}
			return session;
		},
		async jwt({ token, account }) {
			if (!token.sub) return token;

			if (account) {
				// Upsert user on sign-in
				await db
					.insert(users)
					.values({
						id: token.sub,
						name: token.name ?? null,
						email: token.email ?? null,
						image: token.picture ?? null,
					})
					.onConflictDoUpdate({
						target: users.id,
						set: {
							name: token.name ?? null,
							email: token.email ?? null,
							image: token.picture ?? null,
						},
					});
			}

			// Always read isAdmin fresh from DB so changes take effect without re-login
			const [user] = await db
				.select({ isAdmin: users.isAdmin })
				.from(users)
				.where(eq(users.id, token.sub));
			(token as typeof token & { isAdmin: boolean }).isAdmin = user?.isAdmin ?? false;

			return token;
		},
	},
});
