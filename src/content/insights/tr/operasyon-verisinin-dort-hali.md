---
translationKey: four-shapes-of-operational-data
locale: tr
slug: operasyon-verisinin-dort-hali
status: published
title: Operasyon verisinin dört hâli
excerpt: >-
  Metrik, log, event ve trace aynı olayın dört farklı görüntüsüdür. Bunları ayrı
  araçlarda tutmak, kök nedeni aramayı bir arşiv çalışmasına çevirir.
series: architecture-notes
tags:
  - observability
  - operations
  - apm
authorRef: duosis-muhendislik-ekibi
relatedSolutionRefs:
  - tr/operasyonel-gorunurluk
publishedAt: 2026-09-09
seo:
  title: Operasyon verisinin dört hâli
  description: >-
    Metrik, log, event ve trace neden tek bir operasyon görünümünde birleşmeli?
  noindex: true
---

Bir servis yavaşladığında sorulan soru hep aynıdır: nerede başladı? Bu sorunun
cevabı çoğu kurumda tek bir yerde durmaz. Dört ayrı veri türüne, çoğu zaman
dört ayrı ekranda bakılır.

## Dördü de aynı olayı anlatır

- **Metrik** olayın büyüklüğünü söyler: gecikme arttı, kuyruk büyüdü.
- **Log** olayın metnini verir: hangi istek, hangi hata.
- **Event** olayın sistemdeki karşılığıdır: bir servis yeniden başladı, bir
  konfigürasyon değişti.
- **Trace** olayın yolunu gösterir: istek hangi servislerden geçti, nerede
  bekledi.

Tek başına hiçbiri yeterli değildir. Metrik bir şeyin bozulduğunu söyler ama
nedenini söylemez. Log nedeni taşır ama hangi isteğin etkilendiğini bilmez.
Trace yolu bilir ama o sırada altyapıda ne olduğunu görmez.

## Ayrı araç, ayrı zaman ekseni

Bu dört veriyi farklı sistemlerde tutmanın asıl maliyeti depolama değil,
**zaman eksenlerinin birbirine oturmamasıdır**. Bir olayı incelerken saat
farkı, farklı örnekleme aralıkları ve farklı etiket şemaları arasında elle
köprü kurmak gerekir. Kök neden analizi böylece bir mühendislik işinden
arşiv çalışmasına döner.

## Ortak bağlam ne demek?

Bu verileri birleştirmek onları aynı ekrana koymak değildir. Birleştirmek,
hepsinin **aynı kimlikleri** taşıması demektir: aynı servis adı, aynı ortam,
aynı istek kimliği, aynı dağıtım sürümü. Ortak bağlam kurulduğunda bir metrik
sıçramasından ilgili trace'e ve oradan o sıradaki konfigürasyon değişikliğine
tek adımda gidilebilir.

Uygulama performansı da bu bağlamın dışında değildir. APM'yi ayrı bir disiplin
gibi kurgulamak, uygulamayı üzerinde çalıştığı altyapıdan kopararak incelemek
anlamına gelir; sorunun iki tarafta da olabileceği durumlarda bu ayrım
yardımcı olmaz.

## Sonraki adım

Bu ortak bağlam kurulduğunda alarm gürültüsünü anlamlı olaya indirgemek ve
olayı bir aksiyona bağlamak mümkün hâle gelir. Bu, ayrı bir araç meselesi
değil, veri modelinin nasıl kurulduğuyla ilgili bir karardır.
