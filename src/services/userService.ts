import { supabase } from './supabase'
import type { UserProfile } from '@/types/projects'
import { UserStatus, USER_STATUS_LABELS, convertUserStateToIsActive } from '@/types/index'

export const userService = {
  // Obtener todos los usuarios activos
  async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('user_state', UserStatus.ACTIVE)
      .order('full_name')

    if (error) throw error
    return (data || []) as UserProfile[]
  },

  // Obtener usuarios por rol (solo activos)
  async getUsersByRole(roleId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('role_id', roleId)
      .eq('user_state', UserStatus.ACTIVE)
      .order('full_name')

    if (error) throw error
    return (data || []) as UserProfile[]
  },

  // Obtener todos los roles
  async getAllRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name')

    if (error) throw error
    return { data: data || [], error: null }
  },

  // Obtener usuario por ID
  async getUserById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data as UserProfile
  },

  // Obtener usuario por email
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data as UserProfile
  },

  // Crear nuevo usuario (requiere usuario autenticado)
  async createUser(userData: {
    id: string  // ID del usuario autenticado de Supabase Auth
    email: string
    full_name: string
    role_id: string
    department?: string
    employee_id?: string
  }): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role_id: userData.role_id,
        department: userData.department || null,
        employee_id: userData.employee_id || null,
        user_state: UserStatus.ACTIVE
      })
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          permissions
        )
      `)
      .single()

    if (error) throw error
    return data as UserProfile
  },

  // Actualizar usuario
  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          permissions
        )
      `)
      .single()

    if (error) throw error
    return data as UserProfile
  },

  // Alias para compatibilidad
  async updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.updateUser(id, updates)
  },

  // Alias para compatibilidad  
  async createUserProfile(userData: {
    id: string
    email: string
    full_name: string
    role_id: string
    department?: string
    employee_id?: string
  }): Promise<UserProfile> {
    return this.createUser(userData)
  },

  // Invitar nuevo usuario (crea perfil pendiente)
  async inviteUser(userData: {
    email: string
    full_name: string
    role_id: string
    department?: string
    employee_id?: string
  }): Promise<{success: boolean, data?: UserProfile, error?: string}> {
    const { data, error } = await supabase.rpc('invite_user' as any, {
      user_email: userData.email,
      user_full_name: userData.full_name,
      user_role_id: userData.role_id,
      user_department: userData.department || null,
      user_employee_id: userData.employee_id || null
    })

    if (error) {
      console.error('Error inviting user:', error)
      return { success: false, error: error.message }
    }

    return data as {success: boolean, data?: UserProfile, error?: string}
  },

  // Crear perfil para usuario existente en auth
  async createProfileForAuthUser(userData: {
    auth_user_id: string
    email: string
    full_name: string
    role_id: string
    department?: string
    employee_id?: string
  }): Promise<{success: boolean, data?: UserProfile, error?: string}> {
    const { data, error } = await supabase.rpc('create_user_profile_safe' as any, {
      auth_user_id: userData.auth_user_id,
      user_email: userData.email,
      user_full_name: userData.full_name,
      user_role_id: userData.role_id,
      user_department: userData.department || null,
      user_employee_id: userData.employee_id || null
    })

    if (error) {
      console.error('Error creating profile:', error)
      return { success: false, error: error.message }
    }

    return data as {success: boolean, data?: UserProfile, error?: string}
  },

  // Activar usuario invitado que se registró
  async activateInvitedUser(authUserId: string, email: string): Promise<{success: boolean, data?: UserProfile, error?: string}> {
    const { data, error } = await supabase.rpc('activate_invited_user' as any, {
      auth_user_id: authUserId,
      user_email: email
    })

    if (error) {
      console.error('Error activating invited user:', error)
      return { success: false, error: error.message }
    }

    return data as {success: boolean, data?: UserProfile, error?: string}
  },

  // Cambiar estado del usuario
  async changeUserStatus(userId: string, newStatus: UserStatus): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ user_state: newStatus })
      .eq('id', userId)
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          permissions
        )
      `)
      .single()

    if (error) throw error
    return data as UserProfile
  },

  // Obtener todos los usuarios con estado específico (incluye inactivos)
  async getAllUsersWithStatus(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          permissions
        )
      `)
      .order('full_name')

    if (error) throw error
    return (data || []) as UserProfile[]
  },

  // Obtener usuarios por estado
  async getUsersByStatus(status: UserStatus): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('user_state', status)
      .order('full_name')

    if (error) throw error
    return (data || []) as UserProfile[]
  },

  // Obtener estadísticas de usuarios por estado
  async getUserStatusStats(): Promise<{
    active: number
    blocked: number
    deleted: number
    pending: number
    total: number
  }> {
    const { data: allUsers, error } = await supabase
      .from('user_profiles')
      .select('user_state')

    if (error) throw error

    const stats = {
      active: 0,
      blocked: 0,
      deleted: 0,
      pending: 0,
      total: allUsers?.length || 0
    }

    allUsers?.forEach(user => {
      switch (user.user_state) {
        case UserStatus.ACTIVE:
          stats.active++
          break
        case UserStatus.BLOCKED:
          stats.blocked++
          break
        case UserStatus.DELETED:
          stats.deleted++
          break
        case UserStatus.PENDING:
          stats.pending++
          break
      }
    })

    return stats
  },

  // Verificar si usuario puede realizar acciones (está activo)
  async canUserPerformActions(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_state')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data?.user_state === UserStatus.ACTIVE
  },

  // Activar usuario (cambiar estado a ACTIVE)
  async activateUser(userId: string): Promise<UserProfile> {
    return this.changeUserStatus(userId, UserStatus.ACTIVE)
  },

  // Bloquear usuario (cambiar estado a BLOCKED)
  async blockUser(userId: string): Promise<UserProfile> {
    return this.changeUserStatus(userId, UserStatus.BLOCKED)
  },

  // Eliminar usuario (soft delete - cambiar estado a DELETED)
  async deleteUser(userId: string): Promise<UserProfile> {
    return this.changeUserStatus(userId, UserStatus.DELETED)
  },

  // Obtener etiqueta de estado
  getStatusLabel(status: UserStatus): string {
    return USER_STATUS_LABELS[status] || 'Desconocido'
  },

  // Helper para compatibilidad: obtener is_active desde user_state
  isUserActive(user: Pick<UserProfile, 'user_state'>): boolean {
    return user.user_state === UserStatus.ACTIVE
  }
}

// Export default para compatibilidad
export default userService
