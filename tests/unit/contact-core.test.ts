import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CONTACT_TOPICS,
  EN_SOLUTION_TOPICS,
  GENERAL_TOPIC,
  TR_SOLUTION_TOPICS,
  isContactTopic,
  normalizeTopic,
  topicFromSearchParams,
} from "@lib/contact/topics";
import {
  FIELDS,
  HONEYPOT_FIELD,
  IDEMPOTENCY_FIELD,
  MAX_BODY_BYTES,
  MIN_FILL_MS,
  SPAM_TOKEN_FIELD,
  TIMESTAMP_FIELD,
  htmlAttributes,
  validateSubmission,
} from "@lib/contact/schema";
import {
  FixedWindowRateLimiter,
  InMemoryIdempotencyStore,
  dryRunAdapter,
  handleContactSubmission,
  maskEmail,
  safeLogFields,
  unconfiguredSpamVerifier,
  type Logger,
  type SpamVerifier,
  type SubmissionAdapter,
} from "@lib/contact/server";

/**
 * S12 — İLETİŞİM ÇEKİRDEĞİ.
 *
 * Client ve server aynı kurallardan türediği için doğrulama BURADA sınanır;
 * e2e tarafı davranışı ölçer, kuralı değil.
 */

const ORIGIN = "https://duosis.com";

function baseRequest(overrides: Partial<Parameters<typeof handleContactSubmission>[0]> = {}) {
  return {
    method: "POST",
    contentType: "application/json",
    origin: ORIGIN,
    bodyBytes: 512,
    clientKey: "test-client",
    fields: {
      name: "Ayşe Yılmaz",
      email: "ayse@ornekkurum.com",
      organization: "Örnek Kurum",
      topic: "operasyonel-gorunurluk",
      message: "Operasyon görünürlüğü konusunda mevcut kurulumumuzu konuşmak istiyoruz.",
      consent: true,
      [TIMESTAMP_FIELD]: 0,
      [IDEMPOTENCY_FIELD]: "sub-1",
      [SPAM_TOKEN_FIELD]: "token",
    } as Record<string, unknown>,
    ...overrides,
  };
}

const silentLogger: Logger = { info: () => {}, warn: () => {} };

const okSpam: SpamVerifier = { configured: true, verify: async () => true };
const failSpam: SpamVerifier = { configured: true, verify: async () => false };
const liveAdapter: SubmissionAdapter = { kind: "live", deliver: async () => true };
const brokenAdapter: SubmissionAdapter = { kind: "live", deliver: async () => false };

function options(overrides: Record<string, unknown> = {}) {
  return {
    adapter: liveAdapter,
    rateLimiter: { check: () => true },
    spam: okSpam,
    logger: silentLogger,
    allowedOrigins: [ORIGIN],
    legalApproved: true,
    now: () => MIN_FILL_MS + 1,
    ...overrides,
  } as Parameters<typeof handleContactSubmission>[1];
}

const store = () => new InMemoryIdempotencyStore();

/* ------------------------------------------------------------------ konu */

describe("konu allowlist'i — TEK canonical yaklaşım", () => {
  it("içerikteki yayınlanmış çözüm slug'larıyla birebir aynı", () => {
    const root = fileURLToPath(new URL("../../src/content/solutions/", import.meta.url));
    const published = (locale: string): string[] =>
      readdirSync(`${root}${locale}`)
        .map((file) => readFileSync(`${root}${locale}/${file}`, "utf8"))
        .filter((text) => /^status:\s*published\s*$/m.test(text))
        .map((text) => /^slug:\s*(\S+)\s*$/m.exec(text)?.[1] ?? "")
        .sort();

    expect([...TR_SOLUTION_TOPICS].sort()).toEqual(published("tr"));
    expect([...EN_SOLUTION_TOPICS].sort()).toEqual(published("en"));
  });

  it("`interest` gibi ikinci bir paralel sistem yok", () => {
    const schema = readFileSync(
      fileURLToPath(new URL("../../src/lib/contact/schema.ts", import.meta.url)),
      "utf8"
    );
    expect(schema).not.toMatch(/["']interest["']/);
    expect(FIELDS.some((field) => field.name === "topic")).toBe(true);
  });

  it("bilinmeyen değer `genel`e düşer, ham metin taşınmaz", () => {
    for (const raw of ["", "bilinmeyen", "<script>", "../gizli", "a".repeat(200)]) {
      expect(normalizeTopic(raw)).toBe(GENERAL_TOPIC);
    }
  });

  it("çok değerli parametre reddedilir", () => {
    expect(normalizeTopic(["cyclops", "otomasyon"])).toBe(GENERAL_TOPIC);
    const params = new URLSearchParams("topic=cyclops&topic=otomasyon");
    expect(topicFromSearchParams(params)).toBe(GENERAL_TOPIC);
  });

  it("tekil ve geçerli parametre korunur", () => {
    expect(topicFromSearchParams(new URLSearchParams("topic=cyclops"))).toBe("cyclops");
    expect(isContactTopic("cyclops")).toBe(true);
    expect(CONTACT_TOPICS.length).toBe(1 + 1 + 8 + 8);
  });
});

/* --------------------------------------------------------------- doğrulama */

describe("alan doğrulaması — client ve server AYNI kurallardan", () => {
  it("veri minimizasyonu: telefon alanı YOK", () => {
    expect(FIELDS.some((field) => field.name.includes("phone" as never))).toBe(false);
    expect(FIELDS.map((field) => field.name)).toEqual([
      "name",
      "email",
      "organization",
      "topic",
      "message",
      "consent",
    ]);
  });

  it("HTML öznitelikleri kuraldan üretiliyor", () => {
    const email = htmlAttributes("email");
    expect(email["maxlength"]).toBe(120);
    expect(email["required"]).toBe(true);
    expect(email["type"]).toBe("email");
    expect(typeof email["pattern"]).toBe("string");
  });

  it("geçerli gönderim kabul edilir", () => {
    const result = validateSubmission(baseRequest().fields);
    expect(result.ok).toBe(true);
    expect(result.value?.topic).toBe("operasyonel-gorunurluk");
  });

  it("boş zorunlu alanlar kod ile raporlanır", () => {
    const result = validateSubmission({});
    expect(result.ok).toBe(false);
    expect(result.errors.map((e) => e.field).sort()).toEqual([
      "consent",
      "email",
      "message",
      "name",
      "organization",
      "topic",
    ]);
  });

  it("aşırı uzun değer reddedilir", () => {
    const result = validateSubmission({
      ...baseRequest().fields,
      message: "a".repeat(2001),
    });
    expect(result.errors).toContainEqual({ field: "message", code: "too_long" });
  });

  it("çok kısa mesaj reddedilir", () => {
    const result = validateSubmission({ ...baseRequest().fields, message: "kısa" });
    expect(result.errors).toContainEqual({ field: "message", code: "too_short" });
  });

  it("bozuk e-posta reddedilir", () => {
    for (const email of ["ayse", "ayse@", "@kurum.com", "ayse@kurum", "a b@kurum.com"]) {
      const result = validateSubmission({ ...baseRequest().fields, email });
      expect(result.ok, email).toBe(false);
    }
  });

  it("allowlist dışı konu reddedilir", () => {
    const result = validateSubmission({ ...baseRequest().fields, topic: "serbest-konu" });
    expect(result.errors).toContainEqual({ field: "topic", code: "invalid_choice" });
  });

  it("onay kutusu işaretlenmeden geçilemez", () => {
    const result = validateSubmission({ ...baseRequest().fields, consent: false });
    expect(result.errors).toContainEqual({ field: "consent", code: "not_accepted" });
  });
});

/* ------------------------------------------------------------ sunucu akışı */

describe("sunucu çekirdeği — negatif matris", () => {
  it("GET reddedilir", async () => {
    const result = await handleContactSubmission(
      baseRequest({ method: "GET" }),
      options(),
      store()
    );
    expect(result.status).toBe(405);
    expect(result.delivered).toBe(false);
  });

  it("yanlış content-type reddedilir", async () => {
    const result = await handleContactSubmission(
      baseRequest({ contentType: "text/plain" }),
      options(),
      store()
    );
    expect(result.status).toBe(415);
  });

  it("origin eşleşmezse reddedilir", async () => {
    const result = await handleContactSubmission(
      baseRequest({ origin: "https://saldirgan.example" }),
      options(),
      store()
    );
    expect(result.status).toBe(403);
  });

  it("origin YOKSA reddedilir (fail-closed)", async () => {
    const result = await handleContactSubmission(baseRequest({ origin: null }), options(), store());
    expect(result.status).toBe(403);
  });

  it("izinli origin listesi boşsa reddedilir", async () => {
    const result = await handleContactSubmission(
      baseRequest(),
      options({ allowedOrigins: [] }),
      store()
    );
    expect(result.status).toBe(403);
  });

  it("aşırı büyük gövde reddedilir", async () => {
    const result = await handleContactSubmission(
      baseRequest({ bodyBytes: MAX_BODY_BYTES + 1 }),
      options(),
      store()
    );
    expect(result.status).toBe(413);
  });

  it("honeypot dolu ise reddedilir", async () => {
    const request = baseRequest();
    request.fields[HONEYPOT_FIELD] = "bot";
    const result = await handleContactSubmission(request, options(), store());
    expect(result.reason).toBe("honeypot");
    expect(result.delivered).toBe(false);
  });

  it("çok hızlı gönderim reddedilir", async () => {
    const request = baseRequest();
    request.fields[TIMESTAMP_FIELD] = 1_000;
    const result = await handleContactSubmission(request, options({ now: () => 1_500 }), store());
    expect(result.reason).toBe("too_fast");
  });

  it("rate limit aşılırsa 429", async () => {
    const limiter = new FixedWindowRateLimiter(1, 60_000, () => 0);
    const shared = store();
    const first = await handleContactSubmission(
      baseRequest(),
      options({ rateLimiter: limiter }),
      shared
    );
    expect(first.delivered).toBe(true);

    const request = baseRequest();
    request.fields[IDEMPOTENCY_FIELD] = "sub-2";
    const second = await handleContactSubmission(
      request,
      options({ rateLimiter: limiter }),
      shared
    );
    expect(second.status).toBe(429);
  });

  it("aynı gönderim iki kez işlenmez", async () => {
    const shared = store();
    const first = await handleContactSubmission(baseRequest(), options(), shared);
    expect(first.delivered).toBe(true);
    const second = await handleContactSubmission(baseRequest(), options(), shared);
    expect(second.status).toBe(409);
    expect(second.reason).toBe("duplicate");
  });

  it("spam sağlayıcısı yoksa gönderim GEÇMEZ", async () => {
    const result = await handleContactSubmission(
      baseRequest(),
      options({ spam: unconfiguredSpamVerifier }),
      store()
    );
    expect(result.delivered).toBe(false);
    expect(result.reason).toBe("spam_unavailable");
  });

  it("spam token geçersizse reddedilir", async () => {
    const result = await handleContactSubmission(
      baseRequest(),
      options({ spam: failSpam }),
      store()
    );
    expect(result.reason).toBe("spam_rejected");
  });

  it("spam doğrulaması takılırsa zaman aşımına düşer ve REDDEDİLİR", async () => {
    const hanging: SpamVerifier = { configured: true, verify: () => new Promise(() => {}) };
    const result = await handleContactSubmission(
      baseRequest(),
      options({ spam: hanging, timeoutMs: 20 }),
      store()
    );
    expect(result.delivered).toBe(false);
    expect(result.reason).toBe("spam_rejected");
  });

  it("teslim başarısızsa SAHTE BAŞARI üretilmez", async () => {
    const result = await handleContactSubmission(
      baseRequest(),
      options({ adapter: brokenAdapter }),
      store()
    );
    expect(result.delivered).toBe(false);
    expect(result.status).toBe(502);
  });

  it("dry-run adapter asla teslim etmez ve başarı demez", async () => {
    const result = await handleContactSubmission(
      baseRequest(),
      options({ adapter: dryRunAdapter }),
      store()
    );
    expect(result.delivered).toBe(false);
    expect(result.messageKey).toBe("contact.notDelivered");
  });

  it("hukuki metin onaylanmadan gerçek teslim YAPILMAZ", async () => {
    const result = await handleContactSubmission(
      baseRequest(),
      options({ legalApproved: false }),
      store()
    );
    expect(result.delivered).toBe(false);
    expect(result.reason).toBe("delivery_unavailable");
  });

  it("geçerli akış teslim eder", async () => {
    const result = await handleContactSubmission(baseRequest(), options(), store());
    expect(result.delivered).toBe(true);
    expect(result.status).toBe(200);
  });
});

/* --------------------------------------------------------- PII-güvenli log */

describe("loglama kişisel veri taşımaz", () => {
  it("e-posta maskelenir", () => {
    expect(maskEmail("ayse.yilmaz@ornekkurum.com")).toBe("a***@ornekkurum.com");
    expect(maskEmail("bozuk")).toBe("***");
  });

  it("log alanları tam e-posta, ad veya mesaj taşımaz", () => {
    const submission = {
      name: "Ayşe Yılmaz",
      email: "ayse.yilmaz@ornekkurum.com",
      organization: "Örnek Kurum",
      topic: "cyclops",
      message: "Gizli kalması gereken mesaj gövdesi.",
      consent: true,
    };
    const fields = safeLogFields(submission);
    const serialized = JSON.stringify(fields);
    expect(serialized).not.toContain(submission.email);
    expect(serialized).not.toContain(submission.name);
    expect(serialized).not.toContain(submission.message);
    expect(serialized).not.toContain(submission.organization);
    expect(fields["emailDomain"]).toBe("ornekkurum.com");
    expect(fields["messageLength"]).toBe(submission.message.length);
  });

  it("handler yalnızca güvenli alanları loglar", async () => {
    const captured: Record<string, unknown>[] = [];
    const logger: Logger = {
      info: (_event, data) => captured.push(data),
      warn: (_event, data) => captured.push(data),
    };
    await handleContactSubmission(baseRequest(), options({ logger }), store());
    const serialized = JSON.stringify(captured);
    expect(serialized).not.toContain("ayse@ornekkurum.com");
    expect(serialized).not.toContain("Ayşe");
    expect(serialized).not.toContain("Operasyon görünürlüğü");
  });
});
