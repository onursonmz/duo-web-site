/**
 * DUOSIS OPERATIONAL UNIVERSE — WebGL sahnesi (S15-R2).
 *
 * S15-R1'in CSS 3B katmanlı SVG çözümü görsel kabulden geçmedi: kodda derinlik
 * vardı, EKRANDA yoktu. Bu modül sahneyi gerçek bir perspektif kamerayla,
 * gerçek Z mesafeleriyle ve gerçek hacimli gövdelerle kurar (ADR-014 yeniden
 * OPEN; karar bu dosyanın ürettiği görüntüdür).
 *
 * SAHNENİN ANLATISI — sitenin beş aşamasıyla BİREBİR aynı:
 *   kaynaklar -> sinyaller -> bağlam -> karar -> aksiyon -> (geri besleme)
 *
 * TASARIM SINIRLARI
 * - Rastgele parçacık yağmuru YOK. Hareket eden her nesne TANIMLI bir yol
 *   üzerinde ilerleyen bir sinyal paketidir.
 * - Gradient küre, sahte terminal, oyun arayüzü YOK.
 * - Hazır model, stok asset veya dış kaynak YOK: her geometri burada koddan
 *   üretilir (ikosahedron, torus, tüp, ızgara).
 * - Renkler tasarım sisteminden OKUNUR (`readTokens`), dosyaya gömülmez.
 *
 * TEKNİK SINIRLAR
 * - Yalnızca `MeshBasicMaterial`, `LineBasicMaterial` ve elle yazılmış küçük
 *   `ShaderMaterial`'lar kullanılır. PBR materyali (ve onun shader yığını)
 *   bilinçli olarak İTHAL EDİLMEZ; paket bütçesi bunun üzerine kuruludur.
 * - DPR tavanı 1.5, gizli sekmede ve viewport dışında döngü DURUR.
 * - `webglcontextlost` geldiğinde tüketici `onFail` ile statik postere döner.
 */
import {
  AdditiveBlending,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Float32BufferAttribute,
  FogExp2,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  Object3D,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  RingGeometry,
  Scene,
  ShaderMaterial,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from "three";

// ---------------------------------------------------------------- genel tip

export interface UniverseOptions {
  /** Çizim yüzeyi. */
  canvas: HTMLCanvasElement;
  /** Scroll ilerlemesinin ölçüldüğü kapsayıcı (`.universe`). */
  track: HTMLElement;
  /** Yolculuğun BİTTİĞİ öğe: bunun alt kenarı p = 1 demektir. */
  journeyEnd: HTMLElement;
  /** Tasarım token'larının okunacağı koyu temalı öğe. */
  tokenSource: HTMLElement;
  /** Hareket azaltma açıksa sahne TEK kare çizilir ve döngü hiç başlamaz. */
  reducedMotion: boolean;
  /**
   * Yazılım rasterleştiriciye İZİN ver.
   *
   * Varsayılan `false`: gerçek GPU yoksa context hiç istenmez ve tüketici
   * postere düşer. Yalnızca kanıt üretimi ve WebGL yolunu doğrulayan testler
   * bunu açar (bkz. `SignatureHero.astro`, `?universe=force`).
   */
  allowSoftware: boolean;
  /** Sahne ilk kareyi çizdiğinde. */
  onReady: () => void;
  /** WebGL yoksa veya context kaybedilirse. */
  onFail: () => void;
  /** Tema geçişini DOM'a bildirir (0 koyu, 1 açık). */
  onTheme: (value: number) => void;
}

export interface UniverseHandle {
  dispose(): void;
}

interface Tokens {
  base: Color;
  surface: Color;
  signal: Color;
  decision: Color;
  action: Color;
  line: Color;
  light: Color;
  ink: Color;
}

interface CameraKey {
  p: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
}

interface Stream {
  mesh: Mesh;
  material: ShaderMaterial;
  curved: Vector3[];
  flat: Vector3[];
  speed: number;
}

// ------------------------------------------------------------- yardımcılar

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Yumuşak geçiş: [a, b] aralığını 0..1'e eşler. */
function span(value: number, a: number, b: number): number {
  if (b === a) return value >= b ? 1 : 0;
  const t = clamp01((value - a) / (b - a));
  return t * t * (3 - 2 * t);
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Dizi erişimi `noUncheckedIndexedAccess` altında güvenli olsun. */
function at<T>(list: readonly T[], index: number, fallback: T): T {
  return list[index] ?? fallback;
}

/**
 * Eğri üzerinde EŞİT ARALIKLI örnek tablosu.
 *
 * `Curve.getPointAt` her çağrıda yay uzunluğu tablosuna bakar ve yeni vektör
 * ayırır. Sahnede kare başına onlarca örnek alındığı için tablo bir kez
 * çıkarılır, sonra aradeğerleme elle yapılır: kare başına sıfır ayırma.
 */
function sampleCurve(curve: CatmullRomCurve3, count: number): Vector3[] {
  return curve.getSpacedPoints(count - 1);
}

/** Örnek tablosundan t (0..1) konumunu `out` içine yazar. */
function pointAt(samples: Vector3[], t: number, out: Vector3): Vector3 {
  const last = samples.length - 1;
  const x = clamp01(t) * last;
  const i = Math.min(Math.floor(x), last - 1);
  const f = x - i;
  const a = samples[i];
  const b = samples[i + 1];
  if (a === undefined || b === undefined) return out.set(0, 0, 0);
  return out.set(lerp(a.x, b.x, f), lerp(a.y, b.y, f), lerp(a.z, b.z, f));
}

/** CSS özel değişkenini `Color`a çevirir. */
function token(style: CSSStyleDeclaration, name: string, fallback: string): Color {
  const raw = style.getPropertyValue(name).trim();
  try {
    return new Color(raw.length > 0 ? raw : fallback);
  } catch {
    return new Color(fallback);
  }
}

function readTokens(source: HTMLElement): Tokens {
  const style = getComputedStyle(source);
  return {
    base: token(style, "--surface-sunken", "#0f1316"),
    surface: token(style, "--surface-raised", "#1c2126"),
    signal: token(style, "--signal", "#16a6de"),
    decision: token(style, "--decision", "#d08c46"),
    action: token(style, "--action", "#e06b12"),
    line: token(style, "--border-subtle", "#2b3238"),
    light: token(style, "--surface-inverse", "#f6f7f8"),
    ink: token(style, "--text-inverse", "#14181c"),
  };
}

// ------------------------------------------------------------------ shader

const FOG_HELPER = `
float fogAmount(float depth, float density) {
  float f = density * depth;
  return clamp(1.0 - exp(-f * f), 0.0, 1.0);
}
`;

/** Hacimli gövdeler: koyu yüzey + kenarda ışık (fresnel). */
const RIM_VERT = `
varying vec3 vNormalV;
varying vec3 vViewDir;
varying float vDepth;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormalV = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const RIM_FRAG = `
uniform vec3 uBase;
uniform vec3 uRim;
uniform vec3 uFog;
uniform float uOpacity;
uniform float uRimPow;
uniform float uRimGain;
uniform float uFogDensity;
uniform float uReveal;
varying vec3 vNormalV;
varying vec3 vViewDir;
varying float vDepth;
${FOG_HELPER}
void main() {
  float f = pow(1.0 - clamp(dot(normalize(vNormalV), normalize(vViewDir)), 0.0, 1.0), uRimPow);
  vec3 col = uBase + uRim * f * uRimGain;
  col = mix(col, uFog, fogAmount(vDepth, uFogDensity));
  gl_FragColor = vec4(col, uOpacity * uReveal);
}
`;

/**
 * Veri yolu.
 *
 * `aFlat`: AYNI tüpün DÜZLEŞTİRİLMİŞ hâlindeki köşe konumları. `uFlat` ikisini
 * karıştırır; böylece hero'nun eğrisel akış yolları, kamera çekirdekten
 * geçtikten sonra Çözüm Atlası'nın yatay ray geometrisine DÖNÜŞÜR — yeni
 * bölüme geçerken sahnedeki gerçek nesne korunur.
 */
const STREAM_VERT = `
attribute vec3 aFlat;
uniform float uFlat;
varying vec2 vUv;
varying float vDepth;
void main() {
  vec3 p = mix(position, aFlat, uFlat);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vUv = uv;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const STREAM_FRAG = `
uniform vec3 uColor;
uniform vec3 uInkColor;
uniform vec3 uFog;
uniform float uTime;
uniform float uSpeed;
uniform float uReveal;
uniform float uOpacity;
uniform float uInk;
uniform float uFogDensity;
varying vec2 vUv;
varying float vDepth;
${FOG_HELPER}
void main() {
  if (vUv.x > uReveal) discard;
  float head = smoothstep(uReveal - 0.05, uReveal, vUv.x) * step(uReveal, 0.999);
  float band = fract(vUv.x * 2.6 - uTime * uSpeed);
  float pulse = smoothstep(0.88, 1.0, band);
  float fog = fogAmount(vDepth, uFogDensity);

  vec3 glow = uColor * (0.85 + pulse * 2.1 + head * 1.6) * (1.0 - fog);
  float glowA = uOpacity * (0.40 + pulse * 0.85) + head * 0.55;

  gl_FragColor = vec4(mix(glow, uInkColor, uInk), mix(glowA, 0.34 + pulse * 0.30, uInk));
}
`;

/** Çekirdeğin arkasındaki ışık katmanı — küre DEĞİL, aydınlatma. */
const HAZE_FRAG = `
uniform vec3 uColor;
uniform float uStrength;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = pow(clamp(1.0 - d, 0.0, 1.0), 2.6);
  gl_FragColor = vec4(uColor * a * uStrength, a * uStrength);
}
`;

const HAZE_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/** Bağlam/korelasyon telleri: her segment kendi sırasında belirir. */
const CORR_VERT = `
attribute float aOrder;
varying float vOrder;
void main() {
  vOrder = aOrder;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const CORR_FRAG = `
uniform vec3 uColor;
uniform float uReveal;
uniform float uOpacity;
varying float vOrder;
void main() {
  float a = smoothstep(vOrder, vOrder + 0.18, uReveal);
  if (a <= 0.01) discard;
  gl_FragColor = vec4(uColor, a * uOpacity);
}
`;

// ------------------------------------------------------------ sahne verisi

/** Beş kaynak — farklı yön, farklı DERİNLİK. Ekranın tamamına yayılırlar. */
const SOURCES: [number, number, number][] = [
  [-36, 21, -16],
  [-8, 31, -58],
  [-54, -19, 32],
  [20, -29, -38],
  [40, 25, -74],
];

/** Yolun çekirdeğe giriş yönü — her akış farklı bir kapıdan girer. */
const GATES: [number, number, number][] = [
  [-7.4, 3.4, 1.6],
  [-2.2, 7.6, -2.6],
  [-7.0, -2.6, 4.2],
  [3.0, -7.2, -1.4],
  [6.2, 4.6, -3.8],
];

const CORE_R = 8.4;
const GATE_POS = new Vector3(14, -8, 12);
const ACTION_POS = new Vector3(24, -14, 6);

/** Kamera anahtarları — p = 0 hero, p = 1 Çözüm Atlası devralır. */
const CAMERA_PATH: CameraKey[] = [
  { p: 0.0, pos: [0, 4, 92], look: [0, 1, 0], fov: 42 },
  { p: 0.26, pos: [7, 9, 70], look: [1, 2, -4], fov: 42 },
  { p: 0.52, pos: [4, 3, 46], look: [2, -2, -2], fov: 44 },
  { p: 0.7, pos: [-1, -2, 17], look: [0, -2, -24], fov: 50 },
  { p: 0.81, pos: [-2, 0, -14], look: [0, 0, -66], fov: 54 },
  { p: 0.91, pos: [0, 1, -46], look: [0, 0, -112], fov: 48 },
  { p: 1.0, pos: [0, 0, -72], look: [0, 0, -132], fov: 42 },
];

/** Düzleşmiş rayların yaşadığı düzlem — kamera çekirdekten GEÇTİKTEN sonra. */
const FLAT_Z = -132;
const FLAT_SPAN = 118;

// ------------------------------------------------------------------- kurulum

export function createUniverse(options: UniverseOptions): UniverseHandle {
  const { canvas, track, journeyEnd, tokenSource, reducedMotion, allowSoftware } = options;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: !allowSoftware,
    });
  } catch {
    options.onFail();
    return { dispose: () => undefined };
  }

  const tokens = readTokens(tokenSource);
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 860;
  /** Düşük geometri kipi: aynı evren, daha az segment. */
  const lite = coarse || narrow;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(tokens.base, 1);

  const scene = new Scene();
  const fog = new FogExp2(tokens.base.getHex(), 0.0062);
  scene.fog = fog;
  const fogDensity = { value: fog.density };

  const camera = new PerspectiveCamera(42, 1, 0.5, 520);
  camera.position.set(0, 4, 92);

  const universe = new Group();
  scene.add(universe);

  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  /** Ortak fresnel materyali üreticisi. */
  const rimMaterial = (
    base: Color,
    rim: Color,
    opacity: number,
    rimPow: number,
    rimGain: number
  ): ShaderMaterial =>
    keep(
      new ShaderMaterial({
        vertexShader: RIM_VERT,
        fragmentShader: RIM_FRAG,
        // Sahne aydınlığa dönerken gövdeler `uReveal` ile sönüyor; bu yüzden
        // opak olanlar da `transparent` işaretlidir (aksi halde alfa yok sayılır).
        transparent: true,
        depthWrite: opacity >= 1,
        uniforms: {
          uBase: { value: base.clone() },
          uRim: { value: rim.clone() },
          uFog: { value: tokens.base.clone() },
          uOpacity: { value: opacity },
          uRimPow: { value: rimPow },
          uRimGain: { value: rimGain },
          uFogDensity: { value: fogDensity.value },
          uReveal: { value: 1 },
        },
      })
    );

  const rimMaterials: ShaderMaterial[] = [];
  const trackRim = (m: ShaderMaterial): ShaderMaterial => {
    rimMaterials.push(m);
    return m;
  };

  // ------------------------------------------------------- perspektif ızgara

  const gridGeo = keep(new BufferGeometry());
  {
    const verts: number[] = [];
    const step = lite ? 22 : 16;
    const halfX = 176;
    const zFrom = -230;
    const zTo = 92;
    for (let x = -halfX; x <= halfX; x += step) {
      verts.push(x, -26, zFrom, x, -26, zTo);
    }
    for (let z = zFrom; z <= zTo; z += step) {
      verts.push(-halfX, -26, z, halfX, -26, z);
    }
    // Üst düzlemde YALNIZCA ana hatlar: mekân kapanır, gürültü artmaz.
    for (let z = zFrom; z <= zTo; z += step * 3) {
      verts.push(-halfX, 40, z, halfX, 40, z);
    }
    gridGeo.setAttribute("position", new Float32BufferAttribute(verts, 3));
  }
  const gridMat = keep(
    new LineBasicMaterial({ color: tokens.line.clone(), transparent: true, opacity: 0.5 })
  );
  const grid = new LineSegments(gridGeo, gridMat);
  universe.add(grid);

  // --------------------------------------------------------- ışık katmanı

  const hazeMat = keep(
    new ShaderMaterial({
      vertexShader: HAZE_VERT,
      fragmentShader: HAZE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uColor: { value: tokens.signal.clone() },
        uStrength: { value: 0 },
      },
    })
  );
  const hazeGeo = keep(new PlaneGeometry(150, 150));
  const haze = new Mesh(hazeGeo, hazeMat);
  haze.position.set(2, 0, -46);
  universe.add(haze);

  // ------------------------------------------------------------- kaynaklar

  const sourceGroups: Group[] = [];
  const sourceBodyGeo = keep(new OctahedronGeometry(3.2, 0));
  const sourceRingGeo = keep(new TorusGeometry(7.0, 0.13, 4, lite ? 22 : 44));
  const sourceMat = trackRim(
    rimMaterial(tokens.signal.clone().multiplyScalar(0.1), tokens.signal, 1, 1.7, 1.35)
  );
  const sourceRingMat = trackRim(
    rimMaterial(tokens.signal.clone().multiplyScalar(0.22), tokens.signal, 0.85, 1.6, 1.1)
  );

  for (const [x, y, z] of SOURCES) {
    const group = new Group();
    group.position.set(x, y, z);

    const body = new Mesh(sourceBodyGeo, sourceMat);
    group.add(body);

    const ring = new Mesh(sourceRingGeo, sourceRingMat);
    ring.rotation.set(Math.PI * 0.5, 0, 0);
    group.add(ring);

    const ring2 = new Mesh(sourceRingGeo, sourceRingMat);
    ring2.rotation.set(0, Math.PI * 0.32, Math.PI * 0.18);
    ring2.scale.setScalar(0.66);
    group.add(ring2);

    group.scale.setScalar(0.001);
    universe.add(group);
    sourceGroups.push(group);
  }

  // ----------------------------------------------------------- veri yolları

  const TUBULAR = lite ? 48 : 96;
  const RADIAL = lite ? 4 : 6;
  const streams: Stream[] = [];

  for (let i = 0; i < SOURCES.length; i += 1) {
    const from = new Vector3(...at(SOURCES, i, [0, 0, 0]));
    const gate = new Vector3(...at(GATES, i, [0, 0, 0]));

    // Eğrisel yol: kaynaktan çıkar, mekânda yay çizer, çekirdeğe girer.
    const mid = from.clone().lerp(gate, 0.45);
    mid.y += i % 2 === 0 ? 9 : -8;
    mid.z += i % 3 === 0 ? 16 : -12;
    const near = from.clone().lerp(gate, 0.82);
    near.y += i % 2 === 0 ? 2.4 : -2.2;

    const curve = new CatmullRomCurve3([from, mid, near, gate], false, "catmullrom", 0.42);
    const geo = keep(new TubeGeometry(curve, TUBULAR, 0.26, RADIAL, false));

    // Düzleşmiş hedef: Çözüm Atlası'nın yatay ray geometrisi.
    const railY = (i - (SOURCES.length - 1) / 2) * 8.2;
    const flatCurve = new CatmullRomCurve3(
      [
        new Vector3(-FLAT_SPAN, railY, FLAT_Z - 8),
        new Vector3(-FLAT_SPAN * 0.34, railY, FLAT_Z),
        new Vector3(FLAT_SPAN * 0.34, railY, FLAT_Z),
        new Vector3(FLAT_SPAN, railY, FLAT_Z - 8),
      ],
      false,
      "catmullrom",
      0.0
    );
    const flatGeo = new TubeGeometry(flatCurve, TUBULAR, 0.34, RADIAL, false);
    const flatPos = flatGeo.getAttribute("position");
    geo.setAttribute("aFlat", new Float32BufferAttribute(Float32Array.from(flatPos.array), 3));
    flatGeo.dispose();

    const material = keep(
      new ShaderMaterial({
        vertexShader: STREAM_VERT,
        fragmentShader: STREAM_FRAG,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uColor: { value: tokens.signal.clone() },
          uInkColor: { value: tokens.ink.clone() },
          uFog: { value: tokens.base.clone() },
          uTime: { value: 0 },
          uSpeed: { value: 0.24 + i * 0.045 },
          uReveal: { value: 0 },
          uOpacity: { value: 1 },
          uInk: { value: 0 },
          uFlat: { value: 0 },
          uFogDensity: { value: fogDensity.value },
        },
      })
    );

    const mesh = new Mesh(geo, material);
    /*
     * ÖLÇÜLEN HATA: köşeler vertex shader'da taşındığı için üç.js'in
     * BAŞLANGIÇ sınır küresi artık geçersiz; düzleşen raylar kameranın
     * arkasında sanılıp budanıyor ve p = 1'de sahne BOŞ kalıyordu.
     */
    mesh.frustumCulled = false;
    universe.add(mesh);

    streams.push({
      mesh,
      material,
      curved: sampleCurve(curve, 128),
      flat: sampleCurve(flatCurve, 128),
      speed: 0.13 + i * 0.026,
    });
  }

  // ------------------------------------------------------------- çekirdek

  const core = new Group();
  universe.add(core);

  const coreInnerGeo = keep(new IcosahedronGeometry(CORE_R * 0.5, 0));
  const coreInnerMat = trackRim(
    rimMaterial(tokens.signal.clone().multiplyScalar(0.16), tokens.signal, 1, 1.6, 1.6)
  );
  const coreInner = new Mesh(coreInnerGeo, coreInnerMat);
  core.add(coreInner);

  /* Yarı saydam kabuk: hacmi taşır ama içini gösterir. */
  const coreShellGeo = keep(new IcosahedronGeometry(CORE_R, 1));
  const coreShellMat = trackRim(
    rimMaterial(tokens.signal.clone().multiplyScalar(0.06), tokens.signal, 0.16, 2.8, 1.5)
  );
  coreShellMat.side = DoubleSide;
  const coreShell = new Mesh(coreShellGeo, coreShellMat);
  core.add(coreShell);

  /* Kafes: kameranın İÇİNDEN geçtiği yapı. Küre değil, örgü. */
  const coreMeshGeo = keep(new IcosahedronGeometry(CORE_R * 1.04, lite ? 1 : 2));
  const coreMeshMat = trackRim(
    rimMaterial(tokens.signal.clone().multiplyScalar(0.5), tokens.signal, 0.5, 1.2, 0.8)
  );
  coreMeshMat.wireframe = true;
  const coreLattice = new Mesh(coreMeshGeo, coreMeshMat);
  core.add(coreLattice);

  /** Üç halka, ÜÇ FARKLI hız ve eksende döner. */
  const ringGeos = [
    keep(new TorusGeometry(CORE_R * 1.32, 0.17, 5, lite ? 40 : 96)),
    keep(new TorusGeometry(CORE_R * 1.74, 0.12, 5, lite ? 44 : 110)),
    keep(new TorusGeometry(CORE_R * 2.3, 0.09, 4, lite ? 48 : 128)),
  ];
  const ringMat = trackRim(
    rimMaterial(tokens.signal.clone().multiplyScalar(0.3), tokens.signal, 0.92, 1.5, 1.4)
  );
  const rings = ringGeos.map((geometry, index) => {
    const mesh = new Mesh(geometry, ringMat);
    mesh.rotation.set(index * 0.7, index * 1.1, index * 0.35);
    core.add(mesh);
    return mesh;
  });

  /** Bağlam telleri: kabuk köşelerini birbirine bağlayan korelasyon ağı. */
  const corrGeo = keep(new BufferGeometry());
  {
    const pts: Vector3[] = [];
    const shellPos = coreShellGeo.getAttribute("position");
    const stepv = Math.max(1, Math.floor(shellPos.count / (lite ? 26 : 46)));
    for (let i = 0; i < shellPos.count; i += stepv) {
      pts.push(new Vector3(shellPos.getX(i), shellPos.getY(i), shellPos.getZ(i)));
    }
    const verts: number[] = [];
    const orders: number[] = [];
    for (let i = 0; i < pts.length; i += 1) {
      const a = pts[i];
      const b = pts[(i * 7 + 3) % pts.length];
      if (a === undefined || b === undefined) continue;
      verts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      const order = i / pts.length;
      orders.push(order, order);
    }
    corrGeo.setAttribute("position", new Float32BufferAttribute(verts, 3));
    corrGeo.setAttribute("aOrder", new Float32BufferAttribute(orders, 1));
  }
  const corrMat = keep(
    new ShaderMaterial({
      vertexShader: CORR_VERT,
      fragmentShader: CORR_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uColor: { value: tokens.signal.clone() },
        uReveal: { value: 0 },
        uOpacity: { value: 0.55 },
      },
    })
  );
  const corr = new LineSegments(corrGeo, corrMat);
  core.add(corr);

  /** Enerji tepkisi — çekirdek hizalandığında dışa açılan tek halka. */
  const pulseGeo = keep(new RingGeometry(CORE_R * 0.9, CORE_R * 0.99, 96));
  const pulseMat = keep(
    new MeshBasicMaterial({
      color: tokens.signal.clone(),
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
      fog: false,
    })
  );
  const pulse = new Mesh(pulseGeo, pulseMat);
  core.add(pulse);

  // -------------------------------------------------------- karar geçidi

  const gateGroup = new Group();
  gateGroup.position.copy(GATE_POS);
  /*
   * Geçit akış yönüne TAM dönük olduğunda kenarından görünüyor ve kırık bir
   * hilal gibi okunuyordu. Bakış hedefi kamera ile aksiyon arasında bir
   * noktaya alındı: halka açıkça bir DİYAFRAM olarak okunuyor.
   */
  gateGroup.lookAt(ACTION_POS.clone().lerp(new Vector3(-10, 6, 96), 0.62));
  universe.add(gateGroup);

  const gateArcGeo = keep(new TorusGeometry(6.4, 0.26, 6, 72, Math.PI * 0.92));
  const gateMat = trackRim(
    rimMaterial(tokens.decision.clone().multiplyScalar(0.42), tokens.decision, 1, 1.9, 0.75)
  );
  const gateTop = new Mesh(gateArcGeo, gateMat);
  gateGroup.add(gateTop);
  const gateBottom = new Mesh(gateArcGeo, gateMat);
  gateGroup.add(gateBottom);

  const membraneGeo = keep(new PlaneGeometry(9.4, 9.4));
  const membraneMat = keep(
    new ShaderMaterial({
      vertexShader: HAZE_VERT,
      fragmentShader: HAZE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uColor: { value: tokens.decision.clone() },
        uStrength: { value: 0 },
      },
    })
  );
  const membrane = new Mesh(membraneGeo, membraneMat);
  gateGroup.add(membrane);

  // ------------------------------------------------------------- aksiyon

  const actionGroup = new Group();
  actionGroup.position.copy(ACTION_POS);
  actionGroup.lookAt(camera.position);
  universe.add(actionGroup);

  const portalGeo = keep(new TorusGeometry(5.0, 0.6, 4, 6));
  /*
   * Gövde neredeyse siyah, kenar sıcak: aksiyon nesnesi bir ALARM levhası
   * değil, ışık alan koyu bir çerçevedir. (Ölçüldü: düz turuncu yüzey koyu
   * zeminde kırmızıya doyuyor ve oyun arayüzü gibi okunuyordu.)
   */
  const portalMat = trackRim(
    rimMaterial(tokens.decision.clone().multiplyScalar(0.1), tokens.decision, 1, 1.7, 0.95)
  );
  const portal = new Mesh(portalGeo, portalMat);
  actionGroup.add(portal);

  const plateGeo = keep(new PlaneGeometry(6.6, 6.6));
  const plateMat = keep(
    new ShaderMaterial({
      vertexShader: HAZE_VERT,
      fragmentShader: HAZE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uColor: { value: tokens.action.clone() },
        uStrength: { value: 0 },
      },
    })
  );
  const plate = new Mesh(plateGeo, plateMat);
  actionGroup.add(plate);

  /*
   * Dış çember: aksiyonun ONAY halkası. Önceki üçgen 'bıçak' oyun arayüzü
   * gibi okunuyordu; kaldırıldı.
   */
  const bladeGeo = keep(new TorusGeometry(7.8, 0.07, 4, 64));
  const bladeMat = trackRim(
    rimMaterial(tokens.decision.clone().multiplyScalar(0.22), tokens.decision, 0.42, 1.4, 0.9)
  );
  const blade = new Mesh(bladeGeo, bladeMat);
  actionGroup.add(blade);

  // -------------------------------------------------------- geri besleme

  const feedbackCurve = new CatmullRomCurve3(
    [
      ACTION_POS.clone(),
      new Vector3(6, -34, 26),
      new Vector3(-42, -30, -14),
      new Vector3(-50, -8, 2),
      new Vector3(...at(SOURCES, 2, [0, 0, 0])),
    ],
    false,
    "catmullrom",
    0.4
  );
  const feedbackGeo = keep(new TubeGeometry(feedbackCurve, lite ? 40 : 80, 0.11, 4, false));
  const feedbackMat = keep(
    new ShaderMaterial({
      vertexShader: STREAM_VERT,
      fragmentShader: STREAM_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uColor: { value: tokens.decision.clone() },
        uInkColor: { value: tokens.ink.clone() },
        uFog: { value: tokens.base.clone() },
        uTime: { value: 0 },
        uSpeed: { value: 0.1 },
        uReveal: { value: 0 },
        uOpacity: { value: 0.55 },
        uInk: { value: 0 },
        uFlat: { value: 0 },
        uFogDensity: { value: fogDensity.value },
      },
    })
  );
  feedbackGeo.setAttribute(
    "aFlat",
    new Float32BufferAttribute(Float32Array.from(feedbackGeo.getAttribute("position").array), 3)
  );
  const feedback = new Mesh(feedbackGeo, feedbackMat);
  feedback.frustumCulled = false;
  universe.add(feedback);
  const feedbackSamples = sampleCurve(feedbackCurve, 96);

  /*
   * RAY BAĞLANTILARI — atlasın kolon geometrisi.
   *
   * Yalnızca sahne AYDINLIĞA döndüğünde belirir: düzleşen yollar arasına
   * dikey bağlantılar girer ve kompozisyon bir liste ızgarasına oturur.
   */
  const railGeo = keep(new BufferGeometry());
  {
    const verts: number[] = [];
    const half = ((SOURCES.length - 1) / 2) * 8.2;
    for (const x of [-96, -52, -8, 36, 80, 124]) {
      verts.push(x, -half, FLAT_Z, x, half, FLAT_Z);
    }
    railGeo.setAttribute("position", new Float32BufferAttribute(verts, 3));
  }
  const railMat = keep(
    new LineBasicMaterial({ color: tokens.ink.clone(), transparent: true, opacity: 0 })
  );
  const railTicks = new LineSegments(railGeo, railMat);
  universe.add(railTicks);

  // -------------------------------------------------------------- paketler

  const PER_STREAM = lite ? 3 : 5;
  const PACKET_COUNT = SOURCES.length * PER_STREAM + 8;
  const packetGeo = keep(new OctahedronGeometry(0.52, 0));
  const packetMat = keep(
    new MeshBasicMaterial({
      transparent: true,
      opacity: 0.95,
      blending: AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
  );
  const packets = new InstancedMesh(packetGeo, packetMat, PACKET_COUNT);
  packets.instanceMatrix.setUsage(DynamicDrawUsage);
  packets.frustumCulled = false;
  universe.add(packets);

  const dummy = new Object3D();
  const tmp = new Vector3();
  const tmpFlat = new Vector3();
  for (let i = 0; i < PACKET_COUNT; i += 1) {
    const isFeedback = i >= SOURCES.length * PER_STREAM;
    packets.setColorAt(i, isFeedback ? tokens.decision : tokens.signal);
  }
  if (packets.instanceColor !== null) packets.instanceColor.needsUpdate = true;

  /** Karar geçidinden aksiyona giden TEK anlamlı sinyal. */
  const decisionGeo = keep(new OctahedronGeometry(0.95, 0));
  const decisionMat = keep(
    new MeshBasicMaterial({
      color: tokens.decision.clone(),
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
  );
  const decisionDot = new Mesh(decisionGeo, decisionMat);
  universe.add(decisionDot);

  // -------------------------------------------------------- durum + döngü

  const darkBase = tokens.base.clone();
  const lightBase = tokens.light.clone();
  const darkLine = tokens.line.clone();
  const lightLine = new Color(0xd8dde2);
  const scratch = new Color();

  let width = 0;
  let height = 0;
  let offsetX = narrow ? 0 : 10;
  /* Dar ekranda kamera AŞAĞI kayar; çekirdek metnin üstünde kalır. */
  let offsetY = narrow ? -13 : 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let progress = 0;
  let theme = 0;
  let themeApplied = false;
  let inkSwitched = false;
  let running = false;
  let visible = true;
  let frame = 0;
  let ready = false;
  const start = performance.now();
  let lastPulse = -10;

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (w === width && h === height) return;
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Dar ekranda kompozisyon ORTALANIR; metin sahnenin altına iner.
    offsetX = w < 860 ? 0 : lerp(8, 14, clamp01((w - 860) / 700));
    offsetY = w < 860 ? -13 : 0;
    camera.updateProjectionMatrix();
  }

  function readProgress(): number {
    const trackTop = track.getBoundingClientRect().top;
    const endRect = journeyEnd.getBoundingClientRect();
    const total = endRect.bottom - trackTop - window.innerHeight;
    if (total <= 0) return 0;
    return clamp01(-trackTop / total);
  }

  function cameraAt(p: number): void {
    let a: CameraKey = at(CAMERA_PATH, 0, CAMERA_PATH[0] as CameraKey);
    let b: CameraKey = a;
    for (let i = 1; i < CAMERA_PATH.length; i += 1) {
      const next = CAMERA_PATH[i];
      if (next === undefined) break;
      b = next;
      if (p <= next.p) break;
      a = next;
    }
    const t = b.p === a.p ? 0 : span(p, a.p, b.p);
    camera.position.set(
      lerp(a.pos[0], b.pos[0], t) - offsetX + pointerX * 3.2,
      lerp(a.pos[1], b.pos[1], t) + offsetY + pointerY * 2.4,
      lerp(a.pos[2], b.pos[2], t)
    );
    const fovNext = lerp(a.fov, b.fov, t);
    if (Math.abs(camera.fov - fovNext) > 0.01) {
      camera.fov = fovNext;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(
      lerp(a.look[0], b.look[0], t) - offsetX * 0.55 + pointerX * 1.6,
      lerp(a.look[1], b.look[1], t) + offsetY + pointerY * 1.2,
      lerp(a.look[2], b.look[2], t)
    );
  }

  function applyTheme(value: number): void {
    if (themeApplied && Math.abs(value - theme) < 0.002) return;
    themeApplied = true;
    theme = value;
    scratch.copy(darkBase).lerp(lightBase, value);
    renderer.setClearColor(scratch, 1);
    fog.color.copy(scratch);
    fog.density = lerp(0.0062, 0.0016, value);
    fogDensity.value = fog.density;
    gridMat.color.copy(darkLine).lerp(lightLine, value);
    /* Açık zeminde ızgara GERİ çekilir; sahnenin sonunda raylar konuşur. */
    gridMat.opacity = lerp(0.5, 0.3, value);

    for (const material of rimMaterials) {
      (material.uniforms.uFog?.value as Color | undefined)?.copy(scratch);
      const uniform = material.uniforms.uFogDensity;
      if (uniform !== undefined) uniform.value = fog.density;
      const opacity = material.uniforms.uReveal;
      if (opacity !== undefined) opacity.value = 1 - value;
    }

    for (const stream of streams) {
      stream.material.uniforms.uInk!.value = value;
      stream.material.uniforms.uFogDensity!.value = fog.density;
      (stream.material.uniforms.uFog!.value as Color).copy(scratch);
    }
    feedbackMat.uniforms.uInk!.value = value;
    feedbackMat.uniforms.uOpacity!.value = lerp(0.55, 0, value);

    // Katkılı harmanlama AÇIK zeminde iz bırakmaz: eşik geçilince normale döner.
    const wantInk = value > 0.5;
    if (wantInk !== inkSwitched) {
      inkSwitched = wantInk;
      for (const stream of streams) {
        stream.material.blending = wantInk ? NormalBlending : AdditiveBlending;
        stream.material.needsUpdate = true;
      }
    }

    railMat.opacity = 0.16 * value;
    hazeMat.uniforms.uStrength!.value = lerp(hazeMat.uniforms.uStrength!.value as number, 0, value);
    packetMat.opacity = 0.95 * (1 - value);
    decisionMat.opacity = Math.min(decisionMat.opacity, 1 - value);
    corrMat.uniforms.uOpacity!.value = 0.55 * (1 - value);
    options.onTheme(value);
  }

  /** Giriş sekansı ve sürekli hareket — tek yerde. */
  function animate(elapsed: number, p: number): void {
    // --- 0-1 sn: uzak mekân. 1-3 sn: kaynaklar. 3-5 sn: bağlam. 5-6 sn: karar.
    const intro = {
      sources: span(elapsed, 0.7, 2.6),
      flow: span(elapsed, 1.4, 3.4),
      align: span(elapsed, 2.9, 4.9),
      corr: span(elapsed, 3.2, 5.2),
      gate: span(elapsed, 4.8, 6.1),
      action: span(elapsed, 5.6, 7.0),
    };

    for (let i = 0; i < sourceGroups.length; i += 1) {
      const group = sourceGroups[i];
      if (group === undefined) continue;
      const local = span(elapsed, 0.7 + i * 0.26, 2.2 + i * 0.26);
      group.scale.setScalar(0.2 + local * 0.8);
      group.rotation.y = elapsed * (0.12 + i * 0.03);
      group.rotation.x = Math.sin(elapsed * 0.3 + i) * 0.16;
      const child = group.children[1];
      if (child !== undefined) child.rotation.z = elapsed * (0.3 + i * 0.08);
    }

    for (let i = 0; i < streams.length; i += 1) {
      const stream = streams[i];
      if (stream === undefined) continue;
      const reveal = span(elapsed, 1.4 + i * 0.22, 3.2 + i * 0.22);
      stream.material.uniforms.uReveal!.value = reveal;
      stream.material.uniforms.uTime!.value = elapsed;
    }
    feedbackMat.uniforms.uReveal!.value = intro.action;
    feedbackMat.uniforms.uTime!.value = elapsed;

    // Halkalar önce serbest döner, sonra hizalanır; sonra yavaş dönüşe geçer.
    for (let i = 0; i < rings.length; i += 1) {
      const ring = rings[i];
      if (ring === undefined) continue;
      const free = elapsed * (0.5 - i * 0.13);
      const aligned = lerp(free, i * 0.12, intro.align);
      ring.rotation.x = aligned + Math.sin(elapsed * 0.11 + i) * 0.08;
      ring.rotation.y = lerp(elapsed * (0.36 + i * 0.1), Math.PI * 0.5, intro.align * 0.7);
      ring.rotation.z = i * 0.2 + elapsed * (0.04 + i * 0.02);
      ring.scale.setScalar(0.3 + 0.7 * span(elapsed, 0.4 + i * 0.2, 2.4 + i * 0.2));
    }
    coreInner.rotation.set(elapsed * 0.18, elapsed * 0.24, 0);
    coreShell.rotation.set(-elapsed * 0.07, elapsed * 0.11, 0);
    coreLattice.rotation.set(elapsed * 0.05, -elapsed * 0.08, elapsed * 0.02);
    coreInner.scale.setScalar(0.3 + 0.7 * span(elapsed, 0.2, 2.0));
    coreShell.scale.setScalar(0.3 + 0.7 * span(elapsed, 0.4, 2.4));
    coreLattice.scale.setScalar(0.3 + 0.7 * span(elapsed, 0.4, 2.4));
    corrMat.uniforms.uReveal!.value = intro.corr;

    hazeMat.uniforms.uStrength!.value = (0.3 + 0.09 * Math.sin(elapsed * 0.5)) * intro.align;

    // Enerji tepkisi: hizalanma anında, sonra ~7 sn'de bir.
    const since = elapsed - lastPulse;
    if ((intro.align > 0.98 && lastPulse < 0) || since > 7.2) lastPulse = elapsed;
    const pulseT = clamp01((elapsed - lastPulse) / 1.6);
    pulse.scale.setScalar(1 + pulseT * 2.6);
    pulse.lookAt(camera.position);
    pulseMat.opacity = lastPulse < 0 ? 0 : (1 - pulseT) * 0.5;

    // Karar geçidi AÇILIR: kollar ayrılır, zar dolar.
    const open = intro.gate;
    /* Kollar KAPALI başlar (uçları örtüşür), açılırken diyafram gibi ayrılır. */
    gateTop.rotation.z = Math.PI * (0.04 + 0.16 * open);
    gateBottom.rotation.z = Math.PI * (1.04 - 0.16 * open);
    gateGroup.rotation.z = elapsed * 0.06;
    gateGroup.scale.setScalar(0.25 + open * 0.75);
    membraneMat.uniforms.uStrength!.value = open * (0.5 + 0.24 * Math.sin(elapsed * 1.6));

    // Aksiyon nesnesi: sinyal geldiğinde döner ve ışıklanır.
    actionGroup.scale.setScalar(0.2 + intro.action * 0.8);
    portal.rotation.z = elapsed * 0.22;
    blade.rotation.z = -elapsed * 0.16;
    plate.lookAt(camera.position);
    plateMat.uniforms.uStrength!.value =
      intro.action * (0.36 + 0.2 * Math.sin(elapsed * 2.2 - 1.2));

    // Tek karar sinyali: çekirdek -> geçit -> aksiyon.
    const trip = (elapsed - 5.2) / 2.4;
    if (trip > 0) {
      const k = trip % 1;
      tmp.set(0, 0, 0).lerp(GATE_POS, Math.min(k * 2, 1));
      if (k > 0.5) tmp.copy(GATE_POS).lerp(ACTION_POS, (k - 0.5) * 2);
      decisionDot.position.copy(tmp);
      decisionDot.scale.setScalar(0.8 + Math.sin(k * Math.PI) * 0.6);
      decisionMat.opacity = Math.sin(k * Math.PI) * 0.95 * (1 - theme);
    }

    // Paketler: her biri KENDİ yolunda ilerler.
    const flatMix = span(p, 0.7, 0.95);
    let index = 0;
    for (let s = 0; s < streams.length; s += 1) {
      const stream = streams[s];
      if (stream === undefined) continue;
      for (let k = 0; k < PER_STREAM; k += 1) {
        const phase = (elapsed * stream.speed + k / PER_STREAM + s * 0.17) % 1;
        pointAt(stream.curved, phase, tmp);
        pointAt(stream.flat, phase, tmpFlat);
        dummy.position.copy(tmp).lerp(tmpFlat, flatMix);
        const alive = phase < stream.material.uniforms.uReveal!.value;
        const scale = alive ? 0.55 + Math.sin(phase * Math.PI) * 0.85 : 0;
        dummy.scale.setScalar(scale * (1 - theme * 0.85));
        dummy.rotation.set(elapsed * 1.2 + k, elapsed * 0.9, 0);
        dummy.updateMatrix();
        packets.setMatrixAt(index, dummy.matrix);
        index += 1;
      }
    }
    for (let k = 0; k < 8; k += 1) {
      const phase = (elapsed * 0.075 + k / 8) % 1;
      pointAt(feedbackSamples, phase, tmp);
      dummy.position.copy(tmp);
      dummy.scale.setScalar(intro.action * 0.5 * (1 - theme));
      dummy.rotation.set(elapsed * 0.5, elapsed * 0.4, 0);
      dummy.updateMatrix();
      packets.setMatrixAt(index, dummy.matrix);
      index += 1;
    }
    packets.instanceMatrix.needsUpdate = true;

    // Yol düzleşmesi: kamera çekirdekten geçtikten SONRA başlar.
    for (const stream of streams) {
      stream.material.uniforms.uFlat!.value = flatMix;
    }

    // Çekirdek halkaları kameraya doğru BÜYÜR, sonra geride kalır.
    const approach = span(p, 0.36, 0.74);
    core.scale.setScalar(1 + approach * 1.35);
    grid.position.z = lerp(0, -120, span(p, 0.74, 1));
  }

  function draw(): void {
    resize();
    const now = performance.now();
    const elapsed = (now - start) / 1000;
    progress = reducedMotion ? 0 : readProgress();

    pointerX += (targetX - pointerX) * 0.06;
    pointerY += (targetY - pointerY) * 0.06;

    animate(reducedMotion ? 7.4 : elapsed, progress);
    applyTheme(span(progress, 0.8, 0.95));
    cameraAt(progress);

    // Sahne nefes alır: scroll yokken bile kamera ÇOK YAVAŞ süzülür.
    if (!reducedMotion && progress < 0.02) {
      const settle = 1 - span(elapsed, 0, 5.5);
      camera.position.z += settle * 34;
      camera.position.y += settle * 7;
      camera.position.x += Math.sin(elapsed * 0.14) * 2.4;
      camera.position.y += Math.sin(elapsed * 0.19 + 1.1) * 1.3;
    }

    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      options.onReady();
    }
  }

  function loop(): void {
    if (!running) return;
    frame = requestAnimationFrame(loop);
    draw();
  }

  function play(): void {
    if (running || reducedMotion) return;
    running = true;
    frame = requestAnimationFrame(loop);
  }

  function pause(): void {
    running = false;
    if (frame !== 0) cancelAnimationFrame(frame);
    frame = 0;
  }

  // ------------------------------------------------------------ dinleyiciler
  //
  // DİKKAT: burada wheel, touchmove veya scroll ENGELLEYEN hiçbir dinleyici
  // YOKTUR. Scroll tamamen tarayıcınındır; sahne yalnızca konumu OKUR.

  const onPointer = (event: PointerEvent): void => {
    targetX = (event.clientX / window.innerWidth) * 2 - 1;
    targetY = -((event.clientY / window.innerHeight) * 2 - 1);
  };

  const onVisibility = (): void => {
    if (document.hidden) pause();
    else if (visible) play();
  };

  const onContextLost = (event: Event): void => {
    event.preventDefault();
    pause();
    options.onFail();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry === undefined) return;
      visible = entry.isIntersecting;
      if (visible && !document.hidden) play();
      else pause();
    },
    { rootMargin: "120px" }
  );
  observer.observe(track);

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (reducedMotion) draw();
  });
  resizeObserver.observe(canvas);

  if (!coarse) window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onContextLost);

  resize();
  draw();
  if (!reducedMotion) play();

  return {
    dispose(): void {
      pause();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      for (const item of disposables) item.dispose();
      packets.dispose();
      renderer.dispose();
    },
  };
}
