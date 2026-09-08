import type { Locale } from "@lib/content/schema";

/**
 * Locale sözlüğü — navigasyon etiketleri, CTA'lar ve sistem mesajları.
 *
 * Kural: arayüzde görünen hiçbir metin bileşenlere gömülmez; buradan gelir.
 * Metinler S02 için nötr ve işlevseldir; nihai pazarlama metni S05+ kapsamındadır.
 * TR ve EN ayrı ayrı yazılmıştır (kelime kelime çeviri değil).
 */

const dictionaries = {
  tr: {
    "site.name": "Duosis",
    "site.tagline": "Kurumsal web sitesi — geliştirme sürümü",

    "nav.skipToContent": "Ana içeriğe geç",
    "nav.home": "Ana sayfa",
    "nav.solutions": "Çözümler",
    "nav.language": "Dil",
    "nav.languageSwitch": "English sayfasına geç",

    "cta.exploreSolutions": "Çözümleri inceleyin",
    "cta.solutionDetail": "Çözüm detayına gidin",
    "cta.backToSolutions": "Çözümlere dön",
    "cta.contactUs": "Bizimle iletişime geçin",

    "solutions.title": "Çözüm alanları",
    "solutions.intro":
      "Aşağıdaki çözüm alanları taslak içerik modelinden üretilmektedir. Başlıklar ve kapsamlar iş sahibi onayı beklemektedir.",
    "solutions.problem": "Problem",
    "solutions.approach": "Yaklaşımımız",
    "solutions.benefits": "Beklenen faydalar",
    "solutions.technologies": "Teknoloji ekosistemi",
    "solutions.technologiesEmpty": "Bu çözüm için yayınlanabilir teknoloji kaydı bulunmuyor.",
    "solutions.empty": "Yayınlanabilir çözüm kaydı bulunmuyor.",

    "translation.unavailableTitle": "Bu sayfa henüz Türkçe değil",
    // Dil değiştiricide kullanılır: hedef dilde karşılık YOK demektir.
    "translation.notAvailableInTarget": "bu dilde henüz yayınlanmadı",
    "translation.unavailableBody":
      "Bu içeriğin Türkçe çevirisi henüz yayınlanmadı. Size yanlış dilde içerik göstermiyoruz.",
    "translation.availableIn": "İçerik şu dilde mevcut:",

    "draft.badge": "TASLAK",
    "draft.notice": "Bu sayfa taslak içerik modelinden üretilmiştir; doğrulanmış iddia içermez.",

    "lang.tr": "Türkçe",
    "lang.en": "English",
  },
  en: {
    "site.name": "Duosis",
    "site.tagline": "Corporate website — development build",

    "nav.skipToContent": "Skip to main content",
    "nav.home": "Home",
    "nav.solutions": "Solutions",
    "nav.language": "Language",
    "nav.languageSwitch": "Switch to the Turkish page",

    "cta.exploreSolutions": "Explore the solutions",
    "cta.solutionDetail": "Open solution details",
    "cta.backToSolutions": "Back to solutions",
    "cta.contactUs": "Get in touch",

    "solutions.title": "Solution areas",
    "solutions.intro":
      "These solution areas are generated from the draft content model. Titles and scope are pending owner verification.",
    "solutions.problem": "Problem",
    "solutions.approach": "Our approach",
    "solutions.benefits": "Expected outcomes",
    "solutions.technologies": "Technology ecosystem",
    "solutions.technologiesEmpty": "No publishable technology record for this solution.",
    "solutions.empty": "No publishable solution record.",

    "translation.unavailableTitle": "This page is not available in English yet",
    // Used in the language switcher: no counterpart exists in the target language.
    "translation.notAvailableInTarget": "not published in this language yet",
    "translation.unavailableBody":
      "The English version of this content has not been published. We do not show you content in the wrong language.",
    "translation.availableIn": "Available in:",

    "draft.badge": "DRAFT",
    "draft.notice":
      "This page is generated from the draft content model and contains no verified claims.",

    "lang.tr": "Türkçe",
    "lang.en": "English",
  },
} as const;

export type TranslationKey = keyof (typeof dictionaries)["tr"];

/** Sözlükteki anahtar sayısı — TR/EN paritesi testte doğrulanır. */
export const dictionaryKeys = Object.keys(dictionaries.tr) as TranslationKey[];

export function getDictionary(locale: Locale): Record<TranslationKey, string> {
  return dictionaries[locale];
}

/**
 * Çeviri arar. Anahtar bulunamazsa BAŞKA DİLE DÜŞMEZ — hata fırlatır.
 * Böylece eksik bir arayüz metni build/test sırasında görünür olur.
 */
export function t(locale: Locale, key: TranslationKey): string {
  const value = dictionaries[locale][key];
  if (value === undefined) {
    throw new Error(`Eksik çeviri: "${key}" (locale: ${locale})`);
  }
  return value;
}
