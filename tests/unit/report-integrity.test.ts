import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * TESLİM RAPORU METİN BÜTÜNLÜĞÜ (S08–S11 R1).
 *
 * S08–S11 entegrasyon raporu, UTF-8 metni cp1252 olarak yazan bir araçtan
 * geçtiği için **462 mojibake işaretiyle** teslim edildi (`Ã`, `Å`, `Ä`,
 * `â€”` …) ve içinde çözülmemiş `__INTEG_HEAD__` / `__CI_URL__` yer tutucuları
 * kaldı. İnceleyen taraf raporu okuyamadı.
 *
 * Bu test FAIL-CLOSED bir kapıdır: `pnpm quality` zincirinde çalışır ve
 * bozuk kodlama ya da çözülmemiş yer tutucu içeren bir teslim raporu
 * commit'lenmiş olsa bile kaliteyi kırar.
 *
 * Kapsam: repo kökündeki `*_REPORT.md` dosyaları. Şablon/fixture istisnaları
 * DAR tutulur ve tek tek gerekçelendirilir.
 */

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/**
 * Bilinçli istisnalar.
 *
 * `CLAUDE_REPORT_TEMPLATE.md` bir ŞABLONDUR: yer tutucu taşıması işlevinin
 * kendisidir. Repo kökünde değildir, bu yüzden zaten kapsam dışıdır; liste
 * niyeti belgelemek için burada durur.
 */
const ALLOWLIST: readonly string[] = ["CLAUDE_REPORT_TEMPLATE.md"];

/**
 * Çift kodlanmış UTF-8'in tipik imzaları.
 *
 * Türkçe metinde `Ä±` (ı), `ÅŸ` (ş), `Ã¼` (ü), `Ã§` (ç), `Ã¶` (ö), `ÄŸ` (ğ)
 * ve `â€"` (tire/tırnak) dizileri **hiçbir zaman** doğru metin olamaz.
 */
const MOJIBAKE_PATTERNS: readonly RegExp[] = [
  /Ã[¡-¿]/, // Ã¼, Ã§, Ã¶ …
  /Ä[±Ÿ°]/, // Ä± (ı), ÄŸ (ğ), Ä° (İ)
  /Å[ŸŽž¸]/, // ÅŸ (ş), Åž (Ş)
  /â€[""˜™"–—]/, // â€” , â€œ …
  /Â[ ­°]/, // Â + nbsp/soft hyphen
  /�/, // U+FFFD REPLACEMENT CHARACTER
];

/** Çözülmemiş yer tutucu: `__BUYUK_HARF__`. */
const PLACEHOLDER = /__[A-Z0-9_]+__/g;

function deliveryReports(): string[] {
  return readdirSync(ROOT)
    .filter((name) => /_REPORT\.md$/.test(name))
    .filter((name) => !ALLOWLIST.includes(name))
    .sort();
}

const reports = deliveryReports();

describe("teslim raporu metin bütünlüğü", () => {
  it("taranacak rapor bulunuyor", () => {
    // Kapsam sessizce boşalırsa test hiçbir şeyi korumaz.
    expect(reports.length).toBeGreaterThanOrEqual(5);
  });

  for (const name of reports) {
    describe(name, () => {
      const raw = readFileSync(`${ROOT}${name}`);
      const text = raw.toString("utf8");

      it("geçerli UTF-8", () => {
        // Kayıpsız tur: geçersiz bayt varsa U+FFFD üretilir ve eşitlik bozulur.
        expect(Buffer.from(text, "utf8").equals(raw)).toBe(true);
      });

      it("bozuk kodlama (mojibake) imzası yok", () => {
        for (const pattern of MOJIBAKE_PATTERNS) {
          const match = pattern.exec(text);
          const context =
            match === null ? "" : text.slice(Math.max(0, match.index - 40), match.index + 40);
          expect(match, `${name}: ${pattern} eşleşti → …${context}…`).toBeNull();
        }
      });

      it("çözülmemiş yer tutucu yok", () => {
        const found = [...new Set(text.match(PLACEHOLDER) ?? [])];
        expect(found, `${name}: çözülmemiş yer tutucu`).toEqual([]);
      });

      it("Türkçe karakterler gerçekten Türkçe", () => {
        // Rapor Türkçe yazılıyorsa en az bir gerçek Türkçe harf taşımalı;
        // hepsi mojibake'e dönüşmüşse bu koşul da düşer.
        if (!/[a-z]/i.test(text)) return;
        expect(/[çğıöşüÇĞİÖŞÜ]/.test(text), `${name}: hiç Türkçe karakter yok`).toBe(true);
      });
    });
  }
});
