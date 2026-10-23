# Hotels Audit – nowa strona (Nuxt 4, SSG)

Statyczna strona hotelsaudit.com: Nuxt 4 + Tailwind CSS 4, pełny prerender, zero backendu.
Fonty obsługuje `@nuxt/fonts`: pliki są pobierane przy buildzie i serwowane z naszej domeny (bez zapytań do Google w runtime).
Role: `--font-sans` (tekst), `--font-display` (h1–h3, duże liczby, `font-display`), `--font-mono`.

Wymagany Node ≥ 22.22.3.

## Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run generate   # statyczny build → .output/public
npx serve .output/public
```

## Struktura

```
app/
  assets/css/main.css      tokeny (kolory, skala typografii), siatka 12 kolumn, baza
  data/home.ts             CAŁA treść strony głównej (PL) – tu edytujesz teksty i zdjęcia
  components/
    AppHeader.vue          nawigacja + menu mobilne
    AppFooter.vue
    home/*.vue             sekcje strony głównej (HomeHero, HomeStory, …)
    ui/*.vue               klocki: UiImage
  composables/
  lib/storyScene.ts        scena three.js dla HomeStory (1000 sześcianów = 1000 punktów audytu)
  pages/index.vue          strona główna + SEO
```

## Siatka

`grid-site` to 12 kolumn treści na całą szerokość ekranu (odstęp 20 px od `lg`) i zawsze 20 px od krawędzi ekranu.
Linie siatki: `1` lewa krawędź ekranu · `2–13` kolumny · `14` koniec treści · `15` prawa krawędź.

- treść w kolumnach 1–4: `col-[2/6]`
- element wychodzący za prawą krawędź od kolumny 5: `col-[6/15]`
- element od lewej krawędzi do kolumny 7: `col-[1/9]`

Mobile-first: domyślnie `col-[2/14]`, układ kolumnowy od `lg:`.

## Historia certyfikacji (HomeStory)

Certyfikacja, zakres audytu i proces to jedna sekcja przewijana scrollem: widok jest przyklejony, a GSAP ScrollTrigger
przewija oś czasu (fazy w `PHASES`, rozdziały w `CHAPTER_STARTS` w `Story.vue`). Scena three.js ładuje się dopiero w przeglądarce.
Przy `prefers-reduced-motion` rozdziały stoją jeden pod drugim, a scena pokazuje statyczny stan.

## Zdjęcia

Wrzuć pliki do `public/images/` i ustaw `src` w `app/data/home.ts`, np. `src: '/images/hotel.jpg'`. Wideo w hero: `public/video/` + `hero.video` w `home.ts`.
Bez `src` komponent `UiImage` pokazuje placeholder z opisem kadru. Optymalizacja (AVIF/WebP, srcset) przez `@nuxt/image`.

## Formularz kontaktowy

Przygotowany pod Netlify Forms (`data-netlify`, honeypot). Na innym hostingu zmień endpoint w `HomeContact.vue`.

## Wyszukiwarka hoteli

Działa po stronie klienta na liście `hotels.items` w `app/data/home.ts` (pola: `name`, `city`, `country`, `type`, `rooms`, `tags`, `image`).
Filtruje na żywo po nazwie, mieście i kraju (ignoruje wielkość liter i polskie znaki: „krakow” znajdzie „Kraków”), ma filtry krajów
liczone z bazy, wyróżnia dopasowany fragment i przestawia karty z animacją. Klawisz „/” przenosi do pola wyszukiwania.
Obecna baza to przykład do makiety (fikcyjne hotele) – przed publikacją podmienić na prawdziwą.

## Adresy URL

Obecnie strona PL leży pod `/`. Stara strona ma PL pod `/pl`, a EN pod `/`. Przed wdrożeniem trzeba zdecydować:
albo wersja PL zostaje pod `/pl` (razem z `@nuxtjs/i18n`, EN pod `/`), albo PL idzie na `/` i dodajemy przekierowanie 301 z `/pl`.
Adres strony do canonical i OG ustawiasz w `runtimeConfig.public.siteUrl` w `nuxt.config.ts`.

## Do zrobienia

- [ ] prawdziwe zdjęcia, logotypy klientów, logo Hotels Audit
- [ ] treść case study i potwierdzenie kroków procesu
- [ ] wersja EN (`@nuxtjs/i18n`, `data/home.en.ts`) + przekierowania 301 ze starych adresów Wixa
- [ ] prawdziwa baza certyfikowanych hoteli w `hotels.items`
- [ ] OG image, favicon
