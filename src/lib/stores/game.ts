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
				board1Categories: (savedGame?.board1 as Category[]) ?? [],
				board2Categories: (savedGame?.board2 as Category[]) ?? [],
				board3Categories: (savedGame?.board3 as Category[]) ?? [],
				chaosCategory: (savedGame?.chaosCategory as Category) ?? { id: 'chaos', name: 'Chaos Category', questions: [] },
				chaosEnabled: savedGame?.chaosEnabled ?? false,
				currentTurnIndex: 0,
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
				const scores = { ...state.scores, [scorerId]: (state.scores[scorerId] ?? 0) + points };
				const board1Ids = state.board1Categories.flatMap((c) => c.questions.map((q) => q.id));
				const board2Ids = state.board2Categories.flatMap((c) => c.questions.map((q) => q.id));
				const board1Complete = board1Ids.every((id) => answered[id] !== undefined);
				const board2Complete = board2Ids.every((id) => answered[id] !== undefined);
				const turnCount = state.teams ? state.teams.length : state.players.length;
				const currentTurnIndex = (state.currentTurnIndex + 1) % turnCount;
				return { ...state, answered, scores, board1Complete, board2Complete, currentTurnIndex };
			});
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
