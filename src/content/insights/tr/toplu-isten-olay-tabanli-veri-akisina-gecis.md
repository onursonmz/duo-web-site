---
translationKey: batch-to-event-driven-data-flow
locale: tr
slug: toplu-isten-olay-tabanli-veri-akisina-gecis
status: published
title: Toplu işten olay tabanlı veri akışına geçiş
excerpt: >-
  Gecelik toplu iş bir mimari tercih değil, çoğu kurumda bir alışkanlıktır.
  Olay tabanlı akışa geçmek araç değiştirmekle değil, veriye bakış açısını
  değiştirmekle başlar.
series: data-and-ai
tags:
  - veri-akisi
  - entegrasyon
  - streaming
  - mimari
authorRef: duosis-muhendislik-ekibi
relatedSolutionRefs:
  - tr/veri-akisi-ve-entegrasyon
publishedAt: 2026-09-10
sources:
  - label: Apache Kafka — resmî dokümantasyon
    url: https://kafka.apache.org/documentation/
  - label: Apache Airflow — DAG kavramları (resmî dokümantasyon)
    url: https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html
seo:
  title: Toplu işten olay tabanlı veri akışına geçiş
  description: >-
    Gecelik toplu işlerin gerçek maliyeti, olay tabanlı akışın ne zaman doğru
    cevap olduğu ve geçişin uygulama sınırları.
  noindex: true
---

Çoğu kurumun veri mimarisinin merkezinde tek bir cümle vardır: "gece 02:00'de
çalışıyor." Raporlar sabah hazırdır, entegrasyonlar gece tamamlanır, veri
ambarı güne dolu başlar. Bu düzen yıllarca çalışır ve genellikle kimse
sorgulamaz — ta ki bir iş biriminin sorusu "dün ne oldu?" olmaktan çıkıp "şu
anda ne oluyor?" hâline gelene kadar.

Bu yazı, o geçişin ne zaman gerektiğini ve nereden başlaması gerektiğini ele
alıyor. Baştan söylemek gerekir: **her toplu işin akışa çevrilmesi gerekmez.**
Asıl mesele hangi verinin ne zaman değerli olduğudur.

## Gecelik işin görünmeyen maliyeti

Toplu işin maliyeti çoğunlukla çalışma süresiyle ölçülür. Oysa gerçek maliyet
başka üç yerde birikir.

**Tazelik.** Gecelik bir işte verinin ortalama yaşı on iki saattir. Bu, stok
raporu için sorun değildir; dolandırıcılık tespiti veya kapasite alarmı için
kullanılamaz demektir. Tazelik bir performans ayarı değil, verinin hangi
soruları yanıtlayabileceğini belirleyen bir sınırdır.

**Hata yarıçapı.** Toplu iş bir bütün olarak başarısız olur. 200 bin kaydın
190 bininci satırında bir tip hatası çıkarsa iş baştan koşar. Başarısızlık
gece yaşandığı için de fark edilmesi sabahı bulur; düzeltme penceresi bir
sonraki geceye kadar kapanmıştır.

**Bağımlılık zinciri.** Toplu işler nadiren tek başınadır. Biri gecikince
ardındaki dört iş de gecikir. Airflow gibi bir orkestrasyon aracının DAG
kavramı tam olarak bu bağımlılıkları yönetmek içindir — resmî
dokümantasyonun ifadesiyle "görevler arasındaki bu bağımlılıkları tanımlamak,
DAG yapısını oluşturan şeydir". Araç zinciri **yönetilebilir** kılar; fakat
zincirin kendisini kısaltmaz.

## Olay tabanlı akış neyi değiştirir?

Olay tabanlı yaklaşımda soru tersine döner. "Bu tabloyu ne sıklıkla
kopyalamalıyım?" yerine "bu sistemde ne olduğunda haberim olmalı?" diye
sorulur.

Fark teknik değil, kavramsaldır. Toplu işte veri bir **durumdur**: tablonun
şu anki hâli. Akışta veri bir **olaydır**: neyin, ne zaman, hangi sırayla
değiştiği. İkincisi birincisini üretebilir, tersi mümkün değildir — bir
tablonun anlık görüntüsünden, o hâle nasıl gelindiği geri çıkarılamaz.

Bu ayrımın pratik sonuçları var:

|                | Toplu iş               | Olay tabanlı akış             |
| -------------- | ---------------------- | ----------------------------- |
| Veri yaşı      | Saatler                | Saniyeler                     |
| Hata etkisi    | İş bütünüyle başarısız | Tek kayıt izole edilir        |
| Yeniden işleme | Tüm pencere baştan     | Belirli bir noktadan itibaren |
| Yeni tüketici  | Yeni bir iş yazılır    | Var olan akışa abone olunur   |
| Sıra bilgisi   | Kaybolur               | Korunur                       |

Son satır en çok gözden kaçanıdır. Kafka gibi bir log tabanlı sistemde
olayların sırası, verinin kendisi kadar bilgidir. "Sipariş oluşturuldu →
ödeme alındı → iptal edildi" ile "sipariş oluşturuldu → iptal edildi → ödeme
alındı" aynı son duruma varır ama tamamen farklı iki iş vakasıdır.

## Her yerde akış değil: karar kriteri

Olay tabanlı mimariye geçmenin gerçek bir bedeli vardır — operasyonel
karmaşıklık, şema yönetimi, tekrar işleme senaryoları, izleme. Bu bedel her
veri kümesi için değmez.

Pratik bir karar kriteri şudur:

- **Akışa taşıyın** — verinin değeri zamanla hızla düşüyorsa, birden fazla
  tüketici aynı veriye farklı amaçlarla bakıyorsa, ya da olayların sırası
  iş anlamı taşıyorsa.
- **Toplu işte bırakın** — veri doğası gereği dönemselse (ay sonu mutabakat,
  bordro), kaynak sistem yalnızca anlık görüntü verebiliyorsa, ya da tek
  tüketici günde bir kez bakıyorsa.

Bu ayrım yapılmadan başlayan geçişler genellikle en zor kümeyle başlar,
tıkanır ve "streaming bize uymadı" sonucuyla biter. Oysa uymayan mimari
değil, seçilen ilk adımdır.

## Geçişin uygulama sınırları

Geçişte en çok hafife alınan üç konu şunlar:

**Şema değişimi.** Akış uzun ömürlüdür; şema değişir. Yeni bir alan
eklendiğinde eski tüketicilerin kırılmaması, bir alan kaldırıldığında bunun
kontrollü ilerlemesi gerekir. Bu, akışa geçtikten sonra düşünülecek bir
detay değil, ilk gün kurulacak bir sözleşmedir.

**Tekrar işleme.** Bir hata bulunduğunda "son üç günü yeniden işleyelim"
demek, akış dünyasında toplu iş dünyasından daha karmaşıktır. Tüketicinin
aynı olayı ikinci kez gördüğünde ne yapacağı — yok sayacak mı, üzerine mi
yazacak — baştan tanımlanmalıdır.

**Sıra ve bölümleme.** Olayların sırası yalnızca aynı bölüm içinde
garantilidir. Sıra iş açısından anlamlıysa, bölümleme anahtarının iş
anahtarıyla (müşteri, hesap, sipariş) uyumlu olması gerekir. Bu karar sonradan
değiştirilmesi en pahalı kararlardan biridir.

**Geriye dönük veri.** Akış bugünden itibaren doluyor; geçmiş veri orada
değil. Tarihsel analiz gerekiyorsa, akışın yanında bir dolgu (backfill)
stratejisi de tasarlanmalıdır.

## Somut bir örnek: sipariş akışı

Soyut kalmaması için tipik bir geçişi adım adım izleyelim.

Başlangıç durumu şu: sipariş tablosu her gece kopyalanıyor, veri ambarına
yazılıyor, sabah üç ayrı rapor bu tablodan besleniyor. Ayrıca müşteri hizmetleri
ekibi kendi ekranında aynı tabloyu sorguluyor ve gördükleri veri bir gün eski.

İlk adım tabloyu değil, **olayları** tanımlamaktır: sipariş oluşturuldu,
ödeme alındı, kargoya verildi, teslim edildi, iptal edildi. Bu liste kaynak
sistemin veri modelinden değil, işin kendisinden çıkar. Beş olayın tamamı
tabloda ayrı bir sütun olarak durmuyor olabilir; bazıları yalnızca bir durum
alanının değişmesiyle temsil ediliyordur.

İkinci adım, bu olayların nasıl yakalanacağıdır. Kaynak sistem olay
üretebiliyorsa doğrudan üretir. Üretemiyorsa değişiklik yakalama (change data
capture) devreye girer: tablodaki değişiklikler okunur ve olaya çevrilir. Bu
ikinci yol daha yaygındır ve bir dezavantajı vardır — "durum değişti" bilgisi
vardır ama "neden değişti" bilgisi yoktur. Bu bilgi gerekiyorsa kaynak sistemde
bir değişiklik kaçınılmazdır.

Üçüncü adım, ilk tüketiciyi seçmektir. Burada sezgiye ters bir tercih işe
yarar: en kritik raporu değil, **en az riskli tüketiciyi** seçin. Müşteri
hizmetleri ekranı iyi bir adaydır — hatası görünür, etkisi sınırlı, geri
bildirimi hızlıdır. Aylık mutabakat raporu kötü bir adaydır: hatası bir ay
sonra anlaşılır.

Dördüncü adım, eski işi **kapatmadan** yenisini yanına koymaktır. İki hafta
boyunca ikisi birden çalışır ve çıktıları karşılaştırılır. Farklar
açıklanabilir hâle geldiğinde eski iş kapatılır. Bu paralel dönem atlanırsa,
ilk uyuşmazlıkta yeni mimariye olan güven kaybolur.

## Akışın kendisi de izlenmelidir

Toplu işin bir avantajı vardı: bittiğini ya da bitmediğini biliyordunuz. Akışta
böyle net bir sinyal yoktur. Bir akış "çalışıyor" görünürken saatlerdir hiçbir
olay taşımıyor olabilir.

Bu yüzden akışa geçen her veri kümesi için en az şu üçünün izlenmesi gerekir:

- **Gecikme (lag).** Tüketicinin üretimin ne kadar gerisinde olduğu. Sürekli
  büyüyen bir gecikme, tüketicinin yetişemediğini söyler.
- **Boşluk.** Beklenen olay hacminin altına düşülüp düşülmediği. Sıfır olay,
  çoğu zaman "sakin bir gün" değil, kopmuş bir bağlantıdır.
- **Hatalı kayıt oranı.** Şemaya uymayan veya işlenemeyen kayıtların payı ve
  nereye gittiği. Bu kayıtlar sessizce düşürülüyorsa veri kaybı vardır ve
  kimse bilmiyordur.

Bu üçü kurulmadan yapılan geçişlerde ilk ciddi olay genellikle şudur: bir rapor
boş gelir, günler sürer, sorunun günler önce başladığı anlaşılır.

## Nereden başlamalı?

Uygulamada işe yarayan sıra genellikle şu: tek bir kaynak sistem ve tek bir
tüketiciyle başlayın. Bu ikili üzerinde şema sözleşmesini, tekrar işleme
davranışını ve izlemeyi kurun. Aynı kaynağa ikinci bir tüketici eklemek
kolaylaştığında yaklaşımın işe yaradığını anlarsınız; kolaylaşmıyorsa
mimaride düzeltilecek bir şey var demektir.

Confluent, Apache NiFi, Airflow ve Elastic gibi araçlar bu resmin farklı
yerlerinde durur: biri olay taşımayı, biri veri yönlendirmeyi, biri iş
zincirlemeyi, biri arama ve analizi üstlenir. Hangisinin gerektiği, yukarıdaki
karar kriterinden sonra netleşir — önce değil.

Araç seçimiyle başlayan geçişlerin ortak sonu şudur: yeni araç kurulur, eski
toplu işler yerinde kalır ve kurum ikisini birden işletmeye başlar. Mimarinin
sadeleşmesi beklenirken karmaşıklık iki katına çıkar.
