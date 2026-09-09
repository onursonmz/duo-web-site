# ADR-013 — 10. yıl ve Hakkımızda: yayınlanan tarihsel omurga

- Durum: **ACCEPTED**
- Tarih: 2026-09-09
- Kapsam: S09 çalışma paketi
- İlgili: ADR-011 (yayın kararları), ADR-012 (CyclOps), `docs/source-materials/SOURCE_MATERIALS.md`

Bu kayıt, 10. yıl manifestosundan **hangi bilginin yayına alındığını ve hangisinin
kapalı kaldığını** belgeler. Discovery geçmişi ve S00 doğruluk matrisi yeniden
yazılmamıştır.

---

## 1. Kaynak

| Alan    | Değer                                                              |
| ------- | ------------------------------------------------------------------ |
| Dosya   | `duosis-10-yil-manifesto.html` (SRC-05)                            |
| SHA-256 | `beb51261bceb4a707861a321ad1304e56f456e96e26b6f4414646553c3a4d049` |
| Durum   | **Ölçüldü ve talimattaki değerle birebir aynı**                    |

Ham HTML repoya commit edilmedi; yalnızca içerik kaynağı olarak kullanıldı.

## 2. Yayına alınan

- Duosis **2016'da kuruldu**; 2026 onuncu yıldır. `2016 → 2026` public kullanılabilir.
- `2016-kurulus` kaydı artık **doğrulanmıştır** (`verificationStatus: verified`).
  S00'da `pending` idi; doğrulama kaynağı kullanıcının sağladığı manifestodur.
- Aşağıdaki **güvenli tarihsel omurga** (yıl başına tek kayıt, TR + EN):

| Yıl  | Yayınlanan anlatı                                                     |
| ---- | --------------------------------------------------------------------- |
| 2016 | Kuruluş ve kurumsal BT operasyon yönetimi odağı                       |
| 2019 | Ürün kurulumundan kuruma özgü operasyon çözümlerine genişleyen model  |
| 2021 | Açık kaynak gözlemlenebilirlik çözümlerinin çalışma alanına eklenmesi |
| 2024 | Veri akışı ve modern gözlemlenebilirlik ekosisteminin genişlemesi     |
| 2025 | Veri platformları, makine öğrenmesi ve yapay zekâ uygulamaları        |
| 2026 | Onuncu yıl ve kendi ürünlerimizle sinyalden aksiyona yaklaşımı        |

- Quest ayrımı doğrulandı: **Change Auditor → Governance**,
  **Foglight → Observability**. Envanterdeki iki kayıt bu ayrımla kullanılır.

## 3. Kapalı kalan

Manifestoda bulunmasına rağmen yayınlanmayanlar:

- 5+, 15+, 25+, 35+, 50+ kurumsal müşteri sayıları ve ürün başına müşteri sayıları
- müşteri adları ve logoları
- ATM/banka ve havalimanı vakaları, sektör bazlı müşteri iddiaları
- MicroFocus/OpenText, IBM, Device42, Confluent, Datadog **partnerlik** iddiaları
- fiyatlama, node veya satış rakamları
- kuruluşun gün/ayı ve ayrıntılı şirket tarihi

`tests/unit/milestones.test.ts` ve `tests/e2e/about.spec.ts` bu sınırı hem içerik
verisinde hem render edilmiş sayfada tarar; kısa terimler (ATM, bank, IBM)
kelime sınırıyla aranır ki "katman" gibi kelimeler yanlış pozitif üretmesin.

## 4. Yapısal kararlar

- **Kaynak izi zorunlu.** `milestoneSchema` artık `source` alanını ister; izsiz
  bir kilometre taşı build'i kırar.
- **Yıl tekilliği.** Aynı locale'de aynı yıl için iki GÖRÜNÜR kayıt olursa
  `getMilestones` hata fırlatır ve build kırılır (`assertUniqueMilestoneYears`).
  Sıra deterministiktir: yıl, eşitlikte kayıt kimliği.
- **Ekip anlatısı kişi taşımaz.** `aboutSchema` içinde ad, unvan, fotoğraf veya
  profil alanı YOKTUR; roller kapalı bir anahtar kümesidir.
- S00 ölçüm kaydı (`2024-icerik-tazeligi`) `draft` olarak dahili kalır; yayına
  alınan 2024 kaydı ayrı bir dosyadır.

## 5. Geri alma yolu

- Zaman çizelgesi: kaydın `status` veya `verificationStatus` değeri geri
  alınırsa o yıl public çıktıdan düşer, bölüm kalan kayıtlarla render edilir.
- Hakkımızda sayfası: `about.json` kaydının `status` değeri `published`
  dışına alınırsa rota üretilmez (fail-closed).
