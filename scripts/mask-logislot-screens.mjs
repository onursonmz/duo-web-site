import { mkdir, copyFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

/**
 * LOGISLOT EKRANLARININ MASKELENMESİ (S14).
 *
 * Kaynak ekranlar demo (seed) verisiyle alınmış olsa da tedarikçi portalı
 * başlığında GERÇEK BİR ŞİRKET ADINA BENZEYEN kiracı adı görünüyor. Bir
 * müşteri adını kendi tanıtım sitemizde yayımlamak, izni doğrulanmamış bir
 * referans iddiasıdır; bu yüzden başlık bloğu maskelenir.
 *
 * Yöntem S08'de CyclOps ekranlarında uygulananla aynıdır: alan silinmez,
 * ÜZERİ KAPATILIR ve yerine nötr bir etiket yazılır — böylece ekranın
 * düzeni bozulmaz ve maskeleme yapıldığı görünür kalır.
 *
 * Kaynak commit ve hash'ler `docs/PRODUCT_SOURCE_MANIFEST.md` içindedir.
 *
 * Kullanım: node scripts/mask-logislot-screens.mjs <kaynak-dizin>
 */

const SRC = process.argv[2];
if (SRC === undefined) {
  process.stderr.write("kaynak dizin gerekli\n");
  process.exit(2);
}
const OUT = join(process.cwd(), "src", "assets", "logislot");
await mkdir(OUT, { recursive: true });

/** Kiracı adı ve avatarın bulunduğu başlık bölgesi (1440x900 ölçeğinde). */
const MASK = { left: 1214, top: 14, width: 212, height: 52 };

const label = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${MASK.width}" height="${MASK.height}">
     <rect width="${MASK.width}" height="${MASK.height}" rx="10" fill="#e8ecf1"/>
     <rect x="0.5" y="0.5" width="${MASK.width - 1}" height="${MASK.height - 1}" rx="10"
           fill="none" stroke="#b9c3cf"/>
     <text x="${MASK.width / 2}" y="${MASK.height / 2 + 5}" text-anchor="middle"
           font-family="Segoe UI, DejaVu Sans, sans-serif" font-size="15" fill="#5b6673">
       Tedarikçi hesabı
     </text>
   </svg>`
);

const MASKED = ["supplier-wizard-step2", "supplier-wizard-step3"];
const CLEAN = ["landing-hero-light", "landing-hero-dark"];

for (const name of MASKED) {
  const out = join(OUT, `${name}.png`);
  await sharp(join(SRC, `${name}.png`))
    .composite([{ input: label, left: MASK.left, top: MASK.top }])
    .png({ compressionLevel: 9 })
    .toFile(out);
  process.stdout.write(`maskelendi: ${name}.png\n`);
}

for (const name of CLEAN) {
  // Temiz ekranlar değiştirilmeden kopyalanır; kaynak bütünlüğü korunur.
  await copyFile(join(SRC, `${name}.png`), join(OUT, `${name}.png`));
  process.stdout.write(`kopyalandi (maskeleme gerekmedi): ${name}.png\n`);
}
