<script setup lang="ts">
import { hero } from '~/data/home'

// Plakat renderuje się od razu (SSR, LCP); wideo dochodzi w przeglądarce i pokazuje się, gdy faktycznie ruszy.
// Przy prefers-reduced-motion i oszczędzaniu danych zostaje sam plakat.
// Wideo zaczyna się ściągać dopiero po załadowaniu strony (nie konkuruje z plakatem i skryptami)
// i stoi, gdy hero jest poza ekranem (nie dekoduje klatek pod sceną 3D).
const section = ref<HTMLElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
const videoSrc = ref('')
const playing = ref(false)
let io: IntersectionObserver | undefined

onMounted(() => {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || connection?.saveData) return

  const start = () => {
    videoSrc.value = window.innerWidth >= 1024 ? hero.video.large : hero.video.small
    io = new IntersectionObserver(([e]) => {
      const el = video.value
      if (!el) return
      if (e?.isIntersecting) el.play().catch(() => {})
      else el.pause()
    })
    if (section.value) io.observe(section.value)
  }
  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <section id="top" ref="section" aria-labelledby="hero-title" class="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink text-white">
    <NuxtImg
      v-if="hero.image.src"
      :src="hero.image.src"
      :alt="hero.image.alt"
      format="webp"
      :quality="70"
      sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw"
      loading="eager"
      fetchpriority="high"
      class="absolute inset-0 size-full object-cover"
    />
    <video
      v-if="videoSrc"
      ref="video"
      :src="videoSrc"
      class="absolute inset-0 size-full object-cover transition-opacity duration-1000"
      :class="playing ? 'opacity-100' : 'opacity-0'"
      autoplay
      muted
      loop
      playsinline
      disablepictureinpicture
      aria-hidden="true"
      @playing="playing = true"
      @timeupdate="playing = true"
    />
    <div class="absolute inset-0 bg-linear-to-b from-ink/55 via-ink/40 to-ink/85" aria-hidden="true" />

    <!-- Animacje wejścia w czystym CSS (bez JS treść i tak jest widoczna): linia rysuje się od lewej,
         linie nagłówka wyjeżdżają z masek, reszta wjeżdża od dołu. -->
    <div class="relative flex min-h-[100svh] flex-col">
      <div class="h-[34svh] shrink-0 lg:h-[50svh]" aria-hidden="true" />

      <div class="grid-site gap-y-6">
        <span class="hero-line col-[2/14] h-px bg-white/70" aria-hidden="true" />
        <p class="hero-rise col-[2/14] text-[15px] font-medium text-white/85 lg:col-[2/6]" style="--d: 0.5s">
          {{ hero.label }}
        </p>
        <h1
          id="hero-title"
          class="hero-title col-[2/14] text-[clamp(2.25rem,3.6vw,3.75rem)] leading-[1.06] font-normal tracking-[-0.03em] lg:col-[8/14]"
        >
          <span v-for="(line, i) in hero.title" :key="line" class="hero-mask block">
            <span class="block" :style="{ '--d': `${0.55 + i * 0.12}s` }">{{ line }}</span>{{ ' ' }}
          </span>
        </h1>
      </div>

      <div class="min-h-14 flex-1" aria-hidden="true" />

      <div class="grid-site items-end gap-y-8 pb-8 lg:pb-10">
        <div class="hero-rise col-[2/14] flex flex-col gap-3 lg:col-[2/6]" style="--d: 0.9s">
          <p class="text-[15px] font-medium">{{ hero.subtitle }}</p>
          <p class="max-w-[26rem] text-[15px] leading-[1.5] text-white/70">{{ hero.lead }}</p>
        </div>
        <div class="hero-rise col-[2/14] flex items-center justify-between gap-6 lg:col-[10/14] lg:justify-end" style="--d: 1s">
          <span class="flex items-center gap-2.5 text-[13px] text-white/60 max-sm:hidden lg:order-first lg:mr-auto">
            <span class="hero-scroll relative h-7 w-px overflow-hidden bg-white/25" aria-hidden="true" />
            {{ hero.scrollHint }}
          </span>
          <a :href="hero.cta.href" class="shrink-0 rounded-full bg-white px-6 py-3.5 font-medium text-ink hover:bg-accent">
            {{ hero.cta.label }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-line {
  transform-origin: left;
  animation: hero-line 1.6s var(--ease-out-quint) 0.2s both;
}
.hero-mask {
  overflow: hidden;
  padding-bottom: 0.08em; /* ogonki liter (ę, ą, j) nie są ucinane przez maskę */
  margin-bottom: -0.08em;
}
.hero-mask > span {
  animation: hero-mask 1.3s var(--ease-out-quint) var(--d, 0s) both;
}
.hero-rise {
  animation: hero-rise 1.2s var(--ease-out-quint) var(--d, 0s) both;
}
/* kreska w podpowiedzi przewijania: jasny odcinek zjeżdża w dół w pętli */
.hero-scroll::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 40%;
  background: #fff;
  animation: hero-scroll 2s var(--ease-out-quint) 1.6s infinite;
  transform: translateY(-100%);
}

/* poniżej lg nagłówek łamie się naturalnie i wjeżdża w całości (maski po liniach tylko od lg) */
@media (width < 64rem) {
  .hero-mask,
  .hero-mask > span {
    display: inline;
    overflow: visible;
    animation: none;
  }
  .hero-title {
    animation: hero-rise 1.2s var(--ease-out-quint) 0.55s both;
  }
}

@keyframes hero-line {
  from {
    transform: scaleX(0);
  }
}
@keyframes hero-mask {
  from {
    transform: translateY(105%);
  }
}
@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}
@keyframes hero-scroll {
  to {
    transform: translateY(260%);
  }
}
</style>
