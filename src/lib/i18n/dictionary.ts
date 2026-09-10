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

    "nav.skipToContent": "Ana içeriğe geç",
    "nav.home": "Ana sayfa",
    "nav.solutions": "Çözümler",
    "nav.insights": "İçgörüler",
    "nav.cyclops": "CyclOps",
    "nav.services": "Hizmetler",
    "nav.about": "Hakkımızda",
    "nav.technologies": "Teknolojiler",
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

    "cta.exploreSolutions": "Çözümleri inceleyin",
    "cta.solutionDetail": "Çözüm detayına gidin",
    "cta.backToSolutions": "Çözümlere dön",
    "cta.contactUs": "Bizimle iletişime geçin",
    "cta.talkAboutService": "Bu hizmeti konuşalım",
    "cta.exploreTechnologies": "Teknoloji atlasını inceleyin",
    "cta.readInsight": "Yazıyı okuyun",

    "solutions.title": "Çözüm alanları",
    "solutions.intro":
      "Sekiz çözüm alanı. Her biri bir iş sonucuyla başlar; hangi ürünle çözüldüğü ikinci sorudur.",
    "solutions.problem": "Problem",
    "solutions.approach": "Yaklaşımımız",
    "solutions.benefits": "Beklenen faydalar",
    "solutions.capabilities": "Kabiliyetler",
    "solutions.aiRole": "Yapay zekâ burada ne yapıyor?",
    "solutions.aiDetect": "Algıla",
    "solutions.aiUnderstand": "Anla",
    "solutions.aiAct": "Harekete geç",
    "solutions.scenario": "Örnek akış",
    "solutions.scenarioResult": "Sonuç",
    "solutions.relatedInsights": "İlgili notlar",
    "product.realScreen": "Gerçek ürün ekranı",
    "product.relatedSolutions": "İlgili çözüm alanları",
    "about.jumpToYear": "Yıla git",
    "about.journeyLink": "On yılın kaydını görün",
    "solutions.technologies": "Çözüm kapsamında kullandığımız teknolojiler",
    "solutions.empty": "Yayınlanabilir çözüm kaydı bulunmuyor.",
    "solutions.proofs": "Bu alandaki çalışmalarımızdan",

    "services.title": "Hizmetler",
    "services.intro":
      "Çözüm alanlarını hangi çalışma biçimiyle teslim ettiğimiz. Beş hizmet; her biri ne zaman gerektiği, ne kapsadığı ve neyi teslim ettiğiyle tanımlı.",
    "services.eyebrow": "Çalışma biçimi",
    "services.whenNeeded": "Ne zaman gerekir?",
    "services.offer": "Duosis ne sunar?",
    "services.howWeWork": "Çalışma biçimi",
    "services.outcomes": "Somut çıktı",
    "services.relatedSolutions": "İlişkili çözüm alanları",
    "services.distinction":
      "Çözüm sayfaları çözülen problemi anlatır; bu sayfa o çözümün hangi çalışma biçimiyle teslim edildiğini anlatır.",

    "technologies.title": "Teknoloji yetenek atlası",
    "technologies.intro":
      "Önce yetenek, sonra teknoloji. Her katman bir çözüm alanına ve o alanda çözülen probleme bağlıdır; teknoloji adları katmanın sonunda gelir.",
    "technologies.eyebrow": "Yetenek katmanları",
    "technologies.problem": "Çözülen problem",
    "technologies.relatedSolution": "Çözüm alanı",
    "technologies.stack": "Bu katmanda çalıştığımız teknolojiler",
    "technologies.scopeNote":
      "Bu liste üzerinde çalıştığımız teknolojileri gösterir; satış, temsil veya iş ortaklığı ilişkisi ifade etmez.",
    "technologies.ownProduct": "Duosis ürünü",

    "regions.title": "Çalıştığımız bölgeler",
    "regions.intro": "Kurumsal projelerimizi üç bölgede yürütüyoruz.",
    "regions.eyebrow": "Bölgesel çalışma alanı",
    "regions.listLabel": "Bölge listesi",

    "insights.title": "İçgörüler",
    "insights.intro":
      "Mühendislik ekibinin operasyon, veri ve mimari üzerine yazdığı teknik notlar.",
    "insights.otherLanguage": "İçgörüler şu anda Türkçe olarak yayımlanıyor.",
    "insights.readMore": "Notu okuyun",
    "insights.publishedAt": "Yayın tarihi",
    "insights.series": "Seri",
    "insights.backToIndex": "Tüm içgörüler",
    "insights.featured": "Öne çıkan",
    "insights.latest": "Son yazılar",
    "insights.allSeries": "Seriler",
    "insights.allTags": "Etiketler",
    "insights.tags": "Etiketler",
    "insights.updatedAt": "Güncelleme",
    "insights.author": "Yazan",
    "insights.readingTimeUnit": "dk okuma",
    "insights.sources": "Kaynaklar",
    "insights.relatedSolutions": "İlgili çözüm alanları",
    "insights.rss": "RSS beslemesi",
    "insights.inSeries": "Bu seride",
    "insights.taggedWith": "Bu etiketle",
    "insights.seriesLabel": "Seri",
    "insights.tagLabel": "Etiket",
    "insights.articleCount": "yazı",

    "contact.title": "İletişim",
    "contact.intro":
      "Operasyonunuzu birlikte inceleyelim. Aşağıdaki adreslerden doğrudan ulaşabilirsiniz.",
    "contact.offices": "Ofisler",
    "contact.phone": "Telefon",
    "contact.email": "E-posta",

    // --- S12: iletişim formu ---
    "contact.formTitle": "Bize yazın",
    "contact.formIntro":
      "Aşağıdaki bilgiler size dönebilmemiz için gereklidir; fazlasını istemiyoruz.",
    "contact.field.name": "Ad soyad",
    "contact.field.email": "Kurumsal e-posta",
    "contact.field.organization": "Kurum",
    "contact.field.topic": "İlgi alanı",
    "contact.field.message": "Mesajınız",
    "contact.field.consent":
      "Aydınlatma metnini okudum; bilgilerimin bu talep için işlenmesini kabul ediyorum.",
    "contact.field.honeypot": "Bu alanı boş bırakın",
    "contact.topic.genel": "Genel",
    "contact.submit": "Gönder",
    "contact.required": "zorunlu",
    "contact.legalLink": "Aydınlatma metni",
    "contact.error.required": "Bu alan zorunlu.",
    "contact.error.too_short": "Girilen değer çok kısa.",
    "contact.error.too_long": "Girilen değer çok uzun.",
    "contact.error.invalid_format": "Biçim geçerli değil.",
    "contact.error.invalid_choice": "Listeden bir seçenek seçin.",
    "contact.error.not_accepted": "Devam etmek için onay gerekli.",
    "contact.error.summary": "Form gönderilemedi. Aşağıdaki alanları kontrol edin.",
    "contact.notDelivered":
      "Bu sürümde form gönderimi HENÜZ AÇIK DEĞİL: mesajınız iletilmedi. Lütfen bilgilerinizi kopyalayıp e-posta ile gönderin.",
    "contact.noJs":
      "Form doğrulaması JavaScript ile çalışır. JavaScript kapalıyken gönderim yapılamaz; e-posta veya telefonla ulaşabilirsiniz.",

    // --- S12: çerez izni ---
    "consent.title": "Çerez tercihleri",
    "consent.body":
      "Sitenin çalışması için gereken çerezler her zaman etkindir. Ölçümleme çerezleri varsayılan olarak KAPALIDIR ve yalnızca siz açarsanız kullanılır.",
    "consent.accept": "Kabul et",
    "consent.reject": "Reddet",
    "consent.customize": "Özelleştir",
    "consent.save": "Tercihleri kaydet",
    "consent.category.essential": "Zorunlu",
    "consent.category.essentialNote": "Her zaman etkin; kapatılamaz.",
    "consent.category.analytics": "Ölçümleme",
    "consent.category.analyticsNote":
      "Varsayılan kapalı. Şu an bir ölçümleme sağlayıcısı tanımlı değildir; açsanız bile dış istek yapılmaz.",
    "consent.reopen": "Çerez tercihleri",
    "consent.savedOn": "Tercih kaydedildi",

    "translation.unavailableTitle": "Bu sayfa henüz Türkçe değil",
    // Dil değiştiricide kullanılır: hedef dilde karşılık YOK demektir.
    "translation.notAvailableInTarget": "bu dilde henüz yayınlanmadı",
    "translation.unavailableBody": "Bu içerik şu anda yalnızca aşağıdaki dilde mevcut.",
    "translation.availableIn": "İçerik şu dilde mevcut:",

    "lang.tr": "Türkçe",
    "lang.en": "English",
  },
  en: {
    "site.name": "Duosis",

    "nav.skipToContent": "Skip to main content",
    "nav.home": "Home",
    "nav.solutions": "Solutions",
    "nav.insights": "Insights",
    "nav.cyclops": "CyclOps",
    "nav.services": "Services",
    "nav.about": "About",
    "nav.technologies": "Technologies",
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

    "cta.exploreSolutions": "Explore the solutions",
    "cta.solutionDetail": "Open solution details",
    "cta.backToSolutions": "Back to solutions",
    "cta.contactUs": "Get in touch",
    "cta.talkAboutService": "Let us talk about this service",
    "cta.exploreTechnologies": "Open the technology atlas",
    "cta.readInsight": "Read the article",

    "solutions.title": "Solution areas",
    "solutions.intro":
      "Eight solution areas. Each starts from a business outcome; which product delivers it is the second question.",
    "solutions.problem": "Problem",
    "solutions.approach": "Our approach",
    "solutions.benefits": "Expected outcomes",
    "solutions.capabilities": "Capabilities",
    "solutions.aiRole": "What does AI do here?",
    "solutions.aiDetect": "Detect",
    "solutions.aiUnderstand": "Understand",
    "solutions.aiAct": "Act",
    "solutions.scenario": "Example flow",
    "solutions.scenarioResult": "Outcome",
    "solutions.relatedInsights": "Related notes",
    "product.realScreen": "Real product screen",
    "product.relatedSolutions": "Related solution areas",
    "about.jumpToYear": "Jump to year",
    "about.journeyLink": "See the record of ten years",
    "solutions.technologies": "Technologies we work with in this area",
    "solutions.empty": "No publishable solution record.",
    "solutions.proofs": "From our work in this area",

    "services.title": "Services",
    "services.intro":
      "How we deliver the solution areas. Five services, each defined by when it is needed, what it covers and what it hands over.",
    "services.eyebrow": "Ways of working",
    "services.whenNeeded": "When do you need it?",
    "services.offer": "What Duosis provides",
    "services.howWeWork": "How we work",
    "services.outcomes": "What you receive",
    "services.relatedSolutions": "Related solution areas",
    "services.distinction":
      "Solution pages describe the problem being solved; this page describes the way of working that delivers it.",

    "technologies.title": "Technology capability atlas",
    "technologies.intro":
      "Capability first, technology second. Each layer maps to a solution area and the problem it solves; technology names come at the end of the layer.",
    "technologies.eyebrow": "Capability layers",
    "technologies.problem": "Problem being solved",
    "technologies.relatedSolution": "Solution area",
    "technologies.stack": "Technologies we work with in this layer",
    "technologies.scopeNote":
      "This list shows the technologies we work with; it does not state a reseller, representation or partnership relationship.",
    "technologies.ownProduct": "Duosis product",

    "regions.title": "Regions we work in",
    "regions.intro": "We run our enterprise engagements across three regions.",
    "regions.eyebrow": "Regional operating area",
    "regions.listLabel": "Region list",

    "insights.title": "Insights",
    "insights.intro":
      "Technical notes from the engineering team on operations, data and architecture.",
    "insights.otherLanguage": "Insights are currently published in Turkish.",
    "insights.readMore": "Read the note",
    "insights.publishedAt": "Published",
    "insights.series": "Series",
    "insights.backToIndex": "All insights",
    "insights.featured": "Featured",
    "insights.latest": "Latest articles",
    "insights.allSeries": "Series",
    "insights.allTags": "Tags",
    "insights.tags": "Tags",
    "insights.updatedAt": "Updated",
    "insights.author": "Written by",
    "insights.readingTimeUnit": "min read",
    "insights.sources": "Sources",
    "insights.relatedSolutions": "Related solution areas",
    "insights.rss": "RSS feed",
    "insights.inSeries": "In this series",
    "insights.taggedWith": "Tagged",
    "insights.seriesLabel": "Series",
    "insights.tagLabel": "Tag",
    "insights.articleCount": "articles",

    "contact.title": "Contact",
    "contact.intro":
      "Let us review your operation together. You can reach us directly at the details below.",
    "contact.offices": "Offices",
    "contact.phone": "Phone",
    "contact.email": "Email",

    // --- S12: contact form ---
    "contact.formTitle": "Write to us",
    "contact.formIntro": "The fields below are what we need to reply; we do not ask for more.",
    "contact.field.name": "Full name",
    "contact.field.email": "Work email",
    "contact.field.organization": "Organisation",
    "contact.field.topic": "Area of interest",
    "contact.field.message": "Your message",
    "contact.field.consent":
      "I have read the privacy notice and accept that my details are processed for this enquiry.",
    "contact.field.honeypot": "Leave this field empty",
    "contact.topic.genel": "General",
    "contact.submit": "Send",
    "contact.required": "required",
    "contact.legalLink": "Privacy notice",
    "contact.error.required": "This field is required.",
    "contact.error.too_short": "This value is too short.",
    "contact.error.too_long": "This value is too long.",
    "contact.error.invalid_format": "The format is not valid.",
    "contact.error.invalid_choice": "Choose an option from the list.",
    "contact.error.not_accepted": "Your approval is required to continue.",
    "contact.error.summary": "The form was not sent. Check the fields below.",
    "contact.notDelivered":
      "Form submission is NOT ENABLED in this build: your message was not sent. Please copy your details and email them to us.",
    "contact.noJs":
      "Form validation runs with JavaScript. With JavaScript disabled the form cannot be submitted; please reach us by email or phone.",

    // --- S12: cookie consent ---
    "consent.title": "Cookie preferences",
    "consent.body":
      "Cookies required for the site to work are always on. Measurement cookies are OFF by default and are used only if you turn them on.",
    "consent.accept": "Accept",
    "consent.reject": "Reject",
    "consent.customize": "Customise",
    "consent.save": "Save preferences",
    "consent.category.essential": "Essential",
    "consent.category.essentialNote": "Always on; cannot be turned off.",
    "consent.category.analytics": "Measurement",
    "consent.category.analyticsNote":
      "Off by default. No measurement provider is configured at the moment; even when enabled, no external request is made.",
    "consent.reopen": "Cookie preferences",
    "consent.savedOn": "Preference saved",

    "translation.unavailableTitle": "This page is not available in English yet",
    // Used in the language switcher: no counterpart exists in the target language.
    "translation.notAvailableInTarget": "not published in this language yet",
    "translation.unavailableBody": "This content is currently available in the language below.",
    "translation.availableIn": "Available in:",

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
  "cta.talkAboutService",
  "cta.exploreTechnologies",
  "cta.readInsight",
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
