import { describe, expect, it } from "vitest";
import {
  assertUniqueTranslations,
  canShowLogo,
  isVisibleTechnology,
  isPublishedStatus,
  isVerifiedClaim,
  logoPathIfAllowed,
  PREVIEW,
  PUBLIC,
} from "@lib/content/selectors";

/**
 * MERKEZİ SEÇİCİ KATMANI TESTLERİ.
 * Public ve preview filtreleri aynı katmandan çalışır; üretim sayfaları PUBLIC kullanır.
 */

describe("isPublishedStatus", () => {
  it("public modda yalnızca published geçer", () => {
    expect(isPublishedStatus("published", PUBLIC)).toBe(true);
    expect(isPublishedStatus("draft", PUBLIC)).toBe(false);
    expect(isPublishedStatus("review", PUBLIC)).toBe(false);
    expect(isPublishedStatus("archived", PUBLIC)).toBe(false);
  });

  it("preview modda archived dışındakiler geçer", () => {
    expect(isPublishedStatus("draft", PREVIEW)).toBe(true);
    expect(isPublishedStatus("review", PREVIEW)).toBe(true);
    expect(isPublishedStatus("archived", PREVIEW)).toBe(false);
  });
});

describe("isVerifiedClaim — pending iddia public'te görünmez", () => {
  it("public modda yalnızca verified geçer", () => {
    expect(isVerifiedClaim("verified", PUBLIC)).toBe(true);
    expect(isVerifiedClaim("pending", PUBLIC)).toBe(false);
    expect(isVerifiedClaim("rejected", PUBLIC)).toBe(false);
  });

  it("preview modda pending görülebilir, rejected görülmez", () => {
    expect(isVerifiedClaim("pending", PREVIEW)).toBe(true);
    expect(isVerifiedClaim("rejected", PREVIEW)).toBe(false);
  });
});

describe("canShowLogo — izinsiz logo hiçbir modda gösterilmez", () => {
  it("yalnızca allowed geçer", () => {
    expect(canShowLogo("allowed")).toBe(true);
    expect(canShowLogo("unknown")).toBe(false);
    expect(canShowLogo("denied")).toBe(false);
  });

  it("logoPathIfAllowed izin yoksa undefined döner", () => {
    expect(logoPathIfAllowed({ logoPath: "/logo.svg", logoPermission: "unknown" })).toBeUndefined();
    expect(logoPathIfAllowed({ logoPath: "/logo.svg", logoPermission: "denied" })).toBeUndefined();
    expect(logoPathIfAllowed({ logoPath: "/logo.svg", logoPermission: "allowed" })).toBe(
      "/logo.svg"
    );
  });

  it("izin verilse bile logoPath yoksa undefined döner", () => {
    expect(logoPathIfAllowed({ logoPermission: "allowed" })).toBeUndefined();
  });
});

describe("isVisibleTechnology — fail-closed", () => {
  it("public modda yalnızca active geçer", () => {
    expect(isVisibleTechnology("active", PUBLIC)).toBe(true);
    expect(isVisibleTechnology("pending", PUBLIC)).toBe(false);
    expect(isVisibleTechnology("inactive", PUBLIC)).toBe(false);
  });

  it("preview modda pending görünür, inactive görünmez", () => {
    expect(isVisibleTechnology("pending", PREVIEW)).toBe(true);
    expect(isVisibleTechnology("active", PREVIEW)).toBe(true);
    expect(isVisibleTechnology("inactive", PREVIEW)).toBe(false);
  });
});

describe("assertUniqueTranslations", () => {
  const entry = (translationKey: string, locale: string, slug?: string) => ({
    data: slug === undefined ? { translationKey, locale } : { translationKey, locale, slug },
  });

  it("benzersiz kayıtları kabul eder", () => {
    expect(() =>
      assertUniqueTranslations(
        [entry("a", "tr", "a-tr"), entry("a", "en", "a-en"), entry("b", "tr", "b-tr")],
        "solutions"
      )
    ).not.toThrow();
  });

  it("yinelenen translationKey + locale REDDEDER", () => {
    expect(() =>
      assertUniqueTranslations([entry("a", "tr", "bir"), entry("a", "tr", "iki")], "solutions")
    ).toThrow(/Yinelenen translationKey \+ locale: "a" \(tr\)/);
  });

  it("aynı translationKey farklı locale'de sorun değil", () => {
    expect(() =>
      assertUniqueTranslations([entry("a", "tr", "a-tr"), entry("a", "en", "a-en")], "solutions")
    ).not.toThrow();
  });

  it("yinelenen slug + locale REDDEDER", () => {
    expect(() =>
      assertUniqueTranslations([entry("a", "tr", "ayni"), entry("b", "tr", "ayni")], "solutions")
    ).toThrow(/Yinelenen slug \+ locale: "ayni" \(tr\)/);
  });

  it("aynı slug farklı locale'de sorun değil", () => {
    expect(() =>
      assertUniqueTranslations([entry("a", "tr", "ayni"), entry("b", "en", "ayni")], "solutions")
    ).not.toThrow();
  });

  it("slug'ı olmayan koleksiyonlarda yalnızca translationKey denetlenir", () => {
    expect(() =>
      assertUniqueTranslations([entry("a", "tr"), entry("b", "tr")], "milestones")
    ).not.toThrow();
    expect(() =>
      assertUniqueTranslations([entry("a", "tr"), entry("a", "tr")], "milestones")
    ).toThrow(/Yinelenen translationKey/);
  });
});
