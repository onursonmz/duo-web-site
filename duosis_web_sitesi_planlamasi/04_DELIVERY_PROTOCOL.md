# Sprint Teslim ve İnceleme Protokolü

## 1. Temel kural

Her sprint tek başına incelenebilir, test edilebilir ve geri alınabilir bir artım üretir. Varsayılan düzende sonraki sprint, önceki sprint için Codex onayı gelmeden başlamaz.

### 1.1 İkili sprint paketi (kullanıcı kararı, S04+S05 ile yürürlükte)

Birbiriyle doğrudan ilişkili iki sprint tek branch üzerinde ardışık olarak yürütülebilir. Bu düzende:

- Her sprint kendi **ayrı ve atomik checkpoint commit'ine** sahip olur; ikisi tek commit'te birleştirilmez.
- **İlk sprint sonunda `pnpm quality` çalıştırılması zorunludur.**
- İlk sprint kalite kapısı başarılıysa **Codex onayı beklenmeden** ikinci sprint başlayabilir.
- **İkinci sprint sonunda** tekrar tam kalite zinciri ve **remote CI** çalıştırılır.
- Birleşik raporda iki sprintin kabul kriterleri **ayrı ayrı** gösterilir; base/final commit ve kalite sonuçları da sprint bazında verilir.
- Herhangi bir sprint **BLOCKED** olursa ikinciye geçilmez; blokaj olduğu yerde raporlanır.
- İkili paket ancak Codex tarafından onaylandıktan sonra `main`'e merge edilir.

Bu düzen varsayılan kuralı ortadan kaldırmaz; yalnızca Codex'in açıkça ikili paket ilan ettiği sprintlerde geçerlidir.

## 2. Git çalışma düzeni

- Sprint başında mevcut branch, `git status` ve HEAD kaydedilir.
- Kullanıcıya ait mevcut/untracked değişikliklere dokunulmaz.
- Her sprint kendi branch'inde yürütülür: `duosis-web/sXX-kisa-ad`.
- Sprint sonunda atomik yerel commit oluşturulur.
- Commit mesajı: `feat(web): SXX <kısa sonuç>` veya uygun `chore/fix/test` türü.
- Açık talimat olmadıkça push, merge, rebase, tag, deployment ve PR açma yok.
- Büyük binary ve secret commit edilmez.
- Onaylanan sprint `main`'e **merge commit** ile alınır; squash ve rebase kullanılmaz, sprint commit geçmişi korunur.
- Merge sonrasında `main` CI sonucu beklenir; kırmızıysa yeni sprint başlatılmaz.

Repo henüz yoksa S00 bunu raporlar; git init ve ilk commit yalnız S01 kapsamındadır.

## 3. Değişiklik disiplini

- Sprint kapsamı dışındaki refactor yapılmaz.
- Yeni bağımlılık gerekçesi raporda belirtilir.
- Üçüncü taraf tasarım/metin/assets kopyalanmaz.
- Bilinmeyen iş gerçeği için placeholder açık biçimde işaretlenir.
- Testi geçirmeye yönelik sahte/gevşek kontrol eklenmez.
- Lint/type/test hataları skip veya geniş ignore ile gizlenmez.

## 4. Sprint Definition of Done

Bir sprint ancak şunların tamamı karşılandığında “tamamlandı” denebilir:

- Sprint kabul kriterlerinin tamamı PASS veya açık BLOCKED.
- İlgili otomatik testler çalıştırılmış.
- Desktop ve mobile görsel kanıt hazırlanmış.
- Klavye ve reduced-motion davranışı ilgili sprintte kontrol edilmiş.
- Yeni console error ve kırık link yok.
- Build başarılı.
- Değişen davranış dokümante edilmiş.
- Yerel commit oluşturulmuş.
- Rapor teslim edilmiş ve Claude durmuş.

İkili sprint paketinde ilk sprint için "rapor teslim edilmiş ve durulmuş" maddesi yerine "checkpoint commit oluşturulmuş ve `pnpm quality` başarılı" maddesi geçerlidir; rapor ve durma yalnızca paketin sonunda uygulanır.

## 5. Kanıt türleri

| Alan | Beklenen kanıt |
|---|---|
| Kod | Değişen dosya listesi ve kısa gerekçe |
| Test | Komut, exit code, pass/fail/skip sayısı |
| Görsel | 1440px desktop + yaklaşık 390px mobile screenshot |
| Erişilebilirlik | Klavye akışı, axe sonucu, focus ve reduced-motion notu |
| Performans | İlgili bundle/Lighthouse ölçümü |
| İçerik | Kullanılan fixture ve doğrulama durumları |
| Git | base HEAD, final HEAD, branch ve commit |
| CI | Remote run kimliği, sonuç ve süre |
| Temiz kök | Üst dizinlerinde `node_modules` bulunmayan bir konumda `install --frozen-lockfile` + `quality` sonucu |
| Paket | Review bundle ve evidence ZIP; ZIP yolları platform bağımsız `/` ayıracı kullanır, mutlak yol veya `..` içermez |

## 6. Stop koşulları

Claude aşağıdaki durumda ilerlemeyi durdurup raporlamalıdır:

- Repo veya çalışma dizini belirsiz.
- Kaynak dosyada kullanıcı değişikliğiyle çakışma.
- Gereken görsel/logo/ürün ekranı eksik ve yerine uydurma içerik gerekecek olması.
- İş iddiasının doğrulanmadan kamuya açılması gerekmesi.
- Deployment/CRM/analytics için secret veya dış yetki gereksinimi.
- Kabul kriterini zayıflatmadan giderilemeyen teknik blokaj.
- Bağlayıcı mimari karardan sapma ihtiyacı.

## 7. Codex inceleme sonucu

İnceleme şu kararlardan birini verir:

- **APPROVED:** Sonraki sprint başlayabilir.
- **APPROVED WITH FOLLOW-UP:** Küçük takip maddesi backlog'a alınarak sonraki sprint başlayabilir.
- **CHANGES REQUESTED:** Aynı sprint revizyonu gerekir.
- **BLOCKED:** Kullanıcı/iş sahibi kararı gerekir.

## 8. Rapor boyutu

Rapor eksiksiz ama odaklı olmalıdır. Büyük kod blokları yerine dosya yolları, davranış özeti ve test kanıtları verilmelidir. Hata logu uzunsa ilgili son bölüm ve tam logun dosya yolu yeterlidir.

