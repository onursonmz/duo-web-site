import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * OPEN GRAPH GÖRSEL TESTLERİ (S13).
 *
 * Dosyalar `sharp` ile üretiliyor; test ONLARI ÜRETİCİYE SORMAZ, diskteki
 * baytları okur. Üretici doğru çalışsa bile dosya depoya eksik girmiş,
 * bozulmuş ya da yanlışlıkla SVG olarak kaydedilmiş olabilir.
 *
 * PNG başlığı elle çözülür: 8 baytlık imza, ardından IHDR öbeği. Böylece
 * "gerçek PNG mi" ve "gerçekten 1200×630 mü" soruları bir kütüphaneye
 * devredilmeden yanıtlanır.
 */

const OG_DIR = join(process.cwd(), "public", "og");

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Open Graph'ın beklediği kart oranı. */
const WIDTH = 1200;
const HEIGHT = 630;

/** Paylaşım servisleri büyük dosyaları atlar; 8 MB üst sınırdır. */
const MAX_BYTES = 8 * 1024 * 1024;
/** Birkaç yüz baytlık bir dosya gerçek bir kart olamaz. */
const MIN_BYTES = 4 * 1024;

const EXPECTED_FILES = ["og-default.png", "og-cyclops.png", "og-insights.png"] as const;

function readIhdr(file: string): { width: number; height: number; signature: Buffer } {
  const raw = readFileSync(file);
  return {
    signature: raw.subarray(0, 8),
    // IHDR: 8 bayt imza + 4 bayt uzunluk + 4 bayt tür, sonra genişlik/yükseklik.
    width: raw.readUInt32BE(16),
    height: raw.readUInt32BE(20),
  };
}

describe("Open Graph kartları", () => {
  it("beklenen üç kart da var", () => {
    const found = readdirSync(OG_DIR).sort();
    expect(found).toEqual([...EXPECTED_FILES].sort());
  });

  for (const name of EXPECTED_FILES) {
    const file = join(OG_DIR, name);

    it(`${name} GERÇEK bir PNG`, () => {
      const { signature } = readIhdr(file);
      expect(signature.equals(PNG_SIGNATURE), `${name} PNG imzası taşımıyor`).toBe(true);
    });

    it(`${name} tam olarak ${WIDTH}×${HEIGHT}`, () => {
      const { width, height } = readIhdr(file);
      expect(width).toBe(WIDTH);
      expect(height).toBe(HEIGHT);
    });

    it(`${name} makul bir dosya boyutunda`, () => {
      const bytes = statSync(file).size;
      expect(bytes, `${name} çok küçük — gerçek bir kart değil`).toBeGreaterThan(MIN_BYTES);
      expect(bytes, `${name} çok büyük`).toBeLessThan(MAX_BYTES);
    });

    it(`${name} SVG veya metin dosyası DEĞİL`, () => {
      // Uzantı doğru olsa bile içerik yanlış olabilir.
      const head = readFileSync(file).subarray(0, 200).toString("latin1");
      expect(head).not.toContain("<svg");
      expect(head).not.toContain("<?xml");
    });
  }

  it("kartlar birbirinden FARKLI (üç kez aynı dosya yazılmamış)", () => {
    const bytes = EXPECTED_FILES.map((name) => readFileSync(join(OG_DIR, name)).toString("base64"));
    expect(new Set(bytes).size).toBe(EXPECTED_FILES.length);
  });
});
