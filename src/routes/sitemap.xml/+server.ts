import type { RequestHandler } from './$types';

const BASE = 'https://antiphil.de';

const PAGES = [
	{ url: '/',            priority: '1.0', changefreq: 'weekly',  lastmod: '2025-01-01' },
	{ url: '/how-to-play', priority: '0.8', changefreq: 'monthly', lastmod: '2025-01-01' },
	{ url: '/privacy',     priority: '0.3', changefreq: 'yearly',  lastmod: '2025-01-01' },
	{ url: '/terms',       priority: '0.3', changefreq: 'yearly',  lastmod: '2025-01-01' },
];

export const GET: RequestHandler = () => {
	const entries = PAGES.map(
		({ url, priority, changefreq, lastmod }) => `  <url>
    <loc>${BASE}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
		},
	});
};
