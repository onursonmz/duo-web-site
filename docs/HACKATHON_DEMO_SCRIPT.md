# Hackathon demo akışı — 3–5 dakika

**Hazırlık:** site yerelde açık olsun.

```bash
pnpm build && node tests/support/preview-server.mjs dist 4321
```

**Tam URL:** <http://127.0.0.1:4321/>

> **İnternet veya animasyon çalışmazsa:** akışın tamamı statik olarak da
> yürür. Sahnelerin taşıdığı her bilgi metin olarak sayfada duruyor; hiçbir
> adım animasyonun oynamasına bağlı değil. Kanıt paketindeki ekran
> görüntüleriyle de anlatılabilir.

---

## 0:00–0:20 — Beş saniyede değer önerisi

**Ekran:** ana sayfa, ilk görünüm.

> "Duosis, kurumların operasyonunu görünür kılıyor: farklı araçlardan gelen
> veriyi birleştiriyor, bağlam ekliyor ve onaylı aksiyona bağlıyor."

**Gösterilecek:** H1, açıklama ve iki CTA. Bunlar **ilk karede hareketsiz**
duruyor — okumak için animasyonun bitmesini beklemek gerekmiyor.

---

## 0:20–0:50 — Yaşayan operasyon haritası

**Ekran:** hero'daki harita.

> "Arkadaki şema dekoratif değil; çalışma modelimizin kendisi."

**Gösterilecek, soldan sağa:**

1. Dört **kaynak** — farklı izleme ve iş sistemleri.
2. **Sinyal** kutuları — ham olay.
3. Yolların **tek çekirdekte birleşmesi** — bağlam.
4. **Bakır eşkenar dörtgen** — karar noktası. _"Bakır rengi sitede yalnızca
   kararın ve insan müdahalesinin olduğu yerde kullanılıyor."_
5. **Aksiyon** çerçevesi — onaylı sonuç.

Yollar üzerinde akan cyan darbeler sistemin çalıştığını gösterir.

---

## 0:50–1:20 — Çözüm ve teknoloji katmanları

**Ekran:** Çözümler → bir çözüm detayı.

> "Altı çözüm alanı; her biri gerçek bir mühendislik disiplini."

**Vurgu:** teknoloji atlası yalnızca **doğrulanmış** kayıtları gösterir;
izinsiz hiçbir logo yok, partnerlik iddiası yok.

---

## 1:20–2:00 — Ürün ekosistemi

**Ekran:** `/urunler/`

> "Dört ürün var ve dördü farklı işliyor. Bu yüzden dört kart değil, tek bir
> sahne yaptık — seçtiğiniz ürüne göre sahnenin **topolojisi** değişiyor."

**Canlı gösterim:** sekmeleri sırayla seç, sahnenin değiştiğine dikkat çek.

| Ürün     | Sahne davranışı                                                              |
| -------- | ---------------------------------------------------------------------------- |
| CyclOps  | dört kaynak tek çekirdekte **birleşir**                                      |
| Hermes   | dağınık kayıtlar bağlamda **düzenlenir**                                     |
| LogiSlot | talep kurallardan geçip uygun slota **yerleşir** (çıkış bakır: bu bir karar) |
| RAVSKALD | soru araçlara iner, cevap **kanıtıyla** döner (kesikli çizgi)                |

**Klavye ile de göster:** sekmelerde ok tuşları çalışıyor. Otomatik dönen
carousel yok — sahne yalnızca kullanıcı isterse değişir.

---

## 2:00–2:20 — CyclOps

**Ekran:** `/urunler/cyclops/`

> "Olay yaşam döngüsü ürünümüz. Ekranlar gerçek; hassas alanlar maskelendi."

**Vurgu:** insan onayı ile otomasyon arasındaki sınır sayfada **görünür**.

---

## 2:20–2:40 — Hermes

**Ekran:** `/urunler/hermes/`

> "Ekiplerin müşteri ve proje bazında yaptığı işi kayıt altına alıyor,
> raporluyor ve faturalandırmaya bağlıyor."

**Dürüstlük notu — açıkça söyle:**

> "Burada ürün ekranı **yok**. Depoda yayımlanabilir güvenli ekran
> bulamadık, biz de sahte bir dashboard çizmek yerine iş akışını şema olarak
> gösterdik. Sayfa bunu zaten yazıyor."

---

## 2:40–3:05 — LogiSlot

**Ekran:** `/urunler/logislot/`

> "Fabrika ve depoların tedarikçi mal kabul randevularını yönetiyor. Tesisin
> kendi kurallarını değerlendirip yalnızca **gerçekten uygun** saatleri
> gösteriyor."

**Gerçek ekranları göster:** üç adımlı sihirbaz, müsaitlik dilimleri.

**Dürüstlük notu:** hesap adı gizlilik gereği maskelendi.

---

## 3:05–3:25 — RAVSKALD

**Ekran:** `/urunler/ravskald/`

> "İzleme verisine Türkçe soru sorup cevabın kanıtını görmeyi hedefliyor."

**Bunu mutlaka söyle:**

> "Ürün **geliştirme aşamasında**. Sayfa bunu gizlemiyor: bugün ne çalıştığı
> ve neyin henüz çalışmadığı ayrı ayrı yazıyor. Çalışmayan bir ürünü
> çalışıyormuş gibi göstermedik."

Bu, jüriye teknik dürüstlüğü göstermenin en güçlü anıdır — atlama.

---

## 3:25–3:45 — On yıllık yolculuk

**Ekran:** ana sayfa, 10. yıl bölümü.

> "On yıl, bir zaman rayı üzerinde. Son durak bakır — bugün durduğumuz yer."

**Vurgu:** burada **doğrulanmamış müşteri sayısı, başarı metriği veya
referans yok**. Yalnızca doğrulanmış kilometre taşları.

---

## 3:45–4:10 — TR/EN ve mobil

1. Sağ üstten **English**'e geç — aynı sayfanın karşılığına gidiyor.
2. Pencereyi daralt (veya mobil cihaz göster) — düzen tek sütuna iniyor,
   **yatay kaydırma yok**.

> "İki dil ve 320 piksele kadar test edilmiş durumda; üç tarayıcı motorunda
> da doğrulandı."

---

## 4:10–4:40 — Form ve izin: dürüst demo

**Ekran:** `/iletisim/`

1. Formu **doğru** doldur ve gönder.
2. Çıkan mesajı **oku**:

> "Bu sürümde form gönderimi henüz açık değil: mesajınız iletilmedi."

**Söylenecek:**

> "Teslim hedefi ve hukuk onayı gelmeden form gerçekten gönderim yapamıyor —
> ve bunu kullanıcıdan **gizlemiyoruz**. Sahte 'teşekkürler, aldık' ekranı
> göstermek en kolay şeydi; göstermedik."

3. Çerez panelini aç: **Kabul / Reddet / Özelleştir** eşit görünürlükte.

> "İzinden önce de sonra da hiçbir üçüncü taraf isteği yok. Ölçümleme
> sağlayıcısı şu an `none` — kanal hazır, açık değil."

---

## 4:40–5:00 — Kapanış

> "Site tamamen `noindex`; indeksleme kararını siz vermeden açmıyoruz.
> Üretimi bekleten yedi dış girdi raporda tek tek listeli. Yaptığımız her
> iddianın arkasında bir commit var — ürün anlatıları kaynak depolardan
> türetildi, elle yazılmadı."

---

## Soru gelirse — hazır cevaplar

**"Neden WebGL kullanmadınız?"**
İhtiyaç 3B veya shader değil, topolojisi değişen bir şema. SVG+CSS ile
karşılandı; ana sayfanın istemci JS'i **1,7 KB gzip**. Gerekçe ADR-014'te.

**"Ürün ekranları gerçek mi?"**
CyclOps ve LogiSlot'ta evet, maskelenmiş hâlde. Hermes ve RAVSKALD'da ekran
yok ve sayfa bunu söylüyor.

**"Müşterileriniz kimler?"**
Sitede müşteri adı, logosu veya sayısı **yok** — izni doğrulanmadan
yayımlamıyoruz.

**"Ne kadar hızlı?"**
Üçüncü taraf runtime isteği sıfır, ana sayfa istemci JS'i 1,7 KB gzip,
kaynak haritası yok. Ölçümler raporda.
