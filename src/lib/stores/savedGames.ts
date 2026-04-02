import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ChaosType = 'question' | 'wordle' | 'hangman' | 'wheel' | 'spotdiff';

export type QuestionConfig = {
	id: string;
	question: string; // primary language (or only language)
	answer: string;
	image?: string;
	points: number;
	translations?: Record<string, { question: string; answer: string }>;
	timerEnabled?: boolean;
	timerSeconds?: number;
	chaosType?: ChaosType; // only relevant for chaos category questions
};

export type CategoryConfig = {
	id: string;
	name: string;
	nameTranslations?: Record<string, string>;
	questions: QuestionConfig[];
};

export type SavedGame = {
	id: string;
	name: string;
	languages?: string[]; // e.g. ['de', 'en']
	createdAt: string;
	updatedAt: string;
	boardCount?: 1 | 2 | 3; // default 2
	defaultTimerSeconds?: number; // global default timer for all questions (0 = off)
	board1: CategoryConfig[];
	board2: CategoryConfig[];
	board3: CategoryConfig[];
	chaosCategory: CategoryConfig;
	chaosEnabled: boolean;
	isPublic: boolean;
	avgRating?: number; // only present for public games
	ratingCount?: number;
};

function makeBoard(board: 1 | 2 | 3): CategoryConfig[] {
	const pts = board === 1 ? [100, 200, 300, 400, 500]
		: board === 2 ? [200, 400, 600, 800, 1000]
		: [400, 800, 1200, 1600, 2000];
	return Array.from({ length: 6 }, (_, ci) => ({
		id: `b${board}-c${ci + 1}`,
		name: `Kategorie ${ci + 1}`,
		questions: pts.map((p, qi) => ({
			id: `b${board}-c${ci + 1}-q${qi + 1}`,
			question: '',
			answer: '',
			points: p,
		})),
	}));
}

function makeChaos(): CategoryConfig {
	return {
		id: 'chaos',
		name: 'Chaos Category',
		questions: Array.from({ length: 10 }, (_, i) => ({
			id: `chaos-${i + 1}`,
			question: '',
			answer: '',
			points: (i + 1) * 250,
		})),
	};
}

function migrateGame(raw: unknown): SavedGame {
	const game = raw as SavedGame & { philCategory?: CategoryConfig; language?: string };
	// Migrate legacy single language string → array
	const languages = game.languages ?? (game.language ? [game.language] : undefined);
	const chaos: CategoryConfig = game.chaosCategory ?? game.philCategory ?? makeChaos();
	const padded =
		chaos.questions.length >= 10
			? chaos.questions
			: [
					...chaos.questions,
					...Array.from({ length: 10 - chaos.questions.length }, (_, i) => ({
						id: `chaos-${chaos.questions.length + i + 1}`,
						question: '',
						answer: '',
						points: (chaos.questions.length + i + 1) * 250,
					})),
				];
	const fixed = padded.map((q: QuestionConfig, i: number) =>
		q.points === 0 ? { ...q, points: (i + 1) * 250 } : q
	);
	return {
		...game,
		languages,
		boardCount: game.boardCount ?? 2,
		board3: (game.board3 && game.board3.length > 0) ? game.board3 : makeBoard(3),
		chaosCategory: {
			...chaos,
			id: 'chaos',
			name: chaos.name,
			questions: fixed,
		},
		chaosEnabled: game.chaosEnabled ?? false,
		isPublic: game.isPublic ?? false,
	};
}

function createStore() {
	const { subscribe, set, update } = writable<SavedGame[]>([]);

	return {
		subscribe,

		async _setUser(userId: string | null) {
			if (!browser || !userId) {
				set([]);
				return;
			}
			try {
				const res = await fetch('/api/games');
				if (res.ok) {
					const games: SavedGame[] = await res.json();
					set(games.map(migrateGame));
				}
			} catch {
				set([]);
			}
		},

		async create(language?: string): Promise<SavedGame> {
			const game: SavedGame = {
				id: crypto.randomUUID(),
				name: 'Neues Spiel',
				languages: language ? [language] : undefined,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				boardCount: 2,
				defaultTimerSeconds: 45,
				board1: makeBoard(1),
				board2: makeBoard(2),
				board3: makeBoard(3),
				chaosCategory: makeChaos(),
				chaosEnabled: false,
				isPublic: false,
			};
			const res = await fetch('/api/games', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(game),
			});
			const created: SavedGame = await res.json();
			update((games) => [created, ...games]);
			return created;
		},

		async save(game: SavedGame): Promise<SavedGame> {
			const updated: SavedGame = migrateGame({ ...game, updatedAt: new Date().toISOString() });
			const res = await fetch(`/api/games/${updated.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updated),
			});
			const saved: SavedGame = await res.json();
			update((games) => games.map((g) => (g.id === saved.id ? saved : g)));
			return saved;
		},

		async delete(id: string): Promise<void> {
			await fetch(`/api/games/${id}`, { method: 'DELETE' });
			update((games) => games.filter((g) => g.id !== id));
		},

		async togglePublic(id: string, isPublic: boolean): Promise<void> {
			await fetch(`/api/games/${id}/publish`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isPublic }),
			});
			update((games) => games.map((g) => (g.id === id ? { ...g, isPublic } : g)));
		},
	};
}

export const savedGamesStore = createStore();

export function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit',
	});
}
