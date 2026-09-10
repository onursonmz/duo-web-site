import type { APIRoute } from "astro";
import { indexableRoutes } from "@lib/seo/routes";
import { isProduction, resolveSiteUrl } from "@config/site";

/**
 * SITEMAP (S13).
 *
 * YALNIZCA indekslenebilir canonical rotalar. Design system, 404/410, taslak
 * hukuki metin ve preview-only rotalar HİÇ girmez.
 *
 * PREVIEW ortamında sitemap BOŞ üretilir: önizleme derlemesi arama motoruna
 * kapalıdır ve orada bulunan taslak içerik indekslenmeye aday değildir.
 */
export const GET: APIRoute = async () => {
  const site = resolveSiteUrl(process.env);
  const routes = isProduction(process.env) ? await indexableRoutes() : [];

  const urls = routes
    .map((route) => {
      const loc = new URL(route.path, site).href;
      const lastmod =
        route.lastmod === undefined ? "" : `\n    <lastmod>${route.lastmod}</lastmod>`;
      return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
};
