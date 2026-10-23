<script setup lang="ts">
// `sizes` zawsze z prefiksem (xs:…, ekran xs dopisany w nuxt.config) – w @nuxt/image v2 goła wartość trafia na ekran 1 px.
// Zdjęcie bez zaokrągleń. Bez `src` renderuje placeholder z opisem kadru,
// żeby układ dało się oceniać zanim przyjdą zdjęcia.
const props = withDefaults(
  defineProps<{
    src?: string
    alt: string
    hint?: string
    tone?: 'light' | 'dark'
    sizes?: string
    eager?: boolean
  }>(),
  { tone: 'light', sizes: 'xs:100vw lg:60vw', eager: false },
)
</script>

<template>
  <div class="relative overflow-hidden" :class="props.tone === 'dark' ? 'bg-ink-raised' : 'bg-placeholder'">
    <NuxtImg
      v-if="props.src"
      :src="props.src"
      :alt="props.alt"
      :sizes="props.sizes"
      :loading="props.eager ? 'eager' : 'lazy'"
      :fetchpriority="props.eager ? 'high' : 'auto'"
      class="absolute inset-0 size-full object-cover"
    />
    <div
      v-else
      role="img"
      :aria-label="props.alt"
      class="absolute inset-0 flex items-end p-4 text-xs"
      :class="props.tone === 'dark' ? 'text-muted-dark' : 'text-[#3b414b]'"
    >
      <span>Zdjęcie: {{ props.hint ?? props.alt }}</span>
    </div>
    <slot />
  </div>
</template>
