# S00 — Discovery, Kaynak Envanteri ve Baseline

## Amaç

Kod yazmadan önce repo, marka varlıkları, mevcut içerik, teknik ortam ve kamuya açık iddiaların güvenilir başlangıç durumunu ölçmek. Sonraki sprintlerde tahminle alınacak kararları engellemek.

## Girdiler

- Bu plan paketindeki tüm ana sözleşmeler.
- `Duosis_Yeni_Sunum_v2.pptx`.
- `duosis-hackathon-brief(1).txt`.
- Mevcut site: `https://duosis.com/`.
- Varsa mevcut/yeni repo ve marka varlıkları.

## Yapılacaklar

1. Repo/çalışma ortamı keşfi:
   - root dosya ağacı, git durumu, branch, HEAD, runtime ve package manager.
   - `AGENTS.md`, `CLAUDE.md`, README ve CI talimatlarının tamamını oku.
   - Mevcut değişiklikleri ayrı kaydet; hiçbirini silme/düzeltme.
2. Mevcut site envanteri:
   - Ana route ve menü ağacı.
   - Mevcut çözüm, uzmanlık, hizmet, partner, blog ve politika URL'leri.
   - Redirect planı için CSV/JSON başlangıç listesi.
3. İçerik doğruluk matrisi oluştur:
   - İddia/metrik, kaynak, sahibi, son doğrulama, kullanım durumu.
   - 10 yıl, 50+ müşteri, 15+ danışman ve bölge kapsamı ayrı satırlar.
4. Teknoloji envanteri:
   - Kullanıcı listesindeki adları normalize et.
   - `active`, `decisionNeeded`, `officialName`, `logoPermission` alanları.
   - KACE, eski Micro Focus/OpenText adları ve belirsiz ürünleri işaretle.
5. Görsel varlık envanteri:
   - Logo varyantları, SVG/raster durumu, çözünürlük, arka plan ve lisans/izin.
   - CyclOps gerçek ekranı/brand asset var mı?
   - Müşteri logolarını izin bilgisi olmadan public asset kabul etme.
6. Baseline ölçümü:
   - Mevcut sitenin desktop/mobile screenshot'ları.
   - Lighthouse veya eşdeğer performans/a11y/SEO ölçümü mümkünse.
   - Kırık link, console error, karışık dil ve görünür güncellik sorunları.
7. Architecture Decision Record taslağı:
   - Astro varsayımı uygun mu?
   - Deployment hedefi biliniyor mu?
   - Form için server runtime gerekir mi?
   - İçerik kaynağı Content Collections mı?
8. `S00_FINDINGS.md`, `content-truth-matrix.*`, `technology-inventory.*`, `legacy-url-inventory.*` çıktıları oluştur.

## Kabul kriterleri

- [ ] Git ve repo başlangıç durumu açıkça raporlandı.
- [ ] Kullanıcı değişikliklerine dokunulmadı.
- [ ] Mevcut public URL envanteri oluşturuldu; başarısız erişimler ayrı işaretlendi.
- [ ] Tüm çözüm/teknoloji girdileri normalize edildi ve belirsizler açıkça ayrıldı.
- [ ] Kamuya açık kullanılabilecek iddialarla pending iddialar ayrıldı.
- [ ] Logo/referans izin bilgisi bilinmeyenler `unknown` olarak kaldı.
- [ ] Mevcut site için en az desktop ve mobile baseline kanıtı var.
- [ ] Stack ve deployment belirsizlikleri ADR taslağında listelendi.
- [ ] Kod, dependency, push, merge veya deployment yapılmadı.

## Test / kanıt

- URL envanterinde duplicate ve boş URL kontrolü.
- Teknoloji envanterinde benzersiz ID ve izin durum enum kontrolü.
- Ekran görüntüleri ve ölçüm çıktıları.
- `git diff --stat` ile kaynak kod değişmediğinin kanıtı.

## Kapsam dışı

- Framework scaffold.
- Tasarım implementasyonu.
- Kamuya açık metinlerin nihai yazımı.
- Logo tasarımı veya müşteri logosu indirme.

## Sprint sonu

`CLAUDE_REPORT_TEMPLATE.md` biçiminde rapor ver ve dur. S01'e geçme.

