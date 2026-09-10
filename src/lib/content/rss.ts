import type { APIContext } from "astro";
import type { Locale } from "@lib/content/schema";
import { PUBLIC, getInsights } from "@lib/content/selectors";
import { insightPath, insightsIndexPath, rssPath } from "@lib/i18n/routes";
import { rfc822 } from "@lib/i18n/dates";
import { seriesLabel } from "@lib/content/series";
import { t } from "@lib/i18n/dictionary";

/**
 * RSS BESLEMESİ (S11 §14).
 *
 * Besleme `getInsights(..., PUBLIC)` üzerinden beslenir — sayfaların
 * kullandığı SEÇİCİNİN AYNISI. Kendi filtresini yazmadığı için taslak veya
 * ileri tarihli bir kayıt beslemeye giremez; sayfada gizli olan bir yazının
 * RSS'te görünmesi mümkün değildir.
 *
 * Üçüncü taraf bir RSS paketi kullanılmadı: besleme dört alandan ibaret ve
 * bir bağımlılık eklemek, XML kaçışının nasıl yapıldığını da o pakete
 * devretmek demekti.
 */

/**
 * XML metin kaçışı.
 *
 * Beş karakterin tamamı kaçırılır. `&` MUTLAKA ilk sırada olmalıdır; sonra
 * kaçırılırsa daha önce üretilen `&lt;` gibi diziler ikinci kez kaçırılır ve
 * `&amp;lt;` çıkar.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Bir locale için tam RSS 2.0 belgesi üretir. */
export async function buildFeed(locale: Locale, context: APIContext): Promise<string> {
  const site = context.site ?? new URL(context.url.origin);
  const absolute = (path: string): string => new URL(path, site).href;

  const insights = await getInsights(locale, PUBLIC);

  const items = insights
    .map((insight) => {
      const data = insight.data;
      const link = absolute(insightPath(locale, data.slug));
      // `getInsights` public modda tarihsiz kayıt döndürmez.
      const published = data.publishedAt;
      const pubDate = published === undefined ? "" : `<pubDate>${rfc822(published)}</pubDate>`;

      return [
        "    <item>",
        `      <title>${escapeXml(data.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        // `isPermaLink="true"` : guid gerçek bir adres, opak bir kimlik değil.
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <description>${escapeXml(data.excerpt)}</description>`,
        `      ${pubDate}`,
        // Kategori olarak ham anahtar değil, o dildeki GÖRÜNEN seri adı:
        // besleme okuyucusunda sayfadakiyle aynı etiket görünmeli.
        `      <category>${escapeXml(seriesLabel(data.series, locale))}</category>`,
        "    </item>",
      ]
        .filter((line) => line.trim() !== "")
        .join("\n");
    })
    .join("\n");

  const channelTitle = `${t(locale, "site.name")} — ${t(locale, "insights.title")}`;
  const selfHref = absolute(rssPath(locale));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(channelTitle)}</title>`,
    `    <link>${escapeXml(absolute(insightsIndexPath(locale)))}</link>`,
    `    <description>${escapeXml(t(locale, "insights.intro"))}</description>`,
    `    <language>${locale}</language>`,
    `    <atom:link href="${escapeXml(selfHref)}" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}
