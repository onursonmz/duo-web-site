import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  REDIRECTS,
  activeRedirects,
  legacyRedirects,
  statusFor,
  type RedirectRule,
} from "@config/redirects";

/*
 * S00 KAPSAM DENETİMİ YALNIZCA LEGACY KURALLARA BAKAR.
 *
 * S14'te yeni sitenin KENDİ içinde taşınan rotalar eklendi (CyclOps ürün
 * ailesine geçti). Bunlar S00 envanterine ait değildir; envantere karıştırmak
 * "54 legacy adresin tamamı karşılandı" güvencesini anlamsızlaştırırdı.
 * Zincir, döngü ve kör ana sayfa denetimleri ise TÜM kurallar için geçerli.
 */
const LEGACY = legacyRedirects();

/**
 * S13 — URL MİGRASYON MATRİSİ.
 *
 * S00'da ölçülen 54 legacy URL'nin TAMAMI tek kaynakta ve her biri tek bir
 * kararla temsil edilmeli. Kör homepage yönlendirmesi, zincir ve döngü
 * YASAKTIR; bu test onları fail-closed denetler.
 */

const inventoryPath = fileURLToPath(
  new URL("../../discovery/legacy-url-inventory.csv", import.meta.url)
);

/** S00 envanterindeki legacy yollar (origin'siz). */
function inventoryPaths(): string[] {
  // BOM ayıklanır. Kaçış dizisiyle yazılır: dosyaya görünmez bir karakter
  // gömmek, sonraki okuyucu için sessiz bir tuzaktır.
  const csv = readFileSync(inventoryPath, "utf8").replace(/^\uFEFF/, "");
  return csv
    .split(/\r?\n/)
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => line.split(",")[0] ?? "")
    .map((url) => url.replace("https://duosis.com", ""))
    .map((path) => (path === "" ? "/" : path));
}

const paths = inventoryPaths();
const byFrom = new Map<string, RedirectRule>(REDIRECTS.map((rule) => [rule.from, rule]));
const legacyByFrom = new Map<string, RedirectRule>(LEGACY.map((rule) => [rule.from, rule]));

describe("kapsam", () => {
  it("S00 envanteri 54 URL taşıyor", () => {
    expect(paths).toHaveLength(54);
  });

  it("her legacy URL için TEK bir karar var", () => {
    const missing = paths.filter((path) => !byFrom.has(path));
    expect(missing, `karar verilmemiş URL: ${missing.join(", ")}`).toEqual([]);
    expect(LEGACY).toHaveLength(paths.length);
  });

  it("kaynak listesinde tekrar yok", () => {
    expect(legacyByFrom.size).toBe(LEGACY.length);
    expect(byFrom.size).toBe(REDIRECTS.length);
  });

  it("envanterde olmayan uydurma kayıt yok", () => {
    const extra = LEGACY.map((rule) => rule.from).filter((from) => !paths.includes(from));
    expect(extra, `envanterde olmayan kayıt: ${extra.join(", ")}`).toEqual([]);
  });
});

describe("karar bütünlüğü", () => {
  it("her kayıt gerekçe taşıyor", () => {
    for (const rule of REDIRECTS) {
      expect(rule.reason.length, rule.from).toBeGreaterThan(15);
    }
  });

  it("yönlendirme kayıtları hedef taşır; 410 ve preserve taşımaz", () => {
    for (const rule of REDIRECTS) {
      if (rule.kind === "410") {
        expect(rule.to, `${rule.from} 410 olmasına rağmen hedef taşıyor`).toBeUndefined();
      } else if (rule.kind === "preserve") {
        // Adres korunuyorsa hedef YAZILMAZ: kendi yoludur.
        expect(rule.to, `${rule.from} preserve olmasına rağmen hedef taşıyor`).toBeUndefined();
      } else {
        expect(rule.to, `${rule.from} hedefsiz`).toBeTruthy();
      }
    }
  });

  it("preserve kayıtları kendi yolunu korur", () => {
    for (const rule of REDIRECTS.filter((r) => r.kind === "preserve")) {
      expect(rule.to ?? rule.from).toBe(rule.from);
    }
  });

  it("durum kodu eşlemesi doğru", () => {
    expect(statusFor("410")).toBe(410);
    expect(statusFor("301-exact")).toBe(301);
    expect(statusFor("301-merged")).toBe(301);
  });
});

describe("kör yönlendirme, zincir ve döngü YOK", () => {
  it("hiçbir kayıt körlemesine ana sayfaya atmıyor", () => {
    const blind = REDIRECTS.filter((rule) => rule.kind !== "preserve" && rule.to === "/");
    expect(
      blind.map((rule) => rule.from),
      "karşılığı olmayan sayfa ana sayfaya atılamaz; 410 kullanılmalı"
    ).toEqual([]);
  });

  it("hiçbir hedef başka bir redirect'in KAYNAĞI değil (zincir yok)", () => {
    const sources = new Set(activeRedirects().map((rule) => rule.from));
    for (const rule of activeRedirects()) {
      if (rule.to === undefined) continue;
      expect(
        sources.has(rule.to),
        `zincir: ${rule.from} -> ${rule.to} (hedef de yönlendiriliyor)`
      ).toBe(false);
    }
  });

  it("hiçbir kayıt kendine yönlendirmiyor (döngü yok)", () => {
    for (const rule of activeRedirects()) {
      expect(rule.to, `döngü: ${rule.from}`).not.toBe(rule.from);
    }
  });

  it("her hedef mutlak yol ve sondaki eğik çizgiyle biter", () => {
    for (const rule of REDIRECTS) {
      if (rule.to === undefined) continue;
      expect(rule.to.startsWith("/"), `${rule.from} -> ${rule.to}`).toBe(true);
      expect(rule.to.endsWith("/"), `${rule.from} -> ${rule.to}`).toBe(true);
    }
  });
});

describe("karar dağılımı", () => {
  it("her karar türü kullanılıyor ve sayılar toplamı 54", () => {
    const counts = new Map<string, number>();
    for (const rule of LEGACY) counts.set(rule.kind, (counts.get(rule.kind) ?? 0) + 1);

    for (const kind of ["preserve", "301-exact", "301-merged", "410"]) {
      expect(counts.get(kind) ?? 0, `${kind} kararı hiç kullanılmamış`).toBeGreaterThan(0);
    }
    expect([...counts.values()].reduce((sum, n) => sum + n, 0)).toBe(54);
  });
});
