---
translationKey: signal-context-controlled-action
locale: tr
slug: zabbix-alarmindan-cyclops-olayina
status: published
title: "Zabbix alarmından CyclOps olayına: sinyal, bağlam ve kontrollü aksiyon"
excerpt: >-
  Bir alarm bir olay değildir. Aradaki fark, sinyalin üzerine ne kadar bağlam
  eklenebildiği ve aksiyonun ne kadar kontrollü verilebildiğiyle belirlenir.
series: cyclops-log
tags:
  - observability
  - aiops
  - alarm-yonetimi
  - olay-yonetimi
authorRef: duosis-muhendislik-ekibi
relatedSolutionRefs:
  - tr/operasyonel-gorunurluk
  - tr/aiops-ve-olay-yasam-dongusu
publishedAt: 2026-09-10
sources:
  - label: Zabbix — Triggers (resmî dokümantasyon)
    url: https://www.zabbix.com/documentation/current/en/manual/config/triggers
seo:
  title: "Zabbix alarmından CyclOps olayına"
  description: >-
    Alarm ile olay arasındaki fark, olayın nasıl zenginleştirildiği ve
    otomatik aksiyonun neden kontrollü verilmesi gerektiği.
  noindex: true
---

Nöbetteki mühendise gece yarısı gelen bildirim genellikle şudur: bir eşik
aşıldı. Bildirim doğrudur, zamanında gelmiştir ve teknik olarak beklendiği gibi
çalışmıştır. Buna rağmen mühendis ekranın başına geçtiğinde ilk yaptığı iş
sorunu çözmek değil, **sorunun ne olduğunu anlamaya çalışmaktır**. Aradaki
boşluk, izleme sistemlerinin en pahalı tarafıdır.

Bu yazı o boşluğu üç adımda ele alıyor: sinyalin nasıl üretildiği, üzerine
hangi bağlamın eklenebileceği ve aksiyonun neden kontrollü verilmesi
gerektiği.

## Alarm bir ölçümdür, olay bir yorumdur

Zabbix gibi bir izleme sisteminde alarmın kaynağı bir mantıksal ifadedir:
toplanan veriye bakan, sistemin o anki durumunu "sorunlu" ya da "normal"
olarak değerlendiren bir kural. Resmî dokümantasyonun tanımıyla trigger,
"item'lar tarafından toplanan veriyi değerlendiren mantıksal ifade"dir.

Bu tanım önemli, çünkü sınırı da beraberinde getiriyor. Bir eşik ifadesi
şunu söyleyebilir: bu diskin doluluk oranı %90'ı aştı. Söyleyemeyeceği şey
şudur: bu disk hangi servise ait, o servis şu anda müşteriye dokunuyor mu,
son yirmi dakikada bu sunucuya bir dağıtım yapıldı mı, aynı anda başka kaç
sistem benzer davranış gösteriyor.

Alarm bir **ölçümdür**. Olay ise o ölçümün, sistem hakkında bildiğimiz diğer
şeylerle birleştirilmiş **yorumudur**. Çoğu operasyonda bu yorumu üreten
katman yoktur; yorum, nöbetteki kişinin kafasında ve o kişinin deneyimi kadar
üretilir. Bu yüzden aynı alarm iki farklı mühendiste iki farklı sonuca varır.

## Gürültü bir hacim sorunu değil, bir bağlam sorunudur

Alarm gürültüsü genellikle "çok fazla bildirim geliyor" diye tarif edilir ve
çözüm olarak eşiklerin yükseltilmesi önerilir. Bu, sorunu yanlış yerden
tutmaktır. Eşiği yükseltmek gürültüyü azaltır ama aynı oranda **duyarlılığı
da** azaltır: gerçekten önemli olan bir sapma da artık bildirilmez.

Asıl mesele şudur: gelen bildirimlerin çoğu tek başına anlamlı değildir,
birlikte anlamlıdır. Bir veritabanı yavaşladığında ondan beslenen altı servis
de yavaşlar ve altısı da ayrı ayrı alarm üretir. Nöbetteki kişi altı bildirim
alır; oysa ortada tek bir olay vardır.

Bu ayrımı yapabilmek için sistemin şunları bilmesi gerekir:

- hangi bileşenin hangi bileşene bağlı olduğu,
- aynı zaman aralığında hangi sinyallerin birlikte geldiği,
- bu kombinasyonun daha önce görülüp görülmediği,
- o sırada altyapıda bir değişiklik yapılıp yapılmadığı.

Bunların hiçbiri eşik ifadesinin içine sığmaz. Hepsi izleme aracının
**dışında** duran bilgidir: envanter, bağımlılık haritası, değişiklik kaydı,
geçmiş olay arşivi.

## Zenginleştirme: olayın üzerine ne eklenir?

CyclOps'un bu akıştaki rolü, ham sinyali alıp üzerine bu bağlamı eklemek ve
tek bir olay kaydı üretmektir. Pratikte zenginleştirme şu katmanlardan oluşur:

**Kimlik.** Sinyalin hangi servise, hangi ortama ve hangi sahibe ait olduğu.
Bu katman olmadan bir uyarı "bir sunucuda bir şey oldu" seviyesinde kalır.

**İlişki.** Aynı anda gelen diğer sinyallerin bu sinyalle bağlantılı olup
olmadığı. Altı bildirim tek bir olaya bağlandığında, nöbetteki kişi altı
pencere yerine bir kayda bakar.

**Geçmiş.** Bu olayın daha önce görülüp görülmediği, görüldüyse nasıl
kapatıldığı. Tekrarlayan bir olayın çözüm notu, ilk müdahaleyi dakikalar
yerine saniyeler içinde başlatır.

**Değişiklik.** O zaman aralığında yapılan dağıtım veya konfigürasyon
değişikliği. Operasyonel arızaların önemli bir kısmı bir değişikliğin hemen
ardından gelir; bu bağı kurmak kök neden analizinin en kısa yoludur.

Kabaca söylemek gerekirse, ham sinyal ile zenginleştirilmiş olay arasındaki
fark şudur — aşağıdaki yapı örnekleme amaçlıdır, belirli bir ürünün veri
modeli değildir:

```
ham sinyal        : host=db-07  item=disk.used  value=91  ts=02:14
zenginleştirilmiş : servis      = odeme-api
                    ortam       = prod
                    sahip       = odeme-ekibi
                    ilişkili    = 5 diğer sinyal (aynı 3 dk)
                    son değişim = 01:58 dağıtım #4812
                    geçmiş      = 3 kez görüldü, son çözüm: kayıt #2291
```

<aside class="callout">
  <span class="callout__label">Not</span>
  Zenginleştirme yeni bilgi ÜRETMEZ; kurumda zaten var olan fakat ayrı
  sistemlerde duran bilgiyi sinyalin yanına getirir. Envanter eksikse veya
  değişiklik kayıtları tutulmuyorsa, bu katman da boş kalır.
</aside>

Zenginleştirmenin amacı bildirimi süslemek değil, **nöbetteki kişinin ilk beş
dakikada sorması gereken soruları önceden yanıtlamaktır**.

## Kontrollü aksiyon: otomasyonun sınırı nerede?

Olay yeterince iyi tanımlandığında bir sonraki soru gelir: bunu otomatik
kapatabilir miyiz? Cevap çoğu zaman "kısmen" olmalıdır ve bu bir eksiklik
değil, bilinçli bir tasarım kararıdır.

Otomatik aksiyonu güvenli kılan dört şey vardır:

1. **Kapsam sınırı.** Aksiyonun neye dokunabileceği önceden tanımlıdır. Bir
   servisi yeniden başlatabilir, ama bir veritabanını yeniden
   başlatamaz.
2. **Ön koşul.** Aksiyon yalnızca belirli bir olay imzası için tetiklenir;
   "benzer" görünen bir olay için tetiklenmez.
3. **Geri alınabilirlik.** Yapılan işlemin nasıl geri alınacağı, işlemin
   kendisiyle birlikte tanımlanmıştır.
4. **İz.** Ne yapıldığı, ne zaman ve hangi gerekçeyle yapıldığı kayıtta
   durur; otomatik bir müdahale de en az elle yapılan kadar izlenebilirdir.

Bu dördü sağlanmadığında otomasyon operasyonu hızlandırmaz, yalnızca hata
yapma hızını artırır. Yanlış tanımlanmış bir olaya bağlanan otomatik bir
aksiyon, gece yarısı sessizce yanlış sunucuyu yeniden başlatır ve bunu kimse
sabaha kadar fark etmez.

<aside class="callout callout--warning">
  <span class="callout__label">Uyarı</span>
  Otomatik aksiyonu, olay tanımı olgunlaşmadan devreye almayın. Yanlış
  tanımlanmış bir olaya bağlanan aksiyon, hatayı düzeltmez — yalnızca daha
  hızlı yapar.
</aside>

Pratikte olgunlaşma sırası genellikle şudur: önce **öneri** (sistem ne
yapılabileceğini söyler, insan onaylar), sonra **onaylı aksiyon** (insan tek
tuşla tetikler), en sonunda **otomatik aksiyon** (yalnızca defalarca aynı
sonucu vermiş, dar kapsamlı işlemler için). Bu sırayı atlamak, kazanılmamış
bir güveni sisteme peşinen vermek demektir.

## Olayın yaşam döngüsü: açılıştan kapanışa

Zenginleştirme ve aksiyon, olayın yalnızca ilk anıyla ilgilidir. Bir olay
açıldıktan sonra da yaşamaya devam eder ve bu sürecin nasıl yönetildiği, bir
sonraki olayın ne kadar hızlı çözüleceğini belirler.

Sağlıklı bir olay yaşam döngüsünde şu geçişler tanımlıdır:

**Açılış.** Sinyal geldi, bağlam eklendi, olay bir sahibe atandı. Sahipsiz
olay, herkesin baktığı ve kimsenin çözmediği olaydır.

**Tanı.** Olayın gerçek kapsamı netleşir. Bu aşamada olay birleşebilir ya da
ayrılabilir: başlangıçta tek sanılan sorun aslında ikiyse, ikiye ayrılmalıdır.
Tersi de geçerlidir — ayrı açılmış üç kaydın aynı köke bağlandığı anlaşılırsa
birleştirilmelidir.

**Müdahale.** Yapılan her işlem kayda yazılır. Burada sık yapılan hata, geçici
çözümün kalıcıymış gibi kapatılmasıdır: servis yeniden başlatıldı, belirti
gitti, kayıt kapandı. Kök neden hâlâ oradadır ve aynı olay bir hafta sonra
yeniden açılır.

**Kapanış.** Kapanış notu bir sonraki olayın girdisidir. "Çözüldü" yazan bir
kapanış notu hiçbir işe yaramaz; "X servisinin bağlantı havuzu Y nedeniyle
doldu, geçici olarak yeniden başlatıldı, kalıcı düzeltme Z kaydında" yazan bir
not, bir sonraki nöbetçinin işini yarıya indirir.

**Gözden geçirme.** Tekrar eden olaylar dönemsel olarak toplu hâlde
incelenir. Bu aşama atlandığında operasyon çalışır ama iyileşmez.

## Neyi ölçmek anlamlı?

Bu zincirin işleyip işlemediğini anlamak için bakılabilecek göstergeler var.
Hiçbiri tek başına yeterli değildir; birlikte okunmaları gerekir.

- **Sinyal/olay oranı.** Gelen ham bildirim sayısının açılan olay sayısına
  oranı. Bu oran yükseldikçe ilişkilendirme çalışıyor demektir.
- **Tekrar açılma oranı.** Kapatılıp yeniden açılan kayıtların payı. Yüksek
  bir oran, kök nedene değil belirtiye müdahale edildiğini gösterir.
- **Sahipsiz kalma süresi.** Olayın açılmasıyla bir sahibe atanması arasındaki
  süre. Bu süre uzunsa sorun teknik değil, süreç ve sorumluluk tanımıdır.
- **Otomatik aksiyon geri alma oranı.** Otomatik yapılan işlemlerin kaçının
  geri alındığı. Sıfırdan farklı bir oran, aksiyon ön koşullarının fazla geniş
  tanımlandığını söyler.

Bu göstergelerin ortak özelliği, hepsinin **kendi ortamınızda** ölçülmesi
gerektiğidir. Başka bir kurumun oranı sizin için bir hedef değildir; yalnızca
kendi başlangıç değerinizle karşılaştırılabilir.

## Bu zincir neyi değiştirir?

Sinyal → bağlam → kontrollü aksiyon zinciri kurulduğunda değişen şey, alarm
sayısı değildir. Değişen şey, nöbetteki kişinin **ne yaptığıdır**: bilgi
toplamakla geçen ilk dakikalar ortadan kalkar ve iş, doğrudan kararla başlar.

Bunun ölçülebilir tarafı vardır — ilk müdahaleye kadar geçen süre, bir olaya
bakan kişi sayısı, tekrar açılan kayıt oranı. Fakat bu sayılar her kurumda
farklıdır ve başkasının ortamından devşirilemez. Bu yüzden burada bir oran
vermiyoruz: kendi başlangıç değerinizi ölçmeden, iyileşmeyi de ölçemezsiniz.

Başlangıç noktası genellikle şu sorudur: son otuz günde açılan olayların kaçı
gerçekten ayrı bir olaydı? Bu sorunun cevabı, zincirin hangi halkasından
başlanması gerektiğini de söyler.
