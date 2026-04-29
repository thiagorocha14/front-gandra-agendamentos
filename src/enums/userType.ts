/** Valores de `userType` retornados pela API. */
export enum UserType {
  Regular = 'regular',
  Admin = 'admin',
  Member = 'member',
}

const LABELS: Record<UserType, string> = {
  [UserType.Regular]: 'Padrão',
  [UserType.Admin]: 'Administrador',
  [UserType.Member]: 'Mensalista',
}

/** Rótulo em português para exibição na UI. */
export function getUserTypeLabel(userType: string): string {
  const key = userType.toLowerCase() as UserType
  if (key in LABELS) return LABELS[key]
  return userType
}

/** Estilo visual do Chip conforme o tipo (regular = verde, admin = cinza, member = laranja). */
export function getUserTypeChipClass(userType: string): string {
  const u = userType.toLowerCase()
  if (u === UserType.Regular) return 'user-type-chip user-type-chip--regular'
  if (u === UserType.Admin) return 'user-type-chip user-type-chip--admin'
  if (u === UserType.Member) return 'user-type-chip user-type-chip--member'
  return 'user-type-chip user-type-chip--unknown'
}
