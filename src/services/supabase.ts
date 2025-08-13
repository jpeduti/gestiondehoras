import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Falta configurar las variables de entorno de Supabase')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helpers para tipos más fáciles de usar
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Tipos específicos del MVP
export type Role = Tables<'roles'>
export type UserProfile = Tables<'user_profiles'>
export type Project = Tables<'projects'>
export type TimeEntry = Tables<'time_entries'>
export type ProjectAssignment = Tables<'project_assignments'>

// Tipos con relaciones
export type UserProfileWithRole = UserProfile & {
  roles: Role
}
