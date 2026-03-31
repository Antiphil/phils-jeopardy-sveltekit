
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/games" | "/api/games/public" | "/api/games/[id]" | "/api/games/[id]/publish" | "/api/sessions" | "/api/sessions/[id]" | "/game-config" | "/game" | "/how-to-play" | "/privacy" | "/signin" | "/signout" | "/solutions" | "/terms" | "/winner";
		RouteParams(): {
			"/api/games/[id]": { id: string };
			"/api/games/[id]/publish": { id: string };
			"/api/sessions/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/api": { id?: string };
			"/api/games": { id?: string };
			"/api/games/public": Record<string, never>;
			"/api/games/[id]": { id: string };
			"/api/games/[id]/publish": { id: string };
			"/api/sessions": { id?: string };
			"/api/sessions/[id]": { id: string };
			"/game-config": Record<string, never>;
			"/game": Record<string, never>;
			"/how-to-play": Record<string, never>;
			"/privacy": Record<string, never>;
			"/signin": Record<string, never>;
			"/signout": Record<string, never>;
			"/solutions": Record<string, never>;
			"/terms": Record<string, never>;
			"/winner": Record<string, never>
		};
		Pathname(): "/" | "/api/games" | "/api/games/public" | `/api/games/${string}` & {} | `/api/games/${string}/publish` & {} | "/api/sessions" | `/api/sessions/${string}` & {} | "/game-config" | "/game" | "/how-to-play" | "/privacy" | "/signin" | "/signout" | "/solutions" | "/terms" | "/winner";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}