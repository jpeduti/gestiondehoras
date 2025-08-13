import { supabase } from './supabase'
import type {
  Project,
  ProjectWithAssignments,
  CreateProjectDto,
  UpdateProjectDto,
  UserProfile
} from '@/types/projects'

export const projectService = {
  // Obtener todos los proyectos con asignaciones
  async getProjects(): Promise<ProjectWithAssignments[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        created_by_profile:user_profiles!projects_created_by_fkey(
          id, full_name, email, employee_id
        ),
        assignments:project_assignments!inner(
          id,
          jp_id,
          assigned_at,
          is_active,
          jp_profile:user_profiles!project_assignments_jp_id_fkey(
            id, full_name, email, employee_id, department
          )
        )
      `)
      .eq('project_assignments.is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as ProjectWithAssignments[]
  },

  // Obtener proyecto por ID
  async getProjectById(id: string): Promise<ProjectWithAssignments | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        created_by_profile:user_profiles!projects_created_by_fkey(
          id, full_name, email, employee_id
        ),
        assignments:project_assignments(
          id,
          jp_id,
          assigned_at,
          is_active,
          jp_profile:user_profiles!project_assignments_jp_id_fkey(
            id, full_name, email, employee_id, department
          )
        )
      `)
      .eq('id', id)
      .eq('project_assignments.is_active', true)
      .single()

    if (error) throw error
    return data as ProjectWithAssignments
  },

  // Crear proyecto
  async createProject(project: CreateProjectDto): Promise<Project> {
    const { assigned_jps, ...projectData } = project

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) throw error

    // Asignar JPs al proyecto si se proporcionan
    if (assigned_jps && assigned_jps.length > 0) {
      await this.assignJPsToProject(data.id, assigned_jps)
    }

    return data as Project
  },

  // Actualizar proyecto
  async updateProject(id: string, updates: UpdateProjectDto): Promise<Project> {
    const { assigned_jps, ...projectUpdates } = updates

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...projectUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Actualizar asignaciones si se proporcionan
    if (assigned_jps !== undefined) {
      await this.updateProjectAssignments(id, assigned_jps)
    }

    return data as Project
  },

  // Eliminar proyecto (soft delete - cambiar estado)
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
  },

  // Asignar JPs a proyecto
  async assignJPsToProject(projectId: string, jpIds: string[]): Promise<void> {
    const assignments = jpIds.map(jpId => ({
      project_id: projectId,
      jp_id: jpId,
      is_active: true
    }))

    const { error } = await supabase
      .from('project_assignments')
      .insert(assignments)

    if (error) throw error
  },

  // Actualizar asignaciones de proyecto
  async updateProjectAssignments(projectId: string, jpIds: string[]): Promise<void> {
    // Desactivar asignaciones existentes
    await supabase
      .from('project_assignments')
      .update({ is_active: false })
      .eq('project_id', projectId)

    // Crear nuevas asignaciones activas
    if (jpIds.length > 0) {
      await this.assignJPsToProject(projectId, jpIds)
    }
  },

  // Obtener JPs disponibles (usuarios con rol jp)
  async getAvailableJPs(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        role:roles(name)
      `)
      .eq('is_active', true)
      .eq('roles.name', 'jp')

    if (error) throw error
    return (data || []) as UserProfile[]
  },

  // Obtener proyectos asignados a un JP específico
  async getProjectsForJP(jpId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *
      `)
      .eq('project_assignments.jp_id', jpId)
      .eq('project_assignments.is_active', true)
      .in('status', ['active', 'paused'])

    if (error) throw error
    return (data || []) as Project[]
  },

  // Verificar si un código de proyecto ya existe
  async checkProjectCodeExists(code: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('projects')
      .select('id')
      .eq('code', code)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data?.length || 0) > 0
  }
}
