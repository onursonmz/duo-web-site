import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { insightSchema } from "@lib/content/schemas";
import { INSIGHT_SERIES } from "@lib/content/schema";
import { SERIES, seriesFromSlug, seriesLabel, seriesSlug } from "@lib/content/series";
import { countWords, readingMinutes, WORDS_PER_MINUTE } from "@lib/content/readingTime";
import { isPublishedByDate, PREVIEW, PUBLIC } from "@lib/content/selectors";
import { formatDate, isoDate, rfc822 } from "@lib/i18n/dates";
import { escapeXml } from "@lib/content/rss";

/**
 * S11 — İÇERİK MODELİ TESTLERİ (§10, §11, §15).
 *
 * Şema, seri tablosu, okuma süresi ve tarih biçimi burada kilitlenir. Hepsinin
 * ortak özelliği DETERMİNİSTİK olmaları: aynı girdi her ortamda aynı çıktıyı
 * vermeli.
 */

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

const validInsight = {
  translationKey: "test-note",
  locale: "tr",
  slug: "test-notu",
  status: "published",
  title: "Test notu",
  excerpt: "Kısa açıklama.",
  series: "architecture-notes",
  authorRef: "duosis-muhendislik-ekibi",
  publishedAt: "2026-01-15",
  seo: { title: "Test", description: "Test", noindex: true },
};

// ------------------------------------------------------------------ şema

describe("insightSchema", () => {
  it("geçerli kaydı kabul eder", () => {
    expect(insightSchema.safeParse(validInsight).success).toBe(true);
  });

  it("kapalı küme dışı seriyi REDDEDER", () => {
    const result = insightSchema.safeParse({ ...validInsight, series: "Mimari Notları" });
    expect(result.success).toBe(false);
  });

  /**
   * ETİKET MODELİ S13'TE DEĞİŞTİ.
   *
   * Kayıtta artık bir SLUG değil, dilden bağımsız bir ANAHTAR tutuluyor
   * (`src/config/tags.ts`). Slug ve görünen etiket dile göre türetilir; bu
   * sayede İngilizce rotalarda `/en/insights/tag/veri-akisi/` gibi Türkçe
   * adresler oluşmuyor. Şema kapalı bir `enum` olduğu için serbest metin,
   * Türkçe karakter veya boşluk zaten giremez.
   */
  it("kapalı küme dışı etiketi REDDEDER", () => {
    for (const tag of [
      "Kurumsal Mimari",
      "veri akışı",
      "TAG",
      "veri_akisi",
      "-bas",
      "son-",
      // Eski Türkçe slug'lar artık ANAHTAR değil; kayda giremezler.
      "veri-akisi",
      "entegrasyon",
      "kurumsal-mimari",
    ]) {
      const result = insightSchema.safeParse({ ...validInsight, tags: [tag] });
      expect(result.success, `"${tag}" kabul edilmemeliydi`).toBe(false);
    }
  });

  it("geçerli etiket ANAHTARLARINI kabul eder", () => {
    const result = insightSchema.safeParse({
      ...validInsight,
      tags: ["observability", "data-flow", "aiops"],
    });
    expect(result.success).toBe(true);
  });

  /**
   * Tarihsiz yayınlanmış kayıt: RSS sıralaması, `datePublished` alanı ve
   * "gelecek tarihli içerik gizlenir" kuralının tamamı bu alana dayanıyor.
   */
  it("publishedAt olmadan published kaydı REDDEDER", () => {
    const { publishedAt: _p, ...withoutDate } = validInsight;
    expect(insightSchema.safeParse(withoutDate).success).toBe(false);
  });

  it("taslak kayıt tarihsiz olabilir", () => {
    const { publishedAt: _p, ...withoutDate } = validInsight;
    expect(insightSchema.safeParse({ ...withoutDate, status: "draft" }).success).toBe(true);
  });

  it("updatedAt yayın tarihinden ÖNCE olamaz", () => {
    const result = insightSchema.safeParse({ ...validInsight, updatedAt: "2026-01-01" });
    expect(result.success).toBe(false);
  });

  it("updatedAt yayın tarihiyle aynı veya sonra olabilir", () => {
    expect(insightSchema.safeParse({ ...validInsight, updatedAt: "2026-01-15" }).success).toBe(
      true
    );
    expect(insightSchema.safeParse({ ...validInsight, updatedAt: "2026-02-01" }).success).toBe(
      true
    );
  });

  it("geçersiz kaynak URL'sini REDDEDER", () => {
    const result = insightSchema.safeParse({
      ...validInsight,
      sources: [{ label: "Doküman", url: "kafka.apache.org" }],
    });
    expect(result.success).toBe(false);
  });

  it("şema dışı alanı REDDEDER (strict)", () => {
    expect(insightSchema.safeParse({ ...validInsight, readingTime: 7 }).success).toBe(false);
  });
});

// ----------------------------------------------------------------- seriler

describe("seri tablosu", () => {
  it("kapalı kümedeki her seri için tanım var", () => {
    expect(SERIES).toHaveLength(INSIGHT_SERIES.length);
    expect(SERIES.map((s) => s.key).sort()).toEqual([...INSIGHT_SERIES].sort());
  });

  it("her serinin iki dilde etiketi ve slug'ı var", () => {
    for (const key of INSIGHT_SERIES) {
      for (const locale of ["tr", "en"] as const) {
        expect(seriesLabel(key, locale).length, `${key}/${locale}`).toBeGreaterThan(0);
        expect(seriesSlug(key, locale)).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      }
    }
  });

  it("slug -> anahtar dönüşümü tersine çevrilebilir", () => {
    for (const key of INSIGHT_SERIES) {
      for (const locale of ["tr", "en"] as const) {
        expect(seriesFromSlug(seriesSlug(key, locale), locale)).toBe(key);
      }
    }
  });

  /** Bilinmeyen slug en yakın seriye DÜŞMEZ; çağıran taraf 404 üretir. */
  it("bilinmeyen slug undefined döner", () => {
    expect(seriesFromSlug("bilinmeyen-seri", "tr")).toBeUndefined();
    expect(seriesFromSlug("", "tr")).toBeUndefined();
    // TR slug'ı EN tarafında çözülmez: diller karışmaz.
    expect(seriesFromSlug("mimari-notlari", "en")).toBeUndefined();
  });

  it("slug'lar bir dil içinde benzersiz", () => {
    for (const locale of ["tr", "en"] as const) {
      const slugs = SERIES.map((s) => s.slug[locale]);
      expect(new Set(slugs).size, `${locale} slug çakışması`).toBe(slugs.length);
    }
  });
});

// ------------------------------------------------------------ okuma süresi

describe("okuma süresi deterministik", () => {
  it("aynı girdi her çağrıda aynı sonucu verir", () => {
    const text = "kelime ".repeat(500);
    const first = readingMinutes(text);
    for (let i = 0; i < 5; i += 1) {
      expect(readingMinutes(text)).toBe(first);
    }
  });

  it("kelime hızına göre hesaplanır", () => {
    expect(countWords("bir iki üç")).toBe(3);
    expect(readingMinutes("kelime ".repeat(WORDS_PER_MINUTE))).toBe(1);
    expect(readingMinutes("kelime ".repeat(WORDS_PER_MINUTE * 4))).toBe(4);
  });

  it("hiç kelime yoksa bile en az 1 dakika döner", () => {
    // "0 dakika" bir ölçüm değil, hata gibi okunur.
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes("   \n\n  ")).toBe(1);
  });

  /** Kod satır satır okunmaz, taranır: kelime gibi saymak süreyi şişirir. */
  it("kod blokları sayıma girmez", () => {
    const withCode = ["metin metin", "```", "const a = 1;".repeat(200), "```"].join("\n");
    expect(countWords(withCode)).toBe(2);
  });

  it("satır içi kod ve bağlantı hedefi sayıma girmez", () => {
    expect(countWords("bir `kod` iki")).toBe(2);
    // Bağlantı METNİ sayılır, hedefi sayılmaz.
    expect(countWords("[bağlantı metni](https://example.com/uzun/yol)")).toBe(2);
    expect(countWords("çıplak https://example.com/a/b/c adres")).toBe(2);
  });

  it("markdown başlık işaretleri sayıma girmez", () => {
    expect(countWords("## Başlık burada")).toBe(2);
    expect(countWords("> alıntı satırı")).toBe(2);
  });
});

// ------------------------------------------------------------- tarih biçimi

describe("tarih biçimlendirme", () => {
  const date = new Date("2026-09-10T00:00:00.000Z");

  it("TR ve EN farklı ay adı üretir", () => {
    expect(formatDate(date, "tr")).toBe("10 Eylül 2026");
    expect(formatDate(date, "en")).toBe("10 September 2026");
  });

  it("makine biçimi locale'den etkilenmez", () => {
    expect(isoDate(date)).toBe("2026-09-10");
  });

  it("RSS pubDate RFC 822 biçiminde", () => {
    expect(rfc822(date)).toBe("Thu, 10 Sep 2026 00:00:00 GMT");
  });

  /**
   * UTC alanları okunur: build makinesinin saat dilimi yayın tarihini bir gün
   * kaydıramaz. (Yerel saat kullanılsaydı UTC-5'te bu tarih 9 Eylül olurdu.)
   */
  it("gece yarısı UTC tarihinde gün kaymaz", () => {
    expect(formatDate(new Date("2026-01-01T00:00:00.000Z"), "tr")).toBe("1 Ocak 2026");
    expect(formatDate(new Date("2026-12-31T23:59:59.000Z"), "tr")).toBe("31 Aralık 2026");
  });

  it("on iki ayın tamamı iki dilde tanımlı", () => {
    for (let month = 0; month < 12; month += 1) {
      const d = new Date(Date.UTC(2026, month, 15));
      expect(formatDate(d, "tr")).not.toContain("undefined");
      expect(formatDate(d, "en")).not.toContain("undefined");
    }
  });
});

// ------------------------------------------------------------ tarih filtresi

describe("ileri tarihli içerik public çıktıya girmez", () => {
  const now = new Date("2026-09-10T12:00:00.000Z");

  it("geçmiş tarihli kayıt görünür", () => {
    expect(isPublishedByDate(new Date("2026-09-09T00:00:00Z"), PUBLIC, now)).toBe(true);
  });

  it("aynı ana kadar yayınlanmış kayıt görünür", () => {
    expect(isPublishedByDate(now, PUBLIC, now)).toBe(true);
  });

  it("ileri tarihli kayıt GÖRÜNMEZ", () => {
    expect(isPublishedByDate(new Date("2026-09-11T00:00:00Z"), PUBLIC, now)).toBe(false);
    expect(isPublishedByDate(new Date("2030-01-01T00:00:00Z"), PUBLIC, now)).toBe(false);
  });

  it("tarihsiz kayıt public modda GÖRÜNMEZ", () => {
    expect(isPublishedByDate(undefined, PUBLIC, now)).toBe(false);
  });

  it("preview modda ileri tarihli kayıt görülebilir", () => {
    expect(isPublishedByDate(new Date("2030-01-01T00:00:00Z"), PREVIEW, now)).toBe(true);
  });
});

// ---------------------------------------------------------------- XML kaçışı

describe("RSS XML kaçışı", () => {
  it("beş özel karakteri de kaçırır", () => {
    expect(escapeXml("a & b")).toBe("a &amp; b");
    expect(escapeXml("<tag>")).toBe("&lt;tag&gt;");
    expect(escapeXml(`"alıntı"`)).toBe("&quot;alıntı&quot;");
    expect(escapeXml("it's")).toBe("it&apos;s");
  });

  /**
   * `&` ilk sırada kaçırılmalı. Sonra kaçırılsaydı önce üretilen `&lt;`
   * dizisi ikinci kez kaçırılıp `&amp;lt;` olurdu.
   */
  it("çift kaçış üretmez", () => {
    expect(escapeXml("<a & b>")).toBe("&lt;a &amp; b&gt;");
    expect(escapeXml("&amp;")).toBe("&amp;amp;");
  });

  it("Türkçe karakterlere dokunmaz", () => {
    expect(escapeXml("Çağrı öğütü İş")).toBe("Çağrı öğütü İş");
  });
});

// ------------------------------------------------------- gerçek içerik verisi

describe("yayındaki içerik verisi", () => {
  function files(locale: "tr" | "en"): string[] {
    const dir = `${ROOT}src/content/insights/${locale}`;
    return readdirSync(dir).filter((f) => f.endsWith(".md"));
  }

  function body(locale: "tr" | "en", file: string): string {
    const text = readFileSync(`${ROOT}src/content/insights/${locale}/${file}`, "utf8");
    return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  }

  it("her iki dilde de yayınlanmış içerik var", () => {
    expect(files("tr").length).toBeGreaterThanOrEqual(3);
    expect(files("en").length).toBeGreaterThanOrEqual(1);
  });

  /**
   * TEK H1 KURALI. Sayfa başlığı şablondan gelir; gövdede `#` kullanılırsa
   * belgede iki H1 olur ve başlık hiyerarşisi bozulur.
   */
  it("hiçbir gövdede h1 (#) kullanılmıyor", () => {
    for (const locale of ["tr", "en"] as const) {
      for (const file of files(locale)) {
        const lines = body(locale, file).split(/\r?\n/);
        let inCode = false;
        for (const line of lines) {
          if (/^\s*```/.test(line)) inCode = !inCode;
          if (inCode) continue;
          expect(/^#\s/.test(line), `${locale}/${file}: gövdede h1 var`).toBe(false);
        }
      }
    }
  });

  it("tam yazılar sözleşmedeki uzunluk aralığında", () => {
    // Kısa notlar hariç: 900+ kelimelik "tam yazı" kapsamı denetlenir.
    const longForm = files("tr")
      .map((file) => ({ file, words: countWords(body("tr", file)) }))
      .filter((entry) => entry.words > 600);

    expect(longForm.length, "en az üç tam TR yazı olmalı").toBeGreaterThanOrEqual(3);
    for (const entry of longForm) {
      expect(entry.words, `${entry.file} çok uzun`).toBeLessThanOrEqual(1400);
    }
  });
});
