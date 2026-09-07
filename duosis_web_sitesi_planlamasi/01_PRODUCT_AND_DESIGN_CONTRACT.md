# Ürün ve Tasarım Sözleşmesi

## 1. İletişim görevi

Ziyaretçi ilk 5 saniyede şunları anlamalıdır:

1. Duosis neyi çözüyor?
2. Neden güvenilir?
3. Diğer entegratörlerden farkı ne?
4. Hangi adımı atması bekleniyor?

Hedef algı:

> Duosis; gözlemlenebilirlik, veri, mimari ve otomasyonu AI destekli operasyon yaklaşımında birleştiren, sahada deneyimli ve kendi ürününü geliştiren bir mühendislik şirketidir.

## 2. Hedef kitleler

Öncelik sırası:

1. CIO, CTO, BT Direktörü ve Operasyon Direktörü.
2. ITOM, ITSM, altyapı, SRE, veri ve kurumsal mimari ekipleri.
3. Satın alma ve dönüşüm programı karar vericileri.
4. İş ortakları ve teknoloji üreticileri.
5. Aday çalışanlar ve teknik topluluk.

Her ana sayfa bölümü en az bir hedef kitlenin somut sorusunu yanıtlamalıdır.

## 3. Marka sesi

- Kurumsal, sade, teknik güven veren.
- İddialı ama gösterişli olmayan.
- Jargon kullandığında hemen iş sonucuna bağlayan.
- “Dijital dönüşüm yolculuğunuzda yanınızdayız” gibi ayırt edici olmayan kalıplardan kaçınan.
- Birinci çoğul şahıs kullanılabilir; sonuç cümlesi müşteriye dönmelidir.
- Türkçe ve İngilizce metinler ayrı ayrı doğal yazılacak; kelime kelime çeviri yapılmayacak.

## 4. Ana anlatı

Ana sayfa anlatı sırası:

1. **Vaat:** Operasyonu görün, veriyi bağlayın, AI ile harekete geçin.
2. **Kanıt:** 10 yıl, ekip, sektör ve proje deneyimi — yalnızca onaylı rakamlarla.
3. **Kapsam:** Sekiz çözüm alanı, teknoloji adından önce iş sonucu.
4. **Fark:** CyclOps ve Signal-to-Action yaklaşımı.
5. **Yöntem:** Analiz → Tasarım → Uygulama → Operasyon/Destek.
6. **Güven:** Referans/vaka, bölgeler ve teknoloji ekosistemi.
7. **Bilgi:** Güncel İçgörüler içerikleri.
8. **Dönüşüm:** Birlikte yol haritası çıkaralım.

## 5. Command Atlas görsel dili

### Karakter

- Klasik, keskin, premium, sakin.
- “Operasyon merkezi” hissi; oyun arayüzü veya cyberpunk estetiği değil.
- Açık ve koyu yüzeyler bölüm hikâyesine göre dönüşebilir.
- Bir sayfada tek baskın kompozisyon; art arda kart gridleri kullanılmaz.

### Geometri

- Radius çoğunlukla `0–6px`; yalnızca işlevsel kontrollerde sınırlı artış.
- İnce çizgiler, görünür kolon sistemi ve düzenli boşluk ritmi.
- Pill/badge yalnızca gerçek durum veya kategori bilgisi taşıyorsa.
- Büyük yumuşak gölgeler yerine border, kontrast ve katman kullanımı.

### Renk

Kesin değerler S00 marka varlıklarından ölçülüp S03'te onaylanacaktır.

- Ink: ana koyu yüzey ve başlık rengi.
- Paper: kırık beyaz içerik yüzeyi.
- Signal Cyan: Duosis bağlantısı, link, odak ve sinyal durumu.
- Action Orange: CTA ve aksiyon vurgusu; düşük sıklıkta.
- Success/Warning/Critical: yalnızca operasyon semantiğinde.

Renk tek başına anlam taşımayacak; metin, ikon veya şekil ile desteklenecektir.

### Tipografi

- Büyük, net, kısa ve iddia taşıyan başlıklar.
- Neo-grotesk değişken ana font + sınırlı monospace sistem etiketi.
- En fazla iki font ailesi.
- Hero başlığı küçük ekranda bile 3–5 satırı aşmamalı.
- Gövde satır uzunluğu yaklaşık 55–75 karakter.

### Görsel varlıklar

Öncelik:

1. Gerçek CyclOps/ürün ekranları.
2. Duosis'e özel şematik operasyon illüstrasyonları.
3. Doğrulanmış müşteri sonuçlarını anlatan veri görselleri.
4. Gerçek ekip/ofis/proje fotoğrafları.
5. Stok görsel yalnızca gerekli ve ayırt edici ise.

Üçüncü taraf sitelerden tasarım, metin, görsel veya animasyon birebir kopyalanmayacaktır.

## 6. Hareket sözleşmesi

- Motion bir durumu veya ilişkiyi açıklamalı; dekoratif sürekli hareket sınırlı olmalı.
- Scrolljacking yok.
- Kritik bilgi yalnızca hover/animasyon ile verilmez.
- Mikro etkileşimler çoğunlukla `160–360ms`.
- Uzun anlatı animasyonları kullanıcı scroll'una bağlı ve durdurulabilir olmalı.
- `prefers-reduced-motion: reduce` altında hareket kaldırılır veya anlam kaybetmeyen basit opacity değişimine iner.
- Mobilde ağır canvas/WebGL zorunlu değil; SVG/statik fallback kabul edilir.

## 7. AI deneyimi

AI üç seviyede anlatılır:

1. **Algıla:** metrik, log, event, trace ve mimari bağlam.
2. **Anla:** korelasyon, özetleme, anomali, etki ve kök neden.
3. **Harekete geç:** öneri, onaylı otomasyon, orkestrasyon ve takip.

Hackathon prototipinde ücretli LLM API zorunlu değildir. İnteraktif örnekler deterministik ve içerik tabanlı olabilir. Gerçek LLM kullanılmıyorsa kullanıcıya canlı AI analiziymiş gibi sunulmayacaktır.

## 8. Blog / İçgörüler yayın modeli

- Haftalık: 400–800 kelimelik teknik not, operasyon ipucu veya kısa değerlendirme.
- Aylık: 1.200–2.000 kelimelik derinlemesine rehber/vaka.
- Seriler: Observability Radar, Data & AI, Mimari Notları, Otomasyon Rehberleri, CyclOps Günlüğü, Bölgesel Teknoloji.
- Her yazı ilgili çözümlere ve tek bir mantıklı CTA'ya bağlanır.
- Yazar, yayın/güncelleme tarihi, okuma süresi ve kaynaklar görünür olur.

## 9. Kaçınılacak tasarım kalıpları

- Her bölümde bento grid.
- Mor/mavi gradient küreler ve anlamsız parçacık animasyonları.
- Sahte terminal metinleri.
- Okunamayacak kadar düşük kontrastlı gri metin.
- Aynı seviyede onlarca partner logosu.
- Otomatik kayan ve kontrol edilemeyen müşteri logo şeritleri.
- İçeriği geciktiren tam ekran intro.
- Sayfa boyunca chat balonu ve AI etiketi tekrarı.
- Gerçek olmayan KPI, dashboard veya müşteri sonucu.

