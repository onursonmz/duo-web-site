---
translationKey: from-inventory-to-decision-system
locale: tr
slug: envanterden-karar-sistemine-kurumsal-mimari
status: published
title: Kurumsal mimariyi envanterden karar sistemine taşımak
excerpt: >-
  Çoğu kurumsal mimari çalışması eksiksiz bir envanterle biter ve orada durur.
  Envanterin karar üretebilmesi için eklenmesi gereken şey daha fazla kayıt
  değil, ilişki ve soru.
series: architecture-notes
tags:
  - enterprise-architecture
  - governance
  - inventory
  - decision-management
authorRef: duosis-muhendislik-ekibi
relatedSolutionRefs:
  - tr/kurumsal-mimari-ve-yonetisim
  - tr/konfigurasyon-ve-varlik-yonetimi
publishedAt: 2026-09-10
seo:
  title: Kurumsal mimariyi envanterden karar sistemine taşımak
  description: >-
    Envanterin neden tek başına karar üretmediği, ilişki modelinin rolü ve
    mimari çalışmasının hangi sorulara cevap vermesi gerektiği.
  noindex: true
---

Kurumsal mimari çalışmaları çoğu zaman aynı yerde başlar ve aynı yerde biter:
envanterde. Aylar süren bir çalışmanın sonunda uygulamalar, sunucular,
arayüzler ve veri kümeleri eksiksiz biçimde listelenir. Liste doğrudur,
kapsamlıdır ve genellikle etkileyicidir. Altı ay sonra ise ya güncelliğini
yitirmiştir ya da hâlâ günceldir ama kimse ona bakarak bir karar vermemiştir.

Sorun envanterin kalitesinde değil. Sorun, envanterin **soru sorulabilir**
hâle getirilmemiş olmasındadır.

## Liste ile model arasındaki fark

Bir liste, nesneleri sayar. Bir model, nesneler arasındaki ilişkileri taşır.
Aradaki fark, sorulabilecek soruların türünü tamamen değiştirir.

Liste şunları yanıtlar: kaç uygulamamız var, hangileri hangi teknolojide
yazılmış, hangi sunucu hangi veri merkezinde.

Model ise şunları yanıtlayabilir:

- Bu uygulamayı emekliye ayırırsam hangi süreçler etkilenir?
- Şu veri merkezini kapatırsam hangi iş kabiliyetleri kesintiye uğrar?
- Bu ürünün desteği bittiğinde kaç entegrasyonu yeniden yazmam gerekir?
- Bu iş kabiliyetini iki sistem birden mi karşılıyor?

İkinci gruptaki sorular yatırım kararlarıdır. Birinci gruptakiler ise rapor
malzemesidir. Kurumsal mimari çalışmasının değeri, hangi gruba cevap
verebildiğiyle ölçülür.

## Envanteri modele çeviren dört bağ

Bir envanteri karar üretebilir hâle getirmek için eklenmesi gereken şey daha
fazla nesne değil, nesneler arasındaki dört tür bağdır.

**İş kabiliyetine bağ.** Her teknik bileşen, en az bir iş kabiliyetine
bağlanmalıdır. "Bu sunucu ne işe yarıyor?" sorusunun cevabı "üzerinde X
uygulaması çalışıyor" değil, "sipariş karşılama sürecini destekliyor"
olmalıdır. Bu bağ kurulmadan hiçbir teknik karar iş diline çevrilemez.

**Bağımlılık bağı.** Hangi bileşen hangisine bağlı. Bu bağ yönlüdür ve yön
önemlidir: A'nın B'ye bağlı olması ile B'nin A'ya bağlı olması farklı
sonuçlar doğurur.

**Yaşam döngüsü bağı.** Her bileşenin bir durumu vardır: değerlendiriliyor,
üretimde, emekliye ayrılıyor, kaldırıldı. Durum bilgisi olmayan bir envanter
"neyi değiştirebiliriz" sorusunu yanıtlayamaz.

**Sahiplik bağı.** Bir bileşen hakkında kimin karar verdiği. Sahibi olmayan
bileşen, karar anında sahipsiz kalır ve karar ertelenir.

Bu dört bağ kurulduğunda envanter bir grafiğe döner ve grafiğin üzerinde
gezinilebilir: bir düğümden başlayıp etkilenen her şeyi görebilirsiniz.

## Modelin güncel kalması bir süreç sorunudur

Burada en sık yapılan hata, güncelliği bir araç özelliği sanmaktır. Otomatik
keşif teknik katmanı büyük ölçüde güncel tutabilir — hangi sunucunun ayakta
olduğunu, hangi servisin hangi portu dinlediğini bir araç bulabilir.

Fakat yukarıdaki dört bağın üçü otomatik keşifle bulunamaz. Bir bileşenin
hangi iş kabiliyetini desteklediği, yaşam döngüsünün neresinde olduğu ve
kimin sahibi olduğu **insan kararıdır**. Bu kararlar bir yere yazılmazsa
model, teknik olarak güncel ama anlamsal olarak boş kalır.

Bu yüzden model güncelliği bir süreç tasarımı meselesidir:

- Yeni bir bileşen üretime alınırken sahibi ve iş bağı zorunlu alan olmalıdır.
- Bir değişiklik kaydı kapanırken modeldeki karşılığı da güncellenmelidir.
- Modelde karşılığı olmayan bir bileşen, keşifte bulunduğunda bir soru
  üretmelidir — sessizce eklenmemelidir.

Üçüncüsü özellikle önemli. Model "her şeyi kabul eden" bir depo hâline
gelirse, içindeki bilginin doğruluğu hakkında hiçbir şey söylenemez.

## Araç nerede duruyor?

Ardoq gibi kurumsal mimari araçları bu grafiği tutmak ve üzerinde analiz
yapmak için tasarlanmıştır. Fakat aracın hangi özellikleri sunduğu ile
kurumun hangi soruları sorması gerektiği iki ayrı meseledir ve sıralama
önemlidir.

Ürün seçimiyle başlayan çalışmalarda tipik sonuç şudur: araç kurulur,
envanter içine aktarılır, birkaç görselleştirme üretilir ve çalışma orada
durur. Model kurulmuştur ama hiçbir karar ona bağlı değildir; dolayısıyla
kimse güncel tutmaz.

Soruyla başlayan çalışmalarda sıra tersidir: önce hangi kararların
destekleneceği belirlenir ("üç yıllık uygulama rasyonalizasyonu",
"veri merkezi konsolidasyonu", "destek sonu risk envanteri"), sonra o
kararların hangi bağlara ihtiyaç duyduğu çıkarılır, en sonunda bu bağları
taşıyabilecek araç seçilir.

Bu sıralama araç seçimini önemsizleştirmez — yalnızca doğru yere koyar.

## Modelin ölçeği: ne kadar ayrıntı yeterli?

"Modelde ne kadar derine inmeliyiz?" sorusu her kurumsal mimari çalışmasında
çıkar ve genellikle yanlış yanıtlanır. Varsayılan cevap "mümkün olduğunca
ayrıntılı" olur; oysa ayrıntı, güncel tutma maliyetiyle doğru orantılıdır.

İşe yarayan ölçüt şudur: **bir ayrıntı, ancak bir kararı değiştiriyorsa
modele girer.**

Bir uygulamanın hangi iş kabiliyetini desteklediği bir kararı değiştirir —
o kabiliyeti kapatma kararını. Aynı uygulamanın hangi sürüm numarasında
olduğu genellikle değiştirmez; destek sonu tarihi ise değiştirir. Yani sürüm
numarası değil, **destek sonu tarihi** modele girer.

Aynı ölçüt teknik derinlik için de geçerlidir. Sunucu düzeyinde modelleme
çoğu mimari kararı için gereksizdir; servis düzeyi yeterlidir. Fakat veri
merkezi konsolidasyonu bir karar olarak masadaysa, fiziksel yerleşim aniden
anlamlı hâle gelir.

Bu yüzden modelin ölçeği sabit değildir: gündemdeki karara göre bir katman
derinleşir, başka bir katman sadeleşir. Sabit ve eksiksiz bir model hedefi,
tamamlanamayan tek hedeftir.

## Yaygın üç hata

**Modeli tek bir ekibin ürünü sanmak.** Mimari ekibi modeli kurar ama
besleyemez; besleyecek bilgi operasyon, geliştirme ve iş birimlerindedir.
Model tek bir ekibin sorumluluğunda kalırsa, o ekibin kapasitesi kadar güncel
olur.

**Görselleştirmeyi çıktı sanmak.** Etkileyici bir diyagram bir karar değildir.
Diyagram, modelin bir görünümüdür; değer modelin sorgulanabilirliğinde durur.
Bir çalışmanın çıktısı "şu diyagramlar" ise, muhtemelen soruyla değil araçla
başlanmıştır.

**İstisnaları modelin dışında bırakmak.** Kurumların çoğunda birkaç sistem
"özel" kabul edilir ve modele alınmaz: çok eski olduğu için, çok kritik olduğu
için ya da sahibi belirsiz olduğu için. Bu sistemler tam olarak karar anında
sorun çıkaran sistemlerdir. Modelin dışında bırakılan şey, kararın da dışında
kalmaz — yalnızca görünmez olur.

## Başlangıç için üç soru

Bir kurumsal mimari çalışmasının karar sistemine dönüşüp dönüşmeyeceği,
genellikle ilk üç sorunun cevabından bellidir:

1. **Önümüzdeki on iki ayda hangi kararları bu modele dayanarak vereceğiz?**
   Cevap yoksa çalışma bir envanter projesidir, mimari çalışması değil.
2. **Bu kararlar için hangi bağlar gerekli?** Gerekmeyen bağı modellemek,
   güncel tutulması gereken bir yük eklemekten başka bir şey değildir.
3. **Bu bağları kim, hangi anda güncelleyecek?** Cevap "mimari ekibi, yılda
   bir" ise model ikinci yılda güvenilirliğini yitirir.

Bu üç sorunun cevabı netleştiğinde çalışmanın kapsamı da kendiliğinden
daralır — ve daralmış bir kapsam, tamamlanabilen tek kapsamdır.
