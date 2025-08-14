<template>
  <div v-if="open" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ task ? 'Editar Tarea' : 'Nueva Tarea' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nombre de la Tarea -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de la Tarea *</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Ej: Desarrollo de API, Reunión de equipo..."
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Tipo de Tarea -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Tarea *</label>
            <select
              v-model="form.type"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar tipo</option>
              <option value="project">Proyecto</option>
              <option value="administrative">Administrativa</option>
              <option value="holiday">Vacaciones</option>
              <option value="sick">Licencia Médica</option>
              <option value="training">Capacitación</option>
            </select>
          </div>

          <!-- Proyecto (si es tipo proyecto) -->
          <div v-if="form.type === 'project'">
            <label class="block text-sm font-medium text-gray-700">Proyecto *</label>
            <select
              v-model="form.project_id"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar proyecto</option>
              <option
                v-for="project in availableProjects"
                :key="project.id"
                :value="project.id"
              >
                {{ project.code }} - {{ project.name }}
              </option>
            </select>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Describe la tarea o actividad..."
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Fechas (opcionales) -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
              <input
                v-model="form.start_date"
                type="date"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha de Fin</label>
              <input
                v-model="form.end_date"
                type="date"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {{ task ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { projectService } from '@/services/projectService'

interface Props {
  open: boolean
  task?: any
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'save', task: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Estado del formulario
const form = ref({
  name: '',
  type: '',
  project_id: '',
  description: '',
  start_date: '',
  end_date: ''
})

// Proyectos disponibles
const availableProjects = ref([])

// Computed properties
const closeModal = () => {
  emit('update:open', false)
}

// Métodos
const loadProjects = async () => {
  try {
    availableProjects.value = await projectService.getProjects()
  } catch (error) {
    console.error('Error loading projects:', error)
  }
}

const handleSubmit = () => {
  const taskData = {
    ...form.value,
    id: props.task?.id || Date.now().toString(), // ID temporal para nuevas tareas
    sortable: form.value.type === 'project'
  }
  
  emit('save', taskData)
  closeModal()
}

const resetForm = () => {
  form.value = {
    name: '',
    type: '',
    project_id: '',
    description: '',
    start_date: '',
    end_date: ''
  }
}

// Watchers
watch(() => props.task, (newTask) => {
  if (newTask) {
    form.value = {
      name: newTask.name || '',
      type: newTask.type || 'project',
      project_id: newTask.project_id || '',
      description: newTask.description || '',
      start_date: newTask.start_date || '',
      end_date: newTask.end_date || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

// Lifecycle
onMounted(() => {
  loadProjects()
})
</script>
