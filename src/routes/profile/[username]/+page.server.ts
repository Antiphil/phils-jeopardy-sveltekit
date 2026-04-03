import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users, savedGames, gameRatings, gameSessions } from '$lib/server/schema';
import { eq, count, avg, sql, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const username = event.params.username;

	const [profileUser] = await db
		.select({
			id:        users.id,
			name:      users.name,
			username:  users.username,
			image:     users.image,
			isAdmin:   users.isAdmin,
			createdAt: users.createdAt,
		})
		.from(users)
		.where(eq(users.username, username))
		.limit(1);

	if (!profileUser) throw error(404, 'Profil nicht gefunden');

	const isOwnProfile = session?.user?.id === profileUser.id;

	const [
		[gameStats],
		[ratingStats],
		[sessionStats],
	] = await Promise.all([
		db.select({
			total:  count(),
			public: sql<number>`count(*) filter (where ${savedGames.publishType} IN ('public', 'official'))`,
			round1: sql<number>`count(*) filter (where ${savedGames.boardCount} = 1)`,
			round2: sql<number>`count(*) filter (where ${savedGames.boardCount} = 2)`,
			round3: sql<number>`count(*) filter (where ${savedGames.boardCount} = 3)`,
			chaos:  sql<number>`count(*) filter (where ${savedGames.chaosEnabled} = true)`,
		}).from(savedGames).where(eq(savedGames.userId, profileUser.id)),

		db.select({ avgRating: avg(gameRatings.rating), totalRatings: count() })
			.from(gameRatings)
			.innerJoin(savedGames, eq(gameRatings.gameId, savedGames.id))
			.where(eq(savedGames.userId, profileUser.id)),

		db.select({ total: count() })
			.from(gameSessions)
			.where(eq(gameSessions.userId, profileUser.id)),
	]);

	const gamesPublic = Number(gameStats?.public ?? 0);

	return {
		user: {
			name:      profileUser.name,
			username:  profileUser.username,
			image:     profileUser.image,
			isAdmin:   profileUser.isAdmin,
			createdAt: profileUser.createdAt,
		},
		isOwnProfile,
		stats: {
			gamesTotal:    Number(gameStats?.total ?? 0),
			gamesPublic,
			gamesRound1:   Number(gameStats?.round1 ?? 0),
			gamesRound2:   Number(gameStats?.round2 ?? 0),
			gamesRound3:   Number(gameStats?.round3 ?? 0),
			gamesChaos:    Number(gameStats?.chaos ?? 0),
			avgRating:     gamesPublic > 0 && ratingStats?.avgRating
				? Number(Number(ratingStats.avgRating).toFixed(1))
				: null,
			totalRatings:  Number(ratingStats?.totalRatings ?? 0),
			sessionsTotal: Number(sessionStats?.total ?? 0),
		},
	};
};
