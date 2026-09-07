# S01 — Repository Scaffold ve Quality Gates

## Amaç

Astro/TypeScript tabanlı, tekrarlanabilir ve kalite kontrolleri ilk günden çalışan proje iskeleti kurmak.

## Ön koşul

- S00 Codex tarafından onaylanmış olmalı.
- Repo yolu ve mevcut kullanıcı değişiklikleri net olmalı.

## Yapılacaklar

1. S00 ADR sonucuna göre Astro scaffold kur.
2. Node aktif LTS ve pnpm sürümünü pinle; lockfile oluştur.
3. TypeScript strict, Astro check, lint ve formatter yapılandır.
4. Vitest/unit ve Playwright e2e altyapısını kur.
5. `pnpm quality` tek giriş komutunu oluştur.
6. Environment örneği ekle; gerçek secret koyma.
7. Temel HTML iskeleti:
   - doğru `lang`
   - viewport
   - title/description placeholder
   - skip link hedefi
   - 404 placeholder
8. CI workflow:
   - temiz install
   - lint/type/test/build
   - cache güvenli ve lockfile bağlı
9. Dependency policy ve güncelleme notu ekle.
10. README'de lokal çalıştırma ve test komutlarını belgeleyerek tek doğru yol oluştur.

## Kabul kriterleri

- [ ] Temiz ortamda `pnpm install --frozen-lockfile` başarılı.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` başarılı.
- [ ] `pnpm quality` hepsini fail-closed çalıştırıyor.
- [ ] En az bir unit ve bir smoke e2e testi gerçekten çalışıyor.
- [ ] Client bundle'da secret veya gereksiz runtime yok.
- [ ] Ana sayfa JavaScript kapalıyken temel placeholder içeriği gösteriyor.
- [ ] CI ile lokal komutlar aynı scriptleri kullanıyor.
- [ ] Yerel commit var; push/merge/deployment yok.

## Test / kanıt

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm quality
```

## Kapsam dışı

- Gerçek tasarım sistemi.
- İçerik collection şemaları.
- Analytics, form veya deployment adapter.

## Sprint sonu

Rapor ver ve dur. S02'ye geçme.

