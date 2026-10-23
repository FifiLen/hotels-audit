<script setup lang="ts">
import { nav, hero, contact, footer } from '~/data/home'

// Nawigacja w duchu hut8: bez paska z linkami – napis w lewym górnym rogu i przycisk „Menu”,
// który otwiera ciemny panel zjeżdżający z góry (strona pod spodem przygasa, scroll stoi).
const open = ref(false)
const toggle = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const { $lenis } = useNuxtApp()

const links = [...nav, { label: contact.label, href: '#kontakt' }]

function setOpen(value: boolean) {
  open.value = value
  if (value) {
    $lenis?.stop()
    nextTick(() => panel.value?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true }))
  } else {
    $lenis?.start()
  }
}
// zamknięcie po kliknięciu w link: najpierw wznawiamy scroll, przewinięcie do kotwicy robi plugin Lenis
const close = () => setOpen(false)
const closeAndFocus = () => {
  setOpen(false)
  toggle.value?.focus({ preventScroll: true })
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && open.value) closeAndFocus()
}

// Kolor napisu zależy od sekcji pod lewym górnym rogiem: jasna sekcja (data-theme="light") → granatowy, reszta → biały.
const onLight = ref(false)
const checkTheme = () => {
  const el = document.elementsFromPoint(24, 32).find((n) => n.closest('main [data-theme], footer'))
  onLight.value = el?.closest('[data-theme]')?.getAttribute('data-theme') === 'light'
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('scroll', checkTheme, { passive: true })
  checkTheme()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('scroll', checkTheme)
  if (open.value) $lenis?.start()
})
</script>

<template>
  <header>
    <!-- napis: biały na hero i ciemnych sekcjach, granatowy na jasnych (przy otwartym menu zawsze biały) -->
    <p
      class="fixed top-5 left-5 z-50 transition-colors duration-500 lg:top-6 lg:left-6"
      :class="onLight && !open ? 'text-ink' : 'text-white'"
    >
      <a href="#top" class="flip-link group block text-[17px] font-medium" @click="close">
        <span class="flip"><span>Hotels Audit</span><span aria-hidden="true">Hotels Audit</span></span>
      </a>
    </p>

    <button
      ref="toggle"
      type="button"
      class="group fixed top-4 right-4 z-50 flex h-12 items-stretch bg-white text-ink shadow-[0_6px_24px_rgb(14_26_43/0.08)] lg:top-5 lg:right-5"
      :aria-expanded="open"
      aria-controls="site-menu"
      :aria-label="open ? 'Zamknij menu' : 'Otwórz menu'"
      @click="setOpen(!open)"
    >
      <span class="flex items-center px-5 text-[15px] font-medium">
        <span class="flip"><span>{{ open ? 'Zamknij' : 'Menu' }}</span><span aria-hidden="true">{{ open ? 'Zamknij' : 'Menu' }}</span></span>
      </span>
      <span
        class="grid w-12 place-items-center border-l transition-colors duration-300"
        :class="open ? 'border-accent bg-accent text-ink' : 'border-line'"
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path class="transition-transform duration-500 ease-out-quint" :class="open && 'translate-y-[5px] rotate-45'" style="transform-box: fill-box; transform-origin: center" d="M4 7h16" />
          <path class="transition-transform duration-500 ease-out-quint" :class="open && '-translate-y-[5px] -rotate-45'" style="transform-box: fill-box; transform-origin: center" d="M4 17h16" />
        </svg>
      </span>
    </button>

    <!-- przyciemnienie strony pod panelem -->
    <div
      class="fixed inset-0 z-40 bg-ink/35 backdrop-blur-[3px] transition-opacity duration-500"
      :class="open ? 'opacity-100' : 'pointer-events-none opacity-0'"
      aria-hidden="true"
      @click="close"
    />

    <div
      id="site-menu"
      ref="panel"
      class="fixed inset-x-0 top-0 z-40 max-h-svh overflow-y-auto bg-ink text-white transition-transform duration-700 ease-out-quint"
      :class="open ? 'is-open translate-y-0' : '-translate-y-[101%]'"
      :inert="!open"
      data-lenis-prevent
    >
      <div class="grid-site gap-y-12 pt-24 pb-10 lg:pt-28 lg:pb-12">
        <!-- lewa kolumna: sekcje strony -->
        <nav aria-label="Główna nawigacja" class="col-[2/14] flex flex-col justify-between gap-12 lg:col-[2/8]">
          <div class="flex flex-col gap-6">
            <p class="menu-item text-sm text-muted-dark" style="--i: 0">Nawigacja</p>
            <ul class="flex flex-col gap-1">
              <li v-for="(item, i) in links" :key="item.href" class="menu-item" :style="{ '--i': i + 1 }">
                <a
                  :href="item.href"
                  class="flip-link group block text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.08] font-medium tracking-[-0.03em] text-muted-dark transition-colors duration-300 hover:text-white"
                  @click="close"
                >
                  <span class="flip"><span>{{ item.label }}</span><span aria-hidden="true">{{ item.label }}</span></span>
                </a>
              </li>
            </ul>
          </div>
          <ul class="menu-item flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-dark" :style="{ '--i': links.length + 1 }">
            <li v-for="l in footer.links" :key="l.label">
              <a :href="l.href" class="hover:text-white">{{ l.label }}</a>
            </li>
          </ul>
        </nav>

        <!-- prawa kolumna: kontakt -->
        <div class="col-[2/14] flex flex-col gap-8 border-line-dark lg:col-[9/14] lg:border-l lg:pl-10">
          <p class="menu-item text-sm text-muted-dark" style="--i: 1">Porozmawiajmy</p>
          <div class="menu-item flex flex-col gap-5" style="--i: 2">
            <p class="max-w-sm text-[22px] leading-snug tracking-[-0.01em]">{{ contact.lead }}</p>
            <a :href="`mailto:${contact.email}`" class="self-start border-b border-accent py-1 text-lg">{{ contact.email }}</a>
          </div>
          <a
            :href="hero.cta.href"
            class="menu-item group flex items-center justify-between self-start rounded-full bg-accent py-3.5 pr-4 pl-6 font-medium text-ink"
            style="--i: 3"
            @click="close"
          >
            <span class="mr-6">{{ hero.cta.label }}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
          </a>
          <ul class="menu-item grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line-dark pt-6 text-sm" style="--i: 4">
            <li v-for="o in contact.offices" :key="o.city" class="flex flex-col gap-0.5">
              <span class="font-medium">{{ o.city }}</span>
              <span class="text-muted-dark">{{ o.region }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* napis „przewraca się” w górę na swoją kopię (jak w hut8) */
.flip {
  display: inline-grid;
  overflow: hidden;
  vertical-align: top;
}
.flip > span {
  grid-area: 1 / 1;
  transition: transform 0.55s var(--ease-out-quint);
}
.flip > span + span {
  transform: translateY(105%);
}
.group:hover .flip > span:first-child,
.group:focus-visible .flip > span:first-child {
  transform: translateY(-105%);
}
.group:hover .flip > span + span,
.group:focus-visible .flip > span + span {
  transform: translateY(0);
}

/* elementy panelu wjeżdżają kolejno po otwarciu; przy zamknięciu znikają od razu */
.menu-item {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.is-open .menu-item {
  opacity: 1;
  transform: none;
  transition:
    opacity 0.7s var(--ease-out-quint),
    transform 0.9s var(--ease-out-quint);
  transition-delay: calc(0.25s + var(--i, 0) * 0.06s);
}

@media (prefers-reduced-motion: reduce) {
  .flip > span + span {
    display: none;
  }
  .menu-item {
    transform: none;
  }
}
</style>
