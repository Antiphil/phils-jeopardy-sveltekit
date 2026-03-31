import type { Session } from '@auth/sveltekit';

declare global {
	namespace App {
		interface Locals {
			auth: import('@auth/sveltekit').SvelteKitAuthConfig['callbacks'];
			getSession(): Promise<Session | null>;
		}
		interface PageData {
			session: Session | null;
		}
	}
}

export {};
