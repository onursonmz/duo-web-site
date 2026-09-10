import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { proofSchema } from "@lib/content/schemas";
import { PROOF_KINDS } from "@lib/content/schema";
import {
  canShowLogo,
  isPublishedStatus,
  isVerifiedClaim,
  PREVIEW,
  PUBLIC,
} from "@lib/content/selectors";

/**
 * GÜVEN VE KANIT SİSTEMİ TESTLERİ (S10 §7, §8).
 *
 * Kanıt filtreleri FAIL-CLOSED olmalı: eksik veya belirsiz bir alan kaydı
 * görünür yapmaz, GİZLER. Bu testler her koşulun tek başına yeterli
 * OLMADIĞINI doğrular — üçü birden gerekir.
 */

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** Bir kaydın public müşteri kanıtı olarak görünüp görünemeyeceği. */
function isPublicCustomerProof(
  record: { status: string; verificationStatus: string; kind: string },
  mode: typeof PUBLIC | typeof PREVIEW
): boolean {
  return (
    isPublishedStatus(record.status, mode) &&
    isVerifiedClaim(record.verificationStatus, mode) &&
    record.kind === "customer-reference"
  );
}

describe("kanıt türü kapalı kümede", () => {
  it("tam olarak iki tür var", () => {
    expect([...PROOF_KINDS]).toEqual(["customer-reference", "internal-measurement"]);
  });

  it("tür alanı ZORUNLU — belirtilmeyen kayıt reddedilir", () => {
    const withoutKind = {
      translationKey: "test-proof",
      locale: "tr",
      status: "published",
      anonymousSector: "Test",
      logoPermission: "unknown",
      metrics: [],
      verificationStatus: "verified",
    };
    expect(proofSchema.safeParse(withoutKind).success).toBe(false);
  });

  it("küme dışı tür reddedilir", () => {
    const badKind = {
      translationKey: "test-proof",
      locale: "tr",
      status: "published",
      kind: "case-study",
      anonymousSector: "Test",
      logoPermission: "unknown",
      metrics: [],
      verificationStatus: "verified",
    };
    expect(proofSchema.safeParse(badKind).success).toBe(false);
  });
});

describe("public müşteri kanıtı filtresi fail-closed", () => {
  const base = {
    status: "published",
    verificationStatus: "verified",
    kind: "customer-reference",
  };

  it("üç koşul birden sağlanınca görünür", () => {
    expect(isPublicCustomerProof(base, PUBLIC)).toBe(true);
  });

  it("yayınlanmamış kayıt görünmez", () => {
    for (const status of ["draft", "review", "archived"]) {
      expect(isPublicCustomerProof({ ...base, status }, PUBLIC), status).toBe(false);
    }
  });

  it("doğrulanmamış kayıt görünmez", () => {
    for (const verificationStatus of ["pending", "rejected"]) {
      expect(
        isPublicCustomerProof({ ...base, verificationStatus }, PUBLIC),
        verificationStatus
      ).toBe(false);
    }
  });

  /**
   * S00 PERFORMANS ÖLÇÜMÜ MÜŞTERİ BAŞARISI DEĞİLDİR.
   *
   * Kayıt doğrulanmış ve yayınlanmış olsa bile, türü `internal-measurement`
   * ise müşteri kanıtı bölümüne giremez.
   */
  it("doğrulanmış olsa bile iç ölçüm müşteri kanıtı sayılmaz", () => {
    expect(isPublicCustomerProof({ ...base, kind: "internal-measurement" }, PUBLIC)).toBe(false);
  });

  it("preview modunda bile tür kuralı gevşemez", () => {
    expect(isPublicCustomerProof({ ...base, kind: "internal-measurement" }, PREVIEW)).toBe(false);
  });
});

describe("logo izni ayrı ve bağımsız bir kapı", () => {
  it("yalnızca yazılı izin logoyu açar", () => {
    expect(canShowLogo("allowed")).toBe(true);
    expect(canShowLogo("unknown")).toBe(false);
    expect(canShowLogo("denied")).toBe(false);
  });

  it("doğrulanmış bir kayıt logo iznini KENDİLİĞİNDEN kazanmaz", () => {
    // Doğrulama iddianın doğruluğuyla, izin ise marka kullanımıyla ilgilidir.
    const verifiedButNoPermission = { verificationStatus: "verified", logoPermission: "unknown" };
    expect(isVerifiedClaim(verifiedButNoPermission.verificationStatus, PUBLIC)).toBe(true);
    expect(canShowLogo(verifiedButNoPermission.logoPermission)).toBe(false);
  });
});

describe("mevcut kanıt verisi", () => {
  const files = readdirSync(`${ROOT}src/content/proofs/tr`).filter((f) => f.endsWith(".md"));

  /** Tek bir frontmatter alanını okur; alan yoksa boş string döner. */
  function field(file: string, name: string): string {
    const text = readFileSync(`${ROOT}src/content/proofs/tr/${file}`, "utf8");
    const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
    if (match === null) throw new Error(`frontmatter yok: ${file}`);
    // Satır satır tarama: dinamik `RegExp` burada gereksiz bir kaçış katmanı
    // ekliyor ve alan adının desene sızmasına izin veriyordu.
    const prefix = `${name}:`;
    for (const line of (match[1] ?? "").split(/\r?\n/)) {
      if (line.startsWith(prefix)) return line.slice(prefix.length).trim();
    }
    return "";
  }

  it("her kayıt bir tür taşıyor", () => {
    for (const file of files) {
      expect(PROOF_KINDS as readonly string[], file).toContain(field(file, "kind"));
    }
  });

  /**
   * BU SPRINTTEKİ DURUM: onaylanmış müşteri referansı YOK.
   *
   * Test bunu bir başarısızlık olarak değil, bilinen bir gerçek olarak
   * kilitler. Gerçek bir referans onaylandığında bu test kırılır ve kanıt
   * bölümünün görsel/erişilebilirlik kontrolünün yapılması gerektiğini
   * hatırlatır — sessizce yayına girmez.
   */
  it("public müşteri kanıtı listesi şu anda BOŞ", () => {
    const publicCustomerProofs = files.filter((file) =>
      isPublicCustomerProof(
        {
          status: field(file, "status"),
          verificationStatus: field(file, "verificationStatus"),
          kind: field(file, "kind"),
        },
        PUBLIC
      )
    );
    expect(
      publicCustomerProofs,
      "onaylı müşteri referansı eklendiyse kanıt bölümü gözden geçirilmeli"
    ).toEqual([]);
  });

  it("hiçbir kayıt izinsiz logo yolu taşımıyor", () => {
    for (const file of files) {
      if (field(file, "logoPermission") !== "allowed") {
        expect(field(file, "logoPath"), `${file} izinsiz logo yolu taşıyor`).toBe("");
      }
    }
  });
});
