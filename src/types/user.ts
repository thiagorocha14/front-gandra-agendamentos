/** Usuário retornado por GET /users e GET /users/:id */
export type AppUser = {
  id: number | string
  name: string
  email: string
  userType: string
  phone?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

/** Corpo de PATCH /users/:id — campos opcionais conforme o backend. */
export type AtualizarUsuarioPayload = {
  name?: string
  email?: string
  phone?: string | null
  userType?: string
}
