/** Corpo de POST /auth/sign-in (alinhado ao SignInDto do backend). */
export type SignInPayload = {
  email: string
  password: string
}

/** Corpo de POST /auth/sign-up (alinhado ao SignUpDto do backend). */
export type SignUpPayload = {
  name: string
  email: string
  phone?: string
  password: string
}

export type AuthUser = {
  id: number | string
  name: string
  email: string
  userType: string
  phone?: string | null
}

export type AuthResponse = {
  accessToken: string
  user: AuthUser
}
