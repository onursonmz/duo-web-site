# İçerik Modeli ve Rota Haritası

## 1. Global navigasyon

Üst menü en fazla altı ana giriş:

1. Çözümler
2. CyclOps
3. Hizmetler
4. İçgörüler
5. Hakkımızda
6. İletişim

Teknolojiler, Çözümler mega menüsü ve ayrıca indekslenebilir landing sayfası içinde bulunur.

## 2. Temel rotalar

| Türkçe | İngilizce |
|---|---|
| `/` | `/en/` |
| `/cozumler/` | `/en/solutions/` |
| `/cozumler/[slug]/` | `/en/solutions/[slug]/` |
| `/cyclops/` | `/en/cyclops/` |
| `/hizmetler/` | `/en/services/` |
| `/teknolojiler/` | `/en/technologies/` |
| `/hakkimizda/` | `/en/about/` |
| `/icgoruler/` | `/en/insights/` |
| `/icgoruler/[slug]/` | `/en/insights/[slug]/` |
| `/iletisim/` | `/en/contact/` |
| `/kvkk/` | uygun İngilizce politika rotası |
| `/cerez-politikasi/` | `/en/cookie-policy/` |

Sektörel çözümler aynı `Solution` şemasını kullanır; gerekirse `/cozumler/sektorel/[slug]/` görünümü üretilir.

## 3. Sekiz çözüm kaydı

Başlıklar müşteri faydasını öne çıkarır; parantez içleri içerik ekibi etiketidir.

1. **Altyapınızın tamamını tek görünümde yönetin** — Observability.
   - OpenText, Zabbix, Foglight, Datadog, Instana, OpenTelemetry.
2. **Varlık ve konfigürasyonlarınızı güvenilir tek kaynağa dönüştürün** — Configuration Management / CMDB.
   - OpenText CMS, Device42.
3. **Talepten çözüme kesintisiz hizmet akışı kurun** — ITSM.
   - SMAX, Freshservice.
4. **Veriyi üretildiği anda bağlayın, işleyin ve kullanın** — Data Streaming & Integration.
   - Confluent, Apache NiFi, Apache Airflow, Elastic.
5. **İş ve teknoloji mimarinizi karar verilebilir hale getirin** — Governance / Enterprise Architecture.
   - Ardoq, Quest Change Auditor.
6. **Binlerce alarmı tek anlamlı olaya indirin** — AIOps & Event Lifecycle.
   - CyclOps.
7. **Tekrarlayan operasyonları güvenli ve izlenebilir biçimde otomatikleştirin** — Automation.
   - OpenText OO, OpenText SA, Ansible, AWX, n8n; KACE durumu doğrulanacak.
8. **Fikri çalışan ürüne ve yönetilen operasyona dönüştürün** — Engineering & Product Development.
   - Data Lake / Data Platform, LLM & AI uygulamaları, chatbot, RAG, kurumsal asistanlar, ML, entegrasyon çözümleri, Virtual NOC.

Bu başlıklar taslaktır; SEO araştırması ve iş sahibi onayıyla cilalanacaktır.

## 4. Content collection şemaları

### Solution

```ts
type Solution = {
  translationKey: string;
  locale: "tr" | "en";
  slug: string;
  category: "core" | "industry";
  status: "draft" | "review" | "published" | "archived";
  featured: boolean;
  title: string;
  eyebrow?: string;
  summary: string;
  problem: string;
  approach: string;
  benefits: string[];
  capabilities: string[];
  technologyRefs: string[];
  caseStudyRefs?: string[];
  aiRole?: { detect: string; understand: string; act: string };
  scenario?: { title: string; context: string; flow: string[]; result: string };
  cta: { label: string; href: string };
  seo: SeoFields;
};
```

### Technology

```ts
type Technology = {
  id: string;
  name: string;
  group: string;
  active: boolean;
  officialUrl?: string;
  logoPath?: string;
  logoPermission: "unknown" | "allowed" | "denied";
  solutionRefs: string[];
};
```

### Milestone

```ts
type Milestone = {
  translationKey: string;
  locale: "tr" | "en";
  year: number;
  datePrecision: "year" | "month" | "day";
  title: string;
  summary: string;
  solutionRefs?: string[];
  verificationStatus: "pending" | "verified" | "rejected";
};
```

### Testimonial / CaseStudy

```ts
type Proof = {
  translationKey: string;
  locale: "tr" | "en";
  organization?: string;
  anonymousSector?: string;
  quote?: string;
  personName?: string;
  role?: string;
  logoPermission: "unknown" | "allowed" | "denied";
  metrics?: Array<{ label: string; before?: string; after?: string; value?: string }>;
  verificationStatus: "pending" | "verified" | "rejected";
};
```

### Insight

```ts
type Insight = {
  translationKey: string;
  locale: "tr" | "en";
  slug: string;
  status: "draft" | "review" | "published" | "archived";
  title: string;
  excerpt: string;
  series: string;
  tags: string[];
  authorRef: string;
  relatedSolutionRefs: string[];
  publishedAt?: Date;
  updatedAt?: Date;
  heroImage?: string;
  seo: SeoFields;
};
```

Şemalar uygulama sırasında tek kaynakta tanımlanacak ve fixture/content girdileriyle test edilecektir.

## 5. Çözüm detay şablonu

Her çözüm detayında aynı bilgi mimarisi:

1. Sonuç odaklı hero.
2. Ziyaretçinin yaşadığı problem.
3. Duosis yaklaşımı.
4. Beklenen faydalar.
5. “AI burada ne yapıyor?” — yalnız doğrulanmışsa.
6. Teknoloji ekosistemi.
7. Örnek senaryo / çalışma akışı.
8. İlgili vaka/referans.
9. İlgili İçgörüler.
10. Tek bir ana CTA.

## 6. Ana sayfa bileşen sözleşmesi

```text
GlobalHeader
CommandAtlasHero
TrustMetrics
SolutionAtlas
CyclOpsSignalToAction
IntelligenceLayer
SelectedProof
TenYearTimelinePreview
RegionalPresence
TechnologyEcosystem
LatestInsights
RoadmapCTA
GlobalFooter
```

Mobilde bu sıralama içerik anlamını korur. JavaScript kapalıyken temel içerik ve linkler kullanılabilir kalır.

## 7. İçerik yayın kontrolü

Kamuya açık build aşağıdaki kayıtları göstermemelidir:

- `status !== published`
- `verificationStatus !== verified` olan metrik/iddia
- `logoPermission !== allowed` olan logo
- `active !== true` olan teknoloji

Preview ortamında pending girdiler açık “TASLAK / DOĞRULANACAK” işaretiyle görülebilir.

