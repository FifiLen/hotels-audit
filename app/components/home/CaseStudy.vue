<script setup lang="ts">
import { caseStudy } from '~/data/home'

// Case study jako mozaika dużych zdjęć przeplatanych kafelkami z liczbą i cytatem.
// Zdjęcia odsłaniają się od dołu (clip-path) przy wejściu na ekran i lekko przesuwają w kadrze przy przewijaniu.
// Bez JS i przy prefers-reduced-motion wszystko stoi.
const root = ref<HTMLElement | null>(null)
const img = caseStudy.images
let cleanup = () => {}

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !root.value) return
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  gsap.registerPlugin(ScrollTrigger)

  const ctx = gsap.context(() => {
    root.value!.querySelectorAll<HTMLElement>('[data-img]').forEach((block) => {
      const picture = block.querySelector('img')
      const reveal = { trigger: block, start: 'top 88%', toggleActions: 'play none none none' }
      gsap.fromTo(block, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.out', scrollTrigger: reveal })
      if (!picture) return
      gsap.from(picture, { scale: 1.35, duration: 2, ease: 'expo.out', scrollTrigger: reveal })
      gsap.fromTo(
        picture,
        { yPercent: -6 },
        { yPercent: 6, ease: 'none', scrollTrigger: { trigger: block, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    })
  }, root.value)
  cleanup = () => ctx.revert()
})
onBeforeUnmount(() => cleanup())
</script>

<template>
  <section ref="root" :aria-label="caseStudy.label" data-theme="dark" class="bg-ink pt-24 text-white lg:pt-36">
    <div class="grid-site gap-y-12 lg:gap-y-16">
      <h2
        v-reveal
        class="col-[2/14] text-[clamp(2.25rem,4.2vw,4rem)] leading-[1.04] font-normal tracking-[-0.035em] text-balance lg:col-[2/10]"
      >
        {{ caseStudy.title }}
      </h2>
      <p v-reveal class="col-[2/14] text-[17px] text-muted-dark lg:col-[10/14] lg:self-end">{{ caseStudy.intro }}</p>

      <!-- mozaika na wewnętrznej siatce 12 kolumn (zgrywa się z siatką strony) -->
      <div class="col-[2/14] grid grid-cols-12 gap-4 lg:gap-5">
        <figure data-img class="relative col-span-12 m-0 aspect-[4/3] overflow-hidden bg-ink-raised lg:col-span-8 lg:row-span-2 lg:aspect-auto">
          <NuxtImg :src="img.atrium.src" :alt="img.atrium.alt" sizes="xs:100vw lg:66vw" class="absolute inset-0 size-full scale-[1.15] object-cover" />
        </figure>

        <div v-reveal class="col-span-12 flex aspect-[4/3] flex-col justify-between bg-accent p-7 text-ink sm:col-span-6 lg:col-span-4 lg:p-9">
          <span class="text-[clamp(4rem,7.5vw,7rem)] leading-[0.85] font-normal tracking-[-0.05em] tabular-nums">{{ caseStudy.figure }}</span>
          <span class="max-w-[16rem] text-[17px] leading-snug">{{ caseStudy.figureLabel }}</span>
        </div>

        <figure data-img class="relative col-span-12 m-0 aspect-[4/3] overflow-hidden bg-ink-raised sm:col-span-6 lg:col-span-4">
          <NuxtImg :src="img.room.src" :alt="img.room.alt" sizes="xs:100vw sm:50vw lg:33vw" class="absolute inset-0 size-full scale-[1.15] object-cover" />
        </figure>

        <figure data-img class="relative col-span-12 m-0 aspect-[3/4] overflow-hidden bg-ink-raised sm:col-span-6 lg:col-span-4">
          <NuxtImg :src="img.hall.src" :alt="img.hall.alt" sizes="xs:100vw sm:50vw lg:33vw" class="absolute inset-0 size-full scale-[1.15] object-cover" />
        </figure>

        <figure v-reveal class="col-span-12 m-0 flex flex-col justify-between gap-10 bg-ink-raised p-7 sm:col-span-6 lg:col-span-5 lg:p-10">
          <span class="font-display text-7xl leading-none text-accent" aria-hidden="true">„</span>
          <blockquote class="text-[clamp(1.5rem,2.2vw,2.125rem)] leading-[1.25] tracking-[-0.02em]">{{ caseStudy.quote }}</blockquote>
          <figcaption class="flex flex-col gap-0.5 border-t border-line-dark pt-5 text-sm">
            <span class="font-medium">{{ caseStudy.author }}</span>
            <span class="text-muted-dark">{{ caseStudy.role }}</span>
          </figcaption>
        </figure>

        <figure data-img class="relative col-span-12 m-0 aspect-[3/4] overflow-hidden bg-ink-raised lg:col-span-3 lg:aspect-auto">
          <NuxtImg :src="img.restaurant.src" :alt="img.restaurant.alt" sizes="xs:100vw lg:25vw" class="absolute inset-0 size-full scale-[1.15] object-cover" />
        </figure>
      </div>

      <!-- zamknięcie: zdjęcie na całą szerokość ekranu -->
      <figure data-img class="relative col-[1/15] m-0 h-[60svh] overflow-hidden bg-ink-raised lg:h-[85svh]">
        <NuxtImg :src="img.lobby.src" :alt="img.lobby.alt" sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw" class="absolute inset-0 size-full scale-[1.15] object-cover" />
      </figure>
    </div>
  </section>
</template>
