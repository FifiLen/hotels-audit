<script setup lang="ts">
import { clients } from '~/data/home'

// Wyrównanie optyczne: każde logo ma podobną powierzchnię, więc szerokie są niższe, a zwarte wyższe.
const AREA = 4400 // px²
const logos = clients.logos.map((logo) => {
  const height = Math.round(Math.sqrt(AREA / (logo.w / logo.h)))
  return { ...logo, height, width: Math.round((height * logo.w) / logo.h) }
})
</script>

<template>
  <!-- ciemny blok pod historią certyfikacji: duży nagłówek i białe loga (czarne pliki odwrócone filtrem) -->
  <section aria-labelledby="clients-title" data-theme="dark" class="bg-ink py-24 text-white lg:py-36">
    <div class="grid-site gap-y-14 lg:gap-y-20">
      <div v-reveal.stagger class="col-[2/14] flex flex-col gap-4 lg:col-[2/10]">
        <h2 id="clients-title" class="text-h2 font-medium">{{ clients.title }}</h2>
        <p class="text-[17px] text-muted-dark">{{ clients.label }}</p>
      </div>

      <!-- Od lg jeden rząd na całą szerokość. Niżej przesuwający się pasek (lista zdublowana, druga kopia ukryta przed czytnikami). -->
      <div v-reveal class="marquee-wrap col-[1/15] overflow-hidden lg:col-[2/14] lg:overflow-visible">
        <div class="marquee flex w-max lg:w-auto">
          <ul
            v-for="copy in 2"
            :key="copy"
            class="flex shrink-0 items-center gap-14 pr-14 lg:w-full lg:justify-between lg:gap-6 lg:pr-0"
            :class="copy === 2 && 'lg:hidden'"
            :aria-hidden="copy === 2 ? 'true' : undefined"
          >
            <li v-for="logo in logos" :key="logo.name" class="shrink-0">
              <NuxtImg
                :src="logo.src"
                :alt="copy === 1 ? logo.name : ''"
                :width="logo.width"
                :height="logo.height"
                densities="x1 x2"
                class="block opacity-85 brightness-0 invert"
                :style="{ width: `${logo.width}px`, height: `${logo.height}px` }"
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.marquee {
  animation: marquee 40s linear infinite;
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

@media (width >= 64rem) {
  .marquee {
    animation: none;
  }
}

/* Bez animacji pasek da się przewinąć palcem. */
@media (prefers-reduced-motion: reduce) and (width < 64rem) {
  .marquee-wrap {
    overflow-x: auto;
    scrollbar-width: none;
  }
}
</style>
