<script setup lang="ts">
import { story } from '~/data/home'
import type { StoryState } from '~/lib/storyScene'

// Certyfikacja jako historia: sekcja ma 700svh, widok jest przyklejony (sticky),
// a postęp scrolla przewija oś czasu GSAP, która steruje sceną 3D i rozdziałami.
// Jednostki osi czasu – fazy sceny i początki rozdziałów:
const PHASES = { reveal: [0, 0.8], lit: [1, 1], areas: [2.2, 3], flaws: [5.5, 0.8], fix: [6.8, 0.8], seal: [8, 1.4] } as const
const CHAPTER_STARTS = [0, 1, 2.2, 5.35, 6.65, 7.9]
const END = 10

const section = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const areaLabel = ref<HTMLElement | null>(null)
const pinLabels = ref<HTMLElement[]>([])
const reportLabel = ref<HTMLElement | null>(null)

const chapter = ref(0)
const areaIndex = ref(-1)
const progress = ref(0)
const reduced = ref(false)
const webgl = ref(true)

// Teksty rozdziałów wygasają i wchodzą w rytm scrolla: stary znika w ostatnich FADE jednostkach rozdziału,
// nowy pojawia się w pierwszych FADE – na granicy oba mają 0, więc nigdy na siebie nie nachodzą.
const FADE = 0.35
const chapterFx = ref(story.chapters.map((_, i) => ({ opacity: i === 0 ? 1 : 0, y: 0 })))
const zakresTop = `${(CHAPTER_STARTS[2]! / END) * 100}%`
const activeArea = computed(() => story.areas[Math.max(0, areaIndex.value)]!)

// wypełnienie odcinka skali: poprzednie pełne, aktywny według postępu w rozdziale, dalsze puste
const segmentFill = (i: number) => {
  if (i < chapter.value) return 1
  if (i > chapter.value) return 0
  const start = CHAPTER_STARTS[i]!
  const end = CHAPTER_STARTS[i + 1] ?? END
  return Math.min(1, Math.max(0, (progress.value * END - start) / (end - start)))
}

let cleanup = () => {}

onMounted(async () => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const state: StoryState = { reveal: 0, lit: 0, areas: 0, flaws: 0, fix: 0, seal: 0 }

  let scene: ReturnType<typeof import('~/lib/storyScene').createStoryScene> | null = null
  try {
    const { createStoryScene } = await import('~/lib/storyScene')
    scene = createStoryScene(canvas.value!, {
      areas: story.areas,
      report: story.report,
      certificate: { ...story.certificate, ...story.seal },
      accent: '#ff6b2c',
      ink: '#0e1a2b',
      base: '#d7dce3',
      lit: '#ffffff',
    })
  } catch {
    webgl.value = false
  }

  const resize = () => {
    if (!scene || !canvas.value) return
    scene.resize(canvas.value.clientWidth, canvas.value.clientHeight)
  }
  const ro = new ResizeObserver(resize)
  if (canvas.value) ro.observe(canvas.value)
  resize()

  // Bez animacji: statyczny widok z kolorami obszarów, rozdziały jeden pod drugim.
  if (reduced.value) {
    Object.assign(state, { reveal: 1, lit: 1, areas: 5 })
    scene?.update(state, 0, 4)
    scene?.render()
    cleanup = () => {
      ro.disconnect()
      scene?.dispose()
    }
    return
  }

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  gsap.registerPlugin(ScrollTrigger)

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
  tl.to(state, { reveal: 1, duration: PHASES.reveal[1], ease: 'power2.out' }, PHASES.reveal[0])
    .to(state, { lit: 1, duration: PHASES.lit[1] }, PHASES.lit[0])
    .to(state, { areas: 5, duration: PHASES.areas[1] }, PHASES.areas[0])
    .to(state, { flaws: 1, duration: PHASES.flaws[1], ease: 'power2.out' }, PHASES.flaws[0])
    .to(state, { fix: 1, duration: PHASES.fix[1], ease: 'power2.inOut' }, PHASES.fix[0])
    .to(state, { seal: 1, duration: PHASES.seal[1], ease: 'power1.inOut' }, PHASES.seal[0])
    .set({}, {}, END)

  const sync = () => {
    const t = tl.time()
    let ch = 0
    CHAPTER_STARTS.forEach((start, i) => {
      if (t >= start) ch = i
    })
    chapter.value = ch
    areaIndex.value = ch === 2 ? Math.min(story.areas.length - 1, Math.floor(state.areas)) : -1
    chapterFx.value = story.chapters.map((_, i) => {
      const start = CHAPTER_STARTS[i]!
      const end = CHAPTER_STARTS[i + 1] ?? Infinity
      const fadeIn = i === 0 ? 1 : Math.min(1, Math.max(0, (t - start) / FADE))
      const fadeOut = Math.min(1, Math.max(0, (end - t) / FADE))
      // wchodzi od dołu, wychodzi do góry
      return { opacity: fadeIn * fadeOut, y: (1 - fadeIn) * 18 - (1 - fadeOut) * 18 }
    })
    progress.value = t / END
  }
  tl.eventCallback('onUpdate', sync)
  sync()

  const trigger = ScrollTrigger.create({
    trigger: section.value,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.2, // dłuższe „doganianie” scrolla = płynniejsze przejścia między fazami
    animation: tl,
  })

  // renderuj tylko, gdy sekcja jest na ekranie
  let visible = false
  const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting), { rootMargin: '100px' })
  if (stage.value) io.observe(stage.value)
  const place = (el: HTMLElement | null | undefined, x: number, y: number, opacity: number) => {
    if (!el) return
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    el.style.opacity = String(opacity)
  }
  const tick = (time: number) => {
    if (!visible || !scene) return
    scene.update(state, time, tl.time())
    scene.render()
    // etykiety przypięte do makiety: nad aktywnym obszarem (Zakres) i nad słupkami do poprawy (Raport)
    const a = scene.areaAnchor(Math.max(0, areaIndex.value))
    place(areaLabel.value, a.x, a.y, a.visible ? chapterFx.value[2]!.opacity : 0)
    const pinsOn = Math.min(1, Math.max(0, (scene.flawLevel() - 0.6) / 0.4))
    scene.pinAnchors().forEach((pin, n) => place(pinLabels.value[n], pin.x, pin.y, pin.visible ? pinsOn : 0))
    const r = scene.reportAnchor()
    place(reportLabel.value, r.x, r.y, r.visible ? r.opacity : 0)
  }
  gsap.ticker.add(tick)

  cleanup = () => {
    gsap.ticker.remove(tick)
    trigger.kill()
    tl.kill()
    io.disconnect()
    ro.disconnect()
    scene?.dispose()
  }
})

onBeforeUnmount(() => cleanup())
</script>

<template>
  <section
    id="certyfikacja"
    ref="section"
    :aria-label="story.label"
    data-theme="light"
    class="relative bg-paper text-ink"
    :class="reduced ? 'py-24 lg:py-38' : 'h-[700svh]'"
  >
    <!-- kotwica „Zakres audytu” wskazuje miejsce w scrollu, gdzie zaczyna się ten rozdział -->
    <span id="zakres" class="absolute left-0 h-px w-px" :style="{ top: reduced ? '0' : zakresTop }" aria-hidden="true" />

    <!-- przyklejony widok: opisy u góry, scena na środku, skala na dole -->
    <div
      ref="stage"
      class="grid-site"
      :class="reduced ? 'gap-y-12' : 'sticky top-0 h-svh grid-rows-[auto_minmax(0,1fr)_auto] gap-y-4 pt-20 pb-6 lg:pt-24 lg:pb-8'"
    >
      <!-- 1. opisy -->
      <div class="col-[2/14] flex flex-col items-center text-center">
        <ol :class="reduced ? 'flex flex-col gap-16' : 'grid w-full max-w-6xl'">
          <li
            v-for="(c, i) in story.chapters"
            :key="c.step"
            class="flex flex-col items-center gap-3 [grid-area:1/1] lg:gap-4"
            :class="!reduced && i !== chapter && 'pointer-events-none'"
            :style="reduced ? undefined : { opacity: chapterFx[i]!.opacity, transform: `translateY(${chapterFx[i]!.y}px)` }"
            :aria-hidden="!reduced && i !== chapter ? 'true' : undefined"
          >
            <p v-if="reduced" class="font-mono text-xs text-muted">{{ String(i + 1).padStart(2, '0') }} · {{ c.step }}</p>
            <h2 class="max-w-3xl text-[clamp(1.625rem,3.2vw,3rem)] leading-[1.04] font-medium tracking-[-0.03em] text-balance">{{ c.title }}</h2>
            <p v-if="c.text" class="max-w-2xl text-[15px] text-muted lg:text-[17px]">{{ c.text }}</p>

            <!-- Zakres: legenda obszarów (aktywny podświetlony razem z wypiętrzeniem w scenie) + opis aktywnego -->
            <template v-if="i === 2">
              <ul class="flex flex-wrap justify-center gap-x-4 gap-y-2 lg:gap-x-5">
                <li
                  v-for="(a, ai) in story.areas"
                  :key="a.name"
                  class="flex items-center gap-2 text-sm transition-opacity duration-300"
                  :class="!reduced && areaIndex !== ai && 'opacity-35'"
                >
                  <span class="size-2.5 shrink-0 ring-1 ring-ink/15" :style="{ background: a.color }" aria-hidden="true" />
                  <span class="max-lg:hidden">{{ a.name }}</span>
                  <span class="font-mono text-xs text-muted tabular-nums">{{ a.points }}</span>
                </li>
              </ul>
              <p v-if="!reduced" class="max-w-xl text-[15px] text-muted lg:text-[17px]">
                <span class="text-ink">{{ activeArea.name }}.</span> {{ activeArea.text }}
              </p>
              <dl v-else class="flex max-w-xl flex-col gap-3 text-left text-[15px]">
                <div v-for="a in story.areas" :key="a.name">
                  <dt class="text-ink">{{ a.name }} · {{ a.points }}</dt>
                  <dd class="text-muted">{{ a.text }}</dd>
                </div>
              </dl>
            </template>

            <a
              v-if="i === story.chapters.length - 1"
              :href="story.link.href"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-3 border-b border-ink py-1.5 font-medium hover:border-accent"
            >
              {{ story.link.label }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
              <span class="sr-only">(otwiera się w nowej karcie)</span>
            </a>
          </li>
        </ol>
      </div>

      <!-- 2. scena na całą szerokość -->
      <div class="relative col-[1/15] min-h-0" :class="reduced && 'h-[60svh]'">
        <canvas v-show="webgl" ref="canvas" class="absolute inset-0 block size-full" aria-hidden="true" />

        <!-- etykiety przypięte do makiety (pozycję i krycie ustawia tick, poza Vue) -->
        <div v-if="!reduced" class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div ref="areaLabel" class="absolute top-0 left-0 opacity-0 will-change-transform">
            <div class="flex -translate-x-1/2 -translate-y-full flex-col items-center">
              <span class="flex items-center gap-2.5 rounded-full bg-white py-2 pr-3.5 pl-3 text-[13px] whitespace-nowrap shadow-[0_8px_30px_rgb(14_26_43/0.14)]">
                <span class="size-2 rounded-full bg-ink" />
                {{ activeArea.name }}
                <span class="font-mono text-xs text-muted tabular-nums">{{ activeArea.points }} pkt</span>
              </span>
              <span class="h-10 w-px bg-ink/35 lg:h-14" />
              <span class="size-1.5 rounded-full bg-ink" />
            </div>
          </div>
          <div ref="reportLabel" class="absolute top-0 left-0 opacity-0 will-change-transform">
            <div class="flex -translate-x-1/2 -translate-y-full flex-col items-center">
              <span class="flex items-center gap-2 rounded-full bg-ink py-1.5 pr-3.5 pl-3 text-xs whitespace-nowrap text-white shadow-[0_8px_30px_rgb(14_26_43/0.2)]">
                <span class="size-2 rounded-full bg-accent" />
                Raport z audytu
              </span>
              <span class="h-8 w-px bg-ink/40" />
            </div>
          </div>
          <div
            v-for="n in 3"
            :key="n"
            ref="pinLabels"
            class="absolute top-0 left-0 opacity-0 will-change-transform"
          >
            <div class="flex -translate-x-1/2 -translate-y-full flex-col items-center">
              <span class="flex items-center gap-2 rounded-full bg-white py-1.5 pr-3 pl-2.5 text-xs whitespace-nowrap shadow-[0_8px_30px_rgb(14_26_43/0.14)]">
                <span class="size-2 rounded-full bg-accent" />
                Do poprawy
              </span>
              <span class="h-6 w-px bg-accent/60" />
            </div>
          </div>
        </div>
      </div>

      <!-- 3. skala: 6 odcinków z nazwami kroków, licznik punktów -->
      <div v-if="!reduced" class="col-[2/14]">
        <ol class="grid grid-cols-6 gap-1.5" aria-hidden="true">
          <li v-for="(c, i) in story.chapters" :key="c.step" class="flex flex-col gap-2.5">
            <span class="h-0.5 overflow-hidden bg-line">
              <span
                class="block h-full origin-left bg-accent transition-transform duration-300"
                :style="{ transform: `scaleX(${segmentFill(i)})` }"
              />
            </span>
            <span
              class="truncate font-mono text-xs transition-colors duration-300 max-lg:hidden"
              :class="i === chapter ? 'text-ink' : 'text-muted'"
            >{{ String(i + 1).padStart(2, '0') }} {{ c.step }}</span>
          </li>
        </ol>
        <p class="mt-2.5 text-center font-mono text-xs lg:hidden" aria-hidden="true">
          {{ String(chapter + 1).padStart(2, '0') }} {{ story.chapters[chapter]!.step }}
        </p>
        <p class="sr-only" aria-live="polite">Krok {{ chapter + 1 }} z {{ story.chapters.length }}: {{ story.chapters[chapter]!.step }}</p>
      </div>
    </div>
  </section>
</template>
