import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { serviceSchema } from "@lib/content/schemas";
import { SERVICE_TOPICS } from "@lib/content/schema";
import { contactPathForTopic } from "@lib/i18n/routes";

/**
 * HİZMET MODELİ TESTLERİ (S10 §2, §8).
 *
 * Kapalı küme üç yerde birden iş görür: şema, sıra ve CTA allowlist'i.
 * Bu testler üçünün de AYNI listeden beslendiğini ve listenin dışına
 * çıkılamadığını doğrular.
 */

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** Bir markdown dosyasının frontmatter'ını kaba biçimde okur (yalnızca test için). */
function readFrontmatter(path: string): Record<string, unknown> {
  const text = readFileSync(path, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (match === null) throw new Error(`frontmatter yok: ${path}`);
  const out: Record<string, unknown> = {};
  for (const line of (match[1] ?? "").split(/\r?\n/)) {
    const kv = /^([a-zA-Z]+):\s*(.*)$/.exec(line);
    const key = kv?.[1];
    const value = kv?.[2];
    if (key !== undefined && value !== undefined && value !== "" && !value.startsWith(">")) {
      out[key] = value;
    }
  }
  return out;
}

function serviceFiles(locale: "tr" | "en"): string[] {
  const dir = `${ROOT}src/content/services/${locale}`;
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => `${dir}/${f}`);
}

describe("hizmet kümesi kapalıdır", () => {
  it("tam olarak beş hizmet tanımlı", () => {
    expect(SERVICE_TOPICS).toHaveLength(5);
  });

  it("sözleşmedeki anlatı sırasını taşır", () => {
    expect([...SERVICE_TOPICS]).toEqual([
      "consulting",
      "support",
      "training",
      "managed-services",
      "outsourcing",
    ]);
  });

  it("şema küme dışı bir translationKey'i reddeder", () => {
    const base = {
      translationKey: "danismanlik-plus",
      locale: "tr",
      slug: "danismanlik-plus",
      status: "published",
      order: 1,
      title: "Uydurma hizmet",
      summary: "Test",
      whenNeeded: ["a"],
      offer: ["b"],
      howWeWork: ["c"],
      outcomes: ["d"],
      seo: { title: "T", description: "D", noindex: true },
    };
    expect(serviceSchema.safeParse(base).success).toBe(false);
  });

  it("şema, order ile kapalı küme sırası ayrışırsa reddeder", () => {
    const wrongOrder = {
      translationKey: "outsourcing",
      locale: "tr",
      slug: "dis-kaynak",
      status: "published",
      // outsourcing kümede 5. sırada; 2 verilmesi build'i kırmalı.
      order: 2,
      title: "Dış kaynak",
      summary: "Test",
      whenNeeded: ["a"],
      offer: ["b"],
      howWeWork: ["c"],
      outcomes: ["d"],
      seo: { title: "T", description: "D", noindex: true },
    };
    const result = serviceSchema.safeParse(wrongOrder);
    expect(result.success).toBe(false);
  });

  it("dört sorudan biri boşsa kayıt reddedilir", () => {
    for (const field of ["whenNeeded", "offer", "howWeWork", "outcomes"] as const) {
      const record: Record<string, unknown> = {
        translationKey: "consulting",
        locale: "tr",
        slug: "danismanlik",
        status: "published",
        order: 1,
        title: "Danışmanlık",
        summary: "Test",
        whenNeeded: ["a"],
        offer: ["b"],
        howWeWork: ["c"],
        outcomes: ["d"],
        seo: { title: "T", description: "D", noindex: true },
      };
      record[field] = [];
      expect(serviceSchema.safeParse(record).success, `${field} boş geçmemeli`).toBe(false);
    }
  });
});

describe("içerik kayıtları kümeyle birebir örtüşüyor", () => {
  for (const locale of ["tr", "en"] as const) {
    it(`${locale}: beş kayıt ve beş farklı translationKey`, () => {
      const files = serviceFiles(locale);
      expect(files).toHaveLength(SERVICE_TOPICS.length);

      const keys = files.map((f) => readFrontmatter(f).translationKey);
      expect([...keys].sort()).toEqual([...SERVICE_TOPICS].sort());
    });

    it(`${locale}: order alanı kapalı küme sırasıyla aynı`, () => {
      for (const file of serviceFiles(locale)) {
        const fm = readFrontmatter(file);
        const expected = SERVICE_TOPICS.indexOf(fm.translationKey as never) + 1;
        expect(Number(fm.order), `${file}`).toBe(expected);
      }
    });
  }
});

describe("iletişim CTA'sı kapalı allowlist kullanır", () => {
  it("kümedeki her hizmet için topic parametresi eklenir", () => {
    for (const topic of SERVICE_TOPICS) {
      expect(contactPathForTopic("tr", topic, SERVICE_TOPICS)).toBe(`/iletisim/?topic=${topic}`);
      expect(contactPathForTopic("en", topic, SERVICE_TOPICS)).toBe(`/en/contact/?topic=${topic}`);
    }
  });

  /**
   * NEGATİF TEST — allowlist dışı hiçbir değer taşınmaz.
   * Serbest metin, enjeksiyon denemesi ve çözüm slug'ı da dahil: hizmet
   * CTA'sı YALNIZCA hizmet kümesini taşır.
   */
  it("küme dışı değer parametre olarak EKLENMEZ", () => {
    const rejected = [
      "danismanlik",
      "operasyonel-gorunurluk",
      "consulting ",
      "CONSULTING",
      "<script>alert(1)</script>",
      "consulting&utm_source=x",
      "../../etc/passwd",
      "",
      "support;consulting",
    ];
    for (const topic of rejected) {
      expect(contactPathForTopic("tr", topic, SERVICE_TOPICS), topic).toBe("/iletisim/");
      expect(contactPathForTopic("en", topic, SERVICE_TOPICS), topic).toBe("/en/contact/");
    }
  });

  it("boş allowlist ile hiçbir değer geçmez", () => {
    for (const topic of SERVICE_TOPICS) {
      expect(contactPathForTopic("tr", topic, [])).toBe("/iletisim/");
    }
  });
});
