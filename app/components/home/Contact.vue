<script setup lang="ts">
import { contact } from '~/data/home'

const sent = ref(false)
const sending = ref(false)
const error = ref('')

// Netlify Forms: formularz jest wykrywany w statycznym HTML (data-netlify).
// Na innym hostingu podmień endpoint (Formspree, własna funkcja serverless).
const submit = async (e: Event) => {
  const form = e.target as HTMLFormElement
  if (!form.reportValidity()) return
  sending.value = true
  error.value = ''
  try {
    const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString()
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) throw new Error(String(res.status))
    sent.value = true
    form.reset()
  } catch {
    error.value = `Nie udało się wysłać formularza. Napisz bezpośrednio na ${contact.email}.`
  } finally {
    sending.value = false
  }
}

const field =
  'h-12 border-0 border-b border-line-dark bg-transparent text-lg text-white focus:border-accent focus:outline-none'
</script>

<template>
  <section id="kontakt" aria-labelledby="contact-title" data-theme="dark" class="bg-ink pt-24 pb-8 text-white lg:pt-38 lg:pb-12">
    <div class="grid-site gap-y-14">
      <div v-reveal.stagger class="col-[2/14] flex flex-col gap-8 lg:col-[2/8]">
        <h2 id="contact-title" class="text-h2 font-medium">
          {{ contact.title }}
        </h2>
        <p class="text-[22px] text-muted-dark">{{ contact.lead }}</p>
        <a :href="`mailto:${contact.email}`" class="self-start border-b border-accent py-2 text-[22px]">
          {{ contact.email }}
        </a>
      </div>

      <form
        name="contact"
        method="POST"
        data-netlify="true"
        netlify-honeypot="company-website"
        v-reveal
        class="col-[2/14] flex flex-col gap-7 lg:col-[9/14] lg:pt-11"
        @submit.prevent="submit"
      >
        <input type="hidden" name="form-name" value="contact" />
        <p class="hidden"><label>Nie wypełniaj: <input name="company-website" /></label></p>

        <label class="flex flex-col gap-1.5 text-sm text-muted-dark">Imię i nazwisko
          <input name="name" type="text" autocomplete="name" required :class="field" />
        </label>
        <label class="flex flex-col gap-1.5 text-sm text-muted-dark">Hotel
          <input name="hotel" type="text" autocomplete="organization" required :class="field" />
        </label>
        <label class="flex flex-col gap-1.5 text-sm text-muted-dark">E-mail
          <input name="email" type="email" autocomplete="email" required :class="field" />
        </label>
        <label class="flex flex-col gap-1.5 text-sm text-muted-dark">Wiadomość
          <textarea name="message" rows="3" :class="[field, 'h-auto resize-y py-2.5']" />
        </label>

        <button
          type="submit"
          :disabled="sending"
          class="flex h-15 items-center justify-between rounded-full bg-accent px-6 text-[17px] font-medium text-ink hover:bg-[#ff7f48] disabled:opacity-60"
        >
          {{ sending ? 'Wysyłanie…' : contact.submit }}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" aria-hidden="true"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
        </button>
        <p role="status" class="min-h-6 text-sm" :class="error ? 'text-[#ffb59a]' : 'text-muted-dark'">
          {{ sent ? contact.success : error }}
        </p>
      </form>

    </div>
  </section>
</template>
