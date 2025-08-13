<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ isEditing ? 'Editar Registro' : 'Nuevo Registro de Horas' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Tipo de actividad -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Actividad</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  type="radio"
                  value="project"
                  v-model="activityType"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Proyecto Asignado</span>
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  value="other"
                  v-model="activityType"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Otras Actividades</span>
              </label>
            </div>
          </div>

          <!-- Proyecto (si es proyecto) -->
          <div v-if="activityType === 'project'">
            <label class="block text-sm font-medium text-gray-700">Proyecto *</label>
            <select
              v-model="form.project_id"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar proyecto</option>
              <option
                v-for="project in assignedProjects"
                :key="project.id"
                :value="project.id"
              >
                {{ project.code }} - {{ project.name }}
              </option>
            </select>
          </div>

          <!-- Actividad (si es otros) -->
          <div v-if="activityType === 'other'">
            <label class="block text-sm font-medium text-gray-700">Actividad *</label>
            <input
              v-model="form.other_activity"
              type="text"
              required
              placeholder="Ej: Reuniones administrativas, capacitación, etc."
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Horas -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Horas *</label>
            <input
              v-model.number="form.hours"
              type="number"
              step="0.5"
              min="0.5"
              max="12"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Mínimo 0.5 horas, máximo 12 horas por entrada</p>
          </div>

          <!-- Comentarios/Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              {{ activityType === 'project' ? 'Comentarios' : 'Descripción Detallada' }}
            </label>
            <textarea
              v-model="form.comments"
              rows="3"
              :placeholder="activityType === 'project' ? 'Describe las tareas realizadas...' : 'Describe en detalle la actividad realizada...'"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Validación de horas -->
          <div v-if="hoursValidation.showWarning" class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div class="flex">
              <AlertTriangle class="h-5 w-5 text-yellow-400" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">
                  {{ hoursValidation.message }}
                </h3>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-3 pt-4">
            <Button type="button" @click="$emit('close')" variant="outline">
              Cancelar
            </Button>
            <Button
              type="submit"
              :disabled="loading || hoursValidation.isInvalid"
            >
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import { timeEntryService } from '@/services/timeEntryService'
import type { TimeEntryWithProject, Project } from '@/types/projects'
import Button from '@/components/ui/button/Button.vue'

interface Props {
  entry?: TimeEntryWithProject | null
  assignedProjects: Project[]
  weekStart: string
  currentWeekHours: number
  userId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: []
}>()

const loading = ref(false)
const activityType = ref<'project' | 'other'>('project')
const form = ref({
  project_id: '',
  hours: 1,
  comments: '',
  other_activity: ''
})

const isEditing = computed(() => !!props.entry)

const hoursValidation = computed(() => {
  const currentEntryHours = isEditing.value ? props.entry!.hours : 0
  const totalWithoutCurrent = props.currentWeekHours - currentEntryHours
  const newTotal = totalWithoutCurrent + form.value.hours

  if (newTotal > 40) {
    return {
      showWarning: true,
      isInvalid: true,
      message: `Total de horas excedería 40h (${newTotal}h total). Máximo permitido: ${40 - totalWithoutCurrent}h`
    }
  }

  if (newTotal === 40) {
    return {
      showWarning: true,
      isInvalid: false,
      message: `Perfecto! Completarás exactamente 40 horas esta semana.`
    }
  }

  return {
    showWarning: false,
    isInvalid: false,
    message: ''
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const entryData = {
      week_start: props.weekStart,
      hours: form.value.hours,
      comments: form.value.comments || undefined,
      project_id: activityType.value === 'project' ? form.value.project_id : undefined,
      other_activity: activityType.value === 'other' ? form.value.other_activity : undefined
    }

    if (isEditing.value && props.entry) {
      await timeEntryService.updateTimeEntry(props.entry.id, entryData)
    } else {
      await timeEntryService.createTimeEntry(props.userId, entryData)
    }

    emit('save')
  } catch (error) {
    console.error('Error saving time entry:', error)
    alert('Error al guardar el registro')
  } finally {
    loading.value = false
  }
}

// Watcher para limpiar formulario cuando cambia el tipo
watch(activityType, (newType) => {
  if (newType === 'project') {
    form.value.other_activity = ''
  } else {
    form.value.project_id = ''
  }
})

onMounted(() => {
  if (props.entry) {
    activityType.value = props.entry.project_id ? 'project' : 'other'
    form.value = {
      project_id: props.entry.project_id || '',
      hours: props.entry.hours,
      comments: props.entry.comments || '',
      other_activity: props.entry.other_activity || ''
    }
  }
})
</script>
