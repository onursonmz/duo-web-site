---
translationKey: observability-apm
locale: tr
slug: operasyonel-gorunurluk
status: published
order: 1
category: core
featured: true
eyebrow: Observability & APM
title: Operasyonel görünürlük ve uygulama performansı
summary: >-
  Altyapı, ağ, uygulama ve log verisini tek bir operasyon görünümünde birleştirir.
problem: >-
  Bir servis yavaşladığında ekipler farklı araçlara bakar. Metrik bir yerde, log
  başka yerde, uygulama izleri üçüncü bir ekrandadır. Sorunun nerede başladığını
  bulmak, veri toplamaktan çok arşiv çalışmasına dönüşür.
approach: >-
  Metrik, log, event ve trace verisini ortak kimlikler altında birleştiririz:
  aynı servis, aynı ortam, aynı istek. Uygulama performansını altyapı bağlamından
  ayırmayız; APM bu görünümün bir parçasıdır, ayrı bir disiplin değildir.
benefits:
  - Sorunlar kullanıcıya yansımadan önce görülebilir hâle gelir
  - Kök neden analizi tek bir bağlam üzerinden yürütülür
  - Ekipler arası eskalasyon ve "bende çalışıyor" tartışması azalır
  - Kapasite ve performans kararları ölçüme dayanır
capabilities:
  - Altyapı, sanallaştırma ve ağ izleme
  - Uygulama performans izleme ve dağıtık izleme (tracing)
  - Log ve event toplama, normalleştirme
  - Servis bazlı dashboard ve alarm kurgusu
  - Ortak etiket ve kimlik modelinin tasarımı
  - Alarm eşiği ve gürültü yönetimi
aiRole:
  detect: >-
    Metrik, log, event ve trace akışlarını tek bir operasyon görünümünde toplar;
    normal davranış örüntüsünü öğrenir.
  understand: >-
    Eşzamanlı sapmaları ilişkilendirir, tekrar eden alarmları tek bir olaya
    indirger ve etkilenen servisleri çıkarır.
  act: >-
    Olayı ilgili ekibe ve öneriye bağlar; onaylı otomasyon adımlarını tetikler ve
    yapılan işi izlenebilir bırakır.
scenario:
  title: Yavaşlayan bir ödeme servisi
  context: >-
    Ödeme servisinde yanıt süresi artıyor. Altyapı tarafında bir alarm yok;
    uygulama ekibi ise altyapıdan şüpheleniyor.
  flow:
    - Servis bazlı dashboard yanıt süresindeki artışı ve hangi uçtan geldiğini gösterir.
    - Aynı zaman aralığındaki trace'ler isteğin hangi çağrıda beklediğini ortaya çıkarır.
    - Bekleyen çağrının bağlı olduğu veritabanı bağlantı havuzu metrikleri incelenir.
    - Aynı pencerede yapılan konfigürasyon değişikliği event akışında görünür.
  result: >-
    Sorun, farklı ekiplerin ayrı ayrı araştırması yerine tek bir bağlam üzerinden
    ilerletilir; hangi değişikliğin etkilediği kayıt altına alınır.
technologyRefs:
  - datadog
  - zabbix
  - instana
  - opentelemetry
  - foglight
proofRefs: []
cta:
  labelKey: cta.contactUs
  href: /iletisim/
seo:
  title: Operasyonel görünürlük ve uygulama performansı
  description: >-
    Metrik, log, event ve trace verisini ortak bağlamda birleştirerek sorunun
    nerede başladığını görünür kılıyoruz.
  noindex: true
---

Görünürlük bir ürün kurulumu değildir. Hangi verinin toplandığından çok, o
verinin **ortak bir kimlik altında** birleşip birleşmediği belirleyicidir. Aynı
servisin adı üç sistemde üç farklı yazılıyorsa, elde dört ayrı arşiv olur.

Çalışmaya genellikle mevcut araçların envanteri ve etiket modelinin
çıkarılmasıyla başlarız. Hedef, yeni bir ekran eklemek değil; var olan
sinyalleri tek bir operasyon bağlamına oturtmaktır.
