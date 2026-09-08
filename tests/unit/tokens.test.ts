import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { glob } from "node:fs/promises";

/**
 * TOKEN LINT + KONTRAST DOĞRULAMASI.
 *
 * Üç şeyi denetler:
 * 1. Bileşenler ve temel katman HAM renk yazmaz; yalnızca semantic token okur.
 * 2. Kullanılan her `var(--token)` gerçekten tanımlıdır (yazım hatası = sessiz
 *    kırık stil; CSS bunu hata olarak bildirmez).
 * 3. Belgelenen kontrast oranları GERÇEKTEN hesaplanır. Tabloya elle yazılmış
 *    bir oran, token değeri değişince testi düşürür.
 */

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const TOKENS_CSS = read("src/styles/tokens.css");
const BASE_CSS = read("src/styles/base.css");

// ---------------------------------------------------------------- yardımcılar

/** `--ad: deger;` çiftlerini toplar. */
function definedTokens(css: string): Set<string> {
  const names = new Set<string>();
  for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/gi)) {
    const name = m[1];
    if (name !== undefined) names.add(name);
  }
  return names;
}

/** `var(--ad)` referanslarını toplar. */
function usedTokens(css: string): Set<string> {
  const names = new Set<string>();
  for (const m of css.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
    const name = m[1];
    if (name !== undefined) names.add(name);
  }
  return names;
}

/**
 * Kural ayrıştırma.
 *
 * Yorumlar ve `@media` blokları önce çıkarılır; aksi halde yorum içinde geçen
 * bir seçici adı gerçek kural sanılır (ilk denemede tam olarak bu oldu).
 */
function rules(css: string): { selectors: string[]; body: string }[] {
  const clean = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  const out: { selectors: string[]; body: string }[] = [];
  for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = (m[1] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    out.push({ selectors, body: m[2] ?? "" });
  }
  return out;
}

const TOKEN_RULES = rules(TOKENS_CSS);

/** Bir temada geçerli olan seçiciler (sonra gelen tanım kazanır). */
const THEME_SELECTORS: Record<"light" | "dark", string[]> = {
  light: [":root", ".theme-light"],
  dark: [".theme-dark"],
};

function tokenValue(name: string, theme: "light" | "dark"): string {
  let value: string | undefined;
  for (const rule of TOKEN_RULES) {
    if (!rule.selectors.some((s) => THEME_SELECTORS[theme].includes(s))) continue;
    const m = new RegExp(`${name}\\s*:\\s*([^;]+);`).exec(rule.body);
    if (m?.[1] !== undefined) value = m[1].trim();
  }
  expect(value, `${name} tanımı bulunamadı (tema: ${theme})`).toBeDefined();
  return value ?? "";
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

/** WCAG 2.x bağıl parlaklık. */
function relativeLuminance(hex: string): number {
  const channel = (v: number): number => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

// ---------------------------------------------------------------- testler

describe("token lint — ham renk kullanılmıyor", () => {
  it("base.css içinde ham hex renk yok", () => {
    const offenders = [...BASE_CSS.matchAll(/#[0-9a-f]{3,8}\b/gi)].map((m) => m[0]);
    expect(offenders, `base.css ham renk içeriyor: ${offenders.join(", ")}`).toEqual([]);
  });

  it("bileşenler ve sayfa stilleri ham hex renk yazmıyor", async () => {
    const offenders: string[] = [];
    for await (const file of glob("src/**/*.astro")) {
      const source = readFileSync(join(ROOT, file), "utf8");
      // Yalnızca <style> bloklarını denetle; içerik metni kapsam dışıdır.
      for (const block of source.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
        const css = block[1] ?? "";
        for (const m of css.matchAll(/#[0-9a-f]{3,8}\b/gi)) {
          offenders.push(`${file}: ${m[0]}`);
        }
      }
    }
    expect(offenders, `ham renk kullanan bileşenler:\n${offenders.join("\n")}`).toEqual([]);
  });
});

describe("token lint — tanımsız token referansı yok", () => {
  const defined = definedTokens(TOKENS_CSS);

  it("tokens.css beklenen semantic grupları tanımlıyor", () => {
    for (const required of [
      "--surface-canvas",
      "--surface-raised",
      "--surface-sunken",
      "--surface-inverse",
      "--text-primary",
      "--text-secondary",
      "--text-muted",
      "--border-subtle",
      "--border-strong",
      "--signal",
      "--action",
      "--status-success",
      "--status-warning",
      "--status-critical",
      "--focus-ring",
    ]) {
      expect(defined.has(required), `${required} tanımlı değil`).toBe(true);
    }
  });

  it("base.css yalnızca tanımlı token'lara başvuruyor", () => {
    const unknown = [...usedTokens(BASE_CSS)].filter((t) => !defined.has(t));
    expect(unknown, `base.css tanımsız token kullanıyor: ${unknown.join(", ")}`).toEqual([]);
  });

  it("tüm .astro stilleri yalnızca tanımlı token'lara başvuruyor", async () => {
    const unknown: string[] = [];
    for await (const file of glob("src/**/*.astro")) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const used of usedTokens(source)) {
        if (defined.has(used)) continue;
        // Bileşenin kendi yerel değişkenleri (ör. --logo-width) hariç.
        if (new RegExp(`${used}\\s*:`).test(source)) continue;
        // Şablon değişkenli dinamik ad: `var(--space-${name})` -> "--space-".
        // Böyle bir önek için EN AZ BİR tanımlı token bulunmalıdır; yoksa
        // gerçekten kırık bir referanstır.
        if (used.endsWith("-") && [...defined].some((d) => d.startsWith(used))) continue;
        unknown.push(`${file}: ${used}`);
      }
    }
    expect(unknown, `tanımsız token referansları:\n${unknown.join("\n")}`).toEqual([]);
  });
});

describe("kontrast — belgelenen oranlar gerçekten hesaplanıyor", () => {
  const light = "light" as const;
  const dark = "dark" as const;

  /** AA normal metin eşiği. */
  const AA_TEXT = 4.5;
  /** AA UI bileşeni / büyük metin eşiği. */
  const AA_UI = 3;

  it("AÇIK yüzey metin renkleri AA geçiyor", () => {
    const canvas = tokenValue("--surface-canvas", light);
    for (const token of ["--text-primary", "--text-secondary", "--text-muted"]) {
      const ratio = contrast(tokenValue(token, light), canvas);
      expect(ratio, `${token} açık yüzeyde ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });

  it("KOYU yüzey metin renkleri AA geçiyor", () => {
    const canvas = tokenValue("--surface-canvas", dark);
    for (const token of ["--text-primary", "--text-secondary", "--text-muted"]) {
      const ratio = contrast(tokenValue(token, dark), canvas);
      expect(ratio, `${token} koyu yüzeyde ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });

  /**
   * GÜVENLİK PAYI (S03 takip düzeltmesi).
   *
   * Ham AA eşiği (4.5:1) tek başına yeterli değil: 4.51 gibi bir değer küçük
   * bir yüzey değişikliğinde eşiğin altına düşer. Link ve aksiyon renkleri için
   * daha yüksek bir taban zorunlu tutulur.
   */
  const AA_TEXT_MARGIN = 4.75;

  it("SİNYAL ve AKSİYON açık yüzeyde güvenlik payını (>= 4.75:1) taşıyor", () => {
    for (const surface of ["--surface-canvas", "--surface-raised", "--surface-sunken"]) {
      const bg = tokenValue(surface, light);
      for (const token of ["--signal", "--action"]) {
        const ratio = contrast(tokenValue(token, light), bg);
        expect(
          ratio,
          `${token} / ${surface} = ${ratio.toFixed(2)}:1 (taban ${AA_TEXT_MARGIN})`
        ).toBeGreaterThanOrEqual(AA_TEXT_MARGIN);
      }
    }
  });

  it("SİNYAL açık yüzeyde tercih edilen 5.0:1 seviyesini yakalıyor", () => {
    const ratio = contrast(tokenValue("--signal", light), tokenValue("--surface-canvas", light));
    expect(ratio, `signal ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(5.0);
  });

  it("SİNYAL marka cyanıyla AYNI tonu koruyor (yalnızca açıklık düşürüldü)", () => {
    /** Basit RGB -> HSL dönüşümü; ton ve doygunluk karşılaştırması için. */
    const hs = (hex: string): [number, number] => {
      const [r, g, b] = hexToRgb(hex).map((v) => v / 255) as [number, number, number];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      const d = max - min;
      if (d === 0) return [0, 0];
      const s = d / (1 - Math.abs(2 * l - 1));
      let h: number;
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      return [(((h * 60) % 360) + 360) % 360, s];
    };

    const [brandH, brandS] = hs(tokenValue("--brand-cyan", light));
    const [signalH, signalS] = hs(tokenValue("--signal", light));

    // Ton en fazla 2 derece, doygunluk en fazla 0.05 sapabilir.
    expect(
      Math.abs(brandH - signalH),
      `ton sapması ${Math.abs(brandH - signalH).toFixed(2)}°`
    ).toBeLessThanOrEqual(2);
    expect(Math.abs(brandS - signalS)).toBeLessThanOrEqual(0.05);
  });

  it("signal ve action her iki yüzeyde AA geçiyor", () => {
    for (const [scope, name] of [
      [light, "açık"],
      [dark, "koyu"],
    ] as const) {
      const canvas = tokenValue("--surface-canvas", scope);
      for (const token of ["--signal", "--action"]) {
        const ratio = contrast(tokenValue(token, scope), canvas);
        expect(ratio, `${token} ${name} yüzeyde ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
          AA_TEXT
        );
      }
    }
  });

  it("durum renkleri her iki yüzeyde AA geçiyor", () => {
    for (const scope of [light, dark]) {
      const canvas = tokenValue("--surface-canvas", scope);
      for (const token of ["--status-success", "--status-warning", "--status-critical"]) {
        const ratio = contrast(tokenValue(token, scope), canvas);
        expect(ratio, `${token} ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXT);
      }
    }
  });

  it("buton dolgusu üzerindeki metin AA geçiyor", () => {
    for (const scope of [light, dark]) {
      const onAction = contrast(
        tokenValue("--action-contrast", scope),
        tokenValue("--action", scope)
      );
      expect(onAction, `action üzerinde metin ${onAction.toFixed(2)}:1`).toBeGreaterThanOrEqual(
        AA_TEXT
      );
    }
  });

  it("border-strong UI bileşeni eşiğini (3:1) geçiyor", () => {
    for (const scope of [light, dark]) {
      const ratio = contrast(
        tokenValue("--border-strong", scope),
        tokenValue("--surface-canvas", scope)
      );
      expect(ratio, `border-strong ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_UI);
    }
  });

  it("FOCUS RING her iki yüzeyde 3:1 geçiyor (WCAG 2.2 SC 1.4.11)", () => {
    // Tek değer; kural `:root, .theme-light, .theme-dark` seçici listesinde
    // tanımlıdır, bu yüzden her iki temada da aynı sonucu verir.
    const ring = tokenValue("--focus-ring", light);
    expect(ring).toBe(tokenValue("--focus-ring", dark));
    for (const [scope, name] of [
      [light, "açık"],
      [dark, "koyu"],
    ] as const) {
      for (const surface of ["--surface-canvas", "--surface-raised"]) {
        const ratio = contrast(ring, tokenValue(surface, scope));
        expect(
          ratio,
          `focus ring ${name} ${surface} üzerinde ${ratio.toFixed(2)}:1`
        ).toBeGreaterThanOrEqual(AA_UI);
      }
    }
  });

  it("MARKA CYANI açık yüzeyde metin için KULLANILAMAZ (belgelenen kısıt)", () => {
    const cyan = tokenValue("--brand-cyan", light);
    const ratio = contrast(cyan, tokenValue("--surface-canvas", light));
    // Bu bilinçli bir kısıttır: cyan açık yüzeyde AA'yı geçmez, bu yüzden
    // yalnızca dekoratif kalır. Değer değişirse bu test bunu görünür kılar.
    expect(ratio).toBeLessThan(AA_UI);
    expect(cyan.toLowerCase()).toBe("#16a6de");
  });

  it("KOYU yüzeyde marka cyanı signal olarak kullanılıyor ve AA geçiyor", () => {
    const signalDark = tokenValue("--signal", dark);
    expect(signalDark.toLowerCase()).toBe("#16a6de");
    const ratio = contrast(signalDark, tokenValue("--surface-canvas", dark));
    expect(ratio, `koyu yüzeyde cyan ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXT);
  });
});
