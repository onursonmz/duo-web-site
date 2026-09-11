# İçerik boşlukları

Bu dosya, **bilerek boş bıraktığımız** yerleri kayda geçirir. Amaç: bir
eksiğin unutulmuş mu yoksa bilinçli mi olduğunu her zaman ayırt edebilmek.

Buradaki hiçbir madde "yakında" yazısıyla veya uydurma içerikle kapatılmadı.

---

## 1. RAVSKALD — ürün henüz çalışmıyor

**Durum:** `verificationStatus: "verified-scope"`

Ürünün **ne olduğu** bağlayıcı bir proje sözleşmesiyle doğrulandı
(`RAVSKALD-Planlama-Paketi/00-PROJE-SOZLESMESI.md`, commit
`4a10a5ad0105ce778481041f0caf52b52162e877`). Ancak deponun kendi README'si
şunu yazıyor:

> "Tenant/RLS, login, RBAC, MCP, model ve chat işlevleri bilinçli olarak
> yoktur — bunlar S02 ve sonrasının kapsamındadır."

**Bugün çalışan:** monorepo iskeleti, aynı kökenli ağ geçidi, PostgreSQL
üzerinde kiracı kontrol düzlemi ve satır düzeyi güvenlik.

**Bugün çalışmayan:** doğal dil sohbeti, model entegrasyonu, Zabbix ve
SiteScope sorgulama, MCP araç katmanı, giriş ve rol yönetimi.

**Sayfada nasıl ele alındı:** tasarlanan kapsam ile bugünkü durum AYRI
gösteriliyor; "bugün çalışıyor / henüz çalışmıyor" bloğu sayfanın üst
kısmında. `SoftwareApplication` yapılandırılmış verisi **basılmıyor**.

**Kapanması için gereken:** ürünün çalışır bir sürümü ve yeni bir kaynak
doğrulaması. O zaman `verified-running`'e geçilir ve blok kaldırılır.

---

## 2. Hermes — yayımlanabilir ürün ekranı yok

**Durum:** ürün `verified-running`, fakat **görsel yok**.

Manifestte `screenshots: []`. Depo kökündeki `IMG_*` dosyaları incelendi ve
**reddedildi**: üçü de Hermès lüks markasının wordmark'ı ve kanatlı sandalet
logosu — ürün ekranı değil, başka bir şirketin tescilli markası.

**Sayfada nasıl ele alındı:** iş akışı SVG ile **süreç görselleştirmesi**
olarak çizildi ve bunun bir ürün ekranı olmadığı açıkça yazıldı. Sahte
dashboard tasarlanmadı.

**Kapanması için gereken:** Hermes ekibinden kişisel veri ve müşteri adı
içermeyen gerçek ekran görüntüsü.

---

## 3. LogiSlot — iki ekran maskelenmiş hâlde yayımlandı

**Durum:** dört görselden ikisi olduğu gibi, ikisi maskelenerek kullanıldı.

Tedarikçi portalı ekranlarının başlığında **"Anadolu Un Portal"** kiracı adı
görünüyordu. Manifest bunları "demo (seed) verisi" olarak etiketliyor; yine de
bir şirket adını kendi tanıtım sitemizde yayımlamak izni doğrulanmamış bir
müşteri referansı olurdu.

**Kapanması için gereken:** ya nötr kiracı adıyla alınmış yeni ekranlar, ya da
görünen kurumdan yazılı yayın izni. İzin gelirse maskeleme kaldırılabilir.

---

## 4. Ürünlerin çözüm ve teknoloji ilişkileri kurulmadı

`technologyRefs` ve `relatedSolutionRefs` yeni üç ürün için **boş**.

CyclOps'un entegrasyon listesi S08'de tek tek doğrulanmıştı. Hermes, LogiSlot
ve RAVSKALD için böyle bir doğrulama yapılmadı; kaynak manifestler teknoloji
envanterimizle eşleşen bir liste taşımıyor.

**Kapanması için gereken:** her ürün için kullanılan teknolojilerin
`technologies` envanteriyle eşleştirilmesi ve `lifecycle: active` doğrulaması.

---

## 5. Ürün ekosistemi sahnesinde düğüm etiketleri yok

Sahnedeki kaynak ve sonuç kutuları şu an **boş dikdörtgenler**. Anlam, sahnenin
yanındaki panel metninde duruyor.

SVG içine metin gömmek iki dilde taşma ve font ölçüm sorunları üretiyordu;
ayrıca çeviri sisteminden kopuk bir metin kaynağı yaratırdı.

**Kapanması için gereken:** HTML katmanında konumlandırılmış, çeviri
sisteminden beslenen etiketler (S16 görsel revizyonu).

---

## 6. Bölgesel anlatı görselleştirilmedi

Türkiye, Orta Asya ve Orta Doğu kapsamı metinde duruyor; harita veya görsel
anlatıya dönüştürülmedi.

Bunun nedeni bilinçli: gerçek koordinat iddiası olmadan bir harita çizmek
kolayca "buralarda ofisimiz var" gibi okunuyor. Sahte ofis noktası
eklenmeyeceği için görsel, ofis değil **kapsama** anlatacak biçimde
tasarlanmalı — bu ayrı bir sanat yönü çalışmasıdır.

**Kapanması için gereken:** ofis iddiası taşımayan, kapsama odaklı bölgesel
görsel tasarımı.

---

## 7. Meta açıklama uzunlukları

Üretim derlemesinde: 70 karakterin altında **5**, 160 karakterin üstünde
**3** açıklama var. Hiçbiri boş değil, hiçbiri tekrar etmiyor.

Bunlar kapı değil rapor olarak tutuluyor: arama sonucu kırpması bir içerik
kararıdır ve S15 içerik doğruluk kapısına bırakılmıştır.

**Kapanması için gereken:** içerik sahibinin bu sekiz açıklamayı gözden
geçirmesi.

---

## 8. İndeksleme kararı verilmedi

Sitenin tamamı hâlâ `noindex`; üretim sitemap'i boş.

Bu bir eksik değil, **bilinçli bir bekletmedir**: kullanıcı siteyi görüp
onaylamadan indeksleme açılmayacak.

**Kapanması için gereken:** kullanıcının görsel ve içerik onayı.
