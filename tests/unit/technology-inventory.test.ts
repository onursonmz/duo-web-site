import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { technologySchema } from "@lib/content/schemas";
import { isVisibleTechnology, PREVIEW, PUBLIC } from "@lib/content/selectors";
import { TECHNOLOGY_LIFECYCLES, type TechnologyLifecycle } from "@lib/content/schema";

/**
 * S00 ENVANTERİ ↔ S02 İÇERİK VERİSİ PARİTE TESTLERİ.
 *
 * S00 normalize envanteri (`discovery/technology-inventory.csv`) kaynak kayıttır.
 * İçerik verisi ondan türetilir; sessiz veri kaybı kabul edilmez.
 */

/**
 * ADR-011 ile metin olarak yayınlanması onaylanan kayıtlar.
 * Bu liste TEK doğruluk kaynağıdır: envanterdeki her `active` kayıt burada
 * bulunmalı, buradaki her kayıt `active` olmalıdır.
 */
const ADR011_APPROVED = [
  "airflow",
  "ansible",
  "ardoq",
  "awx",
  "confluent",
  "cyclops",
  "datadog",
  "device42",
  "elastic",
  "foglight",
  "freshservice",
  "instana",
  "n8n",
  "nifi",
  "opentelemetry",
  "opentext-cms",
  "opentext-oo",
  "opentext-sa",
  "quest",
  "smax",
  "zabbix",
];

/** ADR-011 ile adı kesinleştirilen kayıt (aynı ürün iki kez temsil edilmez). */
const ADR011_RENAMED = { id: "quest", from: "Quest Software", to: "Quest Change Auditor" };

const root = new URL("../../", import.meta.url);
const read = (p: string) => readFileSync(fileURLToPath(new URL(p, root)), "utf8");

/** Basit CSV ayrıştırıcı (tırnaklı alan ve gömülü virgül destekli). */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const body = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (quoted) {
      if (ch === '"') {
        if (body[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const header = rows.shift();
  if (header === undefined) return [];
  return rows
    .filter((r) => r.some((c) => c.trim() !== ""))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const s00 = parseCsv(read("discovery/technology-inventory.csv"));
const s02 = JSON.parse(read("src/content/technologies/technologies.json")) as Record<
  string,
  unknown
>[];
const mapping = JSON.parse(read("src/content/technologies/MAPPING.json")) as {
  lifecycleMapping: Record<string, string>;
  counts: { s00: number; s02: number };
  lifecycleTransforms: { id: string; s00Active: string; s02Lifecycle: string }[];
};

const s00Ids = s00.map((r) => r["id"] ?? "");
const s02Ids = s02.map((r) => String(r["id"]));

describe("S00 ↔ S02 teknoloji paritesi", () => {
  it("S00 envanteri 35 kayıt içeriyor", () => {
    expect(s00).toHaveLength(35);
  });

  it("S02 içerik verisi de 35 kayıt içeriyor", () => {
    expect(s02).toHaveLength(35);
  });

  it("ID kümeleri BİREBİR aynı — eksik veya fazla kayıt yok", () => {
    const missing = s00Ids.filter((id) => !s02Ids.includes(id));
    const extra = s02Ids.filter((id) => !s00Ids.includes(id));

    expect(missing, `S02'de eksik: ${missing.join(", ")}`).toEqual([]);
    expect(extra, `S02'de fazla: ${extra.join(", ")}`).toEqual([]);
  });

  it("ID'ler benzersiz", () => {
    expect(new Set(s02Ids).size).toBe(s02Ids.length);
  });

  it("MAPPING.json sayımları gerçek dosyalarla tutarlı", () => {
    expect(mapping.counts.s00).toBe(s00.length);
    expect(mapping.counts.s02).toBe(s02.length);
  });
});

describe("alan korunumu — sessiz veri kaybı yok", () => {
  const byId = new Map(s02.map((r) => [String(r["id"]), r]));

  it("her kayıtta zorunlu alanlar mevcut", () => {
    for (const record of s02) {
      for (const field of [
        "id",
        "name",
        "group",
        "lifecycle",
        "decisionNeeded",
        "logoPermission",
        "licenseModel",
        "source",
        "solutionArea",
        "note",
      ]) {
        expect(record, `${String(record["id"])} -> ${field}`).toHaveProperty(field);
      }
    }
  });

  /**
   * ADR-011 KONTROLLÜ SAPMA.
   *
   * Parite artık "S00 ile birebir eşitlik" değil: yalnızca ADR-011 listesindeki
   * kayıtlar `decisionNeeded: false` yapılmış olabilir. Liste DIŞINDAKİ her
   * kayıt S00 değerini AYNEN korur — sessiz bir onay imkânsızdır.
   */
  it("decisionNeeded: ADR-011 dışındaki kayıtlar S00 değerini koruyor", () => {
    for (const src of s00) {
      const id = src["id"] ?? "";
      if (ADR011_APPROVED.includes(id)) continue;
      const expected = src["decisionNeeded"] === "yes";
      expect(byId.get(id)?.["decisionNeeded"], `${id} S00 değerinden saptı`).toBe(expected);
    }
  });

  it("decisionNeeded: ADR-011 listesindeki her kayıt false", () => {
    for (const id of ADR011_APPROVED) {
      expect(byId.get(id)?.["decisionNeeded"], `${id}`).toBe(false);
    }
  });

  it("ad paritesi: yalnızca ADR-011 ile kesinleştirilen kayıt farklı", () => {
    for (const src of s00) {
      const id = src["id"] ?? "";
      if (id === ADR011_RENAMED.id) continue;
      expect(byId.get(id)?.["name"], `${id} adı değişmiş`).toBe(src["officialName"]);
    }
  });

  it("logoPermission S00 ile birebir aynı", () => {
    for (const src of s00) {
      const id = src["id"] ?? "";
      expect(byId.get(id)?.["logoPermission"], `${id} logoPermission`).toBe(src["logoPermission"]);
    }
  });

  it("licenseModel S00 ile birebir aynı", () => {
    for (const src of s00) {
      const id = src["id"] ?? "";
      expect(byId.get(id)?.["licenseModel"], `${id} licenseModel`).toBe(src["licenseModel"]);
    }
  });

  it("source (kaynak izi) S00 ile birebir aynı", () => {
    for (const src of s00) {
      const id = src["id"] ?? "";
      expect(byId.get(id)?.["source"], `${id} source`).toBe(src["source"]);
    }
  });

  it("officialUrl S00'da doluysa korunmuş", () => {
    for (const src of s00) {
      const id = src["id"] ?? "";
      const url = (src["officialUrl"] ?? "").trim();
      if (url !== "") {
        expect(byId.get(id)?.["officialUrl"], `${id} officialUrl`).toBe(url);
      }
    }
  });

  it("note (açıklama) boş bırakılmamış", () => {
    for (const record of s02) {
      expect(String(record["note"] ?? "").length, `${String(record["id"])} note`).toBeGreaterThan(
        0
      );
    }
  });

  it("Grafana decisionNeeded S00 kaynağıyla uyumlu (false)", () => {
    const src = s00.find((r) => r["id"] === "grafana");
    expect(src?.["decisionNeeded"]).toBe("no");
    expect(byId.get("grafana")?.["decisionNeeded"]).toBe(false);
  });
});

describe("lifecycle dönüşümü — sessizce active yapılmadı", () => {
  it("S00'da hiçbir kayıt active:true değil", () => {
    expect(s00.every((r) => r["active"] === "unknown")).toBe(true);
  });

  it("ADR-011 DIŞINDAKİ her kayıt hâlâ pending", () => {
    for (const src of s00) {
      const id = src["id"] ?? "";
      if (ADR011_APPROVED.includes(id)) continue;
      expect(byIdLifecycle(id), `${id} sessizce açılmış`).toBe("pending");
    }
  });

  it("ACTIVE kayıt kümesi ADR-011 listesiyle BİREBİR aynı", () => {
    const active = s02.filter((r) => r["lifecycle"] === "active").map((r) => String(r["id"]));
    expect(active.sort()).toEqual([...ADR011_APPROVED].sort());
    expect(active).toHaveLength(21);
  });

  it("hiçbir ACTIVE kayıt karar bekliyor olamaz (şema + veri)", () => {
    for (const record of s02) {
      if (record["lifecycle"] !== "active") continue;
      expect(record["decisionNeeded"], `${String(record["id"])}`).toBe(false);
    }
  });

  it("LOGO İZNİ hiçbir kayıtta gevşemedi", () => {
    for (const record of s02) {
      expect(record["logoPermission"], `${String(record["id"])}`).toBe("unknown");
    }
  });

  it("quest kaydı ürüne KESİNLEŞTİRİLDİ, ikinci kayıt açılmadı", () => {
    const quest = byId.get(ADR011_RENAMED.id);
    expect(quest?.["name"]).toBe(ADR011_RENAMED.to);
    // Aynı ürünü temsil eden ikinci bir kayıt olmamalı.
    const duplicates = s02.filter((r) => String(r["name"]).includes("Change Auditor"));
    expect(duplicates).toHaveLength(1);
    // S00 kaynak izi korunmuş olmalı.
    expect(String(quest?.["source"] ?? "").length).toBeGreaterThan(3);
  });

  it("lifecycle değerleri kapalı enumda", () => {
    for (const record of s02) {
      expect(TECHNOLOGY_LIFECYCLES).toContain(record["lifecycle"]);
    }
  });

  it("MAPPING.json dönüşüm kuralını belgeliyor", () => {
    expect(mapping.lifecycleMapping["unknown"]).toBe("pending");
    expect(mapping.lifecycleTransforms).toHaveLength(35);
    // MAPPING.json S02 ANINI belgeler; ADR-011 sonrası durum ADR'de yaşar.
    expect(mapping.lifecycleTransforms.every((t) => t.s02Lifecycle === "pending")).toBe(true);
  });

  function byIdLifecycle(id: string): unknown {
    return byId.get(id)?.["lifecycle"];
  }

  const byId = new Map(s02.map((r) => [String(r["id"]), r]));
});

describe("public seçici FAIL-CLOSED", () => {
  /** Gerçek kayıttan görünürlük girdisi üretir; iki alan birlikte taşınır. */
  const visibilityOf = (record: Record<string, unknown> | undefined) => ({
    lifecycle: record?.["lifecycle"] as TechnologyLifecycle,
    decisionNeeded: record?.["decisionNeeded"] as boolean,
  });

  it("pending teknoloji public'te GÖRÜNMEZ", () => {
    expect(isVisibleTechnology({ lifecycle: "pending", decisionNeeded: false }, PUBLIC)).toBe(
      false
    );
  });

  it("inactive teknoloji public'te GÖRÜNMEZ", () => {
    expect(isVisibleTechnology({ lifecycle: "inactive", decisionNeeded: false }, PUBLIC)).toBe(
      false
    );
  });

  it("yalnızca active + decisionNeeded:false public'te görünür", () => {
    expect(isVisibleTechnology({ lifecycle: "active", decisionNeeded: false }, PUBLIC)).toBe(true);
    expect(isVisibleTechnology({ lifecycle: "active", decisionNeeded: true }, PUBLIC)).toBe(false);
  });

  it("preview modda pending görünür, inactive görünmez", () => {
    expect(isVisibleTechnology({ lifecycle: "pending", decisionNeeded: true }, PREVIEW)).toBe(true);
    expect(isVisibleTechnology({ lifecycle: "inactive", decisionNeeded: false }, PREVIEW)).toBe(
      false
    );
  });

  it("CyclOps ADR-011 ile ONAYLI ve public'te görünüyor", () => {
    const cyclops = s02.find((r) => r["id"] === "cyclops");
    expect(cyclops, "cyclops kaydı bulunmalı").toBeDefined();
    expect(isVisibleTechnology(visibilityOf(cyclops), PUBLIC)).toBe(true);
    // Logo izni yine de gevşemedi.
    expect(cyclops?.["logoPermission"]).toBe("unknown");
  });

  it("public'te görünen küme ADR-011 listesiyle BİREBİR aynı", () => {
    const visible = s02
      .filter((r) => isVisibleTechnology(visibilityOf(r), PUBLIC))
      .map((r) => String(r["id"]));
    expect(visible.sort()).toEqual([...ADR011_APPROVED].sort());
  });

  it("ADR-011 DIŞINDAKİ hiçbir kayıt public'te görünmüyor", () => {
    const leaked = s02
      .filter((r) => !ADR011_APPROVED.includes(String(r["id"])))
      .filter((r) => isVisibleTechnology(visibilityOf(r), PUBLIC))
      .map((r) => String(r["id"]));
    expect(leaked, `sızan kayıt: ${leaked.join(", ")}`).toEqual([]);
  });

  /**
   * CyclOps bu listeden ÇIKARILDI: ADR-011 ile Duosis'in kendi çözümü olarak
   * yayınlanması onaylandı. GLPI, Jira ve Tableau ONAY ALMADI ve hâlâ kapalıdır.
   */
  it("GLPI, Jira ve Tableau public'te görünmüyor", () => {
    for (const id of ["glpi", "jira", "tableau"]) {
      const record = s02.find((r) => r["id"] === id);
      expect(record, `${id} kaydı bulunmalı`).toBeDefined();
      expect(isVisibleTechnology(visibilityOf(record), PUBLIC), `${id} public'te görünmemeli`).toBe(
        false
      );
    }
  });

  it("ŞEMA çelişkili kaydı reddediyor: active + decisionNeeded:true", () => {
    const base = s02.find((r) => r["id"] === "grafana");
    expect(base, "grafana kaydı bulunmalı").toBeDefined();

    const contradictory = { ...base, lifecycle: "active", decisionNeeded: true };
    const result = technologySchema.safeParse(contradictory);
    expect(result.success, "çelişkili kayıt şemadan geçmemeli").toBe(false);

    // Aynı kayıt karar verilmiş haliyle geçmeli.
    const consistent = { ...base, lifecycle: "active", decisionNeeded: false };
    expect(technologySchema.safeParse(consistent).success).toBe(true);
  });
});

describe("şema uyumu", () => {
  it("35 kaydın tamamı technologySchema'yı geçiyor", () => {
    for (const record of s02) {
      const result = technologySchema.safeParse(record);
      expect(
        result.success,
        `${String(record["id"])}: ${JSON.stringify(result.error?.issues)}`
      ).toBe(true);
    }
  });

  it("geçersiz lifecycle değeri REDDEDİLİR", () => {
    const base = { ...s02[0] };
    expect(technologySchema.safeParse({ ...base, lifecycle: "unknown" }).success).toBe(false);
    expect(technologySchema.safeParse({ ...base, lifecycle: true }).success).toBe(false);
  });
});
