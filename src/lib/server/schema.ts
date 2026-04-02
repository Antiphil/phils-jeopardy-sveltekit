import { pgTable, text, boolean, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';
export const users = pgTable('users', {
	id: text('id').primaryKey(),
	name: text('name'),
	email: text('email'),
	image: text('image'),
	isAdmin: boolean('is_admin').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const savedGames = pgTable('saved_games', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull().default('Neues Spiel'),
	language: text('language'), // legacy — superseded by languages
	languages: jsonb('languages'), // string[] e.g. ['de', 'en']
	boardCount: integer('board_count').notNull().default(2),
	defaultTimerSeconds: integer('default_timer_seconds').notNull().default(45),
	board1: jsonb('board1').notNull(),
	board2: jsonb('board2').notNull(),
	board3: jsonb('board3'),
	chaosCategory: jsonb('chaos_category').notNull(),
	chaosEnabled: boolean('chaos_enabled').notNull().default(false),
	isPublic: boolean('is_public').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const gameRatings = pgTable('game_ratings', {
	id: text('id').primaryKey(),
	gameId: text('game_id').notNull().references(() => savedGames.id, { onDelete: 'cascade' }),
	rating: integer('rating').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const gameSessions = pgTable('game_sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	savedGameId: text('saved_game_id').references(() => savedGames.id, { onDelete: 'set null' }),
	state: jsonb('state').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
