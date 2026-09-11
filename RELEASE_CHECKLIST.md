# Yayın kontrol listesi

Bu liste, siteyi **üretime alma** kararı verildiğinde tek tek geçilecek
adımları taşır. Hiçbiri otomatik değildir; her madde bilinçli bir onay ister.

**Bugünkü durum: site yayına HAZIR DEĞİL.** Aşağıdaki bloklayıcılar açık.

---

## A. Bloklayıcılar — bunlar kapanmadan yayın yapılamaz

| #   | Bloklayıcı                                        | Bugünkü davranış                                                            | Kim kapatır |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------- | ----------- |
| 1   | Dağıtım/çalışma zamanı hedefi seçilmedi           | Yönlendirme çıktıları sağlayıcıdan bağımsız üretiliyor, hiçbiri uygulanmadı | İş sahibi   |
| 2   | CRM/e-posta teslim hedefi yok (`CONTACT_FORM_TO`) | Form "gönderilmedi" diyor                                                   | İş sahibi   |
| 3   | KVKK metni hukuk onayı almadı                     | Sayfa taslak ve `noindex`; `LEGAL_APPROVED` kapalı                          | Hukuk       |
| 4   | Veri saklama süresi belirlenmedi                  | Metinde süre yazılmıyor                                                     | Hukuk       |
| 5   | Spam sağlayıcısı ve secret'ı yok                  | Doğrulayıcı yapılandırılmamış; her gönderim reddediliyor                    | İş sahibi   |
| 6   | Analytics sağlayıcısı seçilmedi                   | Sağlayıcı `none`; izin verilse bile istek yok                               | İş sahibi   |
| 7   | Nihai indeksleme onayı verilmedi                  | Tüm sayfalar `noindex`, sitemap boş                                         | İş sahibi   |

**Fail-closed güvencesi:** bu maddelerden biri eksikken üretime alınmaya
çalışılırsa derleme veya çalışma zamanı kapıları bunu engeller. Hiçbiri
"unutulup açık kalmaz".

---

## B. Yayın öncesi teknik adımlar

### B1. Ortam değişkenleri

```
DEPLOY_ENV=production
PUBLIC_SITE_URL=https://duosis.com
LEGAL_APPROVED=true          # YALNIZCA hukuk onayından sonra
CONTACT_FORM_TO=<gerçek hedef>
```

- [ ] `PUBLIC_SITE_URL` https ve localhost değil (derleme zaten kırılır).
- [ ] `LEGAL_APPROVED` yalnızca metin `reviewStatus: "approved"` olduktan
      sonra açıldı.
- [ ] Secret'lar depoya veya rapora yazılmadı.

### B2. Derleme ve doğrulama

- [ ] `pnpm install --frozen-lockfile` temiz klonda çalıştı.
- [ ] `pnpm quality` yeşil (format, lint, typecheck, birim, E2E, build, SEO).
- [ ] `pnpm audit --prod` temiz.
- [ ] Üretim derlemesi alındı ve `dist/` içinde `localhost` geçmiyor.
- [ ] `pnpm seo:report` 0 ihlal.

### B3. İçerik olgunluğu

- [ ] `noindex` değerleri **tek tek** gözden geçirildi; kör biçimde
      `false` yapılmadı.
- [ ] Taslak içerik üretim sitemap'ine girmiyor.
- [ ] `CONTENT_GAPS.md` maddelerinin hangileri kapandı, hangileri bilinçli
      olarak açık bırakıldı — karar verildi.

### B4. Yönlendirmeler

- [ ] `dist/redirect-manifest.json` incelendi (56 kural: 54 legacy + 2 iç).
- [ ] Seçilen sağlayıcıya uygun çıktı (`_redirects` veya nginx) uygulandı.
- [ ] Uygulandıktan sonra örnekleme ile doğrulandı: birkaç legacy adres
      gerçekten 301 dönüyor, 410'lar gerçekten 410 dönüyor.
- [ ] Zincir ve döngü yok (test zaten denetliyor, canlıda da örneklendi).

### B5. Güvenlik başlıkları

Hedef platform seçilmediği için başlıklar **uygulanmadı**; beklenen set
`OPERATIONS_RUNBOOK.md` içindedir.

- [ ] Platforma göre başlık yapılandırması yazıldı.
- [ ] Uygulandıktan sonra gerçek yanıt başlıkları kontrol edildi.
- [ ] CSP raporlama modunda bir süre izlendi, sonra zorunlu kılındı.

### B6. Form

- [ ] Teslim adaptörü gerçek hedefe bağlandı.
- [ ] Test gönderimi yapıldı ve hedefe **gerçekten** ulaştığı görüldü.
- [ ] Log çıktısı kontrol edildi: tam e-posta, mesaj veya form gövdesi
      yazılmıyor.
- [ ] Spam doğrulayıcı yapılandırıldı ve reddetme yolu denendi.
- [ ] Rate limit gerçek ortamda denendi.

### B7. Erişilebilirlik ve performans

- [ ] Üç motorda (Chromium, Firefox, WebKit) çapraz matris yeşil.
- [ ] 320 px, %200 zoom ve reduced-motion kontrol edildi.
- [ ] JavaScript kapalı temel içerik okunuyor.
- [ ] Lighthouse ölçümü alındı ve ADR-014 bütçesiyle karşılaştırıldı.

---

## C. Yayın sonrası

- [ ] Gerçek 404 ve 410 yanıtları örneklendi.
- [ ] `robots.txt` ve `sitemap.xml` canlıda doğru içerikle dönüyor.
- [ ] Arama konsolunda sitemap bildirildi (indeksleme açıldıysa).
- [ ] İlk hafta form gönderimleri ve hata kayıtları izlendi.

---

## D. Geri alma

- [ ] Önceki sürüme dönüş yolu **yayından önce** denendi.
- [ ] Yönlendirme yapılandırmasının geri alınması ayrı ve test edilmiş bir
      adım olarak hazır.

Geri alma planı denenmeden yayın yapılmaz: yönlendirmeler yanlış uygulanırsa
eski adreslerin tamamı aynı anda kırılır.
