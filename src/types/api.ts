/** Resposta de GET /courts */
export interface Court {
  id: number
  name: string
  active: boolean
}

/** Corpo de POST /bookings */
export interface CreateBookingPayload {
  courtId: number
  bookingDate: string
  startTime: string
  endTime: string
  userId?: string
  guestName?: string
  /** Telefone de contato, se o backend aceitar o campo. */
  phone?: string
  price?: string
}

/** Resposta de sucesso de POST /bookings (201 ou 200) */
export interface Booking {
  id: string
  courtId: number
  userId: string | null
  guestName: string | null
  bookingDate: string
  startTime: string
  endTime: string
  status: string
  price: string
  createdAt: string
  approvedBy: string | null
  approvedAt: string | null
}
