# ADR-012 — CyclOps ürün sayfası: kaynak, marka izni ve iddia sınırları

- Durum: **ACCEPTED**
- Tarih: 2026-09-09
- Kapsam: S08 çalışma paketi
- İlgili: ADR-011 (yayın kararları), `docs/source-materials/SOURCE_MATERIALS.md`,
  `src/assets/cyclops/MANIFEST.json`

Bu kayıt CyclOps ürün sayfasının **yayın kararlarını** belgeler. Discovery
geçmişi ve kaynak envanteri yeniden yazılmamıştır; bu ADR onların üzerine bir
karar katmanı ekler.

---

## 1. Kaynak durumu ve bir uyuşmazlık

S08 talimatı asli kaynağı şöyle veriyor:

| Talimattaki alan | Değer                                                              |
| ---------------- | ------------------------------------------------------------------ |
| Dosya            | `Cyclops_v1.pdf`                                                   |
| SHA-256          | `964a6ee73d061cdcc09c436ad43198bbd2eb612388b8a5729e071a6be295435a` |

Çalışma alanındaki ölçüm:

| Dosya                            | SHA-256                                                            | Durum                    |
| -------------------------------- | ------------------------------------------------------------------ | ------------------------ |
| `Cyclops_v1.pdf` (mevcut)        | `6a98ff91b4dcbeee70b050c8ab253f4e1b04a0b8974d9e817d676291b8feb5d7` | **ölçüldü**              |
| `Cyclops_v1.pptx` (SRC-03, asli) | `964a6ee73d061cdcc09c436ad43198bbd2eb612388b8a5729e071a6be295435a` | çalışma alanında **YOK** |

Talimatta verilen hash, S03'te **PPTX** için kaydedilen hash'tir (SRC-03);
çalışma alanındaki PDF'in hash'i farklıdır. PDF sessizce "asli kaynak" olarak
kabul EDİLMEDİ:

- Ürün ekranları **mevcut PDF'ten** (SRC-04) çıkarıldı ve manifestte bu
  dosyanın gerçek hash'i ile kaydedildi.
- SRC-03 (PPTX) hâlâ eksiktir; kayıt `SOURCE_MATERIALS.md` içinde eksik olarak
  durmaya devam eder.
- Slaytlar **rasterize edilmedi**: PDF içindeki gömülü orijinal raster
  XObject'ler çıkarıldı (`img-0119`, `img-0182`, `img-0188`, `img-0181`).

## 2. Ürün ekranı redaksiyonları

Her asset tek tek incelendi (hostname, IP, kullanıcı adı, token, community
string, müşteri adı). Bulgular ve müdahaleler `src/assets/cyclops/MANIFEST.json`
içinde kayıtlıdır:

| Asset                     | Bulgu                                 | Karar                |
| ------------------------- | ------------------------------------- | -------------------- |
| `event-browser-inspector` | Yalnızca sentetik demo verisi         | Redaksiyon gerekmedi |
| `matchers-rules`          | Kural değerinde üçüncü taraf ürün adı | Değer **maskelendi** |
| `operational-dashboard`   | "AVG RESOLUTION" değeri               | Değer **maskelendi** |

"AVG RESOLUTION" demo verisi olsa da ziyaretçi bunu bir **performans/SLA
sonucu** olarak okuyabilirdi; böyle bir iddia yayınlanmaz. Kural değerindeki
üçüncü taraf ürün adı ise müşteri/ilişki çıkarımına açıktı.

Hub ekranı (`img-0181`) galeriye **alınmadı**: özel IP adresi, dağıtım
kimlikleri ve envanterde bulunmayan üçüncü taraf ürün adları taşıyordu.
Yalnızca CyclOps wordmark'ı bu görselden kırpıldı.

## 3. Marka izni — YALNIZCA CyclOps

Kullanıcının ürün sunumunu site için sağlaması, CyclOps wordmark'ının kullanım
onayı sayılmıştır.

- `technologies.json` içinde **yalnızca** `cyclops` kaydı
  `logoPermission: "allowed"` oldu; `logoPath: /brand/cyclops-wordmark.png`.
- Kalan **34 kayıt** `logoPermission: "unknown"` olarak durur.
- Bu karar üçüncü taraf logolarını **açmaz**;
  `tests/unit/technology-inventory.test.ts` bunu kontrollü sapma olarak
  denetler (`ADR012_LOGO_ALLOWED`).
- Wordmark **yeniden çizilmedi**: sunumdaki gerçek asset'ten piksel kırpma.
  Sunumda vektör wordmark bulunmuyor (başlık slaydı metin olarak dizilmiş),
  bu yüzden 108×36 raster kullanılıyor ve açık zeminli olduğu için koyu hero'da
  beyaz bir taşıyıcı içinde duruyor. **Vektör asset iş sahibinden istenmelidir.**

## 4. Yayınlanan ve yayınlanmayan iddialar

Yayınlanan (ürün ekranı veya konumlandırma ile desteklenen):

- CyclOps'un Duosis tarafından geliştirildiği.
- Olay yaşam döngüsü yaklaşımı: sinyal → bağlam → ilişkilendirme → karar → aksiyon.
- Event Browser ve Inspector, filtreleme, matcher/kural yapısı, veri kaynağı
  sürüm geçmişi, operasyon panosu, entegrasyon ve dispatcher kavramları.
- İnsan onaylı otomasyon ve otomasyonun sınırı.
- Altı entegrasyon adı (metin): Zabbix, Datadog, Red Hat Ansible,
  OpenText Operations Orchestration, OpenText SMAX, Freshservice.

Yayınlanmayan (kanıt yok):

- "every event", "every tool", "any IT/OT source", "fully autonomous",
  "self-healing", "future-proof"
- MTTR/SLA iyileştirme oranı, finansal kayıp istatistiği, "10+ monitoring tool"
  pazar ortalaması
- müşteri sayısı, kullanım metriği, müşteri adı veya logosu
- Starter Pack, node sayısı, fiyatlama
- partnerlik iddiaları, sürüm numarası

`tests/unit/product-content.test.ts` ve `tests/e2e/cyclops.spec.ts` bu sınırı
hem içerik verisinde hem de render edilmiş sayfada tarar.

## 5. Marka rengi

CyclOps turkuazı (`#00c7b1`) `tokens.css` içinde `.product-accent-cyclops`
sınıfıyla **ürün yereli** olarak tanımlandı. Global Duosis paleti
değiştirilmedi; hiçbir mevcut token değeri güncellenmedi. Turkuaz yalnızca koyu
yüzeyde grafik vurgu olarak kullanılır (açık yüzeyde metin kontrastı yetersiz
kalır).

## 6. Geri alma yolu

- Ürün sayfası: `products.json` içindeki kaydın `status` değeri `published`
  dışına alınırsa rota üretilmez (fail-closed).
- Marka izni: `cyclops` kaydının `logoPermission` değeri `unknown`'a
  döndürülürse wordmark hiç render edilmez; testteki `ADR012_LOGO_ALLOWED`
  listesi boşaltılır.
- Ürün ekranları: `src/assets/cyclops/` altındaki dosyalar ve manifest
  silinirse galeri şeması `min(3)` nedeniyle build'i kırar — sessiz kayıp olmaz.
