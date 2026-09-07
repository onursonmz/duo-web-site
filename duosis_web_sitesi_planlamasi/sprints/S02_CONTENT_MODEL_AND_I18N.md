# S02 — İçerik Modeli, Fixture Veri ve TR/EN Routing

## Amaç

Tüm sayfaların aynı tip güvenli içerik kaynağından üretileceği, Türkçe varsayılan ve İngilizce `/en` altında çalışan temel bilgi mimarisini kurmak.

## Yapılacaklar

1. `Solution`, `Technology`, `Service`, `Milestone`, `Proof/CaseStudy`, `Insight`, `Author` ve ortak SEO şemalarını tanımla.
2. Zorunlu enumları uygula:
   - status
   - verification status
   - logo permission
   - locale
3. Sekiz çözüm için TR fixture oluştur; en az iki çözüm için EN karşılık ekle.
4. Teknoloji envanterini kod içine dağınık sabitlemek yerine collection/data kaynağına taşı.
5. i18n route yardımcıları:
   - localized path üretimi
   - translationKey eşleme
   - locale algılama
   - güvenli missing-translation davranışı
6. Türkçe root ve İngilizce `/en` smoke sayfalarını oluştur.
7. Navigation label, CTA ve sistem mesajlarını locale dictionary ile yönet.
8. Draft/pending/permission filtrelerinin public ve preview davranışını uygula.
9. Şema validation ve route eşleme testleri yaz.
10. Türkçe karakterli içerik ile ASCII slug ayrımını test et.

## Kabul kriterleri

- [ ] Geçersiz frontmatter build'i kırıyor.
- [ ] `/` Türkçe, `/en/` İngilizce ve doğru `lang` ile render oluyor.
- [ ] Dil değiştirici aynı `translationKey` karşılığına gidebiliyor.
- [ ] Eksik çeviri yanlış dilde sessiz fallback göstermiyor.
- [ ] Pending claim ve izinsiz logo public build'de görünmüyor.
- [ ] Pasif teknoloji public listeden çıkıyor; kod değişmiyor.
- [ ] En az bir solution route TR ve EN fixture'dan üretiliyor.
- [ ] Tüm test/build komutları başarılı.

## Test / kanıt

- Schema invalid fixture negatif testi.
- Duplicate `translationKey + locale` negatif testi.
- Localized route unit testleri.
- Public filtering unit testleri.
- TR/EN Playwright smoke testleri.

## Kapsam dışı

- Nihai pazarlama metni.
- Görsel tasarım.
- Tüm içeriğin İngilizce çevirisi.

## Sprint sonu

Rapor ver ve dur. S03'e geçme.

