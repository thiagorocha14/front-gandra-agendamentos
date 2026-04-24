/** Data local no formato YYYY-MM-DD (evita deslocamento UTC). */
export function toBookingDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Hora local no formato HH:mm (24h). */
export function toTimeHHmm(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${min}`
}

/** Soma minutos a uma data/hora local (útil para horário de término a partir da duração). */
export function addMinutesToDate(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60_000)
}

/** Data/hora local a partir de `bookingDate` (YYYY-MM-DD) e hora (HH:mm ou HH:mm:ss). */
export function fromBookingDateAndTime(bookingDate: string, timeHHmm: string): Date {
  const [ys, ms, ds] = bookingDate.split('-')
  const [hs, mins] = timeHHmm.split(':')
  const y = Number(ys)
  const m = Number(ms)
  const d = Number(ds)
  const h = Number(hs)
  const min = Number(mins ?? '0')
  return new Date(y, m - 1, d, h, min, 0, 0)
}
