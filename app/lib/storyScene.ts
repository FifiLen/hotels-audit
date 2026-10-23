// Scena 3D dla HomeStory: makieta w stylu „gliny” – 1000 białych sześcianów (= 1000 punktów audytu)
// na białej podstawie, z miękkimi cieniami i oświetleniem z otoczenia. Kamera jedzie torem przez ujęcia rozdziałów.
// Stan (0–1 dla każdej fazy, `areas` 0–5) i czas osi `t` (0–10) przychodzą z GSAP; tu tylko liczymy klatkę.
import {
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DynamicDrawUsage,
  Group,
  HemisphereLight,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  NeutralToneMapping,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  QuadraticBezierCurve3,
  Quaternion,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createPulseLines } from './pulseLines'
import { type CertificatePage, drawCertificate, drawReport, type ReportPage, reportMarkers } from './storyDocs'

export interface StoryState {
  reveal: number // sześciany wyrastają z podstawy
  lit: number // zapalają się kolejne punkty
  areas: number // 0–5: obszar po obszarze wypiętrza się (na granatowo) i przyjmuje swój odcień
  flaws: number // punkty do poprawy wystrzeliwują na pomarańczowo
  fix: number // wracają do normy
  seal: number // kartka raportu leci na środek i obraca się w certyfikat, wokół niej sześciany układają się w spiralę
}

interface Options {
  areas: { name: string; points: number; color: string }[]
  report: Pick<ReportPage, 'brand' | 'title' | 'hotel' | 'scoreLabel' | 'flawsLabel' | 'areasLabel' | 'listTitle'>
  certificate: CertificatePage
  accent: string
  ink: string // kolor wypiętrzonego, aktywnego obszaru
  base: string // sześcian przed zapaleniem
  lit: string
}

const COLS = 40
const ROWS = 25
const N = COLS * ROWS
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const HOLE = 192 // pierwsze „miejsca” spirali zostają puste – w środku leży certyfikat
const PLINTH = 0.5 // grubość podstawy makiety
const FLAW_PINS = [150, 520, 830] // w pobliżu tych indeksów szukamy punktów pod pinezki w raporcie
const FLAW_TOP = 0.28 + 2.8 // wysokość w pełni wysuniętego słupka do poprawy
const REPORT_LINES = 14 // tyle łuków biegnie od słupków do kartki raportu (= wierszy listy na kartce)
const SHEET_W = 6.4 // kartka A4
const SHEET_H = 9.05
const SHEET_FINAL = 1.3 // skala certyfikatu na środku spirali
const PAD_W = 9 // podstawka pod kartkę
const PAD_D = 12

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
// lokalny postęp komórki: kolejne komórki startują z opóźnieniem `order * spread`
const stagger = (p: number, order: number, spread: number) => clamp01((p - order * spread) / (1 - spread))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const easeOut = (t: number) => 1 - (1 - t) ** 3
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
// łagodniejszy start i hamowanie (zerowe przyspieszenie na końcach) – dla ruchów kamery i kartki
const smoother = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * t * (t * (t * 6 - 15) + 10)
}
// odległość kamery zmieniamy w skali logarytmicznej: dojazd z daleka wygląda na ruch ze stałą prędkością
const lerpDist = (a: number, b: number, f: number) => Math.exp(MathUtils.lerp(Math.log(a), Math.log(b), f))

// Ujęcia kamery w jednostkach osi czasu (t 0–10). k = odległość względem kadru całej siatki, tx/tz = punkt, na który patrzy.
// Między ujęciami jedzie gładko (Catmull-Rom), więc nie zatrzymuje się na granicach rozdziałów.
const SHOTS = [
  { t: 0, polar: 66, az: -0.62, k: 0.58, tx: -9, tz: 4 }, // nisko przy narożniku, sześciany wyrastają
  { t: 1.1, polar: 57, az: -0.32, k: 0.92, tx: 0, tz: 0 }, // odjazd: cała makieta
  { t: 2.3, polar: 52, az: -0.12, k: 0.8, tx: 0, tz: 0 }, // zakres (cel śledzi aktywny obszar)
  { t: 5.2, polar: 50, az: 0.18, k: 0.8, tx: 0, tz: 0 },
  { t: 5.8, polar: 43, az: 0.34, k: 0.98, tx: 0, tz: 0 }, // raport: wyżej, żeby było widać słupki
  { t: 7.0, polar: 52, az: 0.1, k: 0.92, tx: 0, tz: 0 }, // wdrożenie
  { t: 8.0, polar: 50, az: 0, k: 0.95, tx: 0, tz: 0 },
  { t: 10, polar: 50, az: 0, k: 0.95, tx: 0, tz: 0 },
] as const
type ShotKey = 'polar' | 'az' | 'k' | 'tx' | 'tz'

function sampleShots(t: number, key: ShotKey) {
  const last = SHOTS.length - 1
  if (t <= SHOTS[0].t) return SHOTS[0][key]
  if (t >= SHOTS[last].t) return SHOTS[last][key]
  let i = 0
  while (SHOTS[i + 1]!.t < t) i++
  const s0 = SHOTS[Math.max(0, i - 1)]!
  const s1 = SHOTS[i]!
  const s2 = SHOTS[i + 1]!
  const s3 = SHOTS[Math.min(last, i + 2)]!
  const dt = s2.t - s1.t
  const u = (t - s1.t) / dt
  // nierówne odstępy: styczne skalowane do długości odcinka
  const m1 = s2.t - s0.t > 0 ? ((s2[key] - s0[key]) / (s2.t - s0.t)) * dt : 0
  const m2 = s3.t - s1.t > 0 ? ((s3[key] - s1[key]) / (s3.t - s1.t)) * dt : 0
  const u2 = u * u
  const u3 = u2 * u
  return (2 * u3 - 3 * u2 + 1) * s1[key] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * s2[key] + (u3 - u2) * m2
}

export function createStoryScene(canvas: HTMLCanvasElement, opts: Options) {
  const small = canvas.clientWidth < 700
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = NeutralToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = env
  scene.environmentIntensity = 0.4
  pmrem.dispose()

  const camera = new PerspectiveCamera(26, 1, 1, 500)
  scene.add(new HemisphereLight(0xffffff, 0xd3dae3, 0.5))
  const sun = new DirectionalLight(0xffffff, 2.7)
  sun.position.set(-20, 36, 18)
  sun.castShadow = true
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048)
  Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 120 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.03
  scene.add(sun)

  const group = new Group()
  scene.add(group)

  // podłoga: tylko cień (przezroczysta), pod spodem prześwituje tło strony
  const floor = new Mesh(new PlaneGeometry(400, 400), new ShadowMaterial({ opacity: 0.16 }))
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -PLINTH
  floor.receiveShadow = true
  scene.add(floor)

  // podstawy makiety: prostokątna pod siatką, okrągła pod pieczęcią
  const plinthMat = new MeshStandardMaterial({ color: '#ffffff', roughness: 0.92, metalness: 0 })
  const plinthRect = new Mesh(new RoundedBoxGeometry(42.6, PLINTH, 27.6, 3, 0.18), plinthMat)
  const plinthDisc = new Mesh(new CylinderGeometry(22.4, 22.4, PLINTH, 128), plinthMat)
  for (const pl of [plinthRect, plinthDisc]) {
    pl.castShadow = true
    pl.receiveShadow = true
    group.add(pl)
  }

  const geometry = new RoundedBoxGeometry(0.8, 1, 0.8, 2, 0.07)
  geometry.translate(0, 0.5, 0) // podstawa na y = 0, skalowanie w górę
  const material = new MeshStandardMaterial({ roughness: 0.6, metalness: 0 })
  const mesh = new InstancedMesh(geometry, material, N)
  mesh.instanceMatrix.setUsage(DynamicDrawUsage)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)

  // dane komórek
  const area = new Uint8Array(N)
  const flaw = new Uint8Array(N)
  const gx = new Float32Array(N)
  const gz = new Float32Array(N)
  const sx = new Float32Array(N)
  const sz = new Float32Array(N)
  let k = 0
  opts.areas.forEach((a, ai) => {
    for (let j = 0; j < a.points && k < N; j++) area[k++] = ai
  })
  for (let i = 0; i < N; i++) {
    gx[i] = (i % COLS) - (COLS - 1) / 2
    gz[i] = Math.floor(i / COLS) - (ROWS - 1) / 2
    const r = 0.62 * Math.sqrt(i + HOLE)
    const th = i * GOLDEN
    sx[i] = r * Math.cos(th)
    sz[i] = r * Math.sin(th)
    // deterministyczny „losowy” wybór ~7% punktów do poprawy
    const h = Math.sin(i * 12.9898) * 43758.5453
    flaw[i] = h - Math.floor(h) < 0.07 ? 1 : 0
  }

  // środki obszarów – cel kamery w „Zakresie” i miejsce etykiety
  const areaCenter = opts.areas.map((_, ai) => {
    let x = 0
    let z = 0
    let n = 0
    for (let i = 0; i < N; i++)
      if (area[i] === ai) {
        x += gx[i]!
        z += gz[i]!
        n++
      }
    return { x: x / Math.max(1, n), z: z / Math.max(1, n) }
  })
  const pins = FLAW_PINS.map((near) => {
    for (let i = near; i < N; i++) if (flaw[i]) return i
    return near
  })

  const cBase = new Color(opts.base)
  const cLit = new Color(opts.lit)
  const cInk = new Color(opts.ink)
  const cAccent = new Color(opts.accent)
  const cAreas = opts.areas.map((a) => new Color(a.color))
  // pieczęć: wewnętrzny pierścień w kolorze akcentu, dalej od bieli do chłodnej szarości
  const cWhite = new Color('#ffffff')
  const cOuter = new Color('#a3aebd')
  const cSeal = Array.from({ length: N }, (_, i) =>
    i < 110 ? cAccent.clone() : cWhite.clone().lerp(cOuter, (i - 110) / (N - 110)),
  )

  // ── Raport: kartka A4 na podstawce obok makiety; łuki z impulsami lądują na znacznikach jej listy ──
  // Na szerokim ekranie podstawka stoi z prawej, na wąskim przed makietą (layoutReport przy resize).
  // W „Certyfikacie” kartka unosi się, leci na środek i obraca – jej rewersem jest certyfikat.
  const padGroup = new Group()
  const padSlab = new Mesh(new RoundedBoxGeometry(PAD_W, PLINTH, PAD_D, 3, 0.15), plinthMat)
  padSlab.position.y = -PLINTH / 2
  padSlab.castShadow = true
  padSlab.receiveShadow = true
  padGroup.add(padSlab)
  group.add(padGroup)

  const flawIdx = Array.from({ length: N }, (_, i) => i).filter((i) => flaw[i])
  const every = Math.max(1, Math.floor(flawIdx.length / REPORT_LINES))
  // wiersze listy idą od tyłu makiety do przodu – tak samo jak łuki, więc się nie krzyżują
  const reportFlaws = flawIdx
    .filter((_, n) => n % every === 0)
    .slice(0, REPORT_LINES)
    .sort((a, b) => gz[a]! - gz[b]! || gx[a]! - gx[b]!)

  const anisotropy = renderer.capabilities.getMaxAnisotropy()
  const pageTexture = (draw: (cv: HTMLCanvasElement) => void) => {
    const cv = document.createElement('canvas')
    draw(cv)
    const tex = new CanvasTexture(cv)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = anisotropy
    return {
      tex,
      redraw: () => {
        draw(cv)
        tex.needsUpdate = true
      },
    }
  }
  const reportData: ReportPage = {
    ...opts.report,
    total: N,
    flaws: flawIdx.length,
    areas: opts.areas.map((a, ai) => ({
      name: a.name,
      points: a.points,
      flaws: flawIdx.filter((i) => area[i] === ai).length,
    })),
    rows: reportFlaws.map((i) => ({ id: i, area: opts.areas[area[i]!]!.name })),
  }
  const reportPage = pageTexture((cv) => drawReport(cv, reportData))
  const certPage = pageTexture((cv) => drawCertificate(cv, opts.certificate))
  // fonty strony mogą dojść po starcie sceny – wtedy rysujemy kartki jeszcze raz
  document.fonts?.ready.then(() => {
    reportPage.redraw()
    certPage.redraw()
  })

  const sheet = new Group() // położenie kartki; leży płasko, góra strony (lokalne +Y) wskazuje −Z świata
  const flipper = new Group() // obrót wokół osi góra–dół strony: awers raport → rewers certyfikat
  const pageGeo = new PlaneGeometry(SHEET_W, SHEET_H)
  const frontMat = new MeshStandardMaterial({ map: reportPage.tex, roughness: 0.85 })
  const backMat = new MeshStandardMaterial({ map: certPage.tex, roughness: 0.85 })
  const front = new Mesh(pageGeo, frontMat)
  const back = new Mesh(pageGeo, backMat)
  front.position.z = 0.004
  back.position.z = -0.004
  back.rotation.y = Math.PI
  for (const pg of [front, back]) {
    pg.castShadow = true
    flipper.add(pg)
  }
  sheet.add(flipper)
  group.add(sheet)
  const sheetCenter = new Vector3(0, 0.7, 0)
  const sheetRest = new Vector3()
  const markers = reportMarkers(REPORT_LINES).map(({ u, v }) => ({ x: (u - 0.5) * SHEET_W, y: (0.5 - v) * SHEET_H }))

  let reportMode: 'side' | 'front' | null = null
  let reportLines: ReturnType<typeof createPulseLines> | null = null
  function layoutReport(next: 'side' | 'front') {
    if (next === reportMode) return
    reportMode = next
    // kartka leży górą strony do tyłu (−Z), więc w obu układach czyta się ją z kamery
    if (next === 'side') padGroup.position.set(21.3 + 1.6 + PAD_W / 2, 0, 0)
    else padGroup.position.set(0, 0, 13.8 + 1.6 + PAD_D / 2)
    sheetRest.set(padGroup.position.x, 0.03, padGroup.position.z)
    const curves = reportFlaws.map((i, n) => {
      const from = new Vector3(gx[i]!, FLAW_TOP + 0.05, gz[i]!)
      const to = new Vector3(sheetRest.x + markers[n]!.x, sheetRest.y + 0.02, sheetRest.z - markers[n]!.y)
      const mid = from.clone().lerp(to, 0.5)
      mid.y = Math.max(from.y, to.y) + 2.5 + from.distanceTo(to) * 0.12
      return new QuadraticBezierCurve3(from, mid, to)
    })
    if (reportLines) {
      group.remove(reportLines.mesh)
      reportLines.dispose()
    }
    reportLines = createPulseLines(curves, { base: opts.ink, pulse: opts.accent, radius: 0.06, spacing: 7 })
    group.add(reportLines.mesh)
  }

  const m = new Matrix4()
  const q = new Quaternion()
  const p = new Vector3()
  const s = new Vector3()
  const c = new Color()
  const v = new Vector3()
  const target = new Vector3()

  let width = 1
  let height = 1
  const areaTop = new Float32Array(opts.areas.length)
  let pinTop = 0
  let padOn = 0
  let reportLabelOn = 0
  let flawLevel = 0
  let lastTime = 0

  function update(st: StoryState, time: number, t: number) {
    const dt = lastTime ? Math.min(0.1, Math.max(0, time - lastTime)) : 0
    lastTime = time
    // Wdrożenie: najpierw łuki zwijają się od raportu do słupków (poprawki wracają do obiektu), potem słupki opadają
    const flawOn = st.flaws * (1 - smooth(0.35, 1, st.fix))
    flawLevel = flawOn
    areaTop.fill(0)
    // spirala powoli krąży wokół certyfikatu (sam certyfikat stoi, żeby dało się go czytać)
    const spin = time * 0.05 * st.seal
    const cs = Math.cos(spin)
    const sn = Math.sin(spin)

    for (let i = 0; i < N; i++) {
      const order = i / N
      const rv = easeOut(stagger(st.reveal, order, 0.6))
      const lt = stagger(st.lit, order, 0.6)
      const a = area[i]!
      const ap = clamp01(st.areas - a)
      // obszar wypiętrza się, gdy jest aktywny, potem opada; fale sąsiednich obszarów zachodzą na siebie
      const rise = Math.sin(Math.PI * clamp01((st.areas - a + 0.2) / 1.4))
      const fl = flaw[i] ? flawOn : 0
      const se = easeInOut(stagger(st.seal, order, 0.45))

      let h = MathUtils.lerp(0.1, 0.28, lt) + rise * 1.7 + fl * 2.8
      h = MathUtils.lerp(h, 0.45, se)
      if (!flaw[i] && h > areaTop[a]!) areaTop[a] = h

      p.set(
        MathUtils.lerp(gx[i]!, sx[i]! * cs - sz[i]! * sn, se),
        Math.sin(Math.PI * se) * 2.5, // łuk w locie do spirali
        MathUtils.lerp(gz[i]!, sx[i]! * sn + sz[i]! * cs, se),
      )
      s.set(Math.max(rv, 0.0001), Math.max(h * rv, 0.0001), Math.max(rv, 0.0001))
      m.compose(p, q, s)
      mesh.setMatrixAt(i, m)

      c.copy(cBase).lerp(cLit, lt)
      if (ap > 0) c.lerp(cAreas[a]!, Math.min(1, ap * 1.6))
      if (rise > 0) c.lerp(cInk, rise * 0.88)
      if (fl > 0) c.lerp(cAccent, fl)
      else if (flawOn > 0) c.lerp(cBase, flawOn * 0.6)
      if (se > 0) c.lerp(cSeal[i]!, se)
      mesh.setColorAt(i, c)
    }
    pinTop = 0.28 + 2.8 * flawOn
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

    // podstawy spłaszczają się do podłogi i z niej wyrastają (podłoga jest przezroczysta, więc nic nie chowa się „pod nią”)
    const seal = easeInOut(clamp01(st.seal))
    const base = easeOut(clamp01(st.reveal * 1.6))
    const rectH = Math.max(0.001, base * (1 - seal))
    plinthRect.scale.set(MathUtils.lerp(0.6, 1, base), rectH, MathUtils.lerp(0.6, 1, base))
    plinthRect.position.y = -PLINTH + (PLINTH * rectH) / 2
    plinthRect.visible = rectH > 0.002
    const discH = Math.max(0.001, seal)
    plinthDisc.scale.y = discH
    plinthDisc.position.y = -PLINTH + (PLINTH * discH) / 2
    plinthDisc.visible = seal > 0.002

    // raport: podstawka wyrasta z podłogi razem ze słupkami, a kartka rozwija się na niej; łuki rysują się od słupków
    // i impulsy płyną do kartki. We „Wdrożeniu” impulsy zawracają, łuki zwijają się do słupków i dopiero te opadają.
    padOn = smooth(0.1, 0.6, st.flaws) * (1 - smooth(0.2, 0.6, st.seal))
    padGroup.scale.y = Math.max(0.001, easeOut(padOn))
    padGroup.position.y = -PLINTH * (1 - padGroup.scale.y)
    padGroup.visible = padOn > 0.002
    const flowDir = 1 - 2 * smooth(0, 0.2, st.fix)
    reportLines?.update(dt, 6 * flowDir, 1 - seal, smooth(0.65, 1, st.flaws) * (1 - smooth(0.08, 0.45, st.fix)))

    // certyfikat: kartka unosi się z podstawki, leci łukiem na środek (przechylona do kamery) i w locie się obraca
    const sheetOn = smooth(0.1, 0.6, st.flaws)
    const fly = smoother(0, 0.6, st.seal)
    const flip = smoother(0.2, 0.75, st.seal)
    sheet.position.set(sheetRest.x, padGroup.position.y + sheetRest.y, sheetRest.z).lerp(sheetCenter, fly)
    sheet.position.y += Math.sin(Math.PI * fly) * 6
    sheet.rotation.set(-Math.PI / 2 + Math.sin(Math.PI * fly) * 0.5, 0, 0)
    const sheetScale = MathUtils.lerp(1, SHEET_FINAL, fly)
    sheet.scale.set(sheetScale, sheetScale * Math.max(0.001, easeOut(sheetOn)), sheetScale)
    flipper.rotation.y = Math.PI * flip
    sheet.visible = sheetOn > 0.002
    reportLabelOn = sheetOn * (1 - smooth(0, 0.15, st.seal))

    // kamera: tor ujęć, w „Zakresie” cel podąża za aktywnym obszarem, na końcu prawie z góry na pieczęć
    const aspect = width / height
    const vFov = MathUtils.degToRad(camera.fov)
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
    const fit = (w: number, hh: number) => Math.max(w / 2 / Math.tan(hFov / 2), hh / 2 / Math.tan(vFov / 2)) + 2

    const areasWeight = smoother(2.2, 2.8, t) * (1 - smoother(5.0, 5.7, t))
    const af = MathUtils.clamp(st.areas - 0.5, 0, opts.areas.length - 1)
    const a0 = areaCenter[Math.floor(af)]!
    const a1 = areaCenter[Math.min(opts.areas.length - 1, Math.floor(af) + 1)]!
    const followZ = MathUtils.lerp(a0.z, a1.z, af - Math.floor(af))

    // w Raporcie i Wdrożeniu kadr obejmuje też płytkę raportu
    const reportWeight = smoother(5.2, 5.9, t) * (1 - smoother(7.3, 8.0, t)) * (1 - seal)
    // na sam koniec kamera dojeżdża do certyfikatu, żeby dało się go przeczytać
    const finalZoom = smoother(8.9, 10, t) * seal
    const polar = MathUtils.lerp(sampleShots(t, 'polar'), MathUtils.lerp(12, 5, finalZoom), seal)
    const az = MathUtils.lerp(sampleShots(t, 'az'), 0, seal)
    // na wąskim ekranie siatka może wychodzić poza boki kadru – inaczej byłaby maleńka
    const narrow = MathUtils.clamp((1.1 - aspect) / 0.6, 0, 1)
    const gridW = MathUtils.lerp(47, 30, narrow)
    const side = reportMode === 'side'
    const dist =
      MathUtils.lerp(
        fit(gridW, 19) * sampleShots(t, 'k'),
        lerpDist(fit(46, 43), fit(SHEET_W * SHEET_FINAL * 2, SHEET_H * SHEET_FINAL * 1.3), finalZoom),
        seal,
      ) *
      (1 + reportWeight * (side ? 0.22 : 0.5))
    target.set(
      sampleShots(t, 'tx') * (1 - seal) + reportWeight * (side ? 10.5 : 0),
      0,
      MathUtils.lerp(sampleShots(t, 'tz'), followZ * 0.7, areasWeight) * (1 - seal) + reportWeight * (side ? 0 : 7),
    )
    // koniec Raportu: gdy łuki dolecą, kamera spokojnie dojeżdża do kartki (prawie z góry),
    // a we Wdrożeniu równie spokojnie wraca do makiety
    const focus = smoother(5.95, 6.6, t) * (1 - smoother(6.8, 7.65, t)) * (1 - seal)
    const focusDist = lerpDist(dist, fit(SHEET_W * 2.6, SHEET_H * 1.25), focus)
    // cel przesuwa się w tempie zoomu, więc kartka równo dojeżdża do środka ekranu (a nie wskakuje na końcu)
    target.lerp(v.set(sheetRest.x, 0, sheetRest.z), 1 - ((1 - focus) * focusDist) / dist)
    camera.position
      .setFromSphericalCoords(
        focusDist,
        MathUtils.degToRad(MathUtils.lerp(polar, 26, focus)),
        MathUtils.lerp(az, 0, focus),
      )
      .add(target)
    camera.lookAt(target)
    group.updateMatrixWorld()
  }

  // pozycja punktu makiety na ekranie (px względem canvasu); visible = przed kamerą i w kadrze
  function project(x: number, y: number, z: number) {
    v.set(x, y, z).applyMatrix4(group.matrixWorld).project(camera)
    return {
      x: (v.x * 0.5 + 0.5) * width,
      y: (-v.y * 0.5 + 0.5) * height,
      visible: v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05,
    }
  }

  function resize(w: number, h: number) {
    width = Math.max(1, w)
    height = Math.max(1, h)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    layoutReport(width / height > 1.25 ? 'side' : 'front')
  }

  return {
    update,
    resize,
    render: () => renderer.render(scene, camera),
    // punkty zaczepienia etykiet HTML: wierzch aktywnego obszaru, wierzch słupków z pinezkami
    areaAnchor: (a: number) => project(areaCenter[a]!.x, areaTop[a]! + 0.3, areaCenter[a]!.z),
    pinAnchors: () => pins.map((i) => project(gx[i]!, pinTop + 0.3, gz[i]!)),
    reportAnchor: () => ({ ...project(sheetRest.x, 0.3, sheetRest.z - SHEET_H / 2 - 1.2), opacity: reportLabelOn }),
    flawLevel: () => flawLevel, // 0–1: na ile wysunięte są słupki do poprawy (pinezki)
    dispose: () => {
      geometry.dispose()
      material.dispose()
      mesh.dispose()
      plinthMat.dispose()
      plinthRect.geometry.dispose()
      plinthDisc.geometry.dispose()
      floor.geometry.dispose()
      padSlab.geometry.dispose()
      pageGeo.dispose()
      frontMat.dispose()
      backMat.dispose()
      reportPage.tex.dispose()
      certPage.tex.dispose()
      reportLines?.dispose()
      env.dispose()
      renderer.dispose()
    },
  }
}
