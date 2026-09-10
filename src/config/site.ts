/**
 * ORTAM VE YAYIN YAPILANDIRMASI (S12 + S13).
 *
 * Preview ve production davranışı BURADA ayrılır; bileşenler ortam tahmini
 * yapmaz. Değerler derleme zamanında okunur ve fail-closed doğrulanır.
 */

/** Production kanonik origin'i. Talimatla sabittir. */
export const PRODUCTION_ORIGIN = "https://duosis.com";

export type DeployEnv = "preview" | "production";

/** Ortam: yalnızca `DEPLOY_ENV=production` production sayılır. */
export function deployEnv(env: NodeJS.ProcessEnv = process.env): DeployEnv {
  return env["DEPLOY_ENV"] === "production" ? "production" : "preview";
}

export function isProduction(env: NodeJS.ProcessEnv = process.env): boolean {
  return deployEnv(env) === "production";
}

/**
 * Site URL'si.
 *
 * PRODUCTION'da:
 * - `PUBLIC_SITE_URL` zorunludur,
 * - `https://` olmak ZORUNDADIR,
 * - localhost / 127.0.0.1 KESİNLİKLE YASAKTIR.
 *
 * Koşullardan biri sağlanmazsa build KIRILIR; yanlış canonical üretilmez.
 */
export function resolveSiteUrl(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env["PUBLIC_SITE_URL"]?.trim() ?? "";

  if (!isProduction(env)) {
    return raw === "" ? "http://localhost:4321" : raw;
  }

  if (raw === "") {
    throw new Error(
      "[site] PRODUCTION build için PUBLIC_SITE_URL zorunludur. " + `Beklenen: ${PRODUCTION_ORIGIN}`
    );
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`[site] PUBLIC_SITE_URL geçerli bir URL değil: ${raw}`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`[site] PRODUCTION build HTTPS gerektirir; verilen: ${url.protocol}//`);
  }

  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local")
  ) {
    throw new Error(
      `[site] PRODUCTION build'de localhost canonical YASAK: ${raw}. ` +
        `Beklenen: ${PRODUCTION_ORIGIN}`
    );
  }

  return url.origin;
}

/* ------------------------------------------------------- form teslimi */

/**
 * HUKUK KAPISI.
 *
 * Aydınlatma metni onaylanmadan production formu veri GÖNDEREMEZ. Bu, build
 * zamanında sabitlenir: `LEGAL_APPROVED=true` verilmediği sürece teslim
 * kanalı kapalıdır ve sunucu çekirdeği `delivery_unavailable` döner.
 *
 * Değer içerik verisiyle de tutarlı olmalıdır: `legal.json` içindeki kayıt
 * `legal-review-required` iken bu bayrağın açılması `tests/unit/legal-gate`
 * tarafından kırılır.
 */
export function isLegalApproved(env: NodeJS.ProcessEnv = process.env): boolean {
  return env["LEGAL_APPROVED"] === "true";
}

/**
 * Gerçek teslim mümkün mü?
 *
 * Üç koşul birlikte sağlanmalıdır: production ortamı, hukuk onayı ve tanımlı
 * bir teslim hedefi. Herhangi biri eksikse form DEMO modundadır ve kullanıcıya
 * "gönderilmedi" denir.
 */
export function canDeliverForms(env: NodeJS.ProcessEnv = process.env): boolean {
  const target = env["CONTACT_FORM_TO"]?.trim() ?? "";
  return isProduction(env) && isLegalApproved(env) && target !== "";
}

/** İzin verilen origin'ler; fail-closed origin denetimi bunu kullanır. */
export function allowedFormOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  return isProduction(env) ? [resolveSiteUrl(env)] : [];
}
