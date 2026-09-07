# DUOSIS Web Sitesi Yenileme — Claude Başlangıç Paketi

Bu paket, Duosis kurumsal web sitesinin sıfırdan ve özgün bir tasarımla geliştirilmesi için bağlayıcı ürün, tasarım, teknik kalite ve teslim sözleşmesidir.

## Çalışma şekli

1. Önce bu dosyayı, ardından `01_PRODUCT_AND_DESIGN_CONTRACT.md`, `02_TECHNICAL_ARCHITECTURE.md`, `03_CONTENT_AND_ROUTE_MAP.md` ve `04_DELIVERY_PROTOCOL.md` dosyalarını oku.
2. Yalnızca `sprints/S00_DISCOVERY_AND_BASELINE.md` sprintini uygula.
3. Bir sprint tamamlanmadan ve Codex incelemesi açıkça onay vermeden sonraki sprinte geçme.
4. Sprint sonunda `CLAUDE_REPORT_TEMPLATE.md` biçiminde rapor üret.
5. Kullanıcının mevcut değişikliklerini ve kaynak dosyalarını koru. İlgisiz dosyaları değiştirme.
6. Sprint sonunda yerel commit oluştur; açıkça istenmedikçe push, merge veya prod deployment yapma.

## Ürün hedefi

Duosis'i yalnızca teknoloji ürünleri satan bir entegratör gibi değil; BT operasyonu, veri, kurumsal mimari, otomasyon ve AI yetkinliklerini tek mühendislik yaklaşımında birleştiren, 10 yıllık güvene ve kendi ürünü CyclOps'a sahip bir teknoloji şirketi olarak konumlandırmak.

Ana mesaj:

> Operasyonu görün. Veriyi bağlayın. AI ile harekete geçin.

Bu metin onaylanmış nihai pazarlama metni değildir; gerçek içerik onayı gelene kadar değiştirilebilir bir taslak olarak tutulacaktır.

## Varsayılan tasarım yönü

**Command Atlas Hybrid**

- Keskin, editoryal ve yüksek güven veren kurumsal görünüm.
- Çok koyu ink/lacivert ile kırık beyaz ana yüzeyler.
- Duosis turkuazı sinyal, sınırlı turuncu aksiyon vurgusu.
- Büyük tipografi, ince grid çizgileri, düşük radius; glassmorphism ve kart yığını yok.
- Canlı sistem/topoloji çizgileri yalnızca hikâyeyi desteklediği yerlerde.
- AI, ayrı bir süs veya her yerde açılan chatbot değil; tüm çözüm alanlarını bağlayan yatay karar katmanı.

## Bağlayıcı ürün kısıtları

- WordPress kullanılmayacak.
- Türkçe varsayılan dil; İngilizce URL'ler `/en/...` altında.
- Mobil öncelikli ve WCAG 2.2 AA hedefli.
- Core Web Vitals hedefleri: LCP `< 2.5 s`, CLS `< 0.1`, INP `< 200 ms` (75. yüzdelik saha hedefi).
- Analitik ve isteğe bağlı üçüncü taraf kodları açık kullanıcı onayı olmadan yüklenmeyecek.
- İçerikte doğrulanmamış sayı, müşteri adı, logo izni, başarı metriği veya AI kabiliyeti yayınlanmayacak.
- Gerçek ürün ekranı yoksa uydurma dashboard yerine açıkça “temsili” olarak etiketlenmiş şematik illüstrasyon kullanılacak.
- `prefers-reduced-motion` ve klavye kullanımında tüm kritik bilgi/işlev erişilebilir kalacak.

## Sprint sırası

| Sıra | Sprint | Çıktı |
|---:|---|---|
| S00 | Discovery & Baseline | Kaynak envanteri, karar kaydı, riskler, ölçülen mevcut durum |
| S01 | Repository & Quality Gates | Astro/TypeScript iskeleti, CI ve kalite komutları |
| S02 | Content Model & i18n | Tip güvenli içerik şemaları, TR/EN rota altyapısı |
| S03 | Design System | Command Atlas tokenları ve temel bileşen dili |
| S04 | Global Shell | Header, mega menü, footer, skip link, dil geçişi |
| S05 | Homepage Vertical Slice | Ana dönüşüm akışının statik uçtan uca sürümü |
| S06 | Command Atlas Hero | İmza hero/topoloji etkileşimi ve motion fallback |
| S07 | Solutions System | Çözüm landing ve veriyle çalışan detay şablonu |
| S08 | CyclOps | Signal-to-Action ürün sayfası ve demo anlatısı |
| S09 | 10 Years & About | Timeline, hakkımızda ve güven göstergeleri |
| S10 | Services, Tech, Regions & Proof | Hizmetler, ekosistem, bölgeler, referans sistemi |
| S11 | Insights/Blog | Blog landing, yazı şablonu, RSS ve içerik serileri |
| S12 | Contact, Consent & Analytics | Form, spam koruma, KVKK consent, dönüşüm olayları |
| S13 | SEO, Redirects & Structured Data | Metadata, sitemap, schema, 301 envanteri |
| S14 | A11y, Performance & Security | Bütçeler ve otomatik/manuel kalite matrisi |
| S15 | Final Polish & Demo Release | Cross-browser polish, demo senaryosu, release adayı |

## Şimdilik doğrulanması gereken iş girdileri

Bu girdiler eksikse sprint durdurulmaz; içerik verisinde `verificationStatus: pending` kullanılır ve kamuya açık sayfalarda iddia yayınlanmaz.

- 2016–2026 kilometre taşları ve tarihleri.
- “10+ yıl, 50+ kurumsal müşteri, 15+ teknik danışman” rakamlarının güncel onayı.
- Müşteri logolarının ve referans metinlerinin kullanım izinleri.
- Aktif/pasif teknoloji listesi; özellikle KACE kararı.
- CyclOps yazımı, ürün iddiaları, gerçek ekranları ve kullanım senaryoları.
- Türkiye, Central Asia ve Middle East için doğrulanabilir hizmet kapsamı.
- İletişim formunun CRM/e-posta hedefi ve veri saklama politikası.
- Mevcut logonun korunması veya 10. yıl için güncellenmesi kararı.

## Terim normalizasyonu

- Observability
- Foglight
- Instana
- Freshservice
- Configuration Management
- OpenText Operations Orchestration (OO)
- OpenText Server Automation (SA)
- CyclOps — marka ekibi farklı yazım onaylarsa içerik verisinden değiştirilecek

## İlk Claude talimatı

Claude'a bu paketi verip şunu yaz:

> Paketteki tüm ana sözleşme dosyalarını oku. Yalnızca S00 Discovery & Baseline sprintini uygula. Bilinmeyen iş gerçeklerini uydurma ve mevcut kullanıcı değişikliklerini koru. Sprint sonunda CLAUDE_REPORT_TEMPLATE.md biçiminde rapor ver; yerel commit dışında push, merge veya deployment yapma. Raporu verdikten sonra dur ve Codex incelemesini bekle.

