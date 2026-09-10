# S08â€“S11 Entegrasyon Raporu

**Integration branch:** `duosis-web/s08-s11-integration`

| Ã–ÄŸe                       | DeÄŸer                                     |
| --------------------------- | ------------------------------------------ |
| S08+S09 feature branch HEAD | `95aedc052eea223da5ddb4d0f1e442fd7e673382` |
| S10+S11 feature branch HEAD | `e89dbd1722269a289fcd46427c9c2154cf068944` |
| Merge commit                | `65fdd5d5c00d52e3cee79e58c4fc29226c17b528` |
| Integration HEAD            | `__INTEG_HEAD__`                           |
| Remote CI                   | `__CI_URL__`                               |

Her iki feature branch de **kendi remote CI'Ä±nÄ± yeÅŸil geÃ§tikten sonra**
birleÅŸtirildi. `main` branch'ine **merge edilmedi**. S12'ye geÃ§ilmedi.

---

## 1. YÃ¶ntem

ÃœÃ§Ã¼ncÃ¼ bir worktree aÃ§Ä±ldÄ± (`../duo-web-site-s08-s11-integration`), S08+S09
branch'i temel alÄ±ndÄ± ve S10+S11 **merge commit ile** birleÅŸtirildi:

```
git worktree add ../duo-web-site-s08-s11-integration \
  -b duosis-web/s08-s11-integration \
  origin/duosis-web/s08-s09-cyclops-about
git merge --no-ff origin/duosis-web/s10-s11-services-insights
```

**Rebase ve squash kullanÄ±lmadÄ±.** Merge commit'in iki ebeveyni de korunuyor,
dolayÄ±sÄ±yla her iki sprintin geÃ§miÅŸi ayrÄ± ayrÄ± okunabilir durumda.

HiÃ§bir feature branch'in geÃ§miÅŸi deÄŸiÅŸtirilmedi; force-push yapÄ±lmadÄ±.

---

## 2. Ã‡akÄ±ÅŸmalar ve Ã§Ã¶zÃ¼mleri

BeÅŸ dosyada Ã§akÄ±ÅŸma Ã§Ä±ktÄ±. Åemalar, seÃ§iciler ve sÃ¶zlÃ¼k **temiz merge oldu**.

### 2.1 `src/config/navigation.ts`

Ä°ki branch de aynÄ± diziyi deÄŸiÅŸtirmiÅŸti: S08+S09 `nav.cyclops` ve `nav.about`
girdilerini, S10+S11 ise `nav.services` girdisini aktifleÅŸtirmiÅŸti.

**Ã‡Ã¶zÃ¼m:** sÃ¶zleÅŸmedeki nihai sÄ±ra ve **altÄ± girdinin tamamÄ± aktif**:

| #   | Girdi         | Rota           | Kaynak  |
| --- | ------------- | -------------- | ------- |
| 1   | Ã‡Ã¶zÃ¼mler   | `/cozumler/`   | S06+S07 |
| 2   | CyclOps       | `/cyclops/`    | S08     |
| 3   | Hizmetler     | `/hizmetler/`  | S10     |
| 4   | Ä°Ã§gÃ¶rÃ¼ler | `/icgoruler/`  | S05     |
| 5   | HakkÄ±mÄ±zda  | `/hakkimizda/` | S09     |
| 6   | Ä°letiÅŸim    | `/iletisim/`   | S07     |

`planned` girdi kalmadÄ±; `MAX_PRIMARY_ITEMS` sÄ±nÄ±rÄ± tam dolu.

**Teknoloji atlasÄ± ana menÃ¼ye EKLENMEDÄ°** â€” yedinci giriÅŸ sÃ¶zleÅŸmeyi bozardÄ±.
`SECONDARY_NAV` Ã¼zerinden Ã¼Ã§ yerde eriÅŸilebilir ve build Ã§Ä±ktÄ±sÄ±nda Ã¼Ã§Ã¼ de
doÄŸrulandÄ±: Ã§Ã¶zÃ¼m mega menÃ¼sÃ¼nÃ¼n altÄ±nda, mobil menÃ¼ alt listesinde ve
footer site haritasÄ±nda.

### 2.2 `src/lib/i18n/routes.ts`

`SEGMENTS` nesnesi iki taraftan da geniÅŸletilmiÅŸti. **BirleÅŸim alÄ±ndÄ±**:
`cyclops`, `about` (S08+S09) + `services`, `technologies`, `series`, `tag`
(S10+S11). Tip imzasÄ± da birleÅŸtirildi. HiÃ§bir segment dÃ¼ÅŸmedi.

### 2.3 `tests/e2e/route-inventory.spec.ts` (add/add)

Ä°ki branch **aynÄ± adlÄ± dosyayÄ± baÄŸÄ±msÄ±z olarak** oluÅŸturmuÅŸtu â€” aynÄ± sorunu
farklÄ± yollarla Ã§Ã¶zÃ¼yorlardÄ±.

**Ã‡Ã¶zÃ¼m: S08'in KEÅÄ°F tabanlÄ± yaklaÅŸÄ±mÄ± korundu.** Envanter `dist/`
Ã§Ä±ktÄ±sÄ±ndan tÃ¼retiliyor, dolayÄ±sÄ±yla yeni bir rota taramaya kendiliÄŸinden
giriyor. S10+S11'in elle tuttuÄŸu liste tam olarak eskime riski taÅŸÄ±yordu ve
o branch'te bir kez gerÃ§ekten eskidi.

S10+S11'in getirdiÄŸi iki tamamlayÄ±cÄ± kontrol Ã¼zerine eklendi:

- **besleme adresleri** â€” RSS sayfa deÄŸil kaynaktÄ±r, `index.html` taramasÄ±na
  girmez; ayrÄ±ca kontrol edilir.
- **rota ailesi kapsamÄ±** â€” keÅŸif "ne varsa" bulur, bu test "ne OLMASI
  gerektiÄŸini" sabitler. Bir ÅŸablon ailesi bÃ¼tÃ¼nÃ¼yle Ã¼retilmemeye baÅŸlarsa
  keÅŸif fark etmez, bu test eder.

### 2.4 `tests/support/public-routes.ts`

Elle tutulan rota listesi **kaldÄ±rÄ±ldÄ±** (2.3'e baÄŸlÄ±). Dosyada yalnÄ±zca
keÅŸiften tÃ¼retilemeyen sabitler kaldÄ±: besleme adresleri, kritik rota matrisi
ve taÅŸma test geniÅŸlikleri. `CRITICAL_ROUTES` listesine CyclOps ve HakkÄ±mÄ±zda
rotalarÄ± eklendi.

### 2.5 `tests/e2e/public-voice.spec.ts` ve `navigation.spec.ts`

Ses taramasÄ± keÅŸif tabanlÄ± envantere baÄŸlandÄ±; S10+S11'in eklediÄŸi
`/404-kontrol/` korundu (hata sayfasÄ± da public sestir ve iÃ§ sÃ¼reÃ§ dili
taÅŸÄ±yamaz).

"HenÃ¼z rotasÄ± yok" listesinde entegrasyon sonrasÄ± **yalnÄ±zca `/blog/`** kaldÄ±:
`/iletisim/` (S07), `/cyclops/` ve `/hakkimizda/` (S08+S09), `/hizmetler/`
(S10) gerÃ§ek rota oldu. Kural gevÅŸetilmedi; rotasÄ± aÃ§Ä±lan adres listeden
Ã§Ä±karÄ±ldÄ±.

---

## 3. Entegrasyonun ortaya Ã§Ä±kardÄ±ÄŸÄ± tek hata

Merge sonrasÄ± **bir** test kÄ±rÄ±ldÄ± ve bu, iki doÄŸru kararÄ±n Ã¶lÃ§Ã¼m yÃ¶nteminde
uyuÅŸmamasÄ±ydÄ±.

S10+S11'in eklediÄŸi "teknoloji listesi Ã§Ã¶zÃ¼m sÄ±nÄ±rÄ±nÄ±n dÄ±ÅŸÄ±na taÅŸmÄ±yor" testi
`innerText()` kullanÄ±yordu. S08+S09 ise izin verilen bir logo olduÄŸunda adÄ±n
**metin olarak tekrar etmemesini** saÄŸlÄ±yor: ad `<img alt>` iÃ§inde duruyor
(ekran okuyucu adÄ± yine duyuruyor, gÃ¶z iki kez okumuyor).

Merge sonrasÄ± CyclOps'un logosu gÃ¶rÃ¼ntÃ¼lendiÄŸi iÃ§in AIOps listesi
`innerText()` ile **boÅŸ** gÃ¶rÃ¼nÃ¼yor ve test "CyclOps yok" diyordu.

**Ã‡Ã¶zÃ¼m:** test artÄ±k **eriÅŸilebilir ad** Ã¼zerinden Ã¶lÃ§Ã¼yor â€” her liste
Ã¶ÄŸesinin metni ve varsa `<img alt>` deÄŸeri birlikte deÄŸerlendiriliyor.
Guardrail korundu: AIOps listesinde Zabbix, observability listesinde CyclOps
bulunamaz.

HiÃ§bir test silinmedi, `skip` eklenmedi, timeout yÃ¼kseltilmedi.

---

## 4. Korunan sÃ¶zleÅŸmeler

| SÃ¶zleÅŸme                                                 | Durum                                            |
| ---------------------------------------------------------- | ------------------------------------------------ |
| Global navigasyon en fazla altÄ± ana giriÅŸ                | Tam altÄ±, hepsi aktif                           |
| Teknoloji yedinci ana menÃ¼ deÄŸil                         | Mega menÃ¼ + mobil alt liste + footer            |
| Dictionary TR/EN key parity                                | Korundu; her iki feature'Ä±n anahtar kÃ¼mesi tam |
| HiÃ§bir feature'Ä±n anahtarÄ± sessizce silinmedi           | Korundu (Â§4.1)                                  |
| Milestone `source` / `verificationStatus` alanlarÄ±        | Korundu                                          |
| Insight `author` / `date` / `series` / `sources` alanlarÄ± | Korundu                                          |
| Strict validation gevÅŸetilmedi                            | `.strict()` yerinde; `.passthrough()` yok        |
| Lockfile elle birleÅŸtirilmedi                             | Gerekmedi â€” iki taraf da dokunmamÄ±ÅŸtÄ±       |
| Her iki branch'in test dosyalarÄ± korundu                  | 16 birim + 21 e2e spec dosyasÄ±                  |

### 4.1 Dictionary â€” bilinÃ§li bir silme

S08+S09 iki anahtarÄ± **kasÄ±tlÄ± olarak** kaldÄ±rmÄ±ÅŸtÄ±: `site.tagline` ve
`footer.buildNote` (footer'daki geliÅŸtirme sÃ¼rÃ¼mÃ¼ notu). Bu bir merge kaybÄ±
deÄŸil, o branch'in kendi kararÄ±dÄ±r ve kullanÄ±m yerleri de birlikte
kaldÄ±rÄ±lmÄ±ÅŸtÄ±. Silme korundu; S10+S11'in eklediÄŸi anahtarlarÄ±n tamamÄ±
(`services.*`, `technologies.*`, `regions.*`, geniÅŸletilmiÅŸ `insights.*`,
`nav.technologies`, Ã¼Ã§ CTA anahtarÄ±) eklendi.

---

## 5. Kalite kapÄ±sÄ±

Node `24.20.0`, pnpm `12.3.4` (ikisi de repoda pinli).

| #   | AdÄ±m                                          | SonuÃ§                                           |
| --- | ---------------------------------------------- | ------------------------------------------------ |
| 1   | `pnpm install --frozen-lockfile`               | BaÅŸarÄ±lÄ± â€” lockfile deÄŸiÅŸmedi             |
| 2   | `pnpm format:check`                            | Temiz                                            |
| 3   | `pnpm lint`                                    | 0 bulgu                                          |
| 4   | `pnpm typecheck`                               | 0 hata                                           |
| 5   | `pnpm test`                                    | **281 / 281** (16 dosya)                         |
| 6   | `pnpm test:e2e`                                | **794 / 794** (chromium + chromium-nojs)         |
| 7   | `pnpm build`                                   | 61 sayfa + 2 besleme                             |
| 8   | `pnpm audit --prod`                            | Bilinen guvenlik acigi yok                       |
| 9   | TÃ¼m public rotalarda iÃ§ baÄŸlantÄ± taramasÄ± | KeÅŸif tabanlÄ± envanter; kÄ±rÄ±k baÄŸlantÄ± yok |
| 10  | 320/390/768/1024/1440 responsive tarama        | Yatay taÅŸma yok                                 |
| 11  | External request taramasÄ±                     | 0 dÄ±ÅŸ istek                                    |
| 12  | Public voice taramasÄ±                         | Ä°Ã§ sÃ¼reÃ§ dili yok                            |
| 13  | axe kritik rota matrisi                        | WCAG 2.2 AA ihlali yok                           |

`pnpm quality` Ã§Ä±kÄ±ÅŸ kodu: **0**.

### RSS ve yapÄ±landÄ±rÄ±lmÄ±ÅŸ veri

**113 / 113** kontrol geÃ§ti: iki besleme de geÃ§erli XML, RFC 822 tarihleri
doÄŸru, kaÃ§Ä±rÄ±lmamÄ±ÅŸ `&` yok, Ã¶ÄŸeler gerÃ§ek sayfalara iÅŸaret ediyor ve diller
karÄ±ÅŸmÄ±yor. Her BlogPosting JSON-LD'si sayfadaki `<h1>`, canonical URL, tarih
ve yazarla birebir Ã¶rtÃ¼ÅŸÃ¼yor; gÃ¶sterilmeyen iddia alanÄ± taÅŸÄ±mÄ±yor.

---

## 6. GÃ¶rsel kontrol

Ana sayfada S08â€“S11'in tÃ¼m gereksinimleri build Ã§Ä±ktÄ±sÄ±nda doÄŸrulandÄ±:

| Gereksinim                            | Durum                     |
| ------------------------------------- | ------------------------- |
| DÃ¼zeltilmiÅŸ Command Atlas hero      | Var                       |
| CyclOps baÄŸlantÄ±sÄ±                 | Var                       |
| 10. yÄ±l / HakkÄ±mÄ±zda baÄŸlantÄ±sÄ± | Var                       |
| OnaylÄ± bÃ¶lgeler                     | Var (Ã¼Ã§ bÃ¶lge)         |
| Aktif teknoloji ekosistemi            | Var (yetenek katmanlarÄ±) |
| Son insight iÃ§erikleri               | Var (en yeni Ã¼Ã§)        |
| Roadmap CTA                           | Var                       |

Ekran gÃ¶rÃ¼ntÃ¼leri kanÄ±t paketinde: ana sayfa, CyclOps, HakkÄ±mÄ±zda, Hizmetler,
Teknolojiler, Ä°Ã§gÃ¶rÃ¼ler landing, uzun blog yazÄ±sÄ±, mobil menÃ¼ ve footer â€”
masaÃ¼stÃ¼ / tablet / mobil / 320px / %200 zoom / JS-kapalÄ± koÅŸullarÄ±nda.

---

## 7. Teslim

| Ã–ÄŸe                    | DeÄŸer                                         |
| ------------------------ | ---------------------------------------------- |
| Merge commit             | `65fdd5d5c00d52e3cee79e58c4fc29226c17b528`     |
| Merge parent 1 (S08+S09) | `95aedc052eea223da5ddb4d0f1e442fd7e673382`     |
| Merge parent 2 (S10+S11) | `e89dbd1722269a289fcd46427c9c2154cf068944`     |
| Integration HEAD         | `__INTEG_HEAD__`                               |
| Review bundle            | `duosis-web-S08-S11-integration-review.bundle` |
| Evidence ZIP             | `duosis-web-S08-S11-integration-evidence.zip`  |

### `git status --short`

```
(temiz â€” Ã§Ä±ktÄ± yok)
```

---

## 8. Bilinen iÃ§erik riskleri

Bunlar entegrasyonun Ã¼rettiÄŸi sorunlar deÄŸil; iki sprintten devralÄ±nan ve
**bilinÃ§li olarak aÃ§Ä±k bÄ±rakÄ±lan** durumlardÄ±r.

| #   | Risk                                                                                                                                        | Durum                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **OnaylÄ± mÃ¼ÅŸteri referansÄ± yok.** KanÄ±t bÃ¶lÃ¼mÃ¼ hiÃ§bir sayfada render edilmiyor.                                                    | `proof-system.test.ts` bu durumu kilitliyor: gerÃ§ek bir referans eklendiÄŸinde test kÄ±rÄ±lÄ±r ve bÃ¶lÃ¼mÃ¼n gÃ¶zden geÃ§irilmesini zorunlu kÄ±lar. |
| 2   | **ÃœÃ§Ã¼ncÃ¼ taraf teknoloji logosu yayÄ±nlanamÄ±yor.** Envanterdeki tÃ¼m Ã¼Ã§Ã¼ncÃ¼ taraf kayÄ±tlarÄ±n `logoPermission` deÄŸeri `unknown`. | YalnÄ±zca CyclOps'un izni var (ADR-012, Duosis kendi Ã¼rÃ¼nÃ¼). Teknoloji atlasÄ± bilinÃ§li olarak logosuz.                                          |
| 3   | **Sosyal Ã¶nizleme gÃ¶rseli yok.** Åemada alan var, hiÃ§bir yazÄ±da dolu deÄŸil; OG kartÄ± `summary` tipinde.                               | Sahte hero gÃ¶rseli Ã¼retilmedi. Marka OG raster'Ä± hazÄ±rlanÄ±nca doldurulabilir.                                                                   |
| 4   | **TÃ¼m sayfalar `noindex`.**                                                                                                                | GeliÅŸtirme sÃ¼rÃ¼mÃ¼ politikasÄ± (S02). YayÄ±n Ã¶ncesi toplu gÃ¶zden geÃ§irme gerekiyor.                                                            |
| 5   | **Kanonik adres `localhost:4321`.** `PUBLIC_SITE_URL` ayarlÄ± deÄŸil; JSON-LD ve RSS yerel adres taÅŸÄ±yor.                                 | DaÄŸÄ±tÄ±m kararÄ±yla (ADR-003) birlikte Ã§Ã¶zÃ¼lÃ¼r.                                                                                                |
| 6   | **GeniÅŸ tablo sÄ±nÄ±rÄ±.** ÃœÃ§ sÃ¼tundan geniÅŸ tablo dar ekranda okunaksÄ±z.                                                             | EriÅŸilebilirlik kararÄ±nÄ±n kabul edilen bedeli; `CONTENT_AUTHORING.md` belgeliyor.                                                                 |
| 7   | **Sitemap yok.** S13 kapsamÄ±.                                                                                                              | Ãœretim `src/lib/content/selectors` seÃ§icilerini tÃ¼ketmeli; gÃ¶rÃ¼nÃ¼rlÃ¼k kuralÄ± orada yaÅŸÄ±yor.                                                |

---

## 9. Sonraki adÄ±m

S08â€“S11 entegrasyonu tamamlandÄ± ve remote CI yeÅŸil. **Burada duruldu:**
`main` branch'ine merge edilmedi ve S12'ye geÃ§ilmedi. Codex incelemesi
bekleniyor.
