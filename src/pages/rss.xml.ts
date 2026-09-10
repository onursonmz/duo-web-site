import type { APIContext, APIRoute } from "astro";
import { buildFeed } from "@lib/content/rss";

/**
 * Türkçe RSS beslemesi: /rss.xml
 *
 * İçerik `buildFeed` içinde üretilir ve sayfaların kullandığı public seçiciye
 * dayanır; besleme kendi filtresini yazmaz.
 */
export const GET: APIRoute = async (context: APIContext) =>
  new Response(await buildFeed("tr", context), {
    headers: {
      // `charset` açıkça verilir: XML bildirimi UTF-8 diyor, HTTP başlığı da
      // aynı şeyi söylemeli — aksi halde bazı okuyucular latin-1 varsayıyor.
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
