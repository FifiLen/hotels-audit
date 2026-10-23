<script setup lang="ts">
useSeoMeta({
  title: 'Hotels Audit | Audyty hotelowe',
  description:
    'Zwiększ doświadczenia gości, ratingi i usprawnij funkcjonowanie hotelu z Hotels Audit. Nasz globalny standard poprawia 1000 punktów wpływających na doświadczenia gości, zwiększając lojalność, przychody i ratingi hoteli.',
  ogTitle: 'Hotels Audit | Zwiększ sprzedaż swojego hotelu dzięki certyfikacji',
  ogDescription: 'Globalny standard oparty na audycie 1000 punktów doświadczeń gości.',
  ogType: 'website',
  ogSiteName: 'Hotels Audit',
  twitterCard: 'summary_large_image',
})
const { siteUrl } = useRuntimeConfig().public
useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/` }],
})
</script>

<template>
  <div>
    <AppHeader />
    <main id="main">
      <HomeHero />
      <HomeStory />
      <HomeClients />
      <HomeBenefits />
      <HomeCaseStudy />
      <HomeGuests />
      <HomeHotels />
      <HomeContact />
    </main>
    <AppFooter />
  </div>
</template>
