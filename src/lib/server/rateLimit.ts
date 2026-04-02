/**
 * Lightweight in-memory rate limiter.
 * Resets on server restart — sufficient for single-instance deployments.
 */

const store = new Map<string, number>();

// Prune expired entries once per hour to prevent unbounded memory growth.
// The guard prevents duplicate intervals when HMR reloads this module in dev.
declare const globalThis: { __rateLimitPruner?: ReturnType<typeof setInterval> };
if (!globalThis.__rateLimitPruner) {
	globalThis.__rateLimitPruner = setInterval(
		() => {
			const now = Date.now();
			for (const [key, ts] of store) {
				if (now - ts > 24 * 60 * 60 * 1000) store.delete(key);
			}
		},
		60 * 60 * 1000
	);
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key      Unique identifier, e.g. `"rate:${ip}:${gameId}"`
 * @param windowMs How long (ms) to block after the first request
 */
export function checkRateLimit(key: string, windowMs: number): boolean {
	const now = Date.now();
	const last = store.get(key);
	if (last !== undefined && now - last < windowMs) return false;
	store.set(key, now);
	return true;
}
