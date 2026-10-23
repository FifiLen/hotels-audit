<script setup lang="ts">
import { benefits } from '~/data/home'

// Korzyści w duchu hut8: bez zdjęć, duża typografia i cienkie linie. Przy przewijaniu linia każdego wiersza
// rysuje się od lewej, a treść wiersza wjeżdża za nią. Bez JS i przy prefers-reduced-motion wszystko stoi.
const list = ref<HTMLElement | null>(null)
let cleanup = () => {}

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !list.value) return
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  gsap.registerPlugin(ScrollTrigger)

  const tweens = [...list.value.querySelectorAll<HTMLElement>('[data-row]')].map((row) =>
    gsap
      .timeline({ scrollTrigger: { trigger: row, start: 'top 88%', toggleActions: 'play none none none' } })
      .from(row.querySelector('[data-line]'), { scaleX: 0, duration: 1.4, ease: 'expo.out' })
      .from(
        row.querySelectorAll('[data-anim]'),
        { y: 36, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, clearProps: 'transform,opacity,visibility' },
        0.15,
      ),
  )
  cleanup = () => tweens.forEach((tl) => (tl.scrollTrigger?.kill(), tl.kill()))
})
onBeforeUnmount(() => cleanup())
</script>

<template>
  <section id="korzysci" aria-labelledby="benefits-title" data-theme="light" class="py-24 lg:py-38">
    <div class="grid-site gap-y-16 lg:gap-y-24">
      <div v-reveal.stagger class="col-[2/14] flex flex-col gap-7 lg:col-[2/12]">
        <h2 id="benefits-title" class="text-[clamp(2.5rem,4.6vw,4.5rem)] leading-[1.02] font-normal tracking-[-0.035em] text-balance">
          {{ benefits.title }}
        </h2>
      </div>

      <!-- wiersze na wewnętrznej siatce 12 kolumn – zgrywa się z siatką strony -->
      <ol ref="list" class="col-[2/14] flex flex-col">
        <li
          v-for="(item, i) in benefits.items"
          :key="item.title"
          data-row
          class="group relative grid grid-cols-12 gap-x-5 gap-y-5 py-9 lg:py-12"
        >
          <span data-line class="absolute inset-x-0 top-0 h-px origin-left bg-ink/15" aria-hidden="true" />
          <span
            data-anim
            class="col-span-12 font-mono text-sm text-muted tabular-nums transition-colors duration-300 group-hover:text-accent lg:col-span-1 lg:pt-3"
          >
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <h3
            data-anim
            class="col-span-12 text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.08] font-normal tracking-[-0.025em] transition-transform duration-500 ease-out-quint group-hover:translate-x-2 lg:col-span-4"
          >
            {{ item.title }}
          </h3>
          <p data-anim class="col-span-12 text-[17px] text-muted md:col-span-8 lg:col-span-4 lg:col-start-7 lg:pt-2">
            {{ item.text }}
          </p>
          <p data-anim class="col-span-12 flex flex-col gap-1 md:col-span-4 md:items-end md:text-right lg:col-span-2 lg:pt-1">
            <span class="text-[clamp(1.5rem,2.2vw,2.25rem)] leading-none tracking-[-0.03em] text-accent tabular-nums whitespace-nowrap">
              {{ item.highlight.value }}
            </span>
            <span class="text-sm text-muted">{{ item.highlight.label }}</span>
          </p>
        </li>
        <li class="h-px bg-ink/15" aria-hidden="true" />
      </ol>
    </div>
  </section>
</template>
