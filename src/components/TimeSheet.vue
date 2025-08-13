<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Registro de Horas</h2>
        <p class="text-gray-600">Gestiona tus horas trabajadas semanalmente</p>
      </div>
      <div class="text-right">
        <div class="text-sm text-gray-500">Semana actual</div>
        <div class="font-semibold">{{ currentWeekDisplay }}</div>
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

    <!-- Resumen de la semana -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center justify-between">
          <span class="flex items-center gap-2">
            <Clock class="h-5 w-5" />
            {{ selectedWeekDisplay }}
          </span>
          <div class="flex items-center gap-2">
            <span :class="totalHoursColor" class="text-lg font-bold">
              {{ totalHours }} / 40 hrs
            </span>
            <Badge :variant="weekStatusVariant">
              {{ weekStatusText }}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ projectHours }}</div>
            <div class="text-sm text-blue-800">Horas en Proyectos</div>
          </div>
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ otherHours }}</div>
            <div class="text-sm text-green-800">Otras Actividades</div>
          </div>
          <div class="text-center p-3 bg-orange-50 rounded-lg">
            <div class="text-2xl font-bold text-orange-600">{{ remainingHours }}</div>
            <div class="text-sm text-orange-800">Horas Restantes</div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-2">
          <Button
            @click="openCreateModal"
            v-if="weekStatus === 'draft'"
            class="bg-blue-600 hover:bg-blue-700"
          >
            <Plus class="w-4 h-4 mr-2" />
            Agregar Horas
          </Button>

          <Button
            @click="submitWeek"
            v-if="weekStatus === 'draft' && totalHours > 0"
            variant="outline"
          >
            <Send class="w-4 h-4 mr-2" />
            Enviar Semana
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Lista de entradas -->
    <Card>
      <CardHeader>
        <CardTitle>Detalle de Horas</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="timeEntries.length === 0" class="text-center py-8">
          <Clock class="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No hay registros</h3>
          <p class="text-gray-500 mb-4">Aún no has registrado horas para esta semana.</p>
          <Button @click="openCreateModal">
            <Plus class="w-4 h-4 mr-2" />
            Agregar primera entrada
          </Button>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="entry in timeEntries"
            :key="entry.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <FolderOpen v-if="entry.project" class="h-4 w-4 text-blue-500" />
                  <Package v-else class="h-4 w-4 text-green-500" />
                  <span class="font-medium">
                    {{ entry.project ? `${entry.project.code} - ${entry.project.name}` : 'Otras Actividades' }}
                  </span>
                  <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    {{ entry.hours }}h
                  </span>
                </div>

                <div class="text-sm text-gray-600">
                  <p v-if="entry.project && entry.comments">
                    <strong>Comentarios:</strong> {{ entry.comments }}
                  </p>
                  <p v-if="!entry.project && entry.other_activity">
                    <strong>Actividad:</strong> {{ entry.other_activity }}
                  </p>
                  <p v-if="!entry.project && entry.comments">
                    <strong>Descripción:</strong> {{ entry.comments }}
                  </p>
                </div>
              </div>

              <div class="flex gap-2" v-if="weekStatus === 'draft'">
                <Button @click="editEntry(entry)" variant="ghost" size="sm">
                  <Edit class="h-4 w-4" />
                </Button>
                <Button @click="deleteEntry(entry.id)" variant="ghost" size="sm" class="text-red-600">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Modal para crear/editar entrada -->
    <TimeEntryModal
      v-if="showModal"
      :entry="selectedEntry"
      :assigned-projects="assignedProjects"
      :week-start="selectedWeekStart"
      :current-week-hours="totalHours"
      :user-id="userId"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Send,
  Edit,
  Trash2,
  FolderOpen,
  Package
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { timeEntryService } from '@/services/timeEntryService'
import type { TimeEntryWithProject, Project } from '@/types/projects'
import TimeEntryModal from './TimeEntryModal.vue'

interface Props {
  userId: string
}

const props = defineProps<Props>()

const timeEntries = ref<TimeEntryWithProject[]>([])
const assignedProjects = ref<Project[]>([])
const selectedWeekStart = ref('')
const showModal = ref(false)
const selectedEntry = ref<TimeEntryWithProject | null>(null)

// Computadas
const currentWeekStart = computed(() => timeEntryService.getWeekStartDate())
const currentWeekDisplay = computed(() => timeEntryService.formatWeekRange(currentWeekStart.value))
const selectedWeekDisplay = computed(() => timeEntryService.formatWeekRange(selectedWeekStart.value))

const totalHours = computed(() =>
  timeEntries.value.reduce((sum, entry) => sum + entry.hours, 0)
)

const projectHours = computed(() =>
  timeEntries.value
    .filter(entry => entry.project_id)
    .reduce((sum, entry) => sum + entry.hours, 0)
)

const otherHours = computed(() =>
  timeEntries.value
    .filter(entry => !entry.project_id)
    .reduce((sum, entry) => sum + entry.hours, 0)
)

const remainingHours = computed(() => Math.max(0, 40 - totalHours.value))

const weekStatus = computed(() => {
  if (timeEntries.value.length === 0) return 'draft'
  return timeEntries.value[0].status
})

const weekStatusText = computed(() => {
  const statuses = {
    draft: 'Borrador',
    submitted: 'Enviado',
    approved: 'Aprobado'
  }
  return statuses[weekStatus.value] || 'Borrador'
})

const weekStatusVariant = computed(() => {
  const variants: Record<string, "secondary" | "destructive" | "default"> = {
    draft: 'secondary',
    submitted: 'destructive',
    approved: 'default'
  }
  return variants[weekStatus.value] || 'secondary'
})

const totalHoursColor = computed(() => {
  if (totalHours.value > 40) return 'text-red-600'
  if (totalHours.value === 40) return 'text-green-600'
  return 'text-blue-600'
})

// Métodos
const loadWeekData = async () => {
  try {
    timeEntries.value = await timeEntryService.getTimeEntriesForWeek(
      props.userId,
      selectedWeekStart.value
    )
  } catch (error) {
    console.error('Error loading week data:', error)
  }
}

const loadAssignedProjects = async () => {
  try {
    assignedProjects.value = await timeEntryService.getAssignedProjects(props.userId)
  } catch (error) {
    console.error('Error loading assigned projects:', error)
  }
}

const goToPreviousWeek = () => {
  const date = new Date(selectedWeekStart.value)
  date.setDate(date.getDate() - 7)
  selectedWeekStart.value = timeEntryService.getWeekStartDate(date)
}

const goToNextWeek = () => {
  const date = new Date(selectedWeekStart.value)
  date.setDate(date.getDate() + 7)
  selectedWeekStart.value = timeEntryService.getWeekStartDate(date)
}

const goToCurrentWeek = () => {
  selectedWeekStart.value = currentWeekStart.value
}

const openCreateModal = () => {
  selectedEntry.value = null
  showModal.value = true
}

const editEntry = (entry: TimeEntryWithProject) => {
  selectedEntry.value = entry
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedEntry.value = null
}

const handleSave = async () => {
  await loadWeekData()
  closeModal()
}

const deleteEntry = async (id: string) => {
  if (confirm('¿Estás seguro de eliminar esta entrada?')) {
    try {
      await timeEntryService.deleteTimeEntry(id)
      await loadWeekData()
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Error al eliminar la entrada')
    }
  }
}

const submitWeek = async () => {
  if (confirm('¿Estás seguro de enviar esta semana para aprobación? No podrás editarla después.')) {
    try {
      await timeEntryService.submitWeek(props.userId, selectedWeekStart.value)
      await loadWeekData()
    } catch (error) {
      console.error('Error submitting week:', error)
      alert('Error al enviar la semana')
    }
  }
}

// Watchers
watch(selectedWeekStart, loadWeekData)

// Inicialización
onMounted(() => {
  selectedWeekStart.value = currentWeekStart.value
  loadAssignedProjects()
})
</script>
