import type { LayoutServerLoad } from './$types';

// Stellt die Session auf allen Seiten als page.data.session bereit
export const load: LayoutServerLoad = async (event) => {
	return {
		session: await event.locals.auth(),
	};
};
