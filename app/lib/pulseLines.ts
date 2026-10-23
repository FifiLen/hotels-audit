// Linie z biegnącymi impulsami (jak ścieżki na makiecie hut8): cienkie rurki z jasną „głową” impulsu
// i gasnącym ogonem. Impulsy liczymy w jednostkach długości, więc na krótkich i długich liniach jadą tak samo szybko.
// uOffset rośnie w JS (płynnie, można odwrócić kierunek), uReveal rysuje linię od początku do końca.
import { Color, type Curve, Float32BufferAttribute, Mesh, ShaderMaterial, TubeGeometry, type Vector3 } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

interface PulseOptions {
  base: string // kolor samej linii
  pulse: string // kolor impulsu
  radius: number
  spacing: number // odstęp między impulsami (jednostki sceny)
  tail?: number // im mniejszy, tym dłuższy ogon impulsu (domyślnie 9)
  closed?: boolean
}

export function createPulseLines(curves: Curve<Vector3>[], opts: PulseOptions) {
  const geometries = curves.map((curve, n) => {
    const length = curve.getLength()
    const g = new TubeGeometry(curve, Math.max(24, Math.round(length * 4)), opts.radius, 6, !!opts.closed)
    const count = g.attributes.position!.count
    g.setAttribute('aLen', new Float32BufferAttribute(new Float32Array(count).fill(length), 1))
    // przesunięcie fazy, żeby impulsy na sąsiednich liniach nie biegły w równym szyku
    g.setAttribute('aPhase', new Float32BufferAttribute(new Float32Array(count).fill((n * 2.37) % opts.spacing), 1))
    return g
  })
  const geometry = mergeGeometries(geometries)!
  geometries.forEach((g) => g.dispose())

  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uBase: { value: new Color(opts.base) },
      uPulse: { value: new Color(opts.pulse) },
      uOpacity: { value: 0 },
      uOffset: { value: 0 },
      uReveal: { value: 0 },
      uSpacing: { value: opts.spacing },
      uTail: { value: opts.tail ?? 9 },
    },
    vertexShader: /* glsl */ `
      attribute float aLen;
      attribute float aPhase;
      varying float vDist;
      varying float vU;
      void main() {
        vU = uv.x;
        vDist = uv.x * aLen + aPhase;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase;
      uniform vec3 uPulse;
      uniform float uOpacity;
      uniform float uOffset;
      uniform float uReveal;
      uniform float uSpacing;
      uniform float uTail;
      varying float vDist;
      varying float vU;
      void main() {
        if (vU > uReveal) discard;
        float p = fract((vDist - uOffset) / uSpacing);
        float pulse = pow(p, uTail); // ostra głowa z przodu, ogon gaśnie do tyłu
        vec3 col = mix(uBase, uPulse, pulse);
        gl_FragColor = vec4(col, uOpacity * mix(0.28, 1.0, pulse));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })

  const mesh = new Mesh(geometry, material)
  mesh.renderOrder = 2
  mesh.frustumCulled = false

  let offset = 0
  return {
    mesh,
    // speed: jednostki/s, znak = kierunek (dodatni: od początku do końca linii)
    update(dt: number, speed: number, opacity: number, reveal: number) {
      offset += dt * speed
      material.uniforms.uOffset!.value = offset
      material.uniforms.uOpacity!.value = opacity
      material.uniforms.uReveal!.value = reveal
      mesh.visible = opacity > 0.001 && reveal > 0.001
    },
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}
