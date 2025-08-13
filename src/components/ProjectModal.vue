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
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Estado (solo en edición) -->
          <div v-if="isEditing">
            <label class="block text-sm font-medium text-gray-700">Estado</label>
            <select
              v-model="form.status"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <!-- Fechas -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha Inicio</label>
              <input
                v-model="form.start_date"
                type="date"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha Fin</label>
              <input
                v-model="form.end_date"
                type="date"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- JPs Asignados -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">JPs Asignados</label>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <label
                v-for="jp in availableJps"
                :key="jp.id"
                class="flex items-center"
              >
                <input
                  type="checkbox"
                  :value="jp.id"
                  v-model="form.assigned_jps"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ jp.full_name }}</span>
              </label>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-3 pt-4">
            <Button type="button" @click="$emit('close')" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEditing.value && props.project) {
      await projectService.updateProject(props.project.id, form.value)
    } else {
      await projectService.createProject(form.value)
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
