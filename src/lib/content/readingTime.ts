/**
 * OKUMA SÜRESİ — DETERMİNİSTİK HESAP (S11 §10).
 *
 * Süre içerik kaydında YAZILMAZ, gövdeden hesaplanır. Elle yazılan bir değer
 * gövde değiştiğinde sessizce yanlışa dönerdi; hesaplanan değer her build'de
 * aynı girdi için aynı sonucu verir.
 *
 * Sayımdan ÇIKARILANLAR (okunmayan veya okuma hızını temsil etmeyen şeyler):
 * - kod blokları: satır satır okunmaz, taranır; kelime gibi saymak süreyi şişirir
 * - satır içi kod, bağlantı hedefleri (URL), görsel yolları
 * - markdown işaretleri (#, *, |, >) ve tablo çizgileri
 *
 * 200 kelime/dakika her iki dilde de kullanılır. Türkçe ve İngilizce için ayrı
 * bir katsayı UYDURULMAZ: ölçülmüş bir kaynağımız yok, ve tek katsayı en
 * azından tutarlı.
 */

export const WORDS_PER_MINUTE = 200;

/**
 * Markdown gövdesinden okunabilir kelimeleri sayar.
 * Girdi aynıysa çıktı her zaman aynıdır — rastgelelik veya tarih bağımlılığı yok.
 */
export function countWords(markdown: string): number {
  const text = markdown
    // frontmatter (gövde ayrıca verildiğinde normalde bulunmaz, güvenlik payı)
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
    // çitli kod blokları
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    // satır içi kod
    .replace(/`[^`]*`/g, " ")
    // görseller ve bağlantılar: metni kalır, HEDEF düşer
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, " $1 ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, " $1 ")
    // çıplak URL
    .replace(/https?:\/\/\S+/g, " ")
    // HTML etiketleri
    .replace(/<[^>]+>/g, " ")
    // markdown işaretleri ve tablo çizgileri
    .replace(/^\s{0,3}>\s?/gm, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, " ")
    .replace(/^\s*\|[-:|\s]+\|\s*$/gm, " ")
    .replace(/[|*_~#>]/g, " ");

  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  return words.length;
}

/**
 * Dakika cinsinden okuma süresi. Her zaman en az 1 döner: "0 dakika" bir
 * ölçüm değil, bir hata gibi okunur.
 */
export function readingMinutes(markdown: string): number {
  return Math.max(1, Math.round(countWords(markdown) / WORDS_PER_MINUTE));
}
