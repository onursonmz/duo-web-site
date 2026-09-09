/**
 * ÜRETİM ROTA ENVANTERİ — BUILD ÇIKTISINDAN KEŞFEDİLİR.
 *
 * Public ses, kırık link ve metadata testleri elle tutulan AYRI rota listeleri
 * kullanıyordu. Yeni bir rota eklendiğinde listeye yazılmayı unutmak sessizce
 * KAPSAM KAYBI üretiyordu: S07'de `/iletisim/` ve sekiz EN çözüm rotası bir
 * süre hiç taranmadı.
 *
 * Envanter artık `dist/` içindeki gerçek sayfalardan türetilir; yeni bir rota
 * eklendiği anda taramaların kapsamına girer ve unutulamaz. Dahili istisnalar
 * AÇIKÇA listelenir — listelenmemiş her sayfa public sayılır ve public ses
 * kuralına tabidir.
 *
 * Keşif SENKRONDUR: Playwright testleri modül yüklenirken tanımlanır, bu yüzden
 * rota listesi test tanımından önce hazır olmalıdır.
 */
import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../../dist/", import.meta.url));

/**
 * DAHİLİ İSTİSNALAR — üretim sayfası değildir.
 *
 * `/design-system/`: dahili önizleme; navigasyonda yer almaz.
 *
 * Bu listeye eklemek BİLİNÇLİ bir karardır. Buraya yazılmayan her yeni sayfa
 * public kabul edilir ve public ses taramasına girer.
 */
export const INTERNAL_ROUTES: readonly string[] = ["/design-system/"];

function walk(dir: string, found: string[]): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, found);
    else if (entry.name === "index.html") {
      const rel = relative(DIST, path).split(sep).slice(0, -1).join("/");
      found.push(rel === "" ? "/" : `/${rel}/`);
    }
  }
  return found;
}

/** Build çıktısındaki TÜM sayfa rotaları (dahili olanlar dahil), sıralı. */
export function discoverRoutes(): string[] {
  const routes = walk(DIST, []).sort();
  if (routes.length === 0) {
    throw new Error(`Rota bulunamadı: ${DIST} boş. Testlerden önce build gerekir.`);
  }
  return routes;
}

/** Ziyaretçiye gösterilen üretim rotaları. */
export function publicRoutes(): string[] {
  return discoverRoutes().filter((route) => !INTERNAL_ROUTES.includes(route));
}

/** Bir rotanın hangi locale'e ait olduğu — TR öneksiz, EN `/en/` altında. */
export function routeLocale(route: string): "tr" | "en" {
  return route.startsWith("/en/") || route === "/en/" ? "en" : "tr";
}
