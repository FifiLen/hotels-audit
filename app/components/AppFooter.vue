<script setup lang="ts">
import { nav, hero, contact, footer } from '~/data/home'

// Stopka: hasło z CTA, kolumny (nawigacja, biura z lokalnym czasem, linki) i gigantyczny napis na dole,
// którego litery wyjeżdżają po kolei, gdy stopka wchodzi na ekran.
const links = [...nav, { label: contact.label, href: '#kontakt' }]
const letters = [...footer.wordmark]

// zegary biur – tylko w przeglądarce (bez rozjazdu godzin między SSR a hydracją)
const now = ref<Date | null>(null)
const time = (tz: string) =>
  now.value ? new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(now.value) : '--:--'

const mark = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setInterval> | undefined
let cleanup = () => {}

onMounted(async () => {
  now.value = new Date()
  timer = setInterval(() => (now.value = new Date()), 15_000)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !mark.value) return
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  gsap.registerPlugin(ScrollTrigger)
  const tween = gsap.from(mark.value.querySelectorAll('[data-letter]'), {
    yPercent: 110,
    duration: 1.4,
    ease: 'expo.out',
    stagger: 0.045,
    scrollTrigger: { trigger: mark.value, start: 'top 95%', toggleActions: 'play none none none' },
  })
  cleanup = () => {
    tween.scrollTrigger?.kill()
    tween.kill()
  }
})
onBeforeUnmount(() => {
  clearInterval(timer)
  cleanup()
})
</script>

<template>
  <footer data-theme="dark" class="overflow-hidden bg-ink pt-20 text-white lg:pt-28">
    <div class="grid-site gap-y-14 lg:gap-y-20">
      <!-- hasło i CTA -->
      <div v-reveal class="col-[2/14] flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <p class="max-w-3xl text-[clamp(2.25rem,4.6vw,4.5rem)] leading-[1.02] font-normal tracking-[-0.035em] text-balance">
          {{ footer.statement }}
        </p>
        <div class="flex shrink-0 flex-col items-start gap-5 lg:items-end">
          <a
            :href="hero.cta.href"
            class="group flex items-center gap-6 rounded-full bg-accent py-3.5 pr-4 pl-6 font-medium text-ink"
          >
            {{ hero.cta.label }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
          </a>
          <a :href="`mailto:${contact.email}`" class="border-b border-white/30 py-1 text-lg hover:border-accent">{{ contact.email }}</a>
        </div>
      </div>

      <!-- kolumny -->
      <div v-reveal.stagger class="col-[2/14] grid grid-cols-2 gap-x-5 gap-y-12 border-t border-line-dark pt-10 lg:grid-cols-12 lg:pt-12">
        <nav :aria-label="footer.navLabel" class="col-span-1 flex flex-col gap-4 lg:col-span-3">
          <p class="text-sm text-muted-dark">{{ footer.navLabel }}</p>
          <ul class="flex flex-col gap-2">
            <li v-for="l in links" :key="l.href">
              <a :href="l.href" class="text-[17px] transition-colors hover:text-accent">{{ l.label }}</a>
            </li>
          </ul>
        </nav>

        <div class="col-span-2 flex flex-col gap-4 max-lg:order-last lg:col-span-6">
          <p class="text-sm text-muted-dark">{{ footer.officesLabel }}</p>
          <ul class="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
            <li v-for="o in contact.offices" :key="o.city" class="flex flex-col gap-1">
              <span class="flex items-baseline justify-between gap-3">
                <span class="text-[17px] font-medium">{{ o.city }}</span>
                <span class="flex items-center gap-1.5 font-mono text-xs text-muted-dark tabular-nums">
                  <span class="pulse size-1.5 rounded-full bg-accent" aria-hidden="true" />
                  {{ time(o.tz) }}
                </span>
              </span>
              <span class="text-sm text-muted-dark">{{ o.address }}</span>
              <span class="text-xs text-muted-dark/70">{{ o.region }}</span>
            </li>
          </ul>
        </div>

        <div class="col-span-1 flex flex-col justify-between gap-8 lg:col-span-3 lg:items-end lg:text-right">
          <div class="flex flex-col gap-4 lg:items-end">
            <p class="text-sm text-muted-dark">{{ footer.linksLabel }}</p>
            <ul class="flex flex-col gap-2 lg:items-end">
              <li v-for="l in footer.links" :key="l.label">
                <a :href="l.href" class="text-[17px] transition-colors hover:text-accent">{{ l.label }}</a>
              </li>
            </ul>
          </div>
          <a href="#top" class="group flex items-center gap-3 self-start text-sm lg:self-end">
            <span class="grid size-11 place-items-center rounded-full border border-line-dark transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" aria-hidden="true"><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></svg>
            </span>
            {{ footer.toTop }}
          </a>
        </div>
      </div>

      <div class="col-[2/14] flex flex-wrap justify-between gap-x-6 gap-y-2 text-sm text-muted-dark">
        <span>{{ footer.copyright }}</span>
        <span class="font-mono text-xs">{{ hero.label }}</span>
      </div>
    </div>

    <!-- gigantyczny napis, ucięty dolną krawędzią -->
    <p
      ref="mark"
      aria-hidden="true"
      class="mt-10 -mb-[0.16em] overflow-hidden text-center text-[clamp(4.5rem,17.4vw,26rem)] leading-[0.9] font-medium tracking-[-0.055em] whitespace-nowrap select-none lg:mt-16"
    >
      <span v-for="(ch, i) in letters" :key="i" data-letter class="inline-block" :class="ch === ' ' && 'w-[0.22em]'">{{ ch }}</span>
    </p>
  </footer>
</template>

<style scoped>
.pulse {
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  50% {
    opacity: 0.25;
  }
}
</style>
