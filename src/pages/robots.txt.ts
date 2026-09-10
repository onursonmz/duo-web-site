import type { APIRoute } from "astro";
import { isProduction, resolveSiteUrl } from "@config/site";

/**
 * ROBOTS (S13).
 *
 * PREVIEW: tüm site taramaya KAPALI (`Disallow: /`). Önizleme derlemesi
 * taslak içerik taşır; indekslenmesi kaza olur.
 *
 * PRODUCTION: dahili ve indekslenmeyen rotalar açıkça kapatılır, sitemap
 * bildirilir. Nihai indeksleme kararı S15 içerik doğruluk kapısındadır;
 * sayfa düzeyindeki `noindex` etiketleri bu dosyadan bağımsız olarak
 * geçerlidir.
 */
export const GET: APIRoute = () => {
  const site = resolveSiteUrl(process.env);

  const body = isProduction(process.env)
    ? [
        "User-agent: *",
        "Disallow: /design-system/",
        "Disallow: /404/",
        "Disallow: /410/",
        "Disallow: /aydinlatma-metni/",
        "Disallow: /en/privacy-notice/",
        "",
        `Sitemap: ${new URL("/sitemap.xml", site).href}`,
        "",
      ].join("\n")
    : ["# ÖNİZLEME DERLEMESİ — taramaya kapalı.", "User-agent: *", "Disallow: /", ""].join("\n");

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
