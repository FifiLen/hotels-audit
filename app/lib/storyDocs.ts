// Kartki w makiecie HomeStory, rysowane na canvasie (tekstury A4): raport z audytu i jego rewers – certyfikat.
// Liczby na raporcie pochodzą z samej sceny (te same punkty do poprawy, które widać jako słupki).
export const PAGE = { w: 1024, h: 1448 } as const
const M = 72 // margines strony
const LIST_TOP = 940 // pierwszy wiersz listy punktów do poprawy
const ROW = 30

export interface ReportPage {
  brand: string
  title: string
  hotel: string
  scoreLabel: string
  flawsLabel: string
  areasLabel: string
  listTitle: string
  total: number
  flaws: number
  areas: { name: string; points: number; flaws: number }[]
  rows: { id: number; area: string }[]
}

export interface CertificatePage {
  brand: string
  title: string
  subtitle: string
  awarded: string
  hotel: string
  footer: string
  mark: string
  code: string
}

const INK = '#0e1a2b'
const MUTED = '#6b7380'
const LINE = '#dde1e6'
const ACCENT = '#ff6b2c'
const SANS = 'Figtree, ui-sans-serif, system-ui, sans-serif'
const MONO = '"Geist Mono", ui-monospace, monospace'

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: 'left' | 'center' = 'left') {
  ctx.letterSpacing = `${spacing}px`
  ctx.textAlign = align
  ctx.fillText(text, x, y)
  ctx.letterSpacing = '0px'
  ctx.textAlign = 'left'
}

// Środki pomarańczowych znaczników listy (u, v w 0–1) – w nie trafiają łuki ze słupków.
export function reportMarkers(rows: number) {
  return Array.from({ length: rows }, (_, n) => ({ u: (M + 9) / PAGE.w, v: (LIST_TOP + n * ROW + ROW / 2 - 6) / PAGE.h }))
}

export function drawReport(canvas: HTMLCanvasElement, r: ReportPage) {
  canvas.width = PAGE.w
  canvas.height = PAGE.h
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, PAGE.w, PAGE.h)
  ctx.textBaseline = 'alphabetic'

  // nagłówek
  ctx.fillStyle = ACCENT
  ctx.fillRect(M, M + 4, 18, 18)
  ctx.fillStyle = INK
  ctx.font = `600 22px ${SANS}`
  spaced(ctx, r.brand.toUpperCase(), M + 32, M + 21, 4)
  ctx.fillStyle = MUTED
  ctx.font = `400 22px ${MONO}`
  ctx.textAlign = 'right'
  ctx.fillText(`GX · ${r.total} pkt`, PAGE.w - M, M + 21)
  ctx.textAlign = 'left'

  ctx.fillStyle = INK
  ctx.font = `500 62px ${SANS}`
  ctx.fillText(r.title, M, 205)
  ctx.fillStyle = MUTED
  ctx.font = `400 28px ${SANS}`
  ctx.fillText(r.hotel, M, 252)
  ctx.fillStyle = LINE
  ctx.fillRect(M, 292, PAGE.w - 2 * M, 2)

  // wynik
  ctx.fillStyle = INK
  ctx.font = `500 150px ${SANS}`
  const score = String(r.total - r.flaws)
  ctx.fillText(score, M - 6, 455)
  const sw = ctx.measureText(score).width
  ctx.fillStyle = MUTED
  ctx.font = `400 44px ${SANS}`
  ctx.fillText(`/ ${r.total}`, M + sw + 8, 455)
  ctx.font = `400 26px ${SANS}`
  ctx.fillText(r.scoreLabel, M, 500)

  ctx.fillStyle = ACCENT
  ctx.font = `500 96px ${SANS}`
  ctx.textAlign = 'right'
  ctx.fillText(String(r.flaws), PAGE.w - M, 455)
  ctx.fillStyle = MUTED
  ctx.font = `400 26px ${SANS}`
  ctx.fillText(r.flawsLabel, PAGE.w - M, 500)
  ctx.textAlign = 'left'

  // obszary: nazwa, punkty, pasek z udziałem punktów do poprawy
  ctx.fillStyle = MUTED
  ctx.font = `500 20px ${SANS}`
  spaced(ctx, r.areasLabel.toUpperCase(), M, 585, 3)
  r.areas.forEach((a, n) => {
    const y = 630 + n * 54
    ctx.fillStyle = INK
    ctx.font = `400 25px ${SANS}`
    ctx.fillText(a.name, M, y)
    ctx.fillStyle = MUTED
    ctx.font = `400 22px ${MONO}`
    ctx.textAlign = 'right'
    ctx.fillText(`${a.points - a.flaws}/${a.points}`, PAGE.w - M, y)
    ctx.textAlign = 'left'
    const bw = PAGE.w - 2 * M
    ctx.fillStyle = '#eef0f3'
    ctx.fillRect(M, y + 12, bw, 7)
    ctx.fillStyle = INK
    ctx.fillRect(M, y + 12, bw * (1 - a.flaws / a.points), 7)
    ctx.fillStyle = ACCENT
    ctx.fillRect(M + bw * (1 - a.flaws / a.points), y + 12, bw * (a.flaws / a.points), 7)
  })

  // lista punktów do poprawy – w znaczniki trafiają łuki
  ctx.fillStyle = MUTED
  ctx.font = `500 20px ${SANS}`
  spaced(ctx, r.listTitle.toUpperCase(), M, LIST_TOP - 22, 3)
  r.rows.forEach((row, n) => {
    const y = LIST_TOP + n * ROW
    ctx.fillStyle = ACCENT
    ctx.fillRect(M + 1, y + ROW / 2 - 14, 16, 16)
    ctx.fillStyle = INK
    ctx.font = `400 21px ${MONO}`
    ctx.fillText(`#${String(row.id + 1).padStart(4, '0')}`, M + 34, y + ROW / 2)
    ctx.font = `400 22px ${SANS}`
    ctx.fillText(row.area, M + 140, y + ROW / 2)
    ctx.fillStyle = LINE
    ctx.fillRect(M + 34, y + ROW - 2, PAGE.w - 2 * M - 34, 1)
  })
}

export function drawCertificate(canvas: HTMLCanvasElement, c: CertificatePage) {
  canvas.width = PAGE.w
  canvas.height = PAGE.h
  const ctx = canvas.getContext('2d')!
  const cx = PAGE.w / 2
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, PAGE.w, PAGE.h)
  ctx.textBaseline = 'alphabetic'

  // ramka
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.strokeRect(46, 46, PAGE.w - 92, PAGE.h - 92)
  ctx.strokeStyle = ACCENT
  ctx.lineWidth = 2
  ctx.strokeRect(62, 62, PAGE.w - 124, PAGE.h - 124)

  ctx.fillStyle = INK
  ctx.font = `600 24px ${SANS}`
  spaced(ctx, c.brand.toUpperCase(), cx, 175, 6, 'center')
  ctx.font = `500 96px ${SANS}`
  spaced(ctx, c.title.toUpperCase(), cx, 305, 8, 'center')
  ctx.fillStyle = MUTED
  ctx.font = `400 27px ${SANS}`
  ctx.textAlign = 'center'
  ctx.fillText(c.subtitle, cx, 360)

  // emblemat: pierścień w kolorze akcentu, kropki, znak HA
  const cy = 700
  ctx.strokeStyle = ACCENT
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.arc(cx, cy, 215, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, 182, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = INK
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * 197, cy + Math.sin(a) * 197, 2.6, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.font = `500 170px ${SANS}`
  ctx.fillText(c.mark, cx, cy + 58)
  ctx.fillStyle = MUTED
  ctx.font = `400 32px ${MONO}`
  ctx.fillText(c.code, cx, cy + 118)

  ctx.font = `400 26px ${SANS}`
  ctx.fillText(c.awarded, cx, 1010)
  ctx.fillStyle = INK
  ctx.font = `500 56px ${SANS}`
  ctx.fillText(c.hotel, cx, 1085)

  ctx.fillStyle = LINE
  ctx.fillRect(110, 1250, PAGE.w - 220, 2)
  ctx.fillStyle = MUTED
  ctx.font = `400 22px ${MONO}`
  ctx.textAlign = 'left'
  ctx.fillText(c.footer, 110, 1300)
  ctx.textAlign = 'right'
  ctx.fillText(`${c.mark}:${c.code}`, PAGE.w - 110, 1300)
  ctx.textAlign = 'left'
}
