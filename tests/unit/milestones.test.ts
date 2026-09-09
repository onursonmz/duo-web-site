import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { assertUniqueMilestoneYears } from "@lib/content/selectors";

/**
 * ON YILIN KAYDI — İÇERİK GÜVENLİĞİ (S09).
 *
 * Zaman çizelgesi manifestodan türetildi. Manifesto müşteri sayısı, sektör
 * vakası ve iş ortaklığı iddiaları taşıyor; bunların HİÇBİRİ yayına giremez.
 * Bu testler kaynak izini zorunlu tutar ve yasak iddiaları tarar.
 */

const ROOT = fileURLToPath(new URL("../../src/content/milestones/", import.meta.url));

interface Record {
  file: string;
  frontmatter: string;
  body: string;
}

function loadAll(): Record[] {
  const records: Record[] = [];
  for (const locale of readdirSync(ROOT)) {
    for (const name of readdirSync(`${ROOT}${locale}`)) {
      const raw = readFileSync(`${ROOT}${locale}/${name}`, "utf8");
      const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
      if (match === null) throw new Error(`frontmatter okunamadı: ${locale}/${name}`);
      records.push({
        file: `${locale}/${name}`,
        frontmatter: match[1] ?? "",
        body: match[2] ?? "",
      });
    }
  }
  return records;
}

const records = loadAll();

const field = (frontmatter: string, key: string): string =>
  new RegExp(`^${key}:\\s*(.+)$`, "m").exec(frontmatter)?.[1]?.trim() ?? "";

/**
 * Manifestoda geçen ama YAYINLANAMAZ iddialar.
 *
 * Kısa ve başka kelimelerin içinde geçebilen terimler (ATM, bank, IBM) KELİME
 * SINIRIYLA aranır: "k-atm-an" ve "yatırım" gibi yanlış pozitifler gerçek
 * ihlalleri gürültüye boğuyordu. Kural gevşetilmedi, daha doğru arandı.
 */
const FORBIDDEN_WORDS = [/atm/i, /bank/i, /ibm/i, /partner/i];

const FORBIDDEN = [
  "müşteri",
  "customer",
  "havalimanı",
  "airport",
  "iş ortağı",
  "microfocus",
  "micro focus",
  "device42",
  "confluent",
  "datadog",
  "grafana",
  "instana",
];

describe("kilometre taşı kayıtları", () => {
  it("her kayıt kaynak izi taşıyor", () => {
    expect(records.length).toBeGreaterThanOrEqual(12);
    for (const record of records) {
      expect(
        field(record.frontmatter, "source").length,
        `${record.file} kaynaksız`
      ).toBeGreaterThan(10);
    }
  });

  it("yayınlanan her kayıt DOĞRULANMIŞ", () => {
    for (const record of records) {
      if (field(record.frontmatter, "status") !== "published") continue;
      expect(
        field(record.frontmatter, "verificationStatus"),
        `${record.file} doğrulanmadan yayında`
      ).toBe("verified");
    }
  });

  it("yayınlanan kayıtlarda yasak iddia yok", () => {
    for (const record of records) {
      if (field(record.frontmatter, "status") !== "published") continue;
      const text = `${record.frontmatter}\n${record.body}`.toLocaleLowerCase("tr");
      for (const claim of FORBIDDEN) {
        expect(text.includes(claim), `${record.file} "${claim}" içeriyor`).toBe(false);
      }
    }
  });

  it("yayınlanan kayıtlarda sayısal büyüme iddiası yok", () => {
    for (const record of records) {
      if (field(record.frontmatter, "status") !== "published") continue;
      const text = `${field(record.frontmatter, "title")} ${field(record.frontmatter, "summary")} ${record.body}`;
      // "5+", "15+", "50'den fazla" gibi kalıplar.
      expect(text, `${record.file} sayısal iddia içeriyor`).not.toMatch(/\d+\s*\+/);
      expect(text, `${record.file} sayısal iddia içeriyor`).not.toMatch(/\d+'?den fazla/i);
    }
  });

  it("her yıl için TR ve EN karşılığı var", () => {
    const byLocale = new Map<string, number[]>();
    for (const record of records) {
      if (field(record.frontmatter, "status") !== "published") continue;
      const locale = field(record.frontmatter, "locale");
      const year = Number.parseInt(field(record.frontmatter, "year"), 10);
      byLocale.set(locale, [...(byLocale.get(locale) ?? []), year]);
    }
    const tr = (byLocale.get("tr") ?? []).sort((a, b) => a - b);
    const en = (byLocale.get("en") ?? []).sort((a, b) => a - b);
    expect(tr).toEqual([2016, 2019, 2021, 2024, 2025, 2026]);
    expect(en).toEqual(tr);
  });

  it("çeviri anahtarları iki dilde eşleşiyor", () => {
    const keys = (locale: string): string[] =>
      records
        .filter(
          (record) =>
            field(record.frontmatter, "locale") === locale &&
            field(record.frontmatter, "status") === "published"
        )
        .map((record) => field(record.frontmatter, "translationKey"))
        .sort();
    expect(keys("en")).toEqual(keys("tr"));
  });
});

describe("yıl tekilliği — sessiz düşürme yok", () => {
  it("aynı yıl iki kez görünürse HATA fırlatır", () => {
    expect(() =>
      assertUniqueMilestoneYears(
        [
          { id: "tr/a", data: { year: 2024 } },
          { id: "tr/b", data: { year: 2024 } },
        ],
        "tr"
      )
    ).toThrow(/2024/);
  });

  it("tekil yıllarda sorun çıkarmaz", () => {
    expect(() =>
      assertUniqueMilestoneYears(
        [
          { id: "tr/a", data: { year: 2024 } },
          { id: "tr/b", data: { year: 2025 } },
        ],
        "tr"
      )
    ).not.toThrow();
  });
});

describe("hakkımızda içeriği", () => {
  const about = JSON.parse(
    readFileSync(
      fileURLToPath(new URL("../../src/content/about/about.json", import.meta.url)),
      "utf8"
    )
  ) as unknown[];

  it("kişisel veri alanı taşımıyor", () => {
    const text = JSON.stringify(about);
    // E-posta, telefon, kişi adı/unvan alanı veya fotoğraf yolu bulunamaz.
    expect(text).not.toMatch(/@[a-z0-9.-]+\.[a-z]{2,}/i);
    expect(text).not.toMatch(/\b\d{3}\)?\s?\d{3}\s?\d{2}\s?\d{2}\b/);
    expect(text).not.toMatch(/"(photo|image|avatar|personName|role)"\s*:/i);
    expect(text).not.toMatch(/\.(jpg|jpeg|png|webp|avif)/i);
  });

  it("yasak müşteri/partner iddiası yok", () => {
    const text = JSON.stringify(about).toLocaleLowerCase("tr");
    for (const claim of ["müşteri", "customer", "iş ortağı", "havalimanı", "airport"]) {
      expect(text.includes(claim), `hakkımızda içeriğinde "${claim}" geçiyor`).toBe(false);
    }
    for (const pattern of FORBIDDEN_WORDS) {
      expect(pattern.test(text), `hakkımızda içeriğinde ${pattern} geçiyor`).toBe(false);
    }
  });

  it("kurumsal klişe kullanılmıyor", () => {
    const text = JSON.stringify(about).toLocaleLowerCase("tr");
    for (const cliche of ["yenilikçi", "dinamik", "lider", "tutkulu", "vizyoner", "çözüm ortağı"]) {
      expect(text.includes(cliche), `"${cliche}" klişesi kullanılmış`).toBe(false);
    }
  });
});
