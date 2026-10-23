<script setup lang="ts">
import { hotels } from '~/data/home'

// Wyszukiwarka certyfikowanych hoteli: duże pole, filtry krajów i siatka kart, która płynnie się przestawia.
// Szuka po nazwie, mieście i kraju, ignoruje wielkość liter i polskie znaki („krakow” znajdzie „Kraków”).
const query = ref('')
const country = ref('')
const input = ref<HTMLInputElement | null>(null)

const normalize = (v: string) =>
  v.toLocaleLowerCase('pl').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l')

const countries = computed(() => {
  const counts = new Map<string, number>()
  hotels.items.forEach((h) => counts.set(h.country, (counts.get(h.country) ?? 0) + 1))
  return [...counts].map(([name, n]) => ({ name, n }))
})

const results = computed(() => {
  const q = normalize(query.value.trim())
  return hotels.items.filter(
    (h) => (!country.value || h.country === country.value) && (!q || normalize(`${h.name} ${h.city} ${h.country}`).includes(q)),
  )
})

// polska odmiana: 1 hotel, 2–4 hotele (poza 12–14), 5+ hoteli
const countLabel = computed(() => {
  const n = results.value.length
  const form = n === 1 ? 'one' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'few' : 'many'
  return hotels.count[form].replace('%n', String(n))
})

// fragmenty tekstu z wyróżnionym dopasowaniem (normalizacja nie zmienia długości polskich liter, więc indeksy się zgadzają)
const parts = (text: string) => {
  const q = normalize(query.value.trim())
  const at = q ? normalize(text).indexOf(q) : -1
  if (at < 0) return [{ t: text, hit: false }]
  return [
    { t: text.slice(0, at), hit: false },
    { t: text.slice(at, at + q.length), hit: true },
    { t: text.slice(at + q.length), hit: false },
  ].filter((p) => p.t)
}

const emptyText = computed(() => hotels.empty.replace('%q', query.value.trim() || country.value))

const reset = () => {
  query.value = ''
  country.value = ''
  input.value?.focus()
}

// „/” w dowolnym miejscu strony przenosi do pola wyszukiwania
const onKey = (e: KeyboardEvent) => {
  const el = e.target as HTMLElement
  if (e.key !== '/' || el.closest('input, textarea, select, [contenteditable]')) return
  e.preventDefault()
  input.value?.focus()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <section id="hotele" aria-labelledby="hotels-title" data-theme="light" class="py-24 lg:py-36">
    <div class="grid-site gap-y-10 lg:gap-y-14">
      <h2
        id="hotels-title"
        v-reveal
        class="col-[2/14] text-[clamp(2.25rem,4.2vw,4rem)] leading-[1.04] font-normal tracking-[-0.035em] text-balance lg:col-[2/10]"
      >
        {{ hotels.title }}
      </h2>
      <p v-reveal class="col-[2/14] text-[17px] text-muted lg:col-[10/14] lg:self-end">{{ hotels.text }}</p>

      <!-- pole wyszukiwania + filtry krajów -->
      <form v-reveal role="search" class="col-[2/14] flex flex-col gap-6" @submit.prevent="input?.blur()">
        <label for="hotel-search" class="sr-only">{{ hotels.searchLabel }}</label>
        <div class="flex items-center gap-4 border-b-2 border-ink transition-colors duration-300 focus-within:border-accent">
          <svg class="size-7 shrink-0 lg:size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input
            id="hotel-search"
            ref="input"
            v-model="query"
            type="search"
            autocomplete="off"
            :placeholder="hotels.searchPlaceholder"
            aria-controls="hotel-results"
            class="min-w-0 flex-1 bg-transparent py-4 text-[clamp(1.375rem,3.4vw,3.25rem)] tracking-[-0.03em] placeholder:text-ink/25 focus:outline-none lg:py-5 [&::-webkit-search-cancel-button]:hidden"
          />
          <span class="font-mono text-sm whitespace-nowrap text-muted tabular-nums" aria-live="polite">{{ countLabel }}</span>
          <button
            v-if="query || country"
            type="button"
            class="grid size-10 shrink-0 place-items-center rounded-full border border-line transition-colors hover:border-ink"
            :aria-label="hotels.reset"
            @click="reset"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <kbd v-else class="hidden rounded border border-line px-2 py-0.5 font-mono text-xs text-muted lg:block" aria-hidden="true">/</kbd>
        </div>

        <div class="flex flex-wrap gap-2" role="group" :aria-label="hotels.searchLabel">
          <button
            v-for="c in [{ name: '', n: hotels.items.length }, ...countries]"
            :key="c.name || 'all'"
            type="button"
            class="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-300"
            :class="country === c.name ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink'"
            :aria-pressed="country === c.name"
            @click="country = c.name"
          >
            {{ c.name || hotels.allLabel }}
            <span class="font-mono text-xs tabular-nums" :class="country === c.name ? 'text-white/60' : 'text-muted'">{{ c.n }}</span>
          </button>
        </div>
      </form>

      <!-- wyniki -->
      <div id="hotel-results" class="col-[2/14]">
        <TransitionGroup v-if="results.length" tag="ul" name="hotel" class="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          <li v-for="h in results" :key="h.name">
            <article class="group flex flex-col gap-4">
              <figure class="relative m-0 aspect-[4/5] overflow-hidden bg-placeholder">
                <NuxtImg
                  :src="h.image.src"
                  :alt="h.image.alt"
                  format="webp"
                  sizes="xs:100vw sm:50vw lg:25vw"
                  loading="lazy"
                  class="absolute inset-0 size-full object-cover transition-transform duration-1000 ease-out-quint group-hover:scale-105"
                />
                <span class="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur-sm">
                  <span class="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                  {{ hotels.badge }}
                </span>
              </figure>
              <div class="flex items-start justify-between gap-4">
                <div class="flex flex-col gap-1">
                  <h3 class="text-xl leading-tight tracking-[-0.015em]">
                    <template v-for="(p, i) in parts(h.name)" :key="i"><mark v-if="p.hit" class="bg-transparent text-accent">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template>
                  </h3>
                  <p class="text-sm text-muted">
                    <template v-for="(p, i) in parts(`${h.city}, ${h.country}`)" :key="i"><mark v-if="p.hit" class="bg-transparent text-accent">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template>
                  </p>
                </div>
                <span class="pt-1 font-mono text-xs whitespace-nowrap text-muted tabular-nums">{{ h.rooms }} {{ hotels.roomsLabel }}</span>
              </div>
              <ul class="flex flex-wrap gap-1.5" :aria-label="h.type">
                <li class="rounded-full bg-ink px-2.5 py-1 text-xs text-white">{{ h.type }}</li>
                <li v-for="t in h.tags" :key="t" class="rounded-full border border-line px-2.5 py-1 text-xs text-muted">{{ t }}</li>
              </ul>
            </article>
          </li>
        </TransitionGroup>

        <div v-else class="flex min-h-[18rem] flex-col items-start justify-center gap-5 border-t border-line pt-10">
          <p class="max-w-2xl text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.2] tracking-[-0.02em]">{{ emptyText }}</p>
          <p class="text-muted">{{ hotels.emptyHint }}</p>
          <button type="button" class="mt-2 rounded-full bg-ink px-6 py-3.5 font-medium text-white hover:bg-ink-raised" @click="reset">
            {{ hotels.reset }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* filtrowanie: nowe karty wjeżdżają, pozostałe płynnie przesuwają się na nowe miejsca, usuwane znikają od razu */
.hotel-enter-active {
  transition:
    opacity 0.6s ease,
    transform 0.8s var(--ease-out-quint);
}
.hotel-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.98);
}
.hotel-move {
  transition: transform 0.7s var(--ease-out-quint);
}
.hotel-leave-active {
  display: none;
}
</style>
