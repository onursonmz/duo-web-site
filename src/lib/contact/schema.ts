/**
 * İLETİŞİM FORMU — TEK DOĞRULAMA KAYNAĞI (S12).
 *
 * Client ve server doğrulaması AYNI kurallardan türer: tarayıcıdaki HTML
 * öznitelikleri de, sunucu çekirdeğindeki denetim de aşağıdaki `FIELDS`
 * tanımından üretilir. Kural iki yerde ayrı ayrı yazılmaz, dolayısıyla
 * birbirinden kayamaz.
 *
 * VERİ MİNİMİZASYONU: yalnızca yanıt verebilmek için gereken alanlar vardır.
 * Telefon alanı BİLİNÇLİ OLARAK YOKTUR — zorunlu değildir ve toplanan kişisel
 * veriyi gereksiz genişletir.
 */
import { CONTACT_TOPICS, GENERAL_TOPIC, isContactTopic } from "./topics";

export type FieldName = "name" | "email" | "organization" | "topic" | "message" | "consent";

export interface FieldRule {
  readonly name: FieldName;
  readonly type: "text" | "email" | "select" | "textarea" | "checkbox";
  readonly required: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  /** HTML `pattern` özniteliği ve sunucu denetimi için ORTAK ifade. */
  readonly pattern?: string;
  readonly autocomplete?: string;
}

/**
 * Alan kuralları. `maxLength` değerleri hem HTML'e hem sunucuya gider;
 * sunucu ayrıca ham gövde boyutunu da sınırlar (bkz. `MAX_BODY_BYTES`).
 */
export const FIELDS: readonly FieldRule[] = [
  {
    name: "name",
    type: "text",
    required: true,
    minLength: 2,
    maxLength: 80,
    autocomplete: "name",
  },
  {
    name: "email",
    type: "email",
    required: true,
    minLength: 6,
    maxLength: 120,
    // Kurumsal e-posta beklenir; serbest sağlayıcılar ayrıca uyarılır (bloke edilmez).
    pattern: "^[^@\\s]+@[^@\\s.]+(\\.[^@\\s.]+)+$",
    autocomplete: "email",
  },
  {
    name: "organization",
    type: "text",
    required: true,
    minLength: 2,
    maxLength: 100,
    autocomplete: "organization",
  },
  { name: "topic", type: "select", required: true },
  { name: "message", type: "textarea", required: true, minLength: 20, maxLength: 2000 },
  { name: "consent", type: "checkbox", required: true },
] as const;

export const FIELD_BY_NAME: Readonly<Record<FieldName, FieldRule>> = Object.fromEntries(
  FIELDS.map((field) => [field.name, field])
) as Record<FieldName, FieldRule>;

/** Bot tuzağı: gerçek kullanıcı bu alanı DOLDURAMAZ (görsel olarak gizlidir). */
export const HONEYPOT_FIELD = "website" as const;

/** Formun render edildiği anı taşıyan alan; çok hızlı gönderimler elenir. */
export const TIMESTAMP_FIELD = "rendered_at" as const;

/** Aynı gönderimin tekrarını elemek için istemcide üretilen kimlik. */
export const IDEMPOTENCY_FIELD = "submission_id" as const;

/** Spam sağlayıcısının token alanı. Sağlayıcı seçilene kadar boş kalır. */
export const SPAM_TOKEN_FIELD = "spam_token" as const;

/** Ham istek gövdesi üst sınırı (bayt). Alan sınırlarının toplamından geniş, ama sınırlı. */
export const MAX_BODY_BYTES = 8 * 1024;

/** Formun render edilmesinden sonra beklenen en kısa süre (ms). */
export const MIN_FILL_MS = 2_000;

/** Aynı gönderimin geçerli sayıldığı pencere (ms). */
export const IDEMPOTENCY_WINDOW_MS = 10 * 60 * 1000;

export type ErrorCode =
  "required" | "too_short" | "too_long" | "invalid_format" | "invalid_choice" | "not_accepted";

export interface FieldError {
  readonly field: FieldName;
  readonly code: ErrorCode;
}

export interface ContactSubmission {
  readonly name: string;
  readonly email: string;
  readonly organization: string;
  readonly topic: string;
  readonly message: string;
  readonly consent: boolean;
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: readonly FieldError[];
  /** Yalnızca `ok` true olduğunda doludur. */
  readonly value?: ContactSubmission;
}

function textErrors(rule: FieldRule, raw: unknown): ErrorCode | null {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (value === "") return rule.required ? "required" : null;
  if (rule.minLength !== undefined && value.length < rule.minLength) return "too_short";
  if (rule.maxLength !== undefined && value.length > rule.maxLength) return "too_long";
  if (rule.pattern !== undefined && !new RegExp(rule.pattern, "u").test(value)) {
    return "invalid_format";
  }
  return null;
}

/**
 * Gönderimi doğrular. Client ve server AYNI bu fonksiyonu çağırır.
 *
 * Girdi `unknown`: sunucuya gelen ham veriye güvenilmez.
 */
export function validateSubmission(input: Record<string, unknown>): ValidationResult {
  const errors: FieldError[] = [];

  for (const rule of FIELDS) {
    const raw = input[rule.name];

    if (rule.type === "checkbox") {
      const accepted = raw === true || raw === "on" || raw === "true" || raw === "1";
      if (rule.required && !accepted) errors.push({ field: rule.name, code: "not_accepted" });
      continue;
    }

    if (rule.type === "select") {
      const value = typeof raw === "string" ? raw : "";
      if (value === "") {
        if (rule.required) errors.push({ field: rule.name, code: "required" });
        continue;
      }
      if (!isContactTopic(value)) errors.push({ field: rule.name, code: "invalid_choice" });
      continue;
    }

    const code = textErrors(rule, raw);
    if (code !== null) errors.push({ field: rule.name, code });
  }

  if (errors.length > 0) return { ok: false, errors };

  const text = (name: FieldName): string => String(input[name] ?? "").trim();
  return {
    ok: true,
    errors: [],
    value: {
      name: text("name"),
      email: text("email"),
      organization: text("organization"),
      topic: isContactTopic(input["topic"]) ? input["topic"] : GENERAL_TOPIC,
      message: text("message"),
      consent: true,
    },
  };
}

/** HTML özniteliklerini kuraldan üretir; şablona elle sınır yazılmaz. */
export function htmlAttributes(name: FieldName): Record<string, string | number | boolean> {
  const rule = FIELD_BY_NAME[name];
  const attrs: Record<string, string | number | boolean> = { name: rule.name };
  if (rule.required) attrs["required"] = true;
  if (rule.minLength !== undefined && rule.type !== "select") attrs["minlength"] = rule.minLength;
  if (rule.maxLength !== undefined && rule.type !== "select") attrs["maxlength"] = rule.maxLength;
  if (rule.pattern !== undefined) attrs["pattern"] = rule.pattern;
  if (rule.autocomplete !== undefined) attrs["autocomplete"] = rule.autocomplete;
  if (rule.type === "email") attrs["type"] = "email";
  if (rule.type === "text") attrs["type"] = "text";
  return attrs;
}

/** Seçim listesi için konu değerleri. */
export const TOPIC_OPTIONS = CONTACT_TOPICS;
