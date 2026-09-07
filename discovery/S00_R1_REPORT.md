# DUOSIS Web — Sprint S00-R1 Teslim Raporu

## Durum

- **Sprint:** S00-R1 — Discovery revizyonu (iki zorunlu kaynağın incelenmesi)
- **Önceki inceleme sonucu:** CHANGES REQUESTED
- **Sonuç:** **COMPLETE** — istenen 11 revizyon maddesinin tamamı uygulandı
- **Base HEAD / Final HEAD / Branch:** — *(git deposu hâlâ yok)*
- **Yerel commit:** **OLUŞTURULMADI.** `04_DELIVERY_PROTOCOL.md` §2 uyarınca `git init` ve ilk commit yalnız S01 kapsamındadır; talimat da bunu teyit etti.
- **Push / merge / PR / deployment / scaffold / dependency:** **YAPILMADI**
- **Web taraması / baseline ölçümleri:** **TEKRARLANMADI** (talimat gereği). §2 ve §5 R0'dan aynen korundu.

---

## Uygulanan kapsam

| # | İstenen | Durum |
|---:|---|---|
| 1 | İki kaynağın adı, boyutu, SHA-256'sı kaynak envanterine eklensin | ✔ `S00_FINDINGS.md` §0 + yeni `source-inventory.csv` |
| 2 | PPTX'in 17 slaydının tamamı + brief'in tamamı incelensin | ✔ 17/17 slayt metni + 289 gömülü görselin dağılımı; brief 9.041 baytın tamamı |
| 3 | Altı çıktı yeni kanıtlara göre güncellensin | ✔ 6/6 güncellendi |
| 4 | 10+/50+/15+ "kaynakta mevcut, iş sahibi doğrulaması bekliyor" olsun | ✔ `source-present-owner-unverified`, üçü de `publishableNow: NO` |
| 5 | Sunumdaki hizmet/çözüm/teknoloji/referanslar 8 çözüm alanıyla eşleştirilsin | ✔ `S00_FINDINGS.md` §3A + `mappedSolutionArea` alanı |
| 6 | Kesin olmayan eşlemeler `decisionNeeded` kalsın | ✔ 35 teknolojinin 25'i `decisionNeeded` |
| 7 | CyclOps'ta brief iddiası ile ürün kanıtı ayrılsın | ✔ C12 `claim-only-no-product-evidence` + §3'te kanıt tablosu |
| 8 | webvisor "yüksek öncelikli uyum riski; hukuk doğrulaması gerekli" olsun | ✔ B13 ve ADR-007 yeniden yazıldı; hukuki ihlal kararı verilmedi |
| 9 | Node 18 / pnpm "S01 kurulum ön koşulu" olsun, blokaj değil | ✔ B2, B3 ve ADR-002 yeniden sınıflandırıldı |
| 10 | Plan paketi dosya sayısı doğru ifade edilsin | ✔ 16 sprint + 7 kök + 2 kaynak = **25 dosya** |
| 11 | discovery klasörü ZIP olarak, SHA-256 ile teslim edilsin | ✔ Aşağıda |

---

## Değişen dosyalar

Mevcut hiçbir kullanıcı dosyası değiştirilmedi. Plan paketinin 25 dosyası (iki yeni kaynak dahil) **salt-okunur** işlendi.

| Dosya | Değişiklik nedeni |
|---|---|
| `discovery/S00_FINDINGS.md` | §0 kaynak envanteri eklendi; §1 dosya sayımı düzeltildi ve B2/B3/B4 yeniden sınıflandırıldı; §3 üç rakam + CyclOps + müşteri logoları yeniden yazıldı; **§3A yeni** (kaynak içerik haritası ve 8 alan eşlemesi); B13 ve B18 yeniden yazıldı; B26–B34 eklendi; §8 yeniden düzenlendi |
| `discovery/source-inventory.csv` | **YENİ** — iki kaynağın adı, konumu, boyutu, SHA-256'sı, mtime'ı, biçimi, ad farkı notu |
| `discovery/content-truth-matrix.csv` / `.json` | 18 → **27 kayıt**. C01–C03 yeniden sınıflandırıldı; C04 kaynaksız olarak teyit edildi; C12 kanıt ayrımıyla yeniden yazıldı; C19–C27 eklendi |
| `discovery/technology-inventory.csv` / `.json` | 30 → **35 kayıt**. `mappedSolutionArea` sütunu eklendi; kaynak izleme alanı slayt numarasıyla zenginleştirildi; Jira, GLPI, Tableau, SolarWinds, runZero eklendi |
| `discovery/ADR-DRAFT.md` | ADR-001/002/004/005/007 kaynak bulgularıyla güncellendi; **ADR-009** (çözüm taksonomisi) ve **ADR-010** (kaynak güvenilirlik sırası) eklendi |
| `discovery/S00_R1_REPORT.md` | **YENİ** — bu rapor |

Değişmeyenler: `legacy-url-inventory.csv`, `baseline/MEASUREMENTS.md`, `baseline/*.png` (4 ekran görüntüsü), `S00_REPORT.md` (R0 kaydı olarak korundu).

---

## Kaynak envanteri

| # | Dosya | Boyut | SHA-256 |
|---|---|---:|---|
| SRC-01 | `Duosis_Yeni_Sunum_v2.pdf` | 2.155.996 B | `c4b56f78e0f460d3d635a82e35c975e0e3e62e44625aff2c98b083fd1c0b788c` |
| SRC-02 | `duosis-hackathon-brief.txt` | 9.041 B | `3aa7cfaba3a7b184487a596eb21d02045e1e2446487ccdfdb874b26e699ef3fb` |

**Dosya adı farkları** (engelleyici değil, kayıt için): sprint dosyası `.pptx` bekliyordu, teslim edilen **PDF**'tir (17 slayt doğrulandı); brief'in adında `(1)` soneki yok.

---

## Kaynaklardan çıkan başlıca bulgular

### 1. Üç rakamın kaynağı bulundu

Sunum **slayt 3** üçünü de içeriyor: `10+ yıllık tecrübe`, `50+ kurumsal müşteri`, `15+ teknik danışman`. Üçü de `source-present-owner-unverified` olarak sınıflandırıldı ve **yayınlanamaz** kaldı — sözleşme `verificationStatus !== verified` olan metriklerin kamuya açık build'de görünmesini yasaklıyor.

### 2. Kuruluş bilgisi ortaya çıktı

Slayt 3, birebir: *"DUOSIS, 2016 yılında İstanbul'da kurulmuş bir Bilgi Teknolojileri Danışmanlık şirketidir."* Bu bilgi canlı sitenin hiçbir sayfasında yoktu ve S09 timeline'ının başlangıç noktasıdır. **Dikkat:** 2016 → 2026 tam **10 yıl**; "10+" ifadesi sınırdadır.

### 3. Bölgesel kapsam iddiası hâlâ kaynaksız

`Central Asia`, `Orta Asya`, `Middle East`, `Orta Doğu` terimleri sunumun 17 slaydında ve brief'in tamamında **0 kez** geçiyor. Sunumdaki referansların tamamı Türkiye merkezli kurumlar. C04 `pending` kaldı.

### 4. CyclOps — iddia ile ürün kanıtı ayrıldı

| Kaynak | CyclOps geçiş sayısı |
|---|---:|
| Hackathon brief (planlama belgesi) | **9** |
| Kurumsal sunum (17 slayt) | **0** |
| Canlı site (54 sayfa) | **0** |
| Teknik ürün kanıtı (ekran, sürüm, mimari) | **yok** |

Brief bir planlama belgesidir ve ürün yeteneğinin teknik kanıtı sayılamaz. Şirketin kendi tanıtım sunumunda hiç geçmemesi ayrıca dikkat çekicidir. C12 `claim-only-no-product-evidence` olarak sınıflandırıldı; **S08 BLOCKED** kalır.

### 5. Sunumda ~29 isimli müşteri logosu bulundu — en yüksek riskli bulgu

Slayt 7 sektör bazlı bir referans duvarı (34 gömülü görsel), slayt 8–16 ise her çözümün "İlgili Referanslar" bölümünde logoları tekrarlıyor. Tanımlananlar arasında **TCMB, Turkish Airlines, Turkcell, TOFAŞ, Sabancı Dx, TAV Havalimanları, iGA, DenizBank, Odeabank, Aktif Bank, TEB, Türkiye Finans, Ziraat Teknoloji, AgeSA, Anadolu Hayat Emeklilik, Kuveyt Türk** ve diğerleri var.

> **İç sunumda logo bulunması yayın izni değildir.** Tüm kayıtlar `logoPermission: unknown` bırakıldı; hiçbiri yazılı izin alınmadan kullanılmayacak.

Ayrıca sunum bir çalışanın adını, kurumsal e-postasını ve **cep telefonunu** içeriyor (slayt 17 + tüm altbilgiler). Kişisel veridir; rıza olmadan yayınlanmayacaktır.

### 6. Üç kaynak, üç farklı çözüm taksonomisi

| Kaynak | Yapı |
|---|---|
| Plan paketi `03` | **8** çözüm (Observability, CMDB, ITSM, Data Streaming, EA, AIOps, Automation, Engineering) |
| Brief | **8** farklı fayda başlığı (izleme/APM ayrı, Automation ayrı alan değil) |
| Sunum | 4 üst başlık + **9** detay çözümü (**ITAM** dahil) |

ITAM yalnızca sunumda, Engineering & Product Development yalnızca plan paketinde var. **S02 öncesinde tek taksonomi seçilmelidir** (ADR-009).

### 7. Teknoloji envanteri kaynakla yeniden kuruldu

Sunumda **hiçbir teknoloji adı metin olarak geçmiyor** — hepsi logo görselidir. İlgili slaytların logoları çıkarılıp görsel olarak incelendi:

- **Logo ile doğrulanan 14 teknoloji** ve hangi çözüme ait oldukları eşlendi.
- **Envanterde olmayan 3 teknoloji bulundu:** Jira Software, GLPI, Tableau.
- **Brief'in "eskiyenler" listesi 2 yeni ad getirdi:** SolarWinds, runZero (+ Kron).
- **Plan paketindeki 10 teknoloji hiçbir kaynakta yok:** Foglight, OpenText CMS/OO/SA, NiFi, Airflow, Elastic, AWX, n8n, KACE.
- **Freshservice** canlı sitede hiç geçmiyordu ama sunumun 5 slaydında var.

35 kaydın **25'i `decisionNeeded`**; kesin olmayan eşlemeler açıkça işaretlendi.

### 8. Diğer çelişkiler

- **Hizmet sayısı:** sunum 4, canlı site ve brief 5.
- **Ana mesaj:** brief *"İşlerinizi kolaylaştırıyoruz."*, plan paketi *"Operasyonu görün. Veriyi bağlayın. AI ile harekete geçin."* — R0'da "ayırt edici olmayan kalıp" diye işaretlenen mevcut H1'in aslında bilinçli bir marka sesi tercihi olduğu anlaşıldı (B18 düzeltildi).
- **Kapsam beklentisi:** brief "vertical slice prototip", plan paketi tam kurumsal site tarif ediyor.

---

## Yeniden sınıflandırmalar

| Konu | R0 ifadesi | S00-R1 ifadesi |
|---|---|---|
| Yandex `webvisor:true` | "Aktif KVKK riski / politikayla uyumlu değil" | **"Yüksek öncelikli KVKK/consent uyum riski; hukuk ve iş sahibi doğrulaması gerekli."** Ölçülen teknik davranış bildirilir; hukuki ihlal kararı verilmez — bu Duosis hukuk birimi ve veri sorumlusunun yetkisindedir |
| Node 18 | "S01'in ilk bloklayıcısı" | **"S01 kurulum ön koşulu"** — S01 kapsamında çözülür, harici karar gerektirmez |
| pnpm eksikliği | "Kurulum bloklayıcı" | **"S01 kurulum ön koşulu"** |
| Plan paketi dosya sayısı | "16 markdown dosyası" *(hatalı)* | **25 dosya:** 16 sprint `.md` + 7 kök `.md` + 2 kaynak |
| Mevcut H1 | "Ayırt edici olmayan kalıp" | Bilinçli marka sesi; asıl sorun **iki kaynak arasındaki mesaj çelişkisi** |

---

## Test sonuçları

| Komut | Exit | Sonuç |
|---|---:|---|
| Kaynak SHA-256 + boyut doğrulama | 0 | 2/2 kaynak, 64 hex hash doğrulandı |
| PDF yapı doğrulama (`/Type /Page`, `/Count`) | 0 | **17/17 slayt**; 289 gömülü görsel sayıldı |
| PDF metin çıkarımı (`pdftotext -layout`) | 0 | 24.457 karakter, 17 slaydın tamamı |
| Envanter doğrulama (S00-R1) | **0** | **21/21 kontrol PASS**, 0 FAIL |
| Kaynak kod üretilmedi | 0 | `.js/.ts/.astro/.css/package.json`: **0** |
| Bağımlılık kurulmadı | 0 | `node_modules`: **0** |
| Git deposu yok | 0 | `git rev-parse` → `.git` yok; commit yapılmadı |

S00-R1 doğrulama kapsamı: kaynak hash/boyut biçimi, teknoloji ID benzersizliği, `logoPermission` / `active` / `mappedSolutionArea` enum ve doluluk, yeni 5 teknolojinin varlığı, CyclOps sınıflandırması, iddia ID benzersizliği, `publishableNow` enum, C01–C03'ün `source-present-owner-unverified` + `NO` olması, C04'ün `pending` kalması, C12'nin `claim-only-no-product-evidence` olması, C23'ün yayınlanamaz olması, 3 çelişki kaydı, sahip alanı doluluğu, R0 URL envanterinin bozulmamış olması, 2 JSON dosyasının geçerliliği.

---

## Görsel ve davranış kanıtı

- **Desktop / mobile screenshot:** R0'dan korundu — `baseline/home-desktop-1440.png` (1440×2400), `baseline/home-mobile-390.png` (390×1800), + hakkımızda ve iletişim.
- **Kaynak inceleme kanıtı:** Sunumun logo bölümleri PNG'ye dönüştürülüp görsel olarak incelendi (teknoloji ve müşteri logolarının tanımlanması bu yolla yapıldı). Bu ara görseller geçici çalışma alanında tutuldu; müşteri logoları **teslim paketine kopyalanmadı** — izin durumu `unknown` olduğu için çoğaltılmadılar.
- **Klavye / reduced motion:** Bu sprintte uygulanmadı — henüz kendi arayüzümüz yok (S04+).
- **Console/network:** R0 ölçümleri geçerli; yeniden ölçülmedi.

---

## Performans / bundle etkisi

Değişiklik yok — S00-R1'de kod üretilmedi. R0 baseline'ı geçerli: mevcut site ana sayfası **~7,17 MB / ~102 istek** (CSS+JS 377 KB, görseller 6,61 MB), her iki sözleşme bütçesini de aşıyor.

---

## Bilinen açıklar ve riskler

**Yüksek öncelik**

1. **Sunumdaki ~29 müşteri logosunun hiçbirinde yayın izni kaydı yok.** Referans/proof sistemi (S10) bu izinler gelmeden içerik üretemez.
2. **CyclOps'un ürün kanıtı yok** — S08 BLOCKED.
3. **Çözüm taksonomisi üç kaynakta farklı** — S02 ve S07'nin ön koşulu.
4. **Yandex webvisor** onay arayüzü olmadan çalışıyor — yüksek öncelikli uyum riski; hukuk doğrulaması gerekli.
5. **Formda KVKK rıza kutusu ve spam koruması yok.**
6. **Marka cyanı `#16A6D9` beyaz üzerinde 2.80:1** — AA'yı büyük metinde bile geçmiyor; S03'te koyu varyant türetmek zorunlu.
7. **Hiçbir güvenlik başlığı yok**, `xmlrpc.php` açık.
8. **Sunumdaki kişisel iletişim bilgileri** rıza olmadan yayınlanamaz.

**Orta öncelik**

9. Node 18 ve pnpm eksikliği — S01 kurulum ön koşulu (blokaj değil).
10. Deployment hedefi bilinmiyor (ADR-003 `OPEN`).
11. Hizmet sayısı (4 mü 5 mi) ve ana mesaj çelişkisi.
12. Teknoloji kapsamı: 3 yeni bulunan, 3 "eskiyen", 10 kaynaksız teknoloji karar bekliyor.
13. Brief "vertical slice", plan paketi tam site tarif ediyor — kapsam beklentisi farkı.
14. Mevcut 19 uzmanlık/çözüm sayfasının seçilecek taksonomiye eşlenmesi; 4 legacy URL'nin hedefi yok.
15. R0'dan devam edenler: 24/54 sayfada meta description yok, hatalı `Article`/`Person` şeması, 4 sayfada "Micro Focus", karışık dil dizeleri, `[gslogo id=1]` render hatası.

---

## İş sahibi tarafından doğrulanması gerekenler

Öncelik sırasıyla 22 madde `S00_FINDINGS.md` §8'de listelendi. En kritik altı tanesi:

1. **10+ / 50+ / 15+** rakamlarının teyidi ve "50+" için sayım yöntemi.
2. **Kuruluş tarihi 2016** teyidi; metin "10 yıl" mı "10+ yıl" mı olacak?
3. **Çözüm taksonomisi** — 8 mi 9 mu; ITAM ayrı mı, Engineering kalacak mı?
4. **CyclOps** — gerçek ekran, doğrulanmış yetenek listesi, lansman durumu.
5. **~29 müşteri logosu** için yazılı kullanım izni.
6. **Bölgesel kapsam** — üç kaynağın hiçbirinde yok; kanıt gerekli.

---

## Sonraki sprint önerisi

**S01 — Repository & Quality Gates.** Sırasıyla: aktif Node LTS kurulumu → pnpm → `git init` + ilk commit → Astro/TS iskeleti → fail-closed `pnpm quality`.

S01 hiçbir iş sahibi kararına bağlı değildir ve içerik doğrulamaları beklenirken paralel yürütülebilir. Ancak:

- **S02 öncesi:** çözüm taksonomisi kesinleşmeli (ADR-009).
- **S03 öncesi:** marka paleti kararı verilmeli (ADR-008 — cyan kontrast kısıtı).
- **S08 öncesi:** CyclOps ürün kanıtı gelmeli.
- **S10 öncesi:** müşteri logo izinleri alınmalı.

> Bu yalnızca öneridir. Codex onayı gelmeden S01'e geçilmeyecektir.
