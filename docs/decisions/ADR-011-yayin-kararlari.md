# ADR-011 — Yayın kararları: bölgeler, teknoloji adları ve public ses

- Durum: **ACCEPTED**
- Tarih: 2026-09-09
- Kapsam: S06+S07 çalışma paketi
- İlgili: ADR-009 (çözüm taksonomisi), `discovery/content-truth-matrix.csv`,
  `docs/CONTENT_MATURITY.md`

Bu kayıt, S04+S05 incelemesinde alınan **yayın yönlendirmesi** kararlarını
belgeler. Discovery geçmişi (S00 bulguları, truth matrix satırları, kaynak
envanteri) **yeniden yazılmamıştır**; bu ADR onların üzerine bir yayın kararı
katmanı ekler.

---

## 1. Bağlam

S05 sonunda site fail-closed davranıyordu: hiçbir teknoloji adı, bölge bilgisi
veya ürün anlatısı public çıktıya girmiyordu. Bu güvenliydi fakat iki yan etki
üretti:

1. Ziyaretçiye **iç yayın süreci** anlatılıyordu ("taslak", "iş sahibi
   doğrulaması bekliyor", "logo kullanım izni bulunmuyor").
2. Kurumun gerçekten yaptığı iş, kaynakta mevcut olmasına rağmen
   anlatılamıyordu.

Kullanıcının proje brief'i, aşağıdaki konular için **açık yayın yönlendirmesi**
sayılmıştır.

---

## 2. Karar — public ses

İç süreç dili public arayüzden tamamen kaldırılmıştır. Ziyaretçiye yayın
durumu, doğrulama süreci veya logo izni **anlatılmaz**.

Bu bilgiler kaybolmaz; yaşadıkları yer değişir:

| Bilgi            | Nerede yaşar                       | Public'te |
| ---------------- | ---------------------------------- | --------- |
| Doğrulama durumu | `verificationStatus`, truth matrix | Görünmez  |
| Logo izni        | `logoPermission`, S00 envanteri    | Görünmez  |
| Yayın olgunluğu  | `status`, `lifecycle`              | Görünmez  |
| Karar gerekçesi  | Bu ADR, `docs/`                    | Görünmez  |

**Veri yayınlanamıyorsa bölüm gizlenir.** Boş durum kutusu, "yakında" kartı
veya sahte KPI gösterilmez. `tests/e2e/public-voice.spec.ts` bunu tüm üretim
rotalarında denetler.

`/design-system` dahili/noindex önizlemedir, navigasyona eklenmez ve bu kuralın
kapsamı dışındadır.

---

## 3. Karar — yayınlanabilir konular

Public metinde kullanılabilir:

- Duosis 10. Yıl (tema olarak)
- Türkiye, Orta Asya, Orta Doğu (bölge adı olarak)
- Sekiz çözüm alanı
- AI'ın algıla → anla → harekete geç yaklaşımı
- CyclOps'un Duosis'in kendi çözümü olduğu
- Veri Gölü / Veri Platformu, LLM ve AI uygulamaları, chatbot, RAG,
  kurumsal asistanlar, entegrasyon çözümleri, Virtual NOC

### Sınırlar (değişmedi)

| Yasak                                                | Gerekçe         |
| ---------------------------------------------------- | --------------- |
| Kuruluş günü/ayı, ayrıntılı tarihçe                  | Doğrulanmadı    |
| Ofis, yerel ekip, ülke listesi, bölge başına müşteri | Doğrulanmadı    |
| CyclOps sürümü, müşteri kullanımı, SLA, başarı oranı | Doğrulanmadı    |
| Müşteri adı ve logosu                                | Yazılı izin yok |
| 10+ / 50+ / 15+ gibi sayılar                         | Doğrulanmadı    |

### Bölgeler

`src/content/regions/regions.json` içindeki altı kayıt (TR/EN × üç bölge)
`verificationStatus: verified` yapılmıştır. Kaynak izi
**kullanıcı proje brief'i** olarak korunmuştur. Kayıtlar yalnızca **bölge adı**
taşır; ofis, ekip veya müşteri bilgisi içermez.

---

## 4. Karar — metin olarak yayınlanabilir teknolojiler

Aşağıdaki 21 kayıt `lifecycle: active` ve `decisionNeeded: false` yapılmıştır.

| Çözüm alanı                          | Kayıtlar                                                    |
| ------------------------------------ | ----------------------------------------------------------- |
| Observability & APM                  | `datadog`, `zabbix`, `instana`, `opentelemetry`, `foglight` |
| Configuration & Asset Management     | `device42`, `opentext-cms`                                  |
| ITSM                                 | `smax`, `freshservice`                                      |
| Data Streaming & Integration         | `confluent`, `nifi`, `airflow`, `elastic`                   |
| Governance & Enterprise Architecture | `ardoq`, `quest`                                            |
| AIOps & Event Lifecycle              | `cyclops`                                                   |
| Automation                           | `opentext-oo`, `opentext-sa`, `ansible`, `awx`, `n8n`       |

### Bu kararın KAPSAMADIĞI şeyler

- **`logoPermission` aynen `unknown` kalır.** Hiçbir teknoloji logosu
  gösterilmez; `logoPathIfAllowed` preview modda dahi gevşemez.
- **İlişki iddiası kullanılmaz:** "partner", "resmî iş ortağı", "sertifikalı",
  "yetkili satıcı" gibi ifadeler yasaktır.
- Teknoloji adı yalnızca **nominatif metin** olarak gösterilir.
- Resmî ürün ekranı veya özellik matrisi üretilmez.
- Başlık "partnerlerimiz" olamaz; kullanılan başlık
  **"Çözüm kapsamında kullandığımız teknolojiler"**.

### `quest` kaydının kesinleştirilmesi

Genel `Quest Software` kaydı, kullanıcı onayındaki ürüne göre
**`Quest Change Auditor`** olarak kesinleştirilmiştir. **Yeni kayıt
açılmamıştır**; aynı ürün iki kez temsil edilmez. `source` alanındaki S00
kaynak izi ve `note` alanındaki dönüşüm gerekçesi korunmuştur.

### Pending kalan 14 kayıt

`glpi`, `grafana`, `jira`, `kace`, `kron`, `opentext` (ürünü belirsiz genel
kayıt), `pandora-fms`, `postgresql`, `runecast`, `runzero`, `solarwinds`,
`stor2rrd`, `tableau`, `vertica`.

`kace` kullanıcı brief'inde soru işaretiyle verilmişti; genel `opentext` kaydı
belirli bir ürüne karşılık gelmiyor. Diğerleri için açık onay yok.

---

## 5. Sonuçlar

- Public teknoloji listesi artık boş değil; çözüm sayfalarında 21 ad **metin
  olarak** görünüyor.
- Logo duvarı hâlâ imkânsız: `logoPermission` hiçbir kayıtta `allowed` değil.
- Pending 14 kaydın adı public HTML, metadata veya client payload'a
  giremez; `tests/e2e/i18n.spec.ts` bunu denetler.
- Bölgesel bölüm ana sayfada görünür hâle geldi.
- Site geneli `noindex` politikası **değişmedi**.

## 6. Geri alma

Bir kayıt yeniden kapatılacaksa `lifecycle` değeri `pending` yapılır; kod
değişikliği gerekmez. Aynı şekilde bir bölge `verificationStatus: pending`
yapıldığında bölüm kendiliğinden gizlenir.
