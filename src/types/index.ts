// Re-export all types from other modules
export * from './supabase'
export * from './projects'

// User Status Enum - Valores numéricos para base de datos
export enum UserStatus {
  BLOCKED = 0,    // Usuario bloqueado/suspendido
  ACTIVE = 1,     // Usuario activo (default)
  DELETED = 2,    // Usuario eliminado (soft delete)
  PENDING = 3     // Usuario pendiente de aprobación (futuro)
}

// User Status Labels para UI
export const USER_STATUS_LABELS = {
  [UserStatus.BLOCKED]: 'Bloqueado',
  [UserStatus.ACTIVE]: 'Activo', 
  [UserStatus.DELETED]: 'Eliminado',
  [UserStatus.PENDING]: 'Pendiente'
} as const

// User Status Colors para badges en UI
export const USER_STATUS_COLORS = {
  [UserStatus.BLOCKED]: 'yellow',   // Amarillo para bloqueado
  [UserStatus.ACTIVE]: 'green',     // Verde para activo
  [UserStatus.DELETED]: 'red',      // Rojo para eliminado
  [UserStatus.PENDING]: 'blue'      // Azul para pendiente
} as const

// User Status Icons para UI
export const USER_STATUS_ICONS = {
  [UserStatus.BLOCKED]: '🚫',
  [UserStatus.ACTIVE]: '✅', 
  [UserStatus.DELETED]: '🗑️',
  [UserStatus.PENDING]: '⏳'
} as const

// Helper type para user_state en lugar de is_active
export type UserStateField = {
  user_state: UserStatus
}

// Helper para migración: convertir is_active a user_state
export const convertIsActiveToUserState = (isActive: boolean): UserStatus => {
  return isActive ? UserStatus.ACTIVE : UserStatus.BLOCKED
}

// Helper para migración: convertir user_state a is_active (compatibilidad)
export const convertUserStateToIsActive = (userState: UserStatus): boolean => {
  return userState === UserStatus.ACTIVE
}

// Additional common types
export interface SelectOption {
  value: string
  label: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface FilterOptions {
  status?: string
  department?: string
  role?: string
  search?: string
}
