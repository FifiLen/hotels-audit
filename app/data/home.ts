// Cała treść strony głównej w jednym miejscu.
// Wersja EN: skopiuj ten plik jako home.en.ts i podepnij przez @nuxtjs/i18n.
// `image: undefined` = placeholder; podmień na ścieżkę w /public/images.
// Teksty przeniesione ze starej strony hotelsaudit.com/pl (poprawione literówki).
// Bez odpowiednika na starej stronie: proces, case study, etykiety sekcji, formularz – do potwierdzenia.

export interface ImageRef {
  src?: string
  alt: string
  hint: string // opis kadru dla placeholdera
}

export const nav = [
  { label: 'Certyfikacja', href: '#certyfikacja' },
  { label: 'Zakres audytu', href: '#zakres' },
  { label: 'Korzyści', href: '#korzysci' },
  { label: 'Certyfikowane hotele', href: '#hotele' },
]

export const hero = {
  // Układ jak w hut8: linia przez środek ekranu, pod nią etykieta (lewo) i nagłówek (prawo), na dole podtytuł z opisem.
  label: 'Certyfikacja HA:901/2025',
  // linie nagłówka – każda wyjeżdża z własnej maski (na wąskich ekranach łamią się dalej same)
  title: ['Zwiększ sprzedaż swojego', 'hotelu dzięki certyfikacji', 'Hotels Audit.'],
  subtitle: 'Audyt 1000 punktów GX',
  scrollHint: 'Przewiń, aby poznać certyfikację',
  lead:
    'Sprawdź, w jaki sposób pomogliśmy innym Dyrektorom Sprzedaży i Marketingu w Polsce zwiększyć sprzedaż wyjazdów grupowych i wydarzeń MICE o 10–⁠25%.',
  cta: { label: 'Skontaktuj się', href: '#kontakt' },
  // Tymczasowe wideo z Pexels (Ac Law, pexels.com/video/30658287), pętla „tam i z powrotem” 2 × 10 s,
  // wersje 1080p i 720p bez dźwięku; plakat = pierwsza klatka. Podmienić na certyfikowany obiekt.
  video: { large: '/video/hero-1080.mp4', small: '/video/hero-720.mp4' },
  image: {
    src: '/images/hero-poster.jpg',
    alt: 'Resort przy plaży o zachodzie słońca, widok z drona',
    hint: 'Fasada lub basen certyfikowanego hotelu, kadr poziomy, ciemniejszy dół pod tekst',
  } as ImageRef,
}

export const clients = {
  title: 'Zaufali nam',
  label: 'Pomogliśmy już zespołom obiektów takich jak:',
  // Wycięte z paska logotypów starej strony, czarne na przezroczystym. w/h = wymiary pliku (do wyrównania optycznego).
  logos: [
    { name: 'Górskie Resorty', src: '/images/clients/gorskie-resorty.png', w: 204, h: 73 },
    { name: 'Platinum Mountain Hotel & SPA', src: '/images/clients/platinum-mountain.png', w: 230, h: 146 },
    { name: 'Crystal Mountain', src: '/images/clients/crystal-mountain.png', w: 259, h: 115 },
    { name: 'Hotel Bania', src: '/images/clients/bania.png', w: 250, h: 109 },
    { name: 'Leonardo Hotels', src: '/images/clients/leonardo.png', w: 235, h: 58 },
    { name: 'Belmonte Hotel Krynica-Zdrój', src: '/images/clients/belmonte.png', w: 206, h: 106 },
    { name: 'Muzeum Sztuki Nowoczesnej w Warszawie', src: '/images/clients/msn.png', w: 192, h: 115 },
    { name: 'Muzeum Warszawy', src: '/images/clients/muzeum-warszawy.png', w: 273, h: 96 },
    { name: 'Zachęta – Narodowa Galeria Sztuki', src: '/images/clients/zacheta.png', w: 173, h: 112 },
    { name: 'Teatr Komedia', src: '/images/clients/teatr-komedia.png', w: 257, h: 111 },
  ],
}

// Certyfikacja + zakres audytu + proces jako jedna historia przewijana scrollem (HomeStory).
// Teksty ze starej strony; tytuły rozdziałów są nowe.
export const story = {
  label: 'Certyfikacja',
  chapters: [
    {
      step: 'Standard',
      title: 'Niezależny, globalny znak jakości.',
      text: 'Certyfikacja Hotels Audit to niezależny, globalny znak jakości dla wyjątkowych doświadczeń gości, bazowany na 1000-punktowym audycie GX. Odznacza hotele sieciowe i niezależne – każdej wielkości – które spełniają najwyższe standardy obsługi, infrastruktury oraz personalizacji doświadczeń.',
    },
    {
      step: 'Audyt',
      title: '1000 punktów doświadczeń gościa.',
      text: 'Sprawdzamy obiekt oczami gościa, punkt po punkcie. Każdy sześcian to jeden z 1000 punktów audytu GX.',
    },
    {
      step: 'Zakres',
      title: 'Pięć obszarów, które decydują o pobycie.',
      text: '',
    },
    {
      step: 'Raport',
      title: 'Raport pokazuje, gdzie gość traci.',
      text: 'Otrzymasz raport z badania 1000 punktów pokazujący, w których miejscach doświadczenia gości nie są idealne i co Twój zespół może zrobić, by szybko wyeliminować problemy.',
    },
    {
      step: 'Wdrożenie',
      title: 'Poprawki, które widać w ocenach.',
      text: 'Otrzymasz strategie i wytyczne oparte na doświadczeniu ze 100+ hoteli, dostosowane specjalnie dla Twojego obiektu i jego potrzeb, które zwiększą ratingi hotelu i oceny gości.',
    },
    {
      step: 'Certyfikat',
      title: 'Znak HA:901/2025.',
      text: 'Każdego dnia certyfikujemy kolejne hotele, a coraz więcej gości, firm, agencji turystycznych czy planerów eventów wdraża Certyfikat Hotels Audit (HA:901/2025) jako jeden z wymogów przy wyborze hotelu na pobyt dla swoich gości i wydarzeń.',
    },
  ],
  // kolejność = kolejność wypełniania siatki 40 × 25; odcienie białej makiety (aktywny obszar wypiętrza się na granatowo)
  areas: [
    { name: 'Perfekcyjny stan obiektu', text: 'Nieskazitelna czystość, stan techniczny i bezpieczeństwo to podstawa każdego doświadczenia.', points: 450, color: '#ffffff' },
    { name: 'Szybka realizacja potrzeb gości', text: 'Obsługa, która wyprzedza oczekiwania gościa, zanim o cokolwiek poprosi.', points: 200, color: '#e4e8ed' },
    { name: 'Personalizacja doświadczeń', text: 'Spersonalizowane udogodnienia i wyprzedzanie potrzeb, które tworzą niezapomniane chwile.', points: 200, color: '#cbd2dc' },
    { name: 'Rozwiązywanie problemów', text: 'Ponad 100 scenariuszy: jak szybko zespół rozwiązuje problemy gościa.', points: 100, color: '#afb9c7' },
    { name: 'Najwyższa jakość snu', text: 'Od idealnej ciszy po komfortowe detale – ponad 50 czynników snu.', points: 50, color: '#94a1b4' },
  ],
  seal: { mark: 'HA', code: '901/2025' },
  // kartki w makiecie: raport (liczby liczy scena) i jego rewers – certyfikat
  report: {
    brand: 'Hotels Audit',
    title: 'Raport z audytu GX',
    hotel: '[Nazwa hotelu], [Miasto]',
    scoreLabel: 'punktów spełnionych',
    flawsLabel: 'do poprawy',
    areasLabel: 'Obszary audytu',
    listTitle: 'Punkty do poprawy',
  },
  certificate: {
    brand: 'Hotels Audit',
    title: 'Certyfikat',
    subtitle: 'Niezależny, globalny znak jakości doświadczeń gości',
    awarded: 'przyznany dla',
    hotel: '[Nazwa hotelu]',
    footer: '1000 punktów audytu GX',
  },
  link: { label: 'Zobacz dokumentację', href: 'https://heyzine.com/flip-book/6c7c0a5f8e.html' },
}

export const benefits = {
  title: 'Jaką wartość da Twojemu zespołowi certyfikacja?',
  // wyróżnione liczby przy wierszach – z tekstów ze starej strony
  items: [
    {
      title: 'Zwiększysz wartość oferty',
      text: 'Zwiększysz postrzeganą wartość Twojej oferty, dając gościom i klientom niezależne potwierdzenie tego, że obiekt działa bezbłędnie i kreuje najlepsze doświadczenia gości.',
      highlight: { value: 'HA:901/2025', label: 'niezależne potwierdzenie jakości' },
    },
    {
      title: 'Zwiększysz sprzedaż',
      text: 'Dzięki pozycjonowaniu obiektu jako certyfikowanego sprzedaż wyjazdów grupowych i konferencyjnych wzrosła średnio o 10–⁠25% (w zależności od obiektu i oferty).',
      highlight: { value: '10–⁠25%', label: 'wzrost sprzedaży grup i MICE' },
    },
    {
      title: 'Zwiększysz doświadczenia gości',
      text: 'Otrzymasz raport z badania 1000 punktów pokazujący, w których miejscach doświadczenia gości nie są idealne i co Twój zespół może zrobić, by szybko wyeliminować problemy.',
      highlight: { value: '1000', label: 'punktów w raporcie z audytu' },
    },
    {
      title: 'Zwiększysz ratingi hotelu',
      text: 'Otrzymasz strategie i wytyczne oparte na doświadczeniu ze 100+ hoteli, dostosowane specjalnie dla Twojego obiektu i jego potrzeb, które zwiększą ratingi hotelu i oceny gości.',
      highlight: { value: '100+', label: 'hoteli w bazie doświadczeń' },
    },
  ] as { title: string; text: string; highlight: { value: string; label: string } }[],
}

// TREŚĆ PRZYKŁADOWA (fikcyjny hotel, liczby i osoba) – tylko do makiety, przed publikacją podmienić na prawdziwe case study.
export const caseStudy = {
  label: 'Case study: Baltic Grand Resort',
  title: 'Baltic Grand Resort: o 22% więcej grup i wydarzeń w rok od certyfikacji.',
  intro:
    'Resort nad Bałtykiem: 186 pokoi, 9 sal konferencyjnych i spa. Audyt wykazał 61 punktów do poprawy – najwięcej w szybkości obsługi grup i scenariuszach problemowych. Zespół wdrożył poprawki w trzy miesiące.',
  figure: '+22%',
  figureLabel: 'sprzedaży grup i wydarzeń MICE w 12 miesięcy od certyfikacji',
  quote:
    'Raport pokazał nam rzeczy, których z recepcji nie widzieliśmy od lat. Po wdrożeniu poprawek certyfikat stał się argumentem, o który agencje eventowe pytają już na pierwszym spotkaniu.',
  author: 'Marta Zielińska',
  role: 'Dyrektor Sprzedaży i Marketingu, Baltic Grand Resort',
  // Tymczasowe zdjęcia z Unsplash (identyfikatory: atrium 1788461426781, hala 1655516433028,
  // restauracja 1774989423979, pokój 1731336478850, lobby 1775447665921) – podmienić na zdjęcia hotelu z case study.
  images: {
    atrium: { src: '/images/case/atrium.jpg', alt: 'Atrium hotelu z falującymi balkonami' },
    room: { src: '/images/case/room.jpg', alt: 'Pokój hotelowy z rzeźbionym wezgłowiem' },
    hall: { src: '/images/case/hall.jpg', alt: 'Sala balowa z kryształowym żyrandolem' },
    restaurant: { src: '/images/case/restaurant.jpg', alt: 'Restauracja hotelowa w ciepłym świetle' },
    lobby: { src: '/images/case/lobby.jpg', alt: 'Nowoczesne lobby z recepcją' },
  },
}

// Dla gości: dlaczego wybierają certyfikowane hotele (teksty ze starej strony). Panele rozwijają się po najechaniu.
// Zdjęcia tymczasowe z Unsplash (identyfikatory): planning 1608387371406, problems 1697749118250, service 1596701062351,
// personal 1581541482717, sleep 1765423587693, property 1582719508461.
export const guests = {
  title: 'Dlaczego goście wybierają certyfikowane hotele?',
  items: [
    {
      title: 'Bezstresowe planowanie',
      points: '',
      text: 'Certyfikowane hotele to gwarancja jakości, zapewniająca udany pobyt. Możesz w pełni się zrelaksować, mając pewność, że każdy szczegół Twojego doświadczenia jest dopracowany.',
      image: { src: '/images/guests/planning.jpg', alt: 'Basen otoczony tropikalną zielenią' },
    },
    {
      title: 'Rozwiązywanie problemów',
      points: '100+',
      text: 'Zespół hotelu błyskawicznie rozwiązuje wszelkie problemy, zapewniając spokój i beztroski pobyt. Zbadaliśmy ponad 100 scenariuszy, by Twój pobyt był bezbłędny.',
      image: { src: '/images/guests/problems.jpg', alt: 'Wejście do hotelu z obsługą przy drzwiach' },
    },
    {
      title: 'Szybka realizacja potrzeb gości',
      points: '200',
      text: 'Ciesz się błyskawiczną obsługą, która wyprzedza Twoje oczekiwania – zbadaliśmy ją w 200 punktach, by każda chwila była niezapomniana.',
      image: { src: '/images/guests/service.jpg', alt: 'Śniadanie z sokiem pomarańczowym podane do łóżka' },
    },
    {
      title: 'Personalizacja doświadczeń',
      points: '200+',
      text: 'Ciesz się spersonalizowanymi udogodnieniami i wyprzedzaniem potrzeb, które tworzą niezapomniane chwile. Sprawdziliśmy ponad 200 punktów dotyczących personalizacji.',
      image: { src: '/images/guests/personal.jpg', alt: 'Powitalne owoce i woda przy fotelu w pokoju' },
    },
    {
      title: 'Najwyższa jakość snu',
      points: '50+',
      text: 'Twój sen jest priorytetem – od idealnej ciszy po komfortowe detale – dlatego zbadaliśmy ponad 50 czynników, byś budził się wypoczęty i gotowy na nowy dzień.',
      image: { src: '/images/guests/sleep.jpg', alt: 'Hotelowe łóżko z poduszkami w porannym świetle' },
    },
    {
      title: 'Perfekcyjny stan obiektu',
      points: '450',
      text: 'Nieskazitelna czystość, stan techniczny i bezpieczeństwo to podstawa każdego doświadczenia – w tym obszarze badamy aż 450 punktów podczas audytu.',
      image: { src: '/images/guests/property.jpg', alt: 'Taras z leżakami i basenem nad morzem' },
    },
  ],
  pointsLabel: 'punktów audytu',
  closing:
    'Gdy raz doświadczysz standardu hotelu z certyfikatem Hotels Audit, będziesz pytał o niego w każdym kolejnym hotelu. Nasze niezależnie zweryfikowane standardy gwarantują bezbłędny, bezstresowy pobyt lub wydarzenie.',
  cta: { label: 'Znajdź certyfikowany hotel', href: '#hotele' },
}

export interface Hotel {
  name: string
  city: string
  country: string
  type: string
  rooms: number
  tags: string[]
  image: { src: string; alt: string }
}

// BAZA PRZYKŁADOWA (fikcyjne hotele, prawdziwe miasta) – tylko do makiety; podmienić na prawdziwą bazę certyfikowanych hoteli.
// Zdjęcia tymczasowe z Unsplash (identyfikatory): krakow 1791079588442, wroclaw 1627062474471, warszawa-boutique 1618514272627,
// warszawa-residence 1621891333266, zakopane 1626688475360, karpacz 1559373098, marbella 1571003123894,
// algarve 1549294413, dubaj 1551918120, malediwy 1512100356356.
export const hotels = {
  title: 'Wybieraj obiekty, które świadomie kreują doświadczenia.',
  text: 'Wyszukaj swoje miasto lub kraj, a pokażemy Ci hotele, które spełniają nasze standardy w tworzeniu wyjątkowych doświadczeń gości w tej okolicy.',
  searchLabel: 'Szukaj po mieście, kraju lub nazwie hotelu',
  searchPlaceholder: 'Miasto, kraj lub hotel',
  allLabel: 'Wszystkie',
  // %n = liczba wyników
  count: { one: '%n hotel', few: '%n hotele', many: '%n hoteli' },
  badge: 'HA:901/2025',
  roomsLabel: 'pokoi',
  // %q = wpisana fraza
  empty: 'Nie mamy jeszcze certyfikowanego hotelu dla „%q”.',
  emptyHint: 'Sprawdź pisownię albo wybierz kraj z listy powyżej.',
  reset: 'Pokaż wszystkie hotele',
  items: [
    { name: 'Kamienica Pod Orłem', city: 'Kraków', country: 'Polska', type: 'Hotel miejski', rooms: 72, tags: ['MICE', 'Centrum'], image: { src: '/images/hotels/krakow.jpg', alt: 'Biała, zabytkowa kamienica hotelowa na rogu ulicy' } },
    { name: 'Aurora Business Hotel', city: 'Wrocław', country: 'Polska', type: 'Hotel biznesowy', rooms: 214, tags: ['MICE', 'Konferencje'], image: { src: '/images/hotels/wroclaw.jpg', alt: 'Nowoczesna fasada hotelu z rzędami okien' } },
    { name: 'Stołeczny Boutique', city: 'Warszawa', country: 'Polska', type: 'Hotel butikowy', rooms: 48, tags: ['Boutique', 'Centrum'], image: { src: '/images/hotels/warszawa-boutique.jpg', alt: 'Ciemne, eleganckie wnętrze hotelu butikowego' } },
    { name: 'Nova Residence', city: 'Warszawa', country: 'Polska', type: 'Hotel miejski', rooms: 160, tags: ['MICE', 'Long stay'], image: { src: '/images/hotels/warszawa-residence.jpg', alt: 'Jasny pokój hotelowy z oknem na miasto' } },
    { name: 'Halny Mountain Lodge', city: 'Zakopane', country: 'Polska', type: 'Hotel górski', rooms: 96, tags: ['Spa', 'Rodzinny'], image: { src: '/images/hotels/zakopane.jpg', alt: 'Taras restauracji z widokiem na góry' } },
    { name: 'Skała Resort & Spa', city: 'Karpacz', country: 'Polska', type: 'Resort', rooms: 130, tags: ['Spa', 'MICE'], image: { src: '/images/hotels/karpacz.jpg', alt: 'Kamienny hotel górski pod skalną ścianą' } },
    { name: 'Costa Luz Resort', city: 'Marbella', country: 'Hiszpania', type: 'Resort', rooms: 240, tags: ['Spa', 'Plaża'], image: { src: '/images/hotels/marbella.jpg', alt: 'Basen z altanami o zachodzie słońca' } },
    { name: 'Palmeira Beach Hotel', city: 'Algarve', country: 'Portugalia', type: 'Resort', rooms: 188, tags: ['Plaża', 'Rodzinny'], image: { src: '/images/hotels/algarve.jpg', alt: 'Basen resortu otoczony palmami' } },
    { name: 'Azure Infinity Resort', city: 'Dubaj', country: 'ZEA', type: 'Resort', rooms: 320, tags: ['MICE', 'Spa'], image: { src: '/images/hotels/dubaj.jpg', alt: 'Basen bez krawędzi z widokiem na morze' } },
    { name: 'Lagoon Atoll Retreat', city: 'Atol Baa', country: 'Malediwy', type: 'Resort', rooms: 64, tags: ['Plaża', 'Spa'], image: { src: '/images/hotels/malediwy.jpg', alt: 'Wyspa z willami i hydroplan nad laguną, widok z góry' } },
  ] as Hotel[],
}

export const contact = {
  label: 'Kontakt',
  title: 'Chcesz dowiedzieć się więcej i zwiększyć sprzedaż z naszą pomocą?',
  lead: 'Skontaktuj się i otrzymaj dedykowany plan działania.',
  email: 'contact@hotelsaudit.com',
  submit: 'Wyślij i otrzymaj plan działania',
  success: 'Wiadomość wysłana. Odezwiemy się z planem działania.',
  offices: [
    // tz = strefa czasowa do zegara w stopce
    { region: 'Europa', city: 'Warszawa', address: 'Tytusa Chałubińskiego 9/2', tz: 'Europe/Warsaw' },
    { region: 'USA', city: 'Nowy Jork', address: '368 9th Ave, NY 10001', tz: 'America/New_York' },
    { region: 'Zjednoczone Emiraty Arabskie', city: 'Dubaj', address: 'One Central, Dubai World Trade Center', tz: 'Asia/Dubai' },
    { region: 'Wielka Brytania', city: 'Londyn', address: '10 York Rd, SE1 7ND', tz: 'Europe/London' },
    { region: 'Azja, wkrótce', city: 'Singapur', address: '21 Collyer Quay', tz: 'Asia/Singapore' },
  ],
}

export const footer = {
  statement: 'Stwórzmy razem niezapomniane doświadczenie!',
  navLabel: 'Nawigacja',
  officesLabel: 'Biura',
  linksLabel: 'Na skróty',
  toTop: 'Do góry',
  wordmark: 'Hotels Audit',
  copyright: `© ${new Date().getFullYear()} Hotels Audit. Wszelkie prawa zastrzeżone.`,
  links: [
    { label: 'Polityka prywatności', href: 'https://www.hotelsaudit.com/privacy' },
    { label: 'Kariera', href: 'https://www.hotelsaudit.com/jobs' },
    { label: 'LinkedIn', href: '#' },
  ],
}
