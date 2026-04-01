import type { RequestHandler } from './$types';

const BASE = 'https://antiphil.de';

const pages = [
	{ url: '/', priority: '1.0', changefreq: 'weekly' },
	{ url: '/how-to-play', priority: '0.7', changefreq: 'monthly' },
];

export const GET: RequestHandler = () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(({ url, priority, changefreq }) => `  <url>
    <loc>${BASE}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600',
		},
	});
};
