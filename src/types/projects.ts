export interface Role {
  id: string
  name: string
  description: string | null
  permissions?: Record<string, boolean>
  created_at?: string
}

export interface UserProfile {
  id: string
  employee_id: string | null
  full_name: string
  email: string
  role_id: string
  department: string | null
  is_active: boolean | null
  user_state: number | null
  created_at: string | null
  updated_at: string | null
  // Relación con role
  role?: Role
}

export interface Project {
  id: string
  code: string
  name: string
  description: string | null
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  start_date: string | null
  end_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ProjectAssignment {
  id: string
  project_id: string
  jp_id: string
  assigned_at: string
  is_active: boolean
}

export interface TimeEntry {
  id: string
  jp_id: string
  project_id: string | null // null para "Otros"
  week_start: string
  hours: number
  comments: string | null
  other_activity: string | null // Para actividades "Otros"
  status: 'draft' | 'submitted' | 'approved'
  created_at: string
  updated_at: string
}

// Tipos para DTOs de registro de horas
export interface CreateTimeEntryDto {
  project_id?: string | null
  week_start: string
  hours: number
  comments?: string
  other_activity?: string
}

export interface UpdateTimeEntryDto extends Partial<CreateTimeEntryDto> {
  status?: 'draft' | 'submitted' | 'approved'
}

// Tipo para el resumen semanal
export interface WeekSummary {
  week_start: string
  total_hours: number
  entries: TimeEntryWithProject[]
  status: 'draft' | 'submitted' | 'approved'
}

export interface TimeEntryWithProject extends TimeEntry {
  project?: Project
}

// Tipos para DTOs
export interface CreateProjectDto {
  code: string
  name: string
  description?: string
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  start_date?: string
  end_date?: string
  assigned_jps?: string[]
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  status?: 'active' | 'paused' | 'completed' | 'cancelled'
}

// Tipos con relaciones para el frontend
export interface ProjectWithAssignments extends Project {
  created_by_profile?: UserProfile
  assignments: Array<ProjectAssignment & {
    jp_profile: UserProfile
  }>
}

export interface TimeEntryWithRelations extends TimeEntry {
  jp_profile: UserProfile
  project: Project
}

// Tipo para respuestas de API
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
