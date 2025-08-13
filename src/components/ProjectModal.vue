<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Código -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Código *</label>
            <input
              v-model="form.code"
              type="text"
              required
              placeholder="Ej: TD-001"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Descripción opcional del proyecto..."
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Estado del Proyecto (siempre visible) -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Estado del Proyecto *</label>
            <select
              v-model="form.status"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">🟢 Activo</option>
              <option value="paused">🟡 Pausado</option>
              <option value="completed">🔵 Completado</option>
              <option value="cancelled">🔴 Cancelado</option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              {{ getStatusDescription(form.status) }}
            </p>
          </div>

          <!-- Fechas (Opcionales) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fechas del Proyecto</label>
            <p class="text-xs text-gray-500 mb-3">Las fechas son opcionales y se pueden configurar después</p>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600">Fecha Inicio</label>
                <input
                  v-model="form.start_date"
                  type="date"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600">Fecha Fin</label>
                <input
                  v-model="form.end_date"
                  type="date"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <!-- Validación de fechas -->
            <div v-if="dateError" class="mt-2 text-xs text-red-600">
              {{ dateError }}
            </div>
          </div>

          <!-- JPs Asignados -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">JPs Asignados</label>
            <p class="text-xs text-gray-500 mb-2">Selecciona los Jefes de Proyecto que trabajarán en este proyecto</p>

            <div v-if="availableJps.length === 0" class="text-sm text-gray-500 italic">
              No hay JPs disponibles para asignar
            </div>

            <div v-else class="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
              <label
                v-for="jp in availableJps"
                :key="jp.id"
                class="flex items-center hover:bg-gray-50 p-2 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="jp.id"
                  v-model="form.assigned_jps"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ jp.full_name }}</span>
                <span class="ml-2 text-xs text-gray-500">({{ jp.email }})</span>
              </label>
            </div>

            <p class="mt-1 text-xs text-gray-500">
              {{ form.assigned_jps.length }} JP(s) seleccionado(s)
            </p>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-3 pt-4">
            <Button type="button" @click="$emit('close')" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" :disabled="loading || !isFormValid">
              {{ loading ? 'Guardando...' : 'Guardar Proyecto' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { projectService } from '@/services/projectService'
import type { ProjectWithAssignments } from '@/types/projects'
import Button from '@/components/ui/button/Button.vue'

interface Props {
  project?: ProjectWithAssignments | null
  availableJps: Array<{ id: string; full_name: string; email: string }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: []
}>()

const loading = ref(false)
const dateError = ref('')

const form = ref({
  code: '',
  name: '',
  description: '',
  status: 'active' as 'active' | 'paused' | 'completed' | 'cancelled',
  start_date: '',
  end_date: '',
  assigned_jps: [] as string[]
})

const isEditing = computed(() => !!props.project)

// Validar fechas
const validateDates = () => {
  dateError.value = ''

  if (form.value.start_date && form.value.end_date) {
    const startDate = new Date(form.value.start_date)
    const endDate = new Date(form.value.end_date)

    if (startDate > endDate) {
      dateError.value = 'La fecha de inicio no puede ser posterior a la fecha de fin'
      return false
    }
  }

  return true
}

// Validar formulario completo
const isFormValid = computed(() => {
  return form.value.code.trim() !== '' &&
         form.value.name.trim() !== '' &&
         validateDates()
})

// Descripción del estado
const getStatusDescription = (status: string) => {
  const descriptions = {
    active: 'Proyecto en desarrollo activo',
    paused: 'Proyecto temporalmente suspendido',
    completed: 'Proyecto finalizado exitosamente',
    cancelled: 'Proyecto cancelado o abandonado'
  }
  return descriptions[status as keyof typeof descriptions] || ''
}

// Observar cambios en fechas para validación
watch([() => form.value.start_date, () => form.value.end_date], () => {
  validateDates()
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    return
  }

  loading.value = true
  try {
    // Preparar datos del proyecto
    const projectData = {
      code: form.value.code.trim(),
      name: form.value.name.trim(),
      description: form.value.description.trim() || null,
      status: form.value.status,
      start_date: form.value.start_date || null,
      end_date: form.value.end_date || null,
      assigned_jps: form.value.assigned_jps
    }

    if (isEditing.value && props.project) {
      await projectService.updateProject(props.project.id, projectData)
    } else {
      await projectService.createProject(projectData)
    }
    emit('save')
  } catch (error) {
    console.error('Error saving project:', error)
    alert('Error al guardar el proyecto')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.project) {
    form.value = {
      code: props.project.code,
      name: props.project.name,
      description: props.project.description || '',
      status: props.project.status,
      start_date: props.project.start_date || '',
      end_date: props.project.end_date || '',
      assigned_jps: props.project.assignments?.map(a => a.jp_id) || []
    }
  }
})
</script>
