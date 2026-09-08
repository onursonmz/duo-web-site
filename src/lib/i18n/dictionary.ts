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
    "nav.insights": "İçgörüler",
    "nav.cyclops": "CyclOps",
    "nav.services": "Hizmetler",
    "nav.about": "Hakkımızda",
    "nav.contact": "İletişim",
    "nav.language": "Dil",
    "nav.languageSwitch": "English sayfasına geç",
    "nav.primary": "Ana menü",
    "nav.openMenu": "Menüyü aç",
    "nav.closeMenu": "Menüyü kapat",
    "nav.openSolutions": "Çözüm alanlarını göster",
    "nav.allSolutions": "Tüm çözüm alanları",
    "nav.breadcrumb": "Neredesiniz",
    "nav.goToBrandHome": "Duosis ana sayfasına git",

    "footer.heading": "Duosis",
    "footer.value":
      "Operasyonel görünürlük, veri akışı, kurumsal mimari ve otomasyonu tek mühendislik disiplininde birleştiriyoruz.",
    "footer.offices": "Ofisler",
    "footer.officeIstanbul": "İstanbul — Brandium R2, Ataşehir",
    "footer.officeAnkara": "Ankara — Çankaya",
    "footer.contact": "İletişim",
    "footer.nav": "Site haritası",
    "footer.rights": "Tüm hakları saklıdır.",
    "footer.buildNote": "Bu sürüm geliştirme aşamasındadır ve arama motorlarına kapalıdır.",

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
    "nav.insights": "Insights",
    "nav.cyclops": "CyclOps",
    "nav.services": "Services",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.language": "Language",
    "nav.languageSwitch": "Switch to the Turkish page",
    "nav.primary": "Primary navigation",
    "nav.openMenu": "Open the menu",
    "nav.closeMenu": "Close the menu",
    "nav.openSolutions": "Show the solution areas",
    "nav.allSolutions": "All solution areas",
    "nav.breadcrumb": "You are here",
    "nav.goToBrandHome": "Go to the Duosis home page",

    "footer.heading": "Duosis",
    "footer.value":
      "We bring operational visibility, data streaming, enterprise architecture and automation together under one engineering discipline.",
    "footer.offices": "Offices",
    "footer.officeIstanbul": "Istanbul — Brandium R2, Atasehir",
    "footer.officeAnkara": "Ankara — Cankaya",
    "footer.contact": "Contact",
    "footer.nav": "Site map",
    "footer.rights": "All rights reserved.",
    "footer.buildNote": "This build is under development and is closed to search engines.",

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

/**
 * İçerik verisinde `cta.labelKey` olarak kullanılabilecek KAPALI anahtar kümesi.
 * Şema bu listeye göre doğrular; serbest string veya cast kabul edilmez.
 */
export const CTA_LABEL_KEYS = [
  "cta.exploreSolutions",
  "cta.solutionDetail",
  "cta.backToSolutions",
  "cta.contactUs",
] as const satisfies readonly TranslationKey[];

export type CtaLabelKey = (typeof CTA_LABEL_KEYS)[number];

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
