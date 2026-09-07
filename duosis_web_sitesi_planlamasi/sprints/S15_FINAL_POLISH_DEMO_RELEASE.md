# S15 — Final Polish, Demo Senaryosu ve Release Candidate

## Amaç

Tüm sayfaları tek ürün gibi hissettirmek, çapraz tarayıcı sorunlarını kapatmak ve hackathon jürisine güvenilir bir release candidate sunmak.

## Yapılacaklar

1. Cross-browser/device matrisi:
   - Chromium
   - Firefox
   - WebKit
   - iOS/Android küçük ekran
2. Tüm sayfalarda:
   - spacing ve tipografi tutarlılığı
   - header/footer
   - transition/motion ritmi
   - image crop
   - empty/loading/error states
   - TR/EN taşmaları
3. İçerik doğruluk matrisi final gate:
   - pending claim yok
   - izinsiz logo yok
   - placeholder/TODO/lorem yok
4. Demo seed içeriğini ve prod içeriğini açıkça ayır.
5. Hackathon demo akışı:
   - 5 saniye ana mesaj
   - Solution Atlas
   - Command Atlas hero
   - CyclOps Signal-to-Action
   - 10 yıl timeline
   - TR/EN
   - mobile
   - form + consent
6. 3–5 dakikalık demo scripti ve olası jüri soruları.
7. `RELEASE_CHECKLIST.md`, `CONTENT_GAPS.md`, `OPERATIONS_RUNBOOK.md`.
8. Temiz clone/install/build kanıtı.
9. Release candidate yerel tag önerisi; tag/push yalnız açık onayla.
10. Deployment hedefi onaylıysa dry-run/preview talimatı; gerçek deploy bu sprintte otomatik yapılmaz.

## Kabul kriterleri

- [ ] Kritik rotaların tamamı üç browser engine'de smoke PASS.
- [ ] Mobile ve TR/EN taşma/bozuk layout yok.
- [ ] TODO, lorem, debug paneli, preview badge veya sahte iddia public build'de yok.
- [ ] Tüm public logo ve metrikler doğrulanmış.
- [ ] `pnpm quality` temiz clone üzerinde PASS.
- [ ] Release checklist eksiksiz.
- [ ] Demo akışı internet/üçüncü taraf servis sorunu için güvenli fallback içeriyor.
- [ ] Form demo modundaysa sahte başarı vermiyor.
- [ ] Push/merge/deployment yapılmadan incelemeye hazır release candidate var.

## Test / kanıt

- Full test command matrix.
- Clean install/build log.
- Cross-browser screenshot set.
- Desktop/mobile full-page captures.
- Performance/a11y/security final summary.
- İçerik doğruluk ve izin matrisi.

## Kapsam dışı

- Codex ve kullanıcı onayı olmadan prod yayını.
- Domain/DNS değişikliği.
- CRM, analytics veya başka dış sistemde hesap/anahtar oluşturma.

## Sprint sonu

Final raporu `CLAUDE_REPORT_TEMPLATE.md` ile ver. Push, merge veya deployment yapmadan dur ve Codex final incelemesini bekle.

