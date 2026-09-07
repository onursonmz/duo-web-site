# S14 — Erişilebilirlik, Performans ve Güvenlik Sertleştirme

## Amaç

Tasarım kalitesini ölçülebilir teknik kaliteyle tamamlamak ve tüm kritik rotalarda release gate oluşturmak.

## Kritik rota matrisi

- `/`
- `/en/`
- çözümler landing
- bir solution detail
- `/cyclops/`
- `/hakkimizda/`
- bir insight detail
- `/iletisim/`
- 404

## Yapılacaklar

1. Accessibility:
   - axe otomasyonu
   - heading/landmark
   - keyboard/focus order
   - visible focus
   - dialog/menu semantics
   - alt text/decorative assets
   - contrast
   - 200% zoom/reflow
   - reduced motion
2. Performance:
   - Lighthouse CI profili
   - bundle breakdown
   - LCP element/TTFB/image/font analizi
   - hydration ve third-party audit
   - image dimensions/srcset/format
   - CLS ve INP senaryoları
3. Security:
   - CSP report-only → enforce uygunluğu
   - security headers
   - dependency audit değerlendirmesi
   - secret scan
   - form abuse/input testleri
   - source map ve error disclosure
4. Broken link ve console error gate.
5. Budgets dosyası ve CI thresholdları.
6. Manuel QA ledger; otomatik testin kapsamadığı maddeler.

## Kabul kriterleri

- [ ] Kritik rotalarda serious/critical axe ihlali yok.
- [ ] Tüm kritik işlevler klavye-only çalışıyor.
- [ ] Reduced-motion altında animasyon kaynaklı hareket/işlev kaybı yok.
- [ ] 320px reflow ve 200% zoom'da kritik içerik kaybı/yatay scroll yok.
- [ ] LCP `< 2.5s`, CLS `< 0.1`, INP `< 200ms` hedeflerine laboratuvar temsilinde yaklaşım ve saha ölçüm planı var.
- [ ] Homepage/content route JS bütçeleri karşılanıyor veya onay gerektiren açık sapma var.
- [ ] Kritik security header'lar doğrulanmış.
- [ ] HIGH secret/dependency güvenlik açığı yok; diğerleri risk kararıyla.
- [ ] Form negatif test matrisi geçiyor.
- [ ] Console error ve broken internal link yok.

## Test / kanıt

```bash
pnpm quality
pnpm test:a11y
pnpm test:e2e
pnpm build
```

Ek olarak kritik rotalar için Lighthouse, header scan, secret scan ve manuel QA tablosu.

## Kapsam dışı

- Gerçek saha verisi oluşmadan CrUX garantisi vermek.
- Penetrasyon testi yerine geçtiğini iddia etmek.
- Prod credential kullanmak.

## Sprint sonu

Rapor ver ve dur. S15'e geçme.

