import type { Locale } from "@lib/content/schema";

/**
 * TARİH BİÇİMLENDİRME — DETERMİNİSTİK, ICU'DAN BAĞIMSIZ (S11 §15).
 *
 * `Intl.DateTimeFormat` KULLANILMIYOR. Çıktısı çalıştırıldığı ortamın ICU
 * verisine bağlıdır: küçük ICU ile derlenmiş bir Node sürümünde Türkçe ay
 * adları İngilizceye düşer ve bu build sırasında sessizce olur. Ay adları
 * burada açıkça yazılır; aynı tarih her ortamda aynı metni üretir.
 *
 * Makine tarafı (`<time datetime>`, RSS, JSON-LD) her zaman ISO biçimindedir
 * ve locale'den ETKİLENMEZ.
 */

const MONTHS: Record<Locale, readonly string[]> = {
  tr: [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

/**
 * Tarihi UTC alanlarından okur.
 *
 * Yerel saat dilimi KULLANILMAZ: `publishedAt: 2026-09-10` UTC gece yarısı
 * olarak ayrıştırılır ve UTC+3'te yerel olarak okunursa hâlâ 10 Eylül'dür,
 * ama UTC-5'te 9 Eylül'e kayar. Build makinesinin saat dilimi yayın tarihini
 * değiştiremez.
 */
export function formatDate(date: Date, locale: Locale): string {
  const day = date.getUTCDate();
  const month = MONTHS[locale][date.getUTCMonth()] ?? "";
  const year = date.getUTCFullYear();
  // TR: "10 Eylül 2026" — EN: "10 September 2026"
  return `${day} ${month} ${year}`;
}

/** `<time datetime>`, RSS ve JSON-LD için makine biçimi: YYYY-MM-DD. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** JSON-LD ve RSS'in tam zaman damgası istediği yerler için. */
export function isoDateTime(date: Date): string {
  return date.toISOString();
}

/** RFC 822 — RSS `pubDate` alanının beklediği biçim. */
const RFC822_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const RFC822_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function rfc822(date: Date): string {
  const day = RFC822_DAYS[date.getUTCDay()];
  const month = RFC822_MONTHS[date.getUTCMonth()];
  const dayOfMonth = String(date.getUTCDate()).padStart(2, "0");
  const time = date.toISOString().slice(11, 19);
  return `${day}, ${dayOfMonth} ${month} ${date.getUTCFullYear()} ${time} GMT`;
}
