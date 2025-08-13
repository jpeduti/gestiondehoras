import { supabase } from './supabase'
import type {
  TimeEntry,
  TimeEntryWithProject,
  CreateTimeEntryDto,
  UpdateTimeEntryDto,
  WeekSummary,
  Project
} from '@/types/projects'

export const timeEntryService = {
  // Obtener entradas de tiempo para un JP y semana específica
  async getTimeEntriesForWeek(jpId: string, weekStart: string): Promise<TimeEntryWithProject[]> {
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        project:projects(
          id, code, name, status
        )
      `)
      .eq('jp_id', jpId)
      .eq('week_start', weekStart)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []) as TimeEntryWithProject[]
  },

  // Obtener resumen de semanas para un JP
  async getWeekSummariesForJP(jpId: string, limit = 10): Promise<WeekSummary[]> {
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        week_start,
        hours,
        status,
        project:projects(
          id, code, name, status
        )
      `)
      .eq('jp_id', jpId)
      .order('week_start', { ascending: false })
      .limit(limit * 10) // Obtener más datos para agrupar

    if (error) throw error

    // Agrupar por semana
    const weekMap = new Map<string, WeekSummary>()

    data?.forEach((entry) => {
      const weekStart = entry.week_start

      if (!weekMap.has(weekStart)) {
        weekMap.set(weekStart, {
          week_start: weekStart,
          total_hours: 0,
          entries: [],
          status: (entry.status as 'draft' | 'submitted' | 'approved') || 'draft'
        })
      }

      const week = weekMap.get(weekStart)!
      week.total_hours += entry.hours
      week.entries.push(entry as TimeEntryWithProject)
    })

    return Array.from(weekMap.values()).slice(0, limit)
  },

  // Crear entrada de tiempo
  async createTimeEntry(jpId: string, entry: CreateTimeEntryDto): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        jp_id: jpId,
        project_id: entry.project_id || undefined,
        week_start: entry.week_start,
        hours: entry.hours,
        comments: entry.comments || undefined,
        other_activity: entry.other_activity || undefined,
        status: 'draft'
      } as never)
      .select()
      .single()

    if (error) throw error
    return data as TimeEntry
  },

  // Actualizar entrada de tiempo
  async updateTimeEntry(id: string, updates: UpdateTimeEntryDto): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      } as never)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as TimeEntry
  },

  // Eliminar entrada de tiempo
  async deleteTimeEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Enviar semana completa para aprobación
  async submitWeek(jpId: string, weekStart: string): Promise<void> {
    const { error } = await supabase
      .from('time_entries')
      .update({
        status: 'submitted',
        updated_at: new Date().toISOString()
      })
      .eq('jp_id', jpId)
      .eq('week_start', weekStart)

    if (error) throw error
  },

  // Obtener proyectos asignados a un JP
  async getAssignedProjects(jpId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id, code, name, description, status
      `)
      .eq('project_assignments.jp_id', jpId)
      .eq('project_assignments.is_active', true)
      .in('status', ['active', 'paused'])

    if (error) throw error
    return (data || []) as Project[]
  },

  // Validar que las horas totales de la semana no excedan 40
  async validateWeekHours(jpId: string, weekStart: string, excludeEntryId?: string): Promise<{
    isValid: boolean
    currentTotal: number
    maxHours: number
  }> {
    let query = supabase
      .from('time_entries')
      .select('hours')
      .eq('jp_id', jpId)
      .eq('week_start', weekStart)

    if (excludeEntryId) {
      query = query.neq('id', excludeEntryId)
    }

    const { data, error } = await query

    if (error) throw error

    const currentTotal = (data || []).reduce((sum, entry) => sum + entry.hours, 0)
    const maxHours = 40

    return {
      isValid: currentTotal <= maxHours,
      currentTotal,
      maxHours
    }
  },

  // Utilidad para obtener fecha de inicio de semana
  getWeekStartDate(date: Date = new Date()): string {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Lunes como inicio de semana
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  },

  // Utilidad para formatear fecha de semana
  formatWeekRange(weekStart: string): string {
    const start = new Date(weekStart)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short'
    }

    return `${start.toLocaleDateString('es-ES', options)} - ${end.toLocaleDateString('es-ES', options)}`
  }
}
