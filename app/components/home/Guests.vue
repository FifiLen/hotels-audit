<script setup lang="ts">
import { guests } from '~/data/home'

// Dla gości: 6 pionowych paneli ze zdjęciami. Od lg aktywny panel rozszerza się (najechanie, fokus, kliknięcie),
// pozostałe są wąskimi paskami z liczbą punktów i pionowym tytułem. Na telefonie poziomy pasek kart przewijany palcem.
const active = ref(0)
</script>

<template>
  <section id="dla-gosci" aria-labelledby="guests-title" data-theme="light" class="py-24 lg:py-36">
    <div class="grid-site gap-y-12 lg:gap-y-16">
      <h2
        id="guests-title"
        v-reveal
        class="col-[2/14] text-[clamp(2.25rem,4.2vw,4rem)] leading-[1.04] font-normal tracking-[-0.035em] text-balance lg:col-[2/11]"
      >
        {{ guests.title }}
      </h2>

      <ul
        v-reveal.stagger
        class="rail col-[2/15] gap-3 pr-5 lg:col-[2/14] lg:h-[min(78svh,46rem)] lg:gap-2 lg:overflow-visible lg:pr-0"
      >
        <li
          v-for="(item, i) in guests.items"
          :key="item.title"
          class="panel relative h-[70svh] max-h-[36rem] w-[82vw] max-w-[24rem] shrink-0 overflow-hidden bg-ink text-white lg:h-auto lg:max-h-none lg:w-auto lg:max-w-none lg:min-w-0 lg:shrink"
          :class="active === i && 'is-active'"
          @mouseenter="active = i"
        >
          <NuxtImg
            :src="item.image.src"
            :alt="item.image.alt"
            format="webp"
            sizes="xs:82vw sm:384px lg:50vw"
            loading="lazy"
            class="panel-img absolute inset-0 size-full object-cover"
          />
          <span class="panel-shade absolute inset-0" aria-hidden="true" />

          <button
            type="button"
            class="absolute inset-0 flex flex-col justify-between p-6 text-left lg:p-8"
            :aria-expanded="active === i"
            @focus="active = i"
            @click="active = i"
          >
            <!-- zwinięty pasek (tylko od lg): liczba u góry, tytuł pionowo u dołu -->
            <span class="panel-collapsed flex h-full flex-col justify-between max-lg:hidden" aria-hidden="true">
              <span class="font-mono text-sm tabular-nums text-white/80">{{ item.points || String(i + 1).padStart(2, '0') }}</span>
              <span class="panel-vertical text-xl leading-tight tracking-[-0.01em] whitespace-nowrap">{{ item.title }}</span>
            </span>

            <!-- rozwinięty panel -->
            <span class="panel-open absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 lg:p-8">
              <span v-if="item.points" class="flex items-baseline gap-3">
                <span class="text-[clamp(2.75rem,4vw,4rem)] leading-none tracking-[-0.04em] text-accent tabular-nums">{{ item.points }}</span>
                <span class="text-sm text-white/70">{{ guests.pointsLabel }}</span>
              </span>
              <span class="text-[clamp(1.5rem,2.2vw,2.25rem)] leading-[1.1] tracking-[-0.02em]">{{ item.title }}</span>
              <span class="max-w-md text-[15px] leading-[1.5] text-white/80 lg:text-base">{{ item.text }}</span>
            </span>
          </button>
        </li>
      </ul>

      <div v-reveal class="col-[2/14] grid gap-8 border-t border-line pt-10 lg:grid-cols-12 lg:gap-5 lg:pt-12">
        <p class="text-[clamp(1.375rem,2.2vw,2rem)] leading-[1.3] tracking-[-0.02em] lg:col-span-8">{{ guests.closing }}</p>
        <a
          :href="guests.cta.href"
          class="group flex items-center justify-between gap-6 self-end justify-self-start rounded-full bg-ink py-3.5 pr-4 pl-6 font-medium text-white lg:col-span-4 lg:justify-self-end"
        >
          {{ guests.cta.label }}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel-shade {
  background: linear-gradient(to top, rgb(14 26 43 / 0.85), rgb(14 26 43 / 0.15) 55%, rgb(14 26 43 / 0.25));
}
.panel-vertical {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

@media (width >= 64rem) {
  /* rozszerzanie: aktywny panel zajmuje ~4 razy więcej miejsca niż pozostałe */
  .panel {
    flex: 1 1 0;
    transition: flex-grow 0.9s var(--ease-out-quint);
  }
  .panel.is-active {
    flex-grow: 4.2;
  }
  .panel-img {
    transform: scale(1.08);
    transition: transform 1.2s var(--ease-out-quint);
  }
  .panel.is-active .panel-img {
    transform: scale(1);
  }
  .panel-shade {
    background: rgb(14 26 43 / 0.62);
    transition: background-color 0.6s ease;
  }
  .panel.is-active .panel-shade {
    background: linear-gradient(to top, rgb(14 26 43 / 0.88), rgb(14 26 43 / 0.1) 60%, rgb(14 26 43 / 0.2));
  }
  .panel-collapsed {
    transition: opacity 0.3s ease;
  }
  .panel.is-active .panel-collapsed {
    opacity: 0;
  }
  /* treść rozwiniętego panelu wchodzi dopiero, gdy panel się poszerzy */
  .panel-open {
    min-width: 26rem;
    opacity: 0;
    transform: translateY(16px);
    transition:
      opacity 0.25s ease,
      transform 0.25s ease;
  }
  .panel.is-active .panel-open {
    opacity: 1;
    transform: none;
    transition:
      opacity 0.6s ease 0.35s,
      transform 0.8s var(--ease-out-quint) 0.35s;
  }
}
</style>
