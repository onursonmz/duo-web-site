import { describe, expect, it } from "vitest";
import { proofSchema, solutionSchema, technologySchema } from "@lib/content/schemas";
import { seoSchema, slugSchema, translationKeySchema } from "@lib/content/schema";

/**
 * NEGATİF ŞEMA TESTLERİ.
 * Geçersiz frontmatter, geçersiz enum ve şema dışı alan REDDEDİLMELİDİR.
 */

const validSolution = {
  translationKey: "observability-apm",
  locale: "tr",
  slug: "operasyonel-gorunurluk",
  status: "published",
  order: 1,
  category: "core",
  title: "Operasyonel görünürlük",
  summary: "Özet",
  problem: "Problem",
  approach: "Yaklaşım",
  benefits: ["Fayda"],
  cta: { labelKey: "cta.contactUs", href: "/iletisim/" },
  seo: { title: "Başlık", description: "Açıklama" },
};

describe("solutionSchema", () => {
  it("geçerli kaydı kabul eder", () => {
    expect(solutionSchema.safeParse(validSolution).success).toBe(true);
  });

  it("geçersiz status enum'unu REDDEDER", () => {
    const r = solutionSchema.safeParse({ ...validSolution, status: "yayinda" });
    expect(r.success).toBe(false);
  });

  it("geçersiz locale enum'unu REDDEDER", () => {
    const r = solutionSchema.safeParse({ ...validSolution, locale: "de" });
    expect(r.success).toBe(false);
  });

  it("geçersiz category enum'unu REDDEDER", () => {
    const r = solutionSchema.safeParse({ ...validSolution, category: "sektor" });
    expect(r.success).toBe(false);
  });

  it("şema dışı alanı REDDEDER (strict)", () => {
    const r = solutionSchema.safeParse({ ...validSolution, bilinmeyenAlan: "x" });
    expect(r.success).toBe(false);
  });

  it("zorunlu alan eksikse REDDEDER", () => {
    const { summary: _summary, ...withoutSummary } = validSolution;
    expect(solutionSchema.safeParse(withoutSummary).success).toBe(false);
  });

  it("boş benefits dizisini REDDEDER", () => {
    const r = solutionSchema.safeParse({ ...validSolution, benefits: [] });
    expect(r.success).toBe(false);
  });

  it("ADR-009 dışındaki order değerini REDDEDER (1-8)", () => {
    expect(solutionSchema.safeParse({ ...validSolution, order: 9 }).success).toBe(false);
    expect(solutionSchema.safeParse({ ...validSolution, order: 0 }).success).toBe(false);
  });
});

describe("technologySchema", () => {
  const valid = {
    id: "zabbix",
    name: "Zabbix",
    group: "observability",
    lifecycle: "pending",
    decisionNeeded: false,
    logoPermission: "unknown",
    licenseModel: "not-assessed",
    source: "site+plan+brief+sunum(S12,S16)",
    solutionArea: "observability-apm",
  };

  it("geçerli kaydı kabul eder", () => {
    const r = technologySchema.safeParse(valid);
    expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
  });

  it("geçersiz logoPermission enum'unu REDDEDER", () => {
    // S00-R2 A.4: yalnızca unknown | allowed | denied geçerlidir.
    expect(
      technologySchema.safeParse({ ...valid, logoPermission: "n/a-open-source" }).success
    ).toBe(false);
  });

  it("geçersiz group enum'unu REDDEDER", () => {
    expect(technologySchema.safeParse({ ...valid, group: "monitoring" }).success).toBe(false);
  });

  it("geçersiz lifecycle enum'unu REDDEDER", () => {
    expect(technologySchema.safeParse({ ...valid, lifecycle: "unknown" }).success).toBe(false);
    expect(technologySchema.safeParse({ ...valid, lifecycle: true }).success).toBe(false);
  });

  it("geçersiz licenseModel enum'unu REDDEDER", () => {
    expect(technologySchema.safeParse({ ...valid, licenseModel: "mit" }).success).toBe(false);
  });

  it("solutionArea null olabilir ama tanımsız olamaz", () => {
    expect(technologySchema.safeParse({ ...valid, solutionArea: null }).success).toBe(true);
    const { solutionArea: _drop, ...without } = valid;
    expect(technologySchema.safeParse(without).success).toBe(false);
  });

  it("source alanı zorunlu (S00 kaynak izi kaybolmaz)", () => {
    const { source: _drop, ...without } = valid;
    expect(technologySchema.safeParse(without).success).toBe(false);
  });

  it("geçersiz officialUrl'yi REDDEDER", () => {
    expect(technologySchema.safeParse({ ...valid, officialUrl: "zabbix.com" }).success).toBe(false);
  });

  it("şema dışı alanı REDDEDER (strict)", () => {
    expect(technologySchema.safeParse({ ...valid, active: true }).success).toBe(false);
  });
});

describe("proofSchema", () => {
  const valid = {
    translationKey: "anonymous-public-bank",
    locale: "tr",
    status: "published",
    // S10 §7: kanıt türü ZORUNLU — müşteri kanıtı mı, kendi ölçümümüz mü.
    kind: "customer-reference",
    logoPermission: "unknown",
    verificationStatus: "pending",
  };

  it("geçerli kaydı kabul eder", () => {
    expect(proofSchema.safeParse(valid).success).toBe(true);
  });

  it("tür alanı olmadan REDDEDER", () => {
    const { kind: _kind, ...withoutKind } = valid;
    expect(proofSchema.safeParse(withoutKind).success).toBe(false);
  });

  it("geçersiz verificationStatus enum'unu REDDEDER", () => {
    expect(proofSchema.safeParse({ ...valid, verificationStatus: "onayli" }).success).toBe(false);
  });
});

describe("slugSchema — Türkçe başlık / ASCII slug ayrımı", () => {
  it("ASCII kebab-case slug'ı kabul eder", () => {
    expect(slugSchema.safeParse("operasyonel-gorunurluk").success).toBe(true);
    expect(slugSchema.safeParse("bt-hizmet-yonetimi").success).toBe(true);
  });

  it("Türkçe karakter içeren slug'ı REDDEDER", () => {
    for (const bad of [
      "operasyonel-görünürlük",
      "bt-hizmet-yönetimi",
      "çözümler",
      "işletme",
      "ağ-izleme",
    ]) {
      expect(slugSchema.safeParse(bad).success, `"${bad}" reddedilmeliydi`).toBe(false);
    }
  });

  it("büyük harf, boşluk ve alt çizgiyi REDDEDER", () => {
    for (const bad of ["Operasyonel", "iki kelime", "alt_cizgi", "-bastaTire", "sondaTire-"]) {
      expect(slugSchema.safeParse(bad).success, `"${bad}" reddedilmeliydi`).toBe(false);
    }
  });

  it("Türkçe başlık serbest, slug ASCII kalır", () => {
    // Aynı kayıtta başlık Türkçe karakter içerebilir; slug içeremez.
    const r = solutionSchema.safeParse({
      ...validSolution,
      title: "Operasyonel görünürlük ve uygulama performansı",
      slug: "operasyonel-gorunurluk",
    });
    expect(r.success).toBe(true);
  });
});

describe("translationKeySchema", () => {
  it("ASCII kebab-case kabul eder", () => {
    expect(translationKeySchema.safeParse("observability-apm").success).toBe(true);
  });

  it("Türkçe karakter ve boşluğu REDDEDER", () => {
    expect(translationKeySchema.safeParse("gözlemlenebilirlik").success).toBe(false);
    expect(translationKeySchema.safeParse("iki kelime").success).toBe(false);
  });
});

describe("seoSchema", () => {
  it("şema dışı alanı REDDEDER", () => {
    expect(seoSchema.safeParse({ title: "T", description: "D", keywords: "x" }).success).toBe(
      false
    );
  });

  it("aşırı uzun title'ı REDDEDER (70 karakter sınırı)", () => {
    expect(seoSchema.safeParse({ title: "x".repeat(71), description: "D" }).success).toBe(false);
  });

  it("noindex varsayılanı false", () => {
    const r = seoSchema.parse({ title: "T", description: "D" });
    expect(r.noindex).toBe(false);
  });
});

describe("solutionSchema — sözleşme alanları", () => {
  it("aiRole isteğe bağlı ve strict", () => {
    const withAi = {
      ...validSolution,
      aiRole: { detect: "a", understand: "b", act: "c" },
    };
    expect(solutionSchema.safeParse(withAi).success).toBe(true);

    // eksik alan
    expect(
      solutionSchema.safeParse({ ...validSolution, aiRole: { detect: "a", understand: "b" } })
        .success
    ).toBe(false);
    // fazla alan
    expect(
      solutionSchema.safeParse({
        ...validSolution,
        aiRole: { detect: "a", understand: "b", act: "c", extra: "x" },
      }).success
    ).toBe(false);
  });

  it("scenario isteğe bağlı ve strict", () => {
    const withScenario = {
      ...validSolution,
      scenario: { title: "t", context: "c", flow: ["1"], result: "r" },
    };
    expect(solutionSchema.safeParse(withScenario).success).toBe(true);

    // boş flow
    expect(
      solutionSchema.safeParse({
        ...validSolution,
        scenario: { title: "t", context: "c", flow: [], result: "r" },
      }).success
    ).toBe(false);
  });

  it("aiRole ve scenario yokken kayıt geçerli (doğrulanmamış veri uydurulmaz)", () => {
    expect(solutionSchema.safeParse(validSolution).success).toBe(true);
  });

  it("cta.labelKey KAPALI kümeden olmalı", () => {
    expect(
      solutionSchema.safeParse({
        ...validSolution,
        cta: { labelKey: "cta.contactUs", href: "/x/" },
      }).success
    ).toBe(true);

    for (const bad of ["cta.uydurma", "nav.home", "rastgele"]) {
      expect(
        solutionSchema.safeParse({ ...validSolution, cta: { labelKey: bad, href: "/x/" } }).success,
        `"${bad}" reddedilmeliydi`
      ).toBe(false);
    }
  });
});
