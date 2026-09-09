# DUOSIS Web — S06 + S07 Birleşik Teslim Raporu

## Durum

- Sprintler: **S06** Command Atlas İmza Hero · **S07** Çözüm Sistemi ve İletişim Kabuğu
- Sonuç: **COMPLETE** (her iki sprint)
- Branch: `duosis-web/s06-s07-command-atlas-solutions`
- Branch base: `6ec04a1` (merge edilmiş `main`)
- **Remote CI: YEŞİL** — [run 34381576037](https://github.com/onursonmz/duo-web-site/actions/runs/34381576037), 4m58s
- Push: **YAPILDI** · Merge: **YAPILMADI** (`main` hâlâ `6ec04a1`)
- `git status --short` boş

| Commit    | Sprint  | İçerik                                                      |
| --------- | ------- | ----------------------------------------------------------- |
| `c5ab413` | **S06** | İç süreç dilinin kaldırılması + ADR-011 + imza hero         |
| `47fdc6c` | **S07** | Tek veri sürücülü çözüm şablonu ve editorial düzen          |
| `43b6f1a` | **S07** | Sekiz çözümün iki dilde tamamlanması, public ses düzeltmesi |
| `7de52fd` | **S07** | İletişim kabuğu ve allowlist'e bağlı CTA konusu             |
| `267a16a` | **S07** | S07 kabul testleri ve tarama doğruluğu düzeltmesi           |
| `0828546` | **S07** | 10. yıl bölümünün dengelenmesi, kanıt üreticisi             |
| `4ff9c4d` | **S07** | Public ses taramasının rota başına bölünmesi                |

| Ölçüm                | Değer                                |
| -------------------- | ------------------------------------ |
| S06 (base → c5ab413) | 36 dosya, 1999 ekleme, 377 silme     |
| S07 (c5ab413 → HEAD) | 37 dosya, 1699 ekleme, 154 silme     |
| Toplam (branch)      | 56 dosya, **3673 ekleme**, 506 silme |

> **Dürüstlük notu:** S06 kontrol noktası tek bir commit'te (`c5ab413`) toplandı ve
> commit mesajı içeriğini (hero + ADR-011) tam yansıtmıyor. Geçmiş yeniden
> yazılmadığı için düzeltilmedi; S07 ayrı ve anlamlı commit'lere bölündü.

---

## 1. Yayın kararları (ADR-011)

`docs/decisions/ADR-011-yayin-kararlari.md` üç kararı kayda geçirir:

- **Public ses kuralı:** ziyaretçiye iç yayın süreci anlatılmaz.
- **Onaylı konular ve sınırlar:** 10. yıl teması, Türkiye / Orta Asya / Orta Doğu
  çalışma alanı, sekiz çözüm alanı, algıla→anla→harekete geç zinciri, CyclOps'un
  Duosis'in kendi çözümü olması. Kuruluş gün/ayı, ofis–yerel ekip–müşteri sayısı,
  ülke listesi, CyclOps sürümü/SLA/başarı oranı ve müşteri logoları **kapalı**.
- **Teknoloji listesi:** 21 kayıt `lifecycle: active` + `decisionNeeded: false`.

Kayıt durumu (`src/content/technologies/technologies.json`, doğrulandı):

| Ölçüm                           | Değer  |
| ------------------------------- | ------ |
| Toplam teknoloji kaydı          | 35     |
| Yayınlanabilir (`active`)       | **21** |
| `logoPermission: unknown` kalan | **35** |

Yani **hiçbir logo izni açılmadı**; yalnızca ad metni yayımlanıyor. "Partner",
"resmî iş ortağı", "sertifikalı", "yetkili satıcı" ifadeleri hiçbir yerde geçmez
(regresyon testi: `tests/e2e/solutions.spec.ts` → "ilişki iddiası taşıyan
kelimeler geçmiyor"). `quest` kaydı `Quest Change Auditor` olarak sonlandırıldı,
kopya kayıt üretilmedi. KACE, jenerik OpenText ve diğer 13 kayıt `pending` kaldı.

---

## 2. S06 — Command Atlas imza hero

`src/components/home/SignatureHero.astro` beş aşamalı hikâyeyi anlatır:
kaynaklar → sinyaller → bağlam → karar → aksiyon.

- **Statik semantik HTML önce.** React/Vue/hydration yok; satır içi SVG + CSS.
- **Hero'ya ait istemci JS: 0 bayt.** Animasyon yalnızca CSS `transform`/`opacity`.
- **Tooltip yok**: düğüm bilgisi kalıcı metindir, hover'a bağlı değildir.
- **Tek seferlik giriş**, scrolljacking yok, `prefers-reduced-motion` gerçek
  Playwright `emulateMedia` ile doğrulanır.
- **CLS 0**: SVG sabit `viewBox` + `aspect-ratio` ile yer ayırır.
- JS kapalıyken içerik ve gezinme tam çalışır (`chromium-nojs` projesi).
- Mobilde geniş topoloji gizlenir, liste dikey raya döner.

## 3. S07 — Çözüm sistemi

**Tek şablon, sekiz alan.** `src/components/SolutionDetail.astro` veriyle çalışır;
hiçbir çözüm için özel sayfa kodu yoktur. Anlatı sırası:

problem → yaklaşım → beklenen fayda → kabiliyetler → AI rolü → örnek akış →
teknolojiler → ilgili notlar → CTA

- **Boş alan = bölüm yok.** `muhendislik-ve-urun-gelistirme` sayfasında yalnızca
  dört bölüm oluşur; boş kutu veya "yakında" metni yoktur (ölçüldü).
- **Markdown gövdesi artık render ediliyor.** S07 testleri, yazılmış fakat hiç
  gösterilmeyen gövde metnini ortaya çıkardı; yaklaşım bölümünün devamı olarak
  yayına alındı.
- **Teknolojiler yalnızca metin.** Detay sayfasında `img` sayısı 0.
- Dış bağlantılar `rel="noopener noreferrer nofollow" target="_blank"`.

**Rotalar:** TR 8 + EN 8 = 16 çözüm detayı, iki landing, iki iletişim sayfası;
toplam **27 sayfa**. `/en/solutions/` bu sprintte altı eksik çözümle tamamlandı.
Observability & APM ile Data Streaming & Integration iki dilde de tam derinlikte
(AI rolü + örnek akış + teknolojiler).

## 4. Public ses ve metin kalitesi

- `TASLAK`, "taslak olgunluk", "iş sahibi doğrulaması bekliyor",
  "yayınlanabilir müşteri referansımız yok", "logo kullanım izni bulunmuyor",
  `pending`, `verification`, `maturity` ifadeleri public çıktıda **yok**.
- "vendor" jargonu kaldırıldı → "teknoloji üreticisi" / "ticari ürün".
- **2024 tarihli S00 ölçüm kaydı** ana sayfada görünüyordu ("sitemap kayıtlarının
  50'si 2024 tarihli… ölçülerek doğrulandı"). Bu bir iç ölçüm bulgusudur, kurumsal
  kilometre taşı değildir: `status: draft` yapıldı ve public çıktıdan çıktı. Kayıt
  silinmedi, dahili veride durur.
- Uydurulmuş müşteri, metrik, sertifikasyon veya iş ortaklığı iddiası yok.

## 5. Ana sayfa yeniden gözden geçirme

| Kontrol                                 | Sonuç                                                     |
| --------------------------------------- | --------------------------------------------------------- |
| 10. yıl görünür ve güvenli              | ✅ "2016 → 2026 · İzlemekle başladık, öngörmeye evrildik" |
| Bölgeler görünür                        | ✅ Türkiye, Orta Asya, Orta Doğu — sayı/ofis/ekip yok     |
| CyclOps teaser TASLAK etiketi taşımıyor | ✅ olgunluk dili tamamen kaldırıldı                       |
| Zabbix ve CyclOps farklı rollerde       | ✅ test edildi (aşağıda)                                  |

**Rol ayrımı:** CyclOps ana sayfada ve AIOps çözüm alanında _Duosis'in kendi
geliştirdiği ürün_ olarak anlatılır; Zabbix yalnızca gözlemlenebilirlik alanında
_kullanılan üçüncü taraf ürün_ olarak geçer. AIOps sayfasında Zabbix, Observability
sayfasında CyclOps geçmez — bu bir regresyon testine bağlandı.

10. yıl bölümü, S00 ölçüm kaydı yayından çıkınca tek sütunluk bir metin bloğuna
    düşüp geniş ekranda sağ yarısını boşaltıyordu. **Uydurma kilometre taşı eklemek
    yerine düzen iki sütuna alındı.**

## 6. İletişim kabuğu

`/iletisim/` ve `/en/contact/`:

- Yalnızca **doğrulanmış** iletişim bilgisi (C05–C08): adres, telefon, e-posta.
- **Form yok, input yok, kişisel veri toplanmıyor** (`form, input, textarea,
select, button[type=submit]` sayısı 0 — test edildi).
- `noindex` korunur, breadcrumb var, tek H1.

## 7. CTA bağlamı ve analytics

`contactPathForTopic(locale, topic, allowed)` konu parametresini **yalnızca**
allowlist'teki slug için üretir. Allowlist serbest bir liste değil, aynı görünüm
modunda **gerçekten yayımlanan** çözüm slug'larıdır; bir çözüm yayından kalkarsa
slug'ı kod değişmeden parametre olmaktan çıkar.

- 16 çözüm sayfasının tamamında CTA `?topic=<kendi-slug>` taşır (ölçüldü).
- Allowlist dışı değer (`../gizli`, `a@b.com`, `<script>`, boş) → parametre **hiç**
  eklenmez (birim testi).
- CTA tıklaması **hiçbir dış istek başlatmaz** (ölçüldü: `externalHosts: []`).
- Yalnızca pasif `data-analytics-event="solution-cta"` işareti bırakılır.

## 8. SEO ve i18n

`dist/` üzerinde 26 sayfa için doğrulandı:

| Kural                                  | Sonuç |
| -------------------------------------- | ----- |
| Sayfa başına tek `h1`                  | ✅    |
| `canonical` kendi yoluna işaret ediyor | ✅    |
| `hreflang` karşılıklı (geri işaret)    | ✅    |
| Site geneli `noindex` korunuyor        | ✅    |
| Doğrulanmamış JSON-LD                  | **0** |
| Sessiz dil fallback'i                  | yok   |

TR öneksiz, EN `/en/` altında. Karşılığı olmayan kayıtta bağlantı üretilmez,
erişilebilir "bu dilde henüz yayınlanmadı" bilgisi gösterilir.

## 9. Görsel kalite eşiği

| Kontrol                             | Sonuç                                                    |
| ----------------------------------- | -------------------------------------------------------- |
| 320 / 390 / 768 / 1024 / 1440 taşma | **yok** (scrollWidth = clientWidth, dört rota)           |
| Mobilde dar sütuna sıkışma          | en dar metin bloğu > 200px (40–60px eşiğinin çok üstü)   |
| Çözüm landing "sekiz düz satır"     | numara + problem + kabiliyet/CTA sütunlu editorial satır |
| Detay sayfası 1440px'te doluluk     | makale genişliği **960px** (önce ~350px, sağ yarı boştu) |
| Cyan kullanımı                      | yalnızca sinyal/vurgu                                    |

**Düzeltilen iki düzen hatası:** (1) `main` okuma sütunu ortalanmıyordu, geniş
ekranda içerik sola yapışıyordu; (2) çözüm detayı dar okuma sütununda kalıyordu.
Detay sayfası artık 64rem üstünde sol etiket rayı + okunur ölçüde gövde sütunu
kullanır; mobilde tek sütun akış korunur.

## 10. Bütçeler

| Bütçe                       | Sınır   | Ölçülen                     | Durum |
| --------------------------- | ------- | --------------------------- | ----- |
| Ana sayfa istemci JS (gzip) | ≤ 12 KB | **978 B**                   | ✅    |
| Hero JS (gzip)              | ≤ 8 KB  | **0 B** (hero JS yok)       | ✅    |
| Yeni raster görsel          | 0       | **0** (HTML'de raster yok)  | ✅    |
| Dış istek                   | 0       | **0** (`externalHosts: []`) | ✅    |
| Hero CLS                    | 0       | **0**                       | ✅    |
| LCP regresyonu (S06 A/B)    | ≤ %15   | **−%9** (356 → 324 ms)      | ✅    |

S06 A/B ölçümü çapraz sıralı, 8 turluk (ilk tur atılmış) bir ölçümdür:
`evidence/s06/perf-ab-final.json`.

**S07 kapanış ölçümü (mutlak, boştaki makinede, 6 tur):**

| Sayfa        | LCP medyan | CLS |
| ------------ | ---------- | --- |
| Ana sayfa    | 188 ms     | 0   |
| Çözüm detayı | 172 ms     | 0   |

> İlk deneme, arka planda temiz kök kalite kapısı çalışırken yapıldı ve 476 ms
> gösterdi. Makine yükü altındaki bu değer **rapora alınmadı**; ölçüm boştaki
> makinede tekrarlandı.

## 11. Test sonuçları

| Kapı                 | Sonuç                                     |
| -------------------- | ----------------------------------------- |
| `prettier --check`   | temiz                                     |
| `eslint`             | 0 hata                                    |
| `astro check && tsc` | 93 dosya · **0 hata / 0 uyarı / 0 ipucu** |
| `vitest`             | 10 dosya · **180 test**                   |
| Playwright e2e       | **257 test**                              |
| `astro build`        | **27 sayfa**                              |
| `pnpm quality` exit  | **0**                                     |

**S07 kabul testleri** (`tests/e2e/solutions.spec.ts`, 40 test): iki dilde sekiz
rota, anlatı sırası, boş alanın bölüm üretmemesi, teknolojinin yalnızca metin
olması, ilişki iddiası taşıyan kelimelerin yokluğu, CyclOps/Zabbix rol ayrımı,
AI anlatısının yalnızca gerçek içerikle render edilmesi, CTA allowlist'i, analytics
isteği olmaması, iletişim kabuğunda form bulunmaması, 320–1440 taşma, mobil sıkışma,
masaüstü doluluk, landing'in düz satır görünümünde olmaması ve altı rotada axe
WCAG 2.2 AA.

**Temiz kök doğrulaması** (`git archive HEAD` → boş dizin):

```
pnpm install --frozen-lockfile   → Done in 43.1s (pnpm 12.3.4, Node 24.20.0)
pnpm quality                     → EXIT 0
                                   74 dosya · 0 hata / 0 uyarı / 0 ipucu
                                   180 birim testi · 257 e2e · 27 sayfa
```

`pnpm audit --prod` → **No known vulnerabilities found**.

## 12. Testlerde düzeltilen üç doğruluk hatası

Bunlar kural gevşetmesi **değildir**; testin yanlış ölçmesidir:

1. **Alt dize taraması yanlış pozitif üretiyordu.** "de**pending**" içindeki
   "pending" yasaklı sözcük sayılıyordu. Tek kelimelik terimler artık kelime
   sınırıyla aranır; Türkçe ekler ("taslağı") yakalanmaya devam eder.
2. **Kayıt sayımı torun eşleşmesi yapıyordu.** Kabiliyet etiketleri de `<li>`
   olduğu için landing "8 kayıt" yerine çok daha fazlasını sayıyordu; sayım
   doğrudan satırlara çekildi.
3. **Tek testte 25 rota gezmek zaman aşımına takılıyordu** ve hangi rotanın
   patladığı görünmüyordu. Süre limiti yükseltilmedi; test rota başına bölündü.

Ayrıca "çevirisi olmayan sayfa" fixture'ı çözümden içgörüye taşındı: sekiz çözümün
tamamı artık iki dilde yayımlandığı için eski fixture gerçeği temsil etmiyordu.

## 13. Kanıt

`duosis-web-S06-S07-evidence.zip` yalnızca **yeni** S06 + S07 kanıtını taşır:

- `s06/`: hero 1440/390/320, reduced-motion, JS kapalı, giriş animasyonu ilk kare,
  A/B performans JSON'ları.
- `s07/`: TR/EN landing, TR/EN detay (1440/1024/390), ince içerikli çözüm, iletişim, 10. yıl bölümü, `perf-s07.json`, `bundle-s07.json`.

Yollar `/` ayracıyla, mutlak yol / `..` / gizli bilgi / `.env` / `node_modules` /
tarayıcı ikilisi / ham kurumsal master içermez.

| Paket                              | Boyut  | Doğrulama                  |
| ---------------------------------- | ------ | -------------------------- |
| `duosis-web-S06-S07-evidence.zip`  | 3.5 MB | 25 dosya · `testzip` temiz |
| `duosis-web-S06-S07-review.bundle` | 72 KB  | `git bundle verify` → okay |

ZIP SHA-256: `436c5a2e0b7e6537a8f68d9024b37b2b6d03b926ab051252a60d68d6f7239db7`
Bundle aralığı: `6ec04a1..duosis-web/s06-s07-command-atlas-solutions`

## 14. Bilinen açıklar ve riskler

- **EN çevirileri makine değil elle yazıldı fakat iş sahibi onayından geçmedi.**
  Altı yeni EN çözüm sayfası TR kaynaktan çevrildi; terminoloji onayı beklemektedir.
- **`quest` kaydı iki farklı ürüne referans veriyor olabilir.** Kurumsal mimari
  alanı `quest` (Change Auditor) referansı taşıyor; gözlemlenebilirlik alanı
  `foglight` kullanıyor. Ayrım doğrulanmalı.
- **10. yıl bölümünde kilometre taşı yok.** `2016 kuruluş` kaydı
  `verificationStatus: pending` olduğu için yayımlanmıyor; bölüm yalnızca anlatı
  taşıyor.
- **Footer "Ofisler" başlığı** iki doğrulanmış adres gösteriyor. Bu, S04'te
  onaylanmış iletişim verisidir; bölgesel anlatıdaki "ofis yayımlanmaz" sınırıyla
  karıştırılmamalıdır, ancak iş sahibi teyidi faydalı olur.
- S06 commit mesajı içeriğini tam yansıtmıyor (bkz. Durum bölümündeki not).

## 15. İş sahibi tarafından doğrulanması gerekenler

1. Altı yeni EN çözüm sayfasının terminolojisi.
2. `Quest Change Auditor` ile `Quest Foglight` ayrımının doğruluğu.
3. Footer'daki iki adresin ve iki telefon numarasının güncelliği.
4. "2016 → 2026" ifadesinin kuruluş yılı olarak yayımlanabilirliği (kayıt hâlâ
   `pending`).
5. CyclOps'un AIOps alanındaki "kendi geliştirdiğimiz ürün" cümlesinin onayı.

## 16. Sonraki sprint önerisi

S08 için: içgörüler bölümünün derinleştirilmesi (şu an tek kayıt), EN içgörü
çevirisi, `/design-system` dışındaki kalan rotaların (varsa) kapanışı ve
`noindex` kaldırma öncesi yayın kontrol listesi.

**Bu branch `main`'e merge EDİLMEDİ ve S08'e geçilmedi.**
