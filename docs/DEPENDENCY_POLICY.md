# Bağımlılık Politikası

`02_TECHNICAL_ARCHITECTURE.md` §1 ve `04_DELIVERY_PROTOCOL.md` §3 uyarınca.

## İlkeler

1. **Her bağımlılığın gerekçesi yazılır.** Gerekçesiz paket eklenmez; sprint raporunda
   neden gerektiği belirtilir.
2. **Sürümler tam sabitlenir.** `package.json` içinde caret (`^`) veya tilde (`~`)
   kullanılmaz; `pnpm-lock.yaml` commit edilir.
3. **Tek paket yöneticisi: pnpm.** `packageManager` alanı tam sürümü pinler.
4. **Client runtime varsayılan olarak yoktur.** Sözleşme "varsayılan çıktı HTML/CSS'tir;
   client JavaScript açık gerekçe gerektirir" der. Bir UI framework (React/Vue/Svelte)
   eklemek ayrı bir karar ve ölçüm gerektirir.
5. **Build script'leri varsayılan olarak kapalıdır.** pnpm 12 postinstall script'lerini
   engeller; istisna `pnpm-workspace.yaml > allowBuilds` altında tek tek verilir.
6. **Tedarik zinciri politikası gevşetilmez.** pnpm 12'nin `minimumReleaseAge` denetimi
   çok yeni yayınlanmış paketleri reddeder. Bir paket bu nedenle reddedilirse politika
   kapatılmaz; politikaya uyan bir sürüme sabitlenir.

## Mevcut bağımlılıklar ve gerekçeleri

### Runtime

| Paket   | Sürüm | Gerekçe                                                      |
| ------- | ----- | ------------------------------------------------------------ |
| `astro` | 7.3.1 | ADR-001: içerik ağırlıklı statik site için seçilen framework |

### Geliştirme

| Paket                    | Sürüm   | Gerekçe                                                                                                       |
| ------------------------ | ------- | ------------------------------------------------------------------------------------------------------------- |
| `typescript`             | 5.9.3   | Sözleşme TypeScript strict istiyor. **TS 7 kullanılamadı:** `typescript-eslint` peer aralığı `>=4.8.4 <6.1.0` |
| `@astrojs/check`         | 0.9.10  | `astro check` komutunun çalışması için zorunlu; `.astro` dosyalarının tip denetimi                            |
| `eslint`                 | 10.10.0 | Lint kapısı                                                                                                   |
| `@eslint/js`             | 10.0.1  | ESLint'in önerilen kural seti (flat config)                                                                   |
| `typescript-eslint`      | 8.69.0  | TypeScript lint kuralları. **8.70.0 değil:** pnpm tedarik zinciri politikası reddetti                         |
| `eslint-plugin-astro`    | 3.1.0   | `.astro` dosyalarını lint edebilmek için                                                                      |
| `astro-eslint-parser`    | 3.1.0   | `eslint-plugin-astro`'nun gerektirdiği parser                                                                 |
| `eslint-plugin-jsx-a11y` | 6.10.2  | `eslint-plugin-astro`'nun peer gereksinimi; a11y lint kuralları                                               |
| `eslint-config-prettier` | 10.1.8  | ESLint ve Prettier'in biçim kuralları çakışmasın diye                                                         |
| `prettier`               | 3.9.6   | Biçim kapısı                                                                                                  |
| `prettier-plugin-astro`  | 0.14.1  | `.astro` dosyalarını biçimlendirebilmek için                                                                  |
| `vitest`                 | 5.0.0   | Unit test koşucusu                                                                                            |
| `@playwright/test`       | 1.63.0  | Gerçek tarayıcıda e2e/smoke testleri                                                                          |
| `@axe-core/playwright`   | 4.13.0  | WCAG 2.2 AA erişilebilirlik smoke kontrolü                                                                    |

**Bilinçli olarak eklenmeyenler:** UI framework, deployment adapter, analytics/consent
kütüphanesi, CMS istemcisi, form/spam servisi, ikon/font paketi, CSS framework,
`globals` paketi (ESLint yapılandırmasında yalnızca gerçekten kullanılan üç global
elle tanımlandı).

## Bilinen peer uyarısı

`eslint-plugin-jsx-a11y@6.10.2` peer olarak ESLint `^3 || … || ^9` istiyor; projede ESLint
10 kurulu. Uyarı `eslint-plugin-astro`'nun bu paketi peer olarak listelemesinden geliyor.
**Pratikte sorun yok:** `pnpm lint` sorunsuz çalışıyor ve a11y kuralları uygulanıyor.
Yukarı akış ESLint 10 desteğini yayınlayınca sürüm yükseltilecek.

## Yükseltme ritmi

- **Güvenlik yamaları:** `pnpm audit --prod` çıktısında bulgu varsa aynı sprint içinde.
- **Yama/minor:** sprint başlangıcında, `pnpm quality` yeşil kalmak koşuluyla.
- **Major:** ayrı bir karar; ADR ile kaydedilir.
- Her yükseltmede `pnpm-lock.yaml` yeniden üretilir ve commit edilir.

## Bir bağımlılık eklerken

1. Gerçekten gerekli mi? Standart kütüphane veya birkaç satır kodla çözülür mü?
2. Bakımlı mı, lisansı uygun mu, bundle etkisi ne?
3. Client bundle'a giriyorsa performans bütçesine etkisi ölçülür
   (`02_TECHNICAL_ARCHITECTURE.md` §3: ana sayfa first-party JS ≤ 180 KB gzip).
4. Tam sürümle eklenir, bu tabloya gerekçesiyle yazılır, sprint raporunda belirtilir.
