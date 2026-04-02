import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { SavedGame } from '$lib/stores/savedGames';

// ─── User scoping ─────────────────────────────────────────────────────────────

let _gameUserId: string | null = null;
let _sessionId: string | null = null;
let _saveTimer: ReturnType<typeof setTimeout> | null = null;

export type Player = { id: number; name: string; avatar: string };
export type Team   = { id: number; name: string; color: string; playerIds: number[] };

export type Question = {
	id: string;
	points: number;
	question: string;
	answer: string;
	image?: string;
	timerEnabled?: boolean;
	timerSeconds?: number;
	chaosType?: 'question' | 'wordle' | 'hangman' | 'wheel';
};

export type Category = {
	id: string;
	name: string;
	questions: Question[];
};

// ─── Game Store ───────────────────────────────────────────────────────────────

export type GameState = {
	players: Player[];
	teams: Team[] | null;
	scores: Record<number, number>;
	answered: Record<string, number | null>;
	wrongAnswers: Record<string, number[]>;
	pointsLost: Record<number, number>;
	currentBoard: 1 | 2 | 3;
	boardCount: 1 | 2 | 3;
	board1Complete: boolean;
	board2Complete: boolean;
	board1Categories: Category[];
	board2Categories: Category[];
	board3Categories: Category[];
	chaosCategory: Category;
	chaosEnabled: boolean;
	currentTurnIndex: number;
	pendingSkips: number[];
	savedGameId?: string;
	isPublicGame?: boolean;
};

function schedulePersist(state: GameState) {
	if (!_sessionId || !browser) return;
	if (_saveTimer) clearTimeout(_saveTimer);
	_saveTimer = setTimeout(async () => {
		try {
			await fetch(`/api/sessions/${_sessionId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ state }),
			});
		} catch {
			// silent - data is still in memory
		}
	}, 1000);
}

function createGameStore() {
	const { subscribe, set, update } = writable<GameState | null>(null);

	function setState(state: GameState | null) {
		if (state) schedulePersist(state);
		set(state);
	}

	function updateState(fn: (s: GameState) => GameState) {
		update((state) => {
			if (!state) return state;
			const next = fn(state);
			schedulePersist(next);
			return next;
		});
	}

	return {
		subscribe,

		async start(players: Player[], teams: Team[] | null, savedGame?: SavedGame | null) {
			const scores: Record<number, number> = {};
			if (teams) {
				teams.forEach((t) => { scores[t.id] = 0; });
			} else {
				players.forEach((p) => { scores[p.id] = 0; });
			}

			// Apply defaultTimerSeconds to all questions that don't have a per-question timer set.
			// Per-question timers in the chaos category always take precedence.
			const defaultSecs = savedGame?.defaultTimerSeconds ?? 45;
			function applyTimer(cats: Category[]): Category[] {
				if (!defaultSecs) return cats;
				return cats.map((c) => ({
					...c,
					questions: c.questions.map((q) => {
						// Wheel questions never get a timer
						if (q.chaosType === 'wheel') return q;
						// Per-question timer (chaos category) takes precedence
						if (q.timerEnabled && q.timerSeconds) return q;
						// Otherwise apply the global default
						return { ...q, timerEnabled: true, timerSeconds: defaultSecs };
					}),
				}));
			}

			const state: GameState = {
				players,
				teams,
				scores,
				answered: {},
				wrongAnswers: {},
				pointsLost: {},
				currentBoard: 1,
				boardCount: savedGame?.boardCount ?? 2,
				board1Complete: false,
				board2Complete: false,
				board1Categories: applyTimer((savedGame?.board1 as Category[]) ?? []),
				board2Categories: applyTimer((savedGame?.board2 as Category[]) ?? []),
				board3Categories: applyTimer((savedGame?.board3 as Category[]) ?? []),
				chaosCategory: applyTimer([(savedGame?.chaosCategory as Category) ?? { id: 'chaos', name: 'Chaos Category', questions: [] }])[0],
				chaosEnabled: savedGame?.chaosEnabled ?? false,
				currentTurnIndex: 0,
				pendingSkips: [],
				savedGameId: savedGame?.id,
				isPublicGame: savedGame?.isPublic ?? false,
			};

			if (browser && _gameUserId) {
				const res = await fetch('/api/sessions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ state, savedGameId: savedGame?.id ?? null }),
				});
				if (res.status === 409) throw new Error('MAX_SESSIONS');
				if (res.ok) {
					const { id } = await res.json();
					_sessionId = id;
				}
			}

			setState(state);
		},

		resume(state: GameState, sessionId: string) {
			_sessionId = sessionId;
			set(state);
		},

		markAnswered(questionId: string, scorerId: number, points: number) {
			updateState((state) => {
				const answered = { ...state.answered, [questionId]: scorerId };
				// Only update scores for real scorers (not -1 = missed)
				const scores = scorerId >= 0
					? { ...state.scores, [scorerId]: (state.scores[scorerId] ?? 0) + points }
					: state.scores;
				const board1Ids = state.board1Categories.flatMap((c) => c.questions.map((q) => q.id));
				const board2Ids = state.board2Categories.flatMap((c) => c.questions.map((q) => q.id));
				const board1Complete = board1Ids.every((id) => answered[id] !== undefined);
				const board2Complete = board2Ids.every((id) => answered[id] !== undefined);
				const turnCount = state.teams ? state.teams.length : state.players.length;
				// Advance turn, skipping any player with a pending skip
				let nextIndex = (state.currentTurnIndex + 1) % turnCount;
				const pendingSkips = [...(state.pendingSkips ?? [])];
				const nextId = state.teams ? state.teams[nextIndex]?.id : state.players[nextIndex]?.id;
				if (nextId !== undefined && pendingSkips.includes(nextId)) {
					pendingSkips.splice(pendingSkips.indexOf(nextId), 1);
					nextIndex = (nextIndex + 1) % turnCount;
				}
				return { ...state, answered, scores, board1Complete, board2Complete, currentTurnIndex: nextIndex, pendingSkips };
			});
		},

		addPoints(scorerId: number, points: number) {
			updateState((state) => ({
				...state,
				scores: { ...state.scores, [scorerId]: (state.scores[scorerId] ?? 0) + points },
			}));
		},

		swapScores(id1: number, id2: number) {
			updateState((state) => {
				const s1 = state.scores[id1] ?? 0;
				const s2 = state.scores[id2] ?? 0;
				return { ...state, scores: { ...state.scores, [id1]: s2, [id2]: s1 } };
			});
		},

		scheduleSkip(scorerId: number) {
			updateState((state) => ({
				...state,
				pendingSkips: [...(state.pendingSkips ?? []), scorerId],
			}));
		},

		deductPoints(scorerId: number, points: number, questionId?: string) {
			updateState((state) => {
				const scores = { ...state.scores, [scorerId]: (state.scores[scorerId] ?? 0) - points };
				const pointsLost = { ...state.pointsLost, [scorerId]: (state.pointsLost[scorerId] ?? 0) + points };
				const wrongAnswers = questionId
					? { ...state.wrongAnswers, [questionId]: [...(state.wrongAnswers[questionId] ?? []), scorerId] }
					: state.wrongAnswers;
				return { ...state, scores, pointsLost, wrongAnswers };
			});
		},

		setTurn(index: number) {
			updateState((state) => ({ ...state, currentTurnIndex: index }));
		},

		switchBoard(board: 1 | 2) {
			updateState((state) => ({ ...state, currentBoard: board }));
		},

		async reset() {
			if (browser && _sessionId) {
				const id = _sessionId;
				_sessionId = null;
				try {
					await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
				} catch {
					// silent
				}
			}
			set(null);
		},

		clearState() {
			_sessionId = null;
			set(null);
		},
	};
}

export const gameStore = createGameStore();

/**
 * Called by the layout when the logged-in user changes.
 * Updates the active user ID and clears the in-memory game state.
 */
export function setGameUser(userId: string | null) {
	if (userId === _gameUserId) return;
	_gameUserId = userId;
	if (browser) gameStore.clearState();
}
