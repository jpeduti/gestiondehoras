<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Timesheet</h2>
        <p class="text-gray-600">Registro de horas semanal</p>
      </div>
      <div class="text-right">
        <div class="text-sm text-gray-500">Semana actual</div>
        <div class="font-semibold">{{ currentWeekDisplay }}</div>
      </div>
    </div>

    <!-- Information Bar -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm font-bold">i</span>
        </div>
        <div class="flex-1">
          <span class="text-blue-800">
            Tu timesheet está abierto. Puedes enviar actualizaciones o entregarlo
          </span>
          <span class="font-semibold text-blue-900 ml-2">
            Total: {{ totalHours }}h
          </span>
          <span class="text-blue-700 ml-2">
            Período: {{ selectedWeekDisplay }}
          </span>
        </div>
      </div>
    </div>

    <!-- Selector de semana -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Calendar class="h-5 w-5" />
          Seleccionar Semana
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-center gap-4">
          <Button @click="goToPreviousWeek" variant="outline" size="sm">
            <ChevronLeft class="h-4 w-4" />
            Anterior
          </Button>

          <input
            type="date"
            v-model="selectedWeekStart"
            @change="loadWeekData"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          <Button @click="goToNextWeek" variant="outline" size="sm">
            Siguiente
            <ChevronRight class="h-4 w-4" />
          </Button>

          <Button @click="goToCurrentWeek" variant="outline" size="sm">
            Semana Actual
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Grid Principal del Timesheet -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <!-- Contenedor del Grid -->
      <div class="flex">
        <!-- Panel Izquierdo - Detalles de Tareas y Proyectos (Fijo) -->
        <div class="flex-shrink-0 w-96 border-r border-gray-200">
          <div class="bg-gray-50 border-b border-gray-200">
                         <div class="grid grid-cols-7 gap-2 p-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
               <div class="w-8"></div> <!-- Columna de selección -->
               <div class="col-span-2">Nombre/Descripción de Tarea</div>
               <div>Nombre del Proyecto</div>
               <div>Estado del Proceso</div>
               <div>Inicio</div>
               <div>Fin</div>
             </div>
          </div>
          
                     <!-- Filas de Tareas -->
          <div class="divide-y divide-gray-100">
            <div 
              v-for="(task, index) in tasks" 
              :key="task.id"
              class="grid grid-cols-7 gap-2 p-3 text-sm hover:bg-gray-50"
              :class="{ 'bg-blue-50': selectedTaskIndex === index }"
            >
                             <!-- Columna de selección -->
              <div class="w-8 flex items-center justify-center">
                <div 
                  class="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer"
                  :class="{ 'bg-blue-500 border-blue-500': selectedTaskIndex === index }"
                  @click="selectTask(index)"
                ></div>
              </div>
              
                             <!-- Nombre/Descripción de Tarea -->
              <div class="col-span-2 font-medium text-gray-900">
                {{ task.name }}
                <ChevronUp v-if="task.sortable" class="inline w-3 h-3 ml-1 text-gray-400" />
              </div>
              
                             <!-- Nombre del Proyecto -->
              <div class="text-gray-700">{{ task.project }}</div>
              
                             <!-- Estado del Proceso -->
              <div class="text-gray-500">{{ task.status || '-' }}</div>
              
                             <!-- Fecha de Inicio -->
              <div class="text-gray-500">{{ task.start || '-' }}</div>
              
                             <!-- Fecha de Fin -->
              <div class="text-gray-500">{{ task.finish || '-' }}</div>
            </div>
            
                         <!-- Fila de Total de Trabajo -->
             <div class="grid grid-cols-7 gap-2 p-3 text-sm font-semibold bg-blue-50 border-t-2 border-blue-200">
               <div class="w-8"></div>
               <div class="col-span-2 text-blue-900">Total de trabajo</div>
               <div class="text-blue-900">-</div>
               <div class="text-blue-900">-</div>
               <div class="text-blue-900">-</div>
               <div class="text-blue-900">-</div>
             </div>
          </div>
        </div>

                 <!-- Panel Derecho - Grid de Entrada de Horas Diarias (Desplazable) -->
        <div class="flex-1 overflow-x-auto">
          <div class="bg-gray-50 border-b border-gray-200">
            <div class="flex">
              <div 
                v-for="day in weekDays" 
                :key="day.date"
                class="w-24 flex-shrink-0 p-3 text-xs font-medium text-gray-600 uppercase tracking-wide text-center border-r border-gray-200"
                :class="{ 'bg-gray-100 text-gray-500': day.isWeekend }"
              >
                <div>{{ day.dayName }}</div>
                <div class="text-xs">{{ day.date }}</div>
              </div>
            </div>
          </div>
          
                     <!-- Filas de Entrada de Horas -->
          <div class="divide-y divide-gray-100">
            <div 
              v-for="(task, taskIndex) in tasks" 
              :key="task.id"
              class="flex"
            >
              <div 
                v-for="day in weekDays" 
                :key="day.date"
                class="w-24 flex-shrink-0 p-2 border-r border-gray-200"
                :class="{ 'bg-gray-50': day.isWeekend }"
              >
                <input
                  v-model="task.hours[day.date]"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  class="w-full px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :class="{ 'bg-gray-100': day.isWeekend }"
                  :disabled="day.isWeekend"
                  @input="updateTotalHours"
                  @blur="saveTaskHours(task.id, day.date, task.hours[day.date])"
                />
              </div>
            </div>
            
                         <!-- Fila de Total de Trabajo -->
            <div class="flex bg-blue-50 border-t-2 border-blue-200">
              <div 
                v-for="day in weekDays" 
                :key="day.date"
                class="w-24 flex-shrink-0 p-2 text-center font-semibold text-blue-900 border-r border-gray-200"
                :class="{ 'bg-blue-100': day.isWeekend }"
              >
                {{ getDayTotalHours(day.date) }}h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones de Acción -->
    <div class="flex gap-3">
      <Button
        @click="openCreateModal"
        v-if="weekStatus === 'draft'"
        class="bg-blue-600 hover:bg-blue-700"
      >
        <Plus class="w-4 h-4 mr-2" />
        Agregar Tarea
      </Button>

      <Button
        @click="submitWeek"
        v-if="weekStatus === 'draft' && totalHours > 0"
        variant="outline"
      >
        <Send class="w-4 h-4 mr-2" />
        Enviar Semana
      </Button>

      <Button
        @click="approveWeek"
        v-if="weekStatus === 'submitted'"
        variant="outline"
        class="bg-green-600 hover:bg-green-700 text-white"
      >
        <CheckCircle class="w-4 h-4 mr-2" />
        Aprobar
      </Button>
    </div>

    <!-- Modal para crear/editar tarea -->
    <TimeEntryModal
      v-model:open="isModalOpen"
      :task="editingTask"
      @save="handleTaskSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  Send, 
  CheckCircle,
  ChevronUp
} from 'lucide-vue-next'
import TimeEntryModal from './TimeEntryModal.vue'
import { timeEntryService } from '@/services/timeEntryService'
import { projectService } from '@/services/projectService'

interface Props {
  userId: string
}

const props = defineProps<Props>()

// Estado del componente
const selectedWeekStart = ref('')
const weekStatus = ref('draft')
const isModalOpen = ref(false)
const editingTask = ref(null)
const selectedTaskIndex = ref(0)

// Datos de la semana
const weekDays = ref([])
const tasks = ref([])
const totalHours = ref(0)

// Propiedades computadas
const currentWeekDisplay = computed(() => {
  if (!selectedWeekStart.value) return ''
  const start = new Date(selectedWeekStart.value)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return `${start.toLocaleDateString('es-ES')} - ${end.toLocaleDateString('es-ES')}`
})

const selectedWeekDisplay = computed(() => {
  return currentWeekDisplay.value
})

const weekStatusText = computed(() => {
  switch (weekStatus.value) {
    case 'draft': return 'Borrador'
    case 'submitted': return 'Enviado'
    case 'approved': return 'Aprobado'
    default: return 'Desconocido'
  }
})

const weekStatusVariant = computed(() => {
  switch (weekStatus.value) {
    case 'draft': return 'secondary'
    case 'submitted': return 'default'
    case 'approved': return 'default'
    default: return 'secondary'
  }
})

// Métodos
const initializeWeek = () => {
  const today = new Date()
  const currentDay = today.getDay()
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMonday)
  
  selectedWeekStart.value = monday.toISOString().split('T')[0]
  generateWeekDays()
  loadWeekData()
}

const generateWeekDays = () => {
  if (!selectedWeekStart.value) return
  
  const startDate = new Date(selectedWeekStart.value)
  weekDays.value = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    weekDays.value.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    })
  }
}

const loadWeekData = async () => {
  if (!selectedWeekStart.value) return
  
  generateWeekDays()
  await loadTasks()
  await loadTimeEntries()
  calculateTotalHours()
}

const loadTasks = async () => {
  try {
    // Cargar proyectos asignados al usuario
    const userProjects = await projectService.getProjectsForUser(props.userId)
    
    // Crear tareas basadas en proyectos
    tasks.value = userProjects.map(project => ({
      id: project.id,
      name: project.name,
      project: project.code,
      status: project.status,
      start: project.start_date,
      finish: project.end_date,
      sortable: true,
      hours: {}
    }))
    
         // Agregar tareas administrativas
     const adminTasks = [
       { id: 'admin', name: 'Administrativa', project: 'Administrativo', status: '', start: '', finish: '', sortable: false, hours: {} },
       { id: 'holiday', name: 'Vacaciones', project: 'Administrativo', status: '', start: '', finish: '', sortable: false, hours: {} },
       { id: 'sick', name: 'Licencia Médica', project: 'Administrativo', status: '', start: '', finish: '', sortable: false, hours: {} },
       { id: 'training', name: 'Capacitación', project: 'Administrativo', status: '', start: '', finish: '', sortable: false, hours: {} }
     ]
    
    tasks.value.push(...adminTasks)
    
    // Inicializar horas para cada día
    weekDays.value.forEach(day => {
      tasks.value.forEach(task => {
        task.hours[day.date] = 0
      })
    })
    
  } catch (error) {
    console.error('Error loading tasks:', error)
  }
}

const loadTimeEntries = async () => {
  try {
    const entries = await timeEntryService.getTimeEntriesForWeek(props.userId, selectedWeekStart.value)
    
    // Mapear entradas existentes a las tareas
    entries.forEach(entry => {
      const task = tasks.value.find(t => t.id === entry.project_id)
      if (task && entry.week_start) {
        const entryDate = new Date(entry.week_start)
        const dayKey = entryDate.toISOString().split('T')[0]
        if (task.hours[dayKey] !== undefined) {
          task.hours[dayKey] = entry.hours
        }
      }
    })
    
  } catch (error) {
    console.error('Error loading time entries:', error)
  }
}

const selectTask = (index: number) => {
  selectedTaskIndex.value = index
}

const updateTotalHours = () => {
  calculateTotalHours()
}

const calculateTotalHours = () => {
  totalHours.value = 0
  tasks.value.forEach(task => {
    Object.values(task.hours).forEach(hours => {
      totalHours.value += Number(hours) || 0
    })
  })
}

const getDayTotalHours = (date: string) => {
  let dayTotal = 0
  tasks.value.forEach(task => {
    dayTotal += Number(task.hours[date]) || 0
  })
  return dayTotal
}

const saveTaskHours = async (taskId: string, date: string, hours: number) => {
  try {
    if (hours > 0) {
      await timeEntryService.createTimeEntry({
        jp_id: props.userId,
        project_id: taskId === 'admin' || taskId === 'holiday' || taskId === 'sick' || taskId === 'training' ? null : taskId,
        other_activity: taskId === 'admin' || taskId === 'holiday' || taskId === 'sick' || taskId === 'training' ? taskId : null,
        hours: Number(hours),
        week_start: date,
        comments: ''
      })
    }
  } catch (error) {
    console.error('Error saving hours:', error)
  }
}

const openCreateModal = () => {
  editingTask.value = null
  isModalOpen.value = true
}

const handleTaskSave = (task: any) => {
       // Aquí puedes implementar la lógica para guardar nuevas tareas
     console.log('Guardando tarea:', task)
  isModalOpen.value = false
}

const goToPreviousWeek = () => {
  if (!selectedWeekStart.value) return
  const date = new Date(selectedWeekStart.value)
  date.setDate(date.getDate() - 7)
  selectedWeekStart.value = date.toISOString().split('T')[0]
  loadWeekData()
}

const goToNextWeek = () => {
  if (!selectedWeekStart.value) return
  const date = new Date(selectedWeekStart.value)
  date.setDate(date.getDate() + 7)
  selectedWeekStart.value = date.toISOString().split('T')[0]
  loadWeekData()
}

const goToCurrentWeek = () => {
  initializeWeek()
}

const submitWeek = async () => {
  try {
         // Aquí implementarías la lógica para enviar la semana
     weekStatus.value = 'submitted'
     console.log('Semana enviada')
  } catch (error) {
    console.error('Error submitting week:', error)
  }
}

const approveWeek = async () => {
  try {
         // Aquí implementarías la lógica para aprobar la semana
     weekStatus.value = 'approved'
     console.log('Semana aprobada')
  } catch (error) {
    console.error('Error approving week:', error)
  }
}

// Ciclo de vida
onMounted(() => {
  initializeWeek()
})
</script>

<style scoped>
/* Estilos adicionales para el grid */
.grid-cols-7 {
  grid-template-columns: 2rem 1fr 1fr 1fr 1fr 1fr 1fr;
}

/* Barra de desplazamiento personalizada */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
