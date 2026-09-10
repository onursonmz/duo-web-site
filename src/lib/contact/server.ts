/**
 * İLETİŞİM FORMU — SUNUCU ÇEKİRDEĞİ (S12).
 *
 * SAĞLAYICI BAĞIMSIZ. Deployment adapter'ı, CRM hedefi ve spam sağlayıcısı
 * henüz seçilmediği için bu dosyada HİÇBİR provider-specific kod yoktur;
 * dış dünya `SubmissionAdapter`, `RateLimiter` ve `SpamVerifier` arayüzleri
 * üzerinden takılır. Çekirdek saf TypeScript'tir ve birim testiyle koşar.
 *
 * FAIL-CLOSED: teslim edilemeyen bir gönderim ASLA başarı olarak raporlanmaz.
 * Demo/dry-run modunda sonuç açıkça "gönderilmedi"dir.
 */
import {
  HONEYPOT_FIELD,
  IDEMPOTENCY_FIELD,
  IDEMPOTENCY_WINDOW_MS,
  MAX_BODY_BYTES,
  MIN_FILL_MS,
  SPAM_TOKEN_FIELD,
  TIMESTAMP_FIELD,
  validateSubmission,
  type ContactSubmission,
  type FieldError,
} from "./schema";

/* ------------------------------------------------------------------ tipler */

export type RejectReason =
  | "method_not_allowed"
  | "unsupported_media_type"
  | "origin_mismatch"
  | "payload_too_large"
  | "validation_failed"
  | "honeypot"
  | "too_fast"
  | "duplicate"
  | "rate_limited"
  | "spam_rejected"
  | "spam_unavailable"
  | "delivery_unavailable"
  | "delivery_failed"
  | "delivery_timeout";

export interface ContactResult {
  /** Gönderim GERÇEKTEN teslim edildiyse `true`. Demo modunda asla `true` olmaz. */
  readonly delivered: boolean;
  readonly status: number;
  readonly reason?: RejectReason;
  readonly errors?: readonly FieldError[];
  /** Kullanıcıya gösterilecek durum anahtarı (sözlükten çevrilir). */
  readonly messageKey: string;
}

export interface RateLimiter {
  /** `false` dönerse istek reddedilir. Uygulama sağlayıcıya göre değişir. */
  check(key: string): Promise<boolean> | boolean;
}

export interface SpamVerifier {
  /** Sağlayıcı seçilmediyse `configured: false` döner ve gönderim GEÇMEZ. */
  readonly configured: boolean;
  verify(token: string): Promise<boolean>;
}

export interface SubmissionAdapter {
  readonly kind: "dry-run" | "live";
  /** `false` dönerse teslim BAŞARISIZ sayılır; sahte başarı üretilmez. */
  deliver(submission: ContactSubmission): Promise<boolean>;
}

export interface Logger {
  info(event: string, data: Record<string, unknown>): void;
  warn(event: string, data: Record<string, unknown>): void;
}

export interface HandlerOptions {
  readonly adapter: SubmissionAdapter;
  readonly rateLimiter: RateLimiter;
  readonly spam: SpamVerifier;
  readonly logger: Logger;
  /** İzin verilen origin'ler; boşsa origin denetimi GEÇİLMEZ, istek reddedilir. */
  readonly allowedOrigins: readonly string[];
  /** Hukuki metin onaylandı mı? Onaysızsa gerçek teslim YAPILMAZ. */
  readonly legalApproved: boolean;
  /** Teslim için üst süre sınırı (ms). */
  readonly timeoutMs?: number;
  readonly now?: () => number;
}

/* ------------------------------------------------------- PII-güvenli loglama */

/**
 * E-postayı loglanabilir hâle getirir: `a***@example.com`.
 * TAM e-posta, mesaj gövdesi veya ad ASLA loglanmaz.
 */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  return `${local.slice(0, 1)}***@${domain}`;
}

/** Log kaydı için güvenli özet: kişisel içerik yerine ÖLÇÜ taşır. */
export function safeLogFields(submission: ContactSubmission): Record<string, unknown> {
  return {
    topic: submission.topic,
    emailDomain: submission.email.split("@")[1] ?? "",
    messageLength: submission.message.length,
    organizationLength: submission.organization.length,
    nameLength: submission.name.length,
  };
}

/* ------------------------------------------------- yardımcı: zaman aşımı */

async function withTimeout<T>(task: Promise<T>, ms: number, onTimeout: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(onTimeout), ms);
  });
  try {
    return await Promise.race([task, guard]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/* --------------------------------------------------------- idempotency */

/**
 * Bellek içi tekrar koruması. Üretimde paylaşımlı bir depoya taşınır;
 * arayüz aynı kalır.
 */
export class InMemoryIdempotencyStore {
  private readonly seen = new Map<string, number>();
  private readonly windowMs: number;

  constructor(windowMs: number = IDEMPOTENCY_WINDOW_MS) {
    this.windowMs = windowMs;
  }

  /** İlk görülüşte `true`; pencere içinde tekrar edilirse `false`. */
  accept(key: string, now: number): boolean {
    for (const [id, at] of this.seen) {
      if (now - at > this.windowMs) this.seen.delete(id);
    }
    if (this.seen.has(key)) return false;
    this.seen.set(key, now);
    return true;
  }
}

/* ------------------------------------------------------------- çekirdek */

const JSON_TYPE = "application/json";
const FORM_TYPE = "application/x-www-form-urlencoded";

function reject(status: number, reason: RejectReason, messageKey: string): ContactResult {
  return { delivered: false, status, reason, messageKey };
}

/**
 * Bir iletişim gönderimini işler.
 *
 * Sıra bilinçlidir: ucuz ve niyet belirten denetimler (method, tip, origin,
 * boyut) önce; kişisel veri işlenmeden ELENİR.
 */
export async function handleContactSubmission(
  request: {
    method: string;
    contentType: string | null;
    origin: string | null;
    bodyBytes: number;
    fields: Record<string, unknown>;
    clientKey: string;
  },
  options: HandlerOptions,
  idempotency: InMemoryIdempotencyStore
): Promise<ContactResult> {
  const now = options.now ?? Date.now;
  const timeoutMs = options.timeoutMs ?? 5_000;

  if (request.method.toUpperCase() !== "POST") {
    return reject(405, "method_not_allowed", "contact.error.method");
  }

  const type = (request.contentType ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
  if (type !== JSON_TYPE && type !== FORM_TYPE) {
    return reject(415, "unsupported_media_type", "contact.error.contentType");
  }

  // Origin denetimi FAIL-CLOSED: liste boşsa veya origin eşleşmiyorsa reddedilir.
  if (options.allowedOrigins.length === 0 || request.origin === null) {
    return reject(403, "origin_mismatch", "contact.error.origin");
  }
  if (!options.allowedOrigins.includes(request.origin)) {
    return reject(403, "origin_mismatch", "contact.error.origin");
  }

  if (request.bodyBytes > MAX_BODY_BYTES) {
    return reject(413, "payload_too_large", "contact.error.tooLarge");
  }

  // Honeypot: doldurulmuşsa sessizce elenir; kullanıcıya başarı DENMEZ.
  const honeypot = request.fields[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    options.logger.warn("contact.honeypot", { clientKey: request.clientKey });
    return reject(400, "honeypot", "contact.error.generic");
  }

  // Çok hızlı gönderim: form render zamanı ile arada en az MIN_FILL_MS olmalı.
  const renderedAt = Number(request.fields[TIMESTAMP_FIELD]);
  if (Number.isFinite(renderedAt) && now() - renderedAt < MIN_FILL_MS) {
    options.logger.warn("contact.tooFast", { clientKey: request.clientKey });
    return reject(400, "too_fast", "contact.error.generic");
  }

  const allowed = await options.rateLimiter.check(request.clientKey);
  if (!allowed) {
    options.logger.warn("contact.rateLimited", { clientKey: request.clientKey });
    return reject(429, "rate_limited", "contact.error.rateLimited");
  }

  const validation = validateSubmission(request.fields);
  if (!validation.ok || validation.value === undefined) {
    return {
      delivered: false,
      status: 422,
      reason: "validation_failed",
      errors: validation.errors,
      messageKey: "contact.error.validation",
    };
  }
  const submission = validation.value;

  // Tekrar gönderim koruması.
  const submissionId = String(request.fields[IDEMPOTENCY_FIELD] ?? "");
  if (submissionId !== "" && !idempotency.accept(submissionId, now())) {
    options.logger.info("contact.duplicate", { topic: submission.topic });
    return reject(409, "duplicate", "contact.error.duplicate");
  }

  // Spam doğrulaması: sağlayıcı yoksa gönderim GEÇMEZ (fail-closed).
  if (!options.spam.configured) {
    options.logger.warn("contact.spamUnavailable", safeLogFields(submission));
    return reject(503, "spam_unavailable", "contact.error.unavailable");
  }
  const token = String(request.fields[SPAM_TOKEN_FIELD] ?? "");
  const spamOk = await withTimeout(options.spam.verify(token), timeoutMs, false);
  if (!spamOk) {
    options.logger.warn("contact.spamRejected", { topic: submission.topic });
    return reject(400, "spam_rejected", "contact.error.generic");
  }

  // Hukuki metin onaylanmadan GERÇEK teslim yapılmaz.
  if (!options.legalApproved || options.adapter.kind === "dry-run") {
    options.logger.info("contact.notDelivered", {
      ...safeLogFields(submission),
      adapter: options.adapter.kind,
      legalApproved: options.legalApproved,
    });
    return {
      delivered: false,
      status: 503,
      reason: "delivery_unavailable",
      messageKey: "contact.notDelivered",
    };
  }

  const delivered = await withTimeout(options.adapter.deliver(submission), timeoutMs, false);
  if (!delivered) {
    options.logger.warn("contact.deliveryFailed", safeLogFields(submission));
    return reject(502, "delivery_failed", "contact.error.delivery");
  }

  options.logger.info("contact.delivered", safeLogFields(submission));
  return { delivered: true, status: 200, messageKey: "contact.success" };
}

/* ----------------------------------------------------- varsayılan parçalar */

/** Hiçbir şey göndermeyen adapter. Sahte başarı ÜRETMEZ. */
export const dryRunAdapter: SubmissionAdapter = {
  kind: "dry-run",
  deliver: async () => false,
};

/** Sağlayıcı seçilmediği için doğrulama YAPILAMAZ; fail-closed. */
export const unconfiguredSpamVerifier: SpamVerifier = {
  configured: false,
  verify: async () => false,
};

/** Test/demo için sabit pencereli basit sayaç. */
export class FixedWindowRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, number[]>();
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly now: () => number;

  constructor(limit: number, windowMs: number, now: () => number = Date.now) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
  }

  check(key: string): boolean {
    const at = this.now();
    const window = (this.hits.get(key) ?? []).filter((t) => at - t < this.windowMs);
    if (window.length >= this.limit) {
      this.hits.set(key, window);
      return false;
    }
    window.push(at);
    this.hits.set(key, window);
    return true;
  }
}

/**
 * VARSAYILAN LOGGER: SESSİZ.
 *
 * Çekirdek kendi başına hiçbir yere yazmaz — kişisel veri taşımayan özetler
 * bile olsa, nereye aktığına dağıtım katmanı karar verir. Gerçek logger
 * `HandlerOptions.logger` ile enjekte edilir.
 */
export const silentLogger: Logger = {
  info: () => {},
  warn: () => {},
};
