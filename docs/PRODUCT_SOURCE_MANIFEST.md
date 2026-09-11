# Ürün kaynak manifesti

Bu dosya, siteye giren **her ürün iddiasının** ve **her görsel varlığın**
nereden geldiğini kayda geçirir. Amaç tek bir sorunun her zaman
cevaplanabilmesidir: _"Bu cümleyi hangi commit'e dayanarak yazdık?"_

Kural: burada kaynağı gösterilmeyen hiçbir yetenek, ekran veya rakam
kamuya açık sayfalarda yayımlanmaz.

**Tarama tarihi:** 2026-09-11

---

## Özet

| Ürün     | Kaynak                           | Durum                                               | Yayınlanabilir ekran                          |
| -------- | -------------------------------- | --------------------------------------------------- | --------------------------------------------- |
| CyclOps  | S08 doğrulanmış içerik (bu depo) | yayında                                             | var (S08'de maskelenmiş)                      |
| Hermes   | `Duosis-Developer-Team/Hermes`   | manifest doğrulandı                                 | **yok** — süreç görselleştirmesi kullanılacak |
| LogiSlot | `Duosis-Developer-Team/logislot` | manifest doğrulandı                                 | **2 tam, 2 maskeleme sonrası**                |
| RAVSKALD | `Duosis-Developer-Team/Ravskald` | sözleşme doğrulandı, **ürün geliştirme aşamasında** | **yok**                                       |

---

## 1. Hermes

| Alan               | Değer                                                              |
| ------------------ | ------------------------------------------------------------------ |
| Repo               | `https://github.com/Duosis-Developer-Team/Hermes` (public)         |
| Branch             | `dev` (varsayılan)                                                 |
| Kaynak commit      | `c217e24b41e8633efb4a51a79a940571602bd037`                         |
| Commit tarihi      | 2026-09-10T14:16:46Z                                               |
| Manifest           | `.duosis/website.json`                                             |
| Manifest SHA-256   | `4ce1c36e032c62a10464beb718b5bad7ef562a62f60231fe6f649bd9243073dc` |
| Manifest içi durum | `status: "draft"`, `featured: false`                               |
| Dil                | TR + EN (manifest iki dilli)                                       |

### İçerik durumu

Manifest, ürün anlatısı için **yeterli ve birincil kaynaktır**: başlık, özet,
problem, yaklaşım, 5 sonuç, 3 hedef kitle, **11 yetenek**, 4 adımlı iş akışı
ve güvenlik maddeleri iki dilde tanımlı.

Yayımlanan yetenekler (tamamı manifestten):
zaman girişi · çalışma alanı yapılandırması · raporlama ve panel ·
faturalandırılabilir saatler · görev ve toplantı yönetimi · rol ve izin
yönetimi · destek talepleri merkezi · public API ve MCP sunucusu ·
Microsoft hesabıyla giriş · çok kiracılı çalışma alanları · TR/EN arayüz

### Görsel izin durumu — **YAYIMLANMAYACAK**

Manifestte `screenshots: []`. Depo kökündeki `IMG_*` dosyaları **incelendi ve
reddedildi**.

| Dosya          | SHA-256          | Bulgu                                | Karar                                        |
| -------------- | ---------------- | ------------------------------------ | -------------------------------------------- |
| `IMG_9364.jpg` | `676f1bcb…9ad8`  | Kanatlı sandalet + "HERMES" wordmark | **REDDEDİLDİ** — üçüncü taraf tescilli marka |
| `IMG_9367.PNG` | `e6961171…64f49` | "HERMES" lüks marka wordmark'ı       | **REDDEDİLDİ** — üçüncü taraf tescilli marka |
| `IMG_9369.PNG` | `7214ab9f…6fd08` | Aynı aile görsel                     | **REDDEDİLDİ**                               |

Bu dosyalar ürün ekranı **değildir**; Hermès lüks markasına ait veya ondan
türetilmiş grafiklerdir. Kişisel veri taşımıyor olmaları kullanılabilir
oldukları anlamına gelmez: bunlar **başka bir şirketin markasıdır**.

**Sonuç:** Hermes için gerçek ürün ekranı yayımlanmayacak. Ürünün iş akışı
HTML/SVG ile **süreç görselleştirmesi** olarak gösterilecek ve sayfada açıkça
süreç görselleştirmesi olduğu yazılacak. **Sahte ürün ekranı tasarlanmayacak.**

---

## 2. LogiSlot

| Alan               | Değer                                                              |
| ------------------ | ------------------------------------------------------------------ |
| Repo               | `https://github.com/Duosis-Developer-Team/logislot` (public)       |
| Branch             | `dev` (varsayılan)                                                 |
| Kaynak commit      | `588b6830aa1176413b40ee9100fb812b31e8632f`                         |
| Commit tarihi      | 2026-09-06T18:38:15Z                                               |
| Manifest           | `.duosis/website.json`                                             |
| Manifest SHA-256   | `d899aed22d78bc2d3050dead5d56fcfefeced1df446bec68fa3ad11ae924b5de` |
| Manifest içi durum | `status: "draft"`, `kind: "owned_product"`                         |
| Dil                | TR + EN                                                            |

### İçerik durumu

Manifest **15 yetenek** ve **6 adımlı** iş akışı tanımlıyor; `metrics: []`
(yani manifest de hiçbir sayısal iddia taşımıyor — biz de taşımayacağız).

### Görsel izin durumu

Dört görsel indirildi ve **tek tek gözle incelendi**.

| Dosya                       | SHA-256          | İnceleme bulgusu                                                          | Karar                       |
| --------------------------- | ---------------- | ------------------------------------------------------------------------- | --------------------------- |
| `landing-hero-light.png`    | `7c068533…6f873` | Ürünün kendi tanıtım sayfası; müşteri adı, kişisel veri veya iç adres yok | **KABUL**                   |
| `landing-hero-dark.png`     | `d10dcdcd…5f663` | Aynı sayfanın koyu teması; temiz                                          | **KABUL**                   |
| `supplier-wizard-step2.png` | `4f43b2a7…7cedc` | Başlıkta **"Anadolu Un Portal"** kiracı adı ve "AP" avatarı               | **MASKELEME SONRASI KABUL** |
| `supplier-wizard-step3.png` | `cf9f5bcc…a9df8` | Aynı başlık bloğu; ayrıca "Çavdar Unu" ürün satırı                        | **MASKELEME SONRASI KABUL** |

**Neden maskeleme gerekti.** Manifest bu ekranları "Demo verisi (seed
hesabı)" olarak etiketliyor. Buna rağmen ekranda görünen kiracı adı
**gerçek bir şirket adına benziyor**. Bir müşteri adını kendi tanıtım
sitemizde yayımlamak, izni doğrulanmamış bir referans iddiasıdır — seed
verisi olsa bile. Bu yüzden başlıktaki kiracı adı ve avatar maskelenir;
maskeleme S08'de CyclOps ekranlarında uygulanan yöntemin aynısıdır.

Plaka ve sürücü alanları boş yer tutucudur (`34 ABC 123`, `Ad Soyad`) —
kişisel veri içermez.

**Hotlink yok.** Görseller sabit kaynak commit'inden indirildi, yerel varlık
olarak eklendi, AVIF/WebP türevleri üretildi; kaynak ve hash bu tabloda.

---

## 3. RAVSKALD

| Alan                   | Değer                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| Repo                   | `https://github.com/Duosis-Developer-Team/Ravskald` (**private**)  |
| Branch                 | `main` (varsayılan)                                                |
| Kaynak commit          | `4a10a5ad0105ce778481041f0caf52b52162e877`                         |
| Commit tarihi          | 2026-09-05T15:02:26Z                                               |
| `.duosis/website.json` | **YOK**                                                            |
| Otoritatif kaynak      | `RAVSKALD-Planlama-Paketi/00-PROJE-SOZLESMESI.md`                  |
| Sözleşme SHA-256       | `9af968746c5e1135d117db248fc26c01ba9a72025e1c5569262293b051a788eb` |

Repo, kamuya açık organizasyon listesinde görünmüyordu çünkü **private**.
Yetkili kimlik bilgisiyle bulundu. Önceki konuşmalardaki genel ürün fikirleri
kaynak kabul **edilmedi**; aşağıdaki her cümle sözleşme dosyasına dayanır.

### Ürün tanımı (sözleşme md.1'den, doğrudan)

> RAVSKALD; operasyon ekiplerinin Türkçe doğal dil sorularını Zabbix ve
> SiteScope verisine dayanarak yanıtlayan, on-prem çalışan, salt-okunur ve
> kanıt gösterebilen bir sohbet uygulamasıdır.

Sözleşmenin açıkça **yapmaz** dediği şeyler (sayfada da iddia edilmeyecek):
acknowledge/maintenance/config mutasyonu · otomatik remediation ·
tahmin/anomali tespiti · bildirim gönderimi · veriyi kurum dışına veya bulut
modeline gönderme.

### BUGÜN ÇALIŞAN KISIM ile ROADMAP AYRIMI — kritik bulgu

Bu ayrım, ürünün siteye nasıl konulacağını belirlediği için ayrıca önemlidir.

`README.md` (aynı commit) ürünün **S02 sprintinde** olduğunu söylüyor
(planlama paketi S00–S20 arası tanımlı) ve şunu **kendi cümleleriyle**
belirtiyor:

> "Tenant/RLS, login, RBAC, MCP, model ve chat işlevleri **bilinçle olarak
> yoktur** — bunlar S02 ve sonrasının kapsamındadır."

Bugün gerçekten çalışan:

- monorepo iskeleti (Next.js web kabuğu, FastAPI API, same-origin gateway),
- PostgreSQL 16 üzerinde tenant kontrol düzlemi ve `FORCE ROW LEVEL SECURITY`,
- iki tenantın izolasyonunun gerçek veritabanında kanıtlanmış olması.

Bugün **çalışmayan** (yani ürünün ana vaadi): doğal dil sohbeti, model
entegrasyonu, Zabbix/SiteScope sorgulama, MCP tool'ları, login ve RBAC.
Ayrıca aktif bir `STOP-01` kuralı var: Zabbix, SiteScope ve model
endpoint'lerine erişim yok.

**Bunun siteye etkisi.** RAVSKALD'ın _ne olduğu_ doğrulanmıştır (bağlayıcı
sözleşme), fakat _bugün çalıştığı_ doğrulanmamıştır. Bu yüzden ürün sayfası
yeteneklerini **şimdiki zamanda çalışıyormuş gibi anlatmayacak**; tasarlanan
kapsam ile bugünkü durum sayfada ayrı ayrı ve açıkça gösterilecek. Bu, çalışma
emrinin "doğrulanmamış yetenek yayınlama" kuralının doğrudan uygulanmasıdır.

### Görsel izin durumu — **YAYIMLANMAYACAK**

Depoda görsel olarak yalnızca `apps/web/public/brand/ravskald-logo-v2.png`
bulunuyor; bu bir **logo**, ürün ekranı değil. Yayımlanabilir ürün ekranı
**yoktur** — zaten ürün arayüzü henüz mevcut değil.

---

## 4. CyclOps

| Alan         | Değer                                                                |
| ------------ | -------------------------------------------------------------------- |
| Kaynak       | Bu depo — S08'de doğrulanan içerik ve ekranlar                       |
| Kaynak belge | `Cyclops_v1.pdf`, SHA-256 `964a6ee7…435a` (ham PDF depoya işlenmedi) |
| Görsel izin  | S08'de incelendi; hassas alanlar maskelendi                          |

Mevcut doğrulanmış içerik ve güvenli ekranlar **korunuyor**. S08'de maskelenen
alanlar **geri getirilmiyor**; gerçek müşteri veya altyapı verisi
kullanılmıyor. İnsan onayı ile otomasyon arasındaki sınır görünür kalıyor.

Konumlandırma değişiyor: CyclOps artık tek başına bir ana navigasyon öğesi
değil, **Duosis ürün ailesinin bir üyesi**.

---

## 5. Yayımlanmayan iddialar — genel kural

Kullanıcı ürünlerin siteye eklenmesini açıkça onayladı. Bu onay,
**doğrulanmamış iddia yayımlama izni değildir**. Aşağıdakiler hiçbir üründe
kullanılmayacak:

- müşteri sayısı, kullanım oranı, işlem hacmi,
- başarı metriği, tasarruf veya performans yüzdesi,
- SLA taahhüdü,
- pazar liderliği veya "Türkiye'nin ilk/tek" türü ifadeler,
- müşteri adı, logosu veya referansı,
- henüz çalışmayan roadmap özelliklerinin şimdiki zamanda anlatımı.

Üç ürün manifestinin ikisinde `metrics: []`, birinde metrik alanı hiç yok —
yani kaynaklar da sayısal iddia taşımıyor.
