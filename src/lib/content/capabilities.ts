import { CAPABILITY_LAYERS, type CapabilityLayer, type Locale } from "@lib/content/schema";

/**
 * YETENEK ATLASI MODELİ — TEK KAYNAK (S10 §4-§5).
 *
 * Teknoloji sayfası bir LOGO DUVARI veya rozet bulutu değildir. Sayfa şu
 * sırayla okunur: yetenek katmanı → çözülen problem → ilgili çözüm → o
 * katmanda çalıştığımız aktif teknolojiler. Teknoloji adı anlatının SONUNDA
 * gelir, başında değil.
 *
 * KATMANIN PROBLEM METNİ BURADA YAZILMAZ. Her katman bir çözüm kaydına
 * bağlanır ve problem cümlesi O kayıttan okunur (`solution.data.problem`).
 * Aynı cümleyi ikinci kez buraya yazmak, çözüm metni güncellendiğinde sessizce
 * eskiyen bir kopya bırakırdı.
 */

export interface CapabilityLayerDefinition {
  readonly key: CapabilityLayer;
  /** Katmanın görünen adı. Ürün adı DEĞİL, yetenek adıdır. */
  readonly label: Record<Locale, string>;
  /**
   * Bu katmanın anlatısını taşıyan çözüm kaydının `translationKey` değeri.
   * Problem cümlesi ve detay bağlantısı buradan üretilir.
   */
  readonly solutionKey: string;
  /** Envanterdeki ham `group` değerlerinden hangileri bu katmana düşer. */
  readonly groups: readonly string[];
}

export const CAPABILITY_ATLAS: readonly CapabilityLayerDefinition[] = [
  {
    key: "observability-apm",
    label: { tr: "Observability & APM", en: "Observability & APM" },
    solutionKey: "observability-apm",
    groups: ["observability", "apm"],
  },
  {
    key: "configuration-asset-management",
    label: {
      tr: "Konfigürasyon & varlık yönetimi",
      en: "Configuration & asset management",
    },
    solutionKey: "configuration-asset-management",
    groups: ["cmdb", "itam"],
  },
  {
    key: "itsm",
    label: { tr: "ITSM — BT hizmet yönetimi", en: "ITSM — IT service management" },
    solutionKey: "it-service-management",
    groups: ["itsm"],
  },
  {
    key: "data-streaming-integration",
    label: { tr: "Veri akışı & entegrasyon", en: "Data streaming & integration" },
    solutionKey: "data-streaming-integration",
    groups: ["data"],
  },
  {
    key: "governance-enterprise-architecture",
    label: {
      tr: "Yönetişim & kurumsal mimari",
      en: "Governance & enterprise architecture",
    },
    solutionKey: "governance-enterprise-architecture",
    groups: ["enterprise-architecture"],
  },
  {
    key: "aiops-event-lifecycle",
    label: { tr: "AIOps & olay yaşam döngüsü", en: "AIOps & event lifecycle" },
    solutionKey: "aiops-event-lifecycle",
    groups: ["aiops"],
  },
  {
    key: "automation",
    label: { tr: "Otomasyon", en: "Automation" },
    solutionKey: "automation",
    groups: ["automation"],
  },
] as const;

/* Tablo bütünlüğü: kapalı kümedeki her katmanın tam olarak bir tanımı olmalı. */
const byKey = new Map(CAPABILITY_ATLAS.map((l) => [l.key, l]));
for (const key of CAPABILITY_LAYERS) {
  if (!byKey.has(key)) {
    throw new Error(`[capabilities] "${key}" için katman tanımı eksik.`);
  }
}

/** Bir ham envanter grubunu katmana çevirir. Eşlenmemişse `undefined`. */
const layerByGroup = new Map<string, CapabilityLayer>();
for (const layer of CAPABILITY_ATLAS) {
  for (const group of layer.groups) {
    if (layerByGroup.has(group)) {
      throw new Error(`[capabilities] "${group}" grubu birden fazla katmana eşlenmiş.`);
    }
    layerByGroup.set(group, layer.key);
  }
}

export function layerForGroup(group: string): CapabilityLayer | undefined {
  return layerByGroup.get(group);
}

export function capabilityLayerLabel(key: CapabilityLayer, locale: Locale): string {
  const layer = byKey.get(key);
  if (layer === undefined) throw new Error(`[capabilities] Tanımsız katman: "${key}"`);
  return layer.label[locale];
}

/**
 * EDİTORYAL VURGU — PARTNERLİK İDDİASI DEĞİLDİR.
 *
 * Bu kayıtlar sayfada tipografik olarak biraz daha güçlü görünür (S10 §4).
 * Vurgu YALNIZCA görsel ağırlıktır: "resmî iş ortağı", "yetkili satıcı" veya
 * üstünlük anlamı TAŞIMAZ, ayrı bir bölüm açmaz ve sıralamayı değiştirmez.
 * Vurgulanan kayıt da diğerleri gibi `lifecycle: active` filtresinden geçmek
 * zorundadır; bu liste bir kaydı GÖRÜNÜR YAPMAZ.
 */
export const EMPHASIZED_TECHNOLOGY_IDS: readonly string[] = [
  "datadog",
  "zabbix",
  "ardoq",
  "freshservice",
  "cyclops",
] as const;

export function isEmphasized(technologyId: string): boolean {
  return EMPHASIZED_TECHNOLOGY_IDS.includes(technologyId);
}
