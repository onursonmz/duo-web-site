import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CAPABILITY_ATLAS,
  EMPHASIZED_TECHNOLOGY_IDS,
  capabilityLayerLabel,
  isEmphasized,
  layerForGroup,
} from "@lib/content/capabilities";
import { CAPABILITY_LAYERS, LOCALES } from "@lib/content/schema";
import { isVisibleTechnology, PUBLIC } from "@lib/content/selectors";

/**
 * YETENEK ATLASI TESTLERİ (S10 §4-§5, §8).
 *
 * Atlas envanterden TÜRETİLİR. Bu testler türetmenin kayıpsız olduğunu
 * doğrular: aktif hiçbir kayıt katmansız kalmaz, karar bekleyen hiçbir kayıt
 * katmana girmez.
 */

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

interface TechnologyRecord {
  id: string;
  name: string;
  group: string;
  lifecycle: "active" | "inactive" | "pending";
  decisionNeeded: boolean;
  logoPermission: string;
  logoPath?: string;
}

const inventory = JSON.parse(
  readFileSync(`${ROOT}src/content/technologies/technologies.json`, "utf8")
) as TechnologyRecord[];

const visible = inventory.filter((t) => isVisibleTechnology(t, PUBLIC));
const hidden = inventory.filter((t) => !isVisibleTechnology(t, PUBLIC));

describe("envanter beklenen ölçekte", () => {
  it("21 kayıt public modda görünür", () => {
    expect(visible).toHaveLength(21);
  });

  it("14 kayıt public modda GİZLİ", () => {
    expect(hidden).toHaveLength(14);
  });

  it("görünür kayıtların tamamı active VE karar verilmiş", () => {
    for (const technology of visible) {
      expect(technology.lifecycle, technology.id).toBe("active");
      expect(technology.decisionNeeded, technology.id).toBe(false);
    }
  });
});

describe("katman tablosu", () => {
  it("kapalı kümedeki yedi katmanı da tanımlar", () => {
    expect(CAPABILITY_ATLAS).toHaveLength(CAPABILITY_LAYERS.length);
    expect(CAPABILITY_ATLAS.map((l) => l.key).sort()).toEqual([...CAPABILITY_LAYERS].sort());
  });

  it("her katmanın iki dilde de etiketi var", () => {
    for (const layer of CAPABILITY_LAYERS) {
      for (const locale of LOCALES) {
        expect(capabilityLayerLabel(layer, locale).length, `${layer}/${locale}`).toBeGreaterThan(0);
      }
    }
  });

  /**
   * FAIL-CLOSED KANITI: eşlenmemiş bir grup sessizce kaybolmaz.
   * `getCapabilityAtlas` bu durumda hata fırlatır; burada eşlemenin kendisinin
   * eksiksiz olduğunu doğruluyoruz.
   */
  it("GÖRÜNÜR her kaydın grubu bir katmana eşleniyor", () => {
    for (const technology of visible) {
      expect(
        layerForGroup(technology.group),
        `${technology.id} (${technology.group})`
      ).toBeDefined();
    }
  });

  it("tanımsız bir grup katman döndürmez", () => {
    expect(layerForGroup("bilinmeyen-grup")).toBeUndefined();
    expect(layerForGroup("")).toBeUndefined();
  });
});

describe("logo kuralı gevşetilmiyor", () => {
  /**
   * Envanterdeki HİÇBİR kaydın logo izni yok. Atlas bileşeni zaten <img>
   * üretmez; bu test veri tarafındaki durumu kilitler, böylece ileride bir
   * kayda logoPath eklenirse izin de birlikte gelmek zorunda kalır.
   */
  it("izinsiz hiçbir kaydın logo yolu yok", () => {
    for (const technology of inventory) {
      if (technology.logoPermission !== "allowed") {
        expect(technology.logoPath, `${technology.id} izinsiz logo yolu taşıyor`).toBeUndefined();
      }
    }
  });

  it("logoPermission alanı kapalı kümede", () => {
    for (const technology of inventory) {
      expect(["unknown", "allowed", "denied"]).toContain(technology.logoPermission);
    }
  });
});

describe("editoryal vurgu bir iddia değildir", () => {
  it("vurgulanan her kayıt envanterde ve görünür", () => {
    const visibleIds = new Set(visible.map((t) => t.id));
    for (const id of EMPHASIZED_TECHNOLOGY_IDS) {
      expect(visibleIds.has(id), `${id} vurgulanmış ama görünür değil`).toBe(true);
    }
  });

  /**
   * Vurgu listesi bir kaydı GÖRÜNÜR YAPMAZ: görünürlük yalnızca lifecycle ve
   * decisionNeeded ile belirlenir. Karar bekleyen bir kayıt vurgulansa bile
   * seçiciden geçemez.
   */
  it("vurgu, gizli bir kaydı görünür yapmaz", () => {
    for (const technology of hidden) {
      expect(isVisibleTechnology(technology, PUBLIC), technology.id).toBe(false);
    }
  });

  it("vurgulanmayan kayıt için isEmphasized false döner", () => {
    expect(isEmphasized("nifi")).toBe(false);
    expect(isEmphasized("bilinmeyen")).toBe(false);
    expect(isEmphasized("datadog")).toBe(true);
  });
});
