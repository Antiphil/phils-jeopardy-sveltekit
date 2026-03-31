// @ts-nocheck
import type { LayoutServerLoad } from './$types';

// Stellt die Session auf allen Seiten als page.data.session bereit
export const load = async (event: Parameters<LayoutServerLoad>[0]) => {
	return {
		session: await event.locals.auth(),
	};
};
