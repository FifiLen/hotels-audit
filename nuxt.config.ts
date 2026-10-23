import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },

  modules: ['@nuxt/image', '@nuxt/fonts'],
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    public: {
      siteUrl: 'https://www.hotelsaudit.com',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pl' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#0e1a2b' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  // Samohostowane przy buildzie. Rodziny podane wprost (global), bo moduł nie widzi tokenów z @theme Tailwinda 4.
  fonts: {
    families: [
      { name: 'Figtree', provider: 'google', global: true },
      { name: 'Geist Mono', provider: 'google', global: true, weights: [400] },
    ],
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
    },
  },

  image: {
    format: ['avif', 'webp'],
    quality: 80,
    // domyślne ekrany zaczynają się od sm – bez xs wpis `xs:…` w sizes byłby po cichu pomijany
    screens: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
  },

  // Pełny SSG: `npm run generate` → .output/public
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
})
