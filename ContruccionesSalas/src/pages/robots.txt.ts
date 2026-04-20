export const prerender = true;

export function GET({ site }: { site?: URL }) {
	const base = site ? site.href.replace(/\/$/, '') : '';
	const sitemapIndex = base ? `${base}/sitemap-index.xml` : '/sitemap-index.xml';

	const body = `User-agent: *
Allow: /

Sitemap: ${sitemapIndex}
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
}

