---
translationKey: data-streaming-integration
locale: tr
slug: veri-akisi-ve-entegrasyon
status: published
order: 4
category: core
featured: true
eyebrow: Data Streaming & Integration
title: Veri akışı ve entegrasyon
summary: >-
  Veriyi üretildiği anda işleyip doğru sistemlere taşır.
problem: >-
  Veri sistemler arasında toplu işlerle ve gecikmeli aktarılır. Kararlar
  güncelliğini yitirmiş bir kopya üzerinden alınır; her yeni entegrasyon
  ihtiyacı, mevcut bağlantıların üzerine bir tane daha eklemek anlamına gelir.
approach: >-
  Noktadan noktaya bağlantılar yerine olay tabanlı bir akış omurgası kurarız.
  Veri bir kez yayımlanır, birden fazla tüketici aynı akıştan beslenir; şema ve
  sürüm yönetimi baştan tanımlanır.
benefits:
  - Veri gecikmesi toplu iş penceresine bağlı olmaktan çıkar
  - Sistemler arası bağımlılık noktadan noktaya olmaktan çıkar
  - Analitik ve operasyon aynı veriyi aynı anda kullanır
  - Yeni tüketici eklemek mevcut entegrasyonları değiştirmez
capabilities:
  - Olay tabanlı akış mimarisi tasarımı
  - Şema yönetimi ve sürüm uyumluluğu
  - Veri dönüşümü ve zenginleştirme akışları
  - Toplu işten akışa geçiş planlaması
  - Akış izleme, gecikme ve yeniden işleme yönetimi
  - Analitik ve arama katmanına bağlama
aiRole:
  detect: >-
    Akış gecikmesini, tüketici birikimini ve şema uyumsuzluklarını sürekli izler.
  understand: >-
    Birikmenin kaynağını üretici, ağ ve tüketici tarafı arasında ayrıştırır;
    etkilenen alt akışları çıkarır.
  act: >-
    Yeniden işleme, ölçekleme veya yönlendirme adımlarını öneri ve onaylı
    otomasyon olarak sunar.
scenario:
  title: Toplu işten akışa geçiş
  context: >-
    Gece çalışan bir toplu iş, gün içindeki kararları geciktiriyor. Aynı veriye
    üç farklı sistem ihtiyaç duyuyor ve her biri ayrı bir bağlantıyla besleniyor.
  flow:
    - Kaynak sistemdeki değişiklikler olay olarak yayımlanır.
    - Şema kayıt altına alınır; tüketiciler sürüm uyumluluğuna göre bağlanır.
    - Dönüşüm ve zenginleştirme akış içinde yapılır, kopya iş kalmaz.
    - Üç tüketici aynı akıştan bağımsız olarak beslenir.
  result: >-
    Yeni bir tüketici eklemek mevcut bağlantıları değiştirmeyi gerektirmez; veri
    üretildiği anda kullanılabilir hâle gelir.
technologyRefs:
  - confluent
  - nifi
  - airflow
  - elastic
proofRefs: []
cta:
  labelKey: cta.contactUs
  href: /iletisim/
seo:
  title: Veri akışı ve entegrasyon
  description: >-
    Noktadan noktaya bağlantılar yerine olay tabanlı bir akış omurgası kurarak
    veriyi üretildiği anda kullanılabilir hâle getiriyoruz.
  noindex: true
---

Entegrasyon çalışmalarında en pahalı karar genellikle teknoloji seçimi değil,
**verinin sahibinin kim olduğu** sorusunun cevapsız bırakılmasıdır. Bir olayın
hangi sistemde üretildiği ve hangi şemayla yayımlandığı netleşmeden kurulan
akışlar, kısa sürede yeni bir bağımlılık katmanına dönüşür.

Bu yüzden mimari tasarımına şema ve sahiplik tanımıyla başlarız. Akışın kendisi
teknik olarak kurulduktan sonra, asıl kalıcı olan bu tanımlardır.
