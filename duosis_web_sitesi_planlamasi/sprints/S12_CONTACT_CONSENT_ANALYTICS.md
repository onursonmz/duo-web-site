# S12 — İletişim Formu, KVKK Consent ve Analytics

## Amaç

Kullanıcıyı güvenli biçimde talebe dönüştüren, spam'e dayanıklı, erişilebilir ve açık rıza tercihlerine uyan form/ölçüm akışını kurmak.

## Ön koşullar

- Form hedefi/adapter kararı.
- KVKK metni ve saklama sorumlusu bilgisi.
- Analytics sağlayıcısı veya demo-mode kararı.
- Turnstile/hCaptcha gerçek anahtarları yoksa yalnız test/dry-run adapter.

## Yapılacaklar

1. `/iletisim/` ve `/en/contact/` sayfaları.
2. URL'den gelen güvenli `interest` bağlamını forma uygula; allowlist kullan.
3. Client + server schema validation.
4. Server endpoint/action:
   - origin/method/content-type kontrolü
   - input length/type/format sınırı
   - honeypot
   - rate limit interface
   - spam token server validation
5. CRM/email adapter interface; timeout/retry ve kullanıcıya dürüst hata.
6. PII-safe loglama.
7. Consent manager:
   - essential
   - analytics
   - marketing varsa ayrıca
8. Accept/reject/customize eşit erişilebilirlikte.
9. Analytics yalnız onaydan sonra yüklenir.
10. PII içermeyen event sözleşmesi.
11. Form success/error/focus/live-region davranışı.
12. Test key ve sahte adapter ile otomatik test.

## Kabul kriterleri

- [ ] Server validation olmadan form kabul edilmiyor.
- [ ] Spam token yalnız client widget'a güvenmiyor; server doğrulama yolu mevcut.
- [ ] Demo adapter gerçek gönderim yapmıyorsa açıkça belirtiliyor.
- [ ] Secret client bundle'a girmiyor.
- [ ] Consent verilmeden analytics isteği/script'i yok.
- [ ] Reject, accept kadar kolay.
- [ ] Form error mesajları alanla programatik ilişkili.
- [ ] Duplicate submit önleniyor; hata sonrası kullanıcı verisi kontrollü korunuyor.
- [ ] Loglarda tam mesaj/e-posta yok.
- [ ] TR/EN metin ve politika linkleri doğru.

## Test / kanıt

- Valid/invalid/oversize/honeypot/rate-limit test matrisi.
- Turnstile official dummy key/test adapter senaryosu.
- Network kanıtı: consent öncesi analytics yok.
- E2E success/error/double-submit.
- Keyboard ve axe.
- Secret scan.

## Kapsam dışı

- Kullanıcı onayı olmadan gerçek dış servise veri gönderme.
- CRM hesabı veya API key oluşturma.
- Pazarlama e-posta aboneliği.

## Sprint sonu

Rapor ver ve dur. S13'e geçme.

