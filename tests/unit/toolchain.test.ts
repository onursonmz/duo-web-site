import { existsSync, readFileSync, realpathSync } from "node:fs";
import { delimiter, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * TOOLCHAIN GUARD — tip tanımları REPO İÇİNDEN çözülmek ZORUNDA.
 *
 * S03 ön kontrolünde ortaya çıkan bulgu: `@types/node` `package.json` içinde
 * tanımlı değildi ve yerel `astro check` tipleri repo DIŞINDAKİ
 * `C:\Users\ASUS\node_modules\@types\node` klasöründen ödünç alıyordu.
 * TypeScript `@types` ararken üst dizinleri tarar; bu yüzden yerel kapı
 * yeşil görünürken CI (temiz Linux runner) 14 hata verdi.
 *
 * Bu test o sınıfın tekrar etmesini engeller:
 * - `@types/node` doğrudan bağımlılık olarak tanımlı olmalı,
 * - repo içindeki `node_modules/.pnpm/...` altına çözülmeli,
 * - kullanıcı profili / üst dizin / global `node_modules` üzerinden
 *   çözülürse test DÜŞMELİ,
 * - `tsconfig.json` proje-local çözümü açıkça zorlamalı.
 */

const repoRoot = realpathSync(fileURLToPath(new URL("../../", import.meta.url)));
const read = (relative: string) => readFileSync(join(repoRoot, relative), "utf8");

/** `tsconfig.json` yorum içermiyor; yine de savunmacı ayrıştırma yapılır. */
function readJsonc<T>(relative: string): T {
  const raw = read(relative).replace(/^\uFEFF/, "");
  return JSON.parse(raw) as T;
}

interface PackageJson {
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
}

interface TsConfig {
  compilerOptions?: {
    types?: string[];
    typeRoots?: string[];
  };
}

const pkg = readJsonc<PackageJson>("package.json");
const tsconfig = readJsonc<TsConfig>("tsconfig.json");

/** Bir yolun repo kökünün ALTINDA olup olmadığı (sınır güvenli karşılaştırma). */
function isInsideRepo(target: string): boolean {
  const normalized = realpathSync(target);
  return normalized === repoRoot || normalized.startsWith(repoRoot + sep);
}

describe("toolchain — @types/node proje-local çözülüyor", () => {
  it("@types/node doğrudan devDependency olarak tanımlı", () => {
    const declared = pkg.devDependencies?.["@types/node"];
    expect(declared, "@types/node package.json içinde bulunamadı").toBeDefined();
    // Sürüm sabitlenmiş olmalı: proje genelinde exact pinleme kuralı geçerli.
    expect(declared).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("node_modules/@types/node repo içinde gerçekten mevcut", () => {
    const typesDir = join(repoRoot, "node_modules", "@types", "node");
    expect(existsSync(typesDir), `${typesDir} yok — pnpm install çalıştırıldı mı?`).toBe(true);
  });

  it("gerçek yol repo içindeki node_modules/.pnpm altına çözülüyor", () => {
    const typesDir = join(repoRoot, "node_modules", "@types", "node");
    const real = realpathSync(typesDir);

    // 1) Repo sınırının dışına taşmamalı.
    expect(
      isInsideRepo(typesDir),
      `@types/node repo DIŞINDAN çözülüyor: ${real}. ` +
        "Üst dizindeki bir node_modules klasörü kullanılıyor olabilir."
    ).toBe(true);

    // 2) pnpm sanal deposu üzerinden gelmeli (hoisting kazası değil).
    const pnpmStore = join(repoRoot, "node_modules", ".pnpm") + sep;
    expect(real.startsWith(pnpmStore), `beklenen .pnpm altında, bulunan: ${real}`).toBe(true);

    // 3) Çözülen sürüm package.json ile aynı olmalı.
    const declared = pkg.devDependencies?.["@types/node"];
    expect(real).toContain(`@types+node@${declared}`);
  });

  it("kullanıcı profili / üst dizin / global node_modules kullanılmıyor", () => {
    const real = realpathSync(join(repoRoot, "node_modules", "@types", "node"));

    // Repo kökünün TÜM üst dizinlerini gez; hiçbirinin node_modules'ı
    // çözülen yolun kaynağı olmamalı.
    const ancestors: string[] = [];
    let current = dirname(repoRoot);
    let previous = "";
    while (current !== previous) {
      ancestors.push(current);
      previous = current;
      current = dirname(current);
    }

    for (const ancestor of ancestors) {
      const stray = join(ancestor, "node_modules");
      if (!existsSync(stray)) continue;
      expect(
        real.startsWith(realpathSync(stray) + sep),
        `@types/node üst dizindeki ${stray} klasöründen çözülüyor`
      ).toBe(false);
    }

    // Global pnpm/npm kök dizinleri de kaynak olmamalı.
    const globalRoots = (process.env["NODE_PATH"] ?? "")
      .split(delimiter)
      .filter((entry) => entry.length > 0);
    for (const globalRoot of globalRoots) {
      if (!existsSync(globalRoot)) continue;
      expect(
        real.startsWith(realpathSync(globalRoot) + sep),
        `@types/node global NODE_PATH girdisinden çözülüyor: ${globalRoot}`
      ).toBe(false);
    }
  });

  it("tsconfig proje-local tip çözümünü açıkça zorluyor", () => {
    const options = tsconfig.compilerOptions ?? {};

    // `types` kapalı liste: otomatik @types taraması devre dışı kalır.
    expect(options.types, "compilerOptions.types tanımlı değil").toBeDefined();
    expect(options.types).toContain("node");

    // `typeRoots` yalnızca repo içini göstermeli.
    expect(options.typeRoots, "compilerOptions.typeRoots tanımlı değil").toBeDefined();
    for (const root of options.typeRoots ?? []) {
      expect(root.startsWith("./"), `typeRoots girdisi göreli olmalı: ${root}`).toBe(true);
      expect(isInsideRepo(resolve(repoRoot, root))).toBe(true);
    }
    expect(options.typeRoots).toContain("./node_modules/@types");
  });
});
